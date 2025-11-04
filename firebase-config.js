// ============================================
// ENHANCED FIREBASE CONFIGURATION
// Supports: Lessons, Quiz, True/False, All Games
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsVXny76jcd7XeAkErqdBW7l89B5T5nws",
  authDomain: "accountswizard-2025.firebaseapp.com",
  projectId: "accountswizard-2025",
  storageBucket: "accountswizard-2025.firebasestorage.app",
  messagingSenderId: "678121384731",
  appId: "1:678121384731:web:6c1cea60976976966f81be",
  measurementId: "G-YLYVNGL5T7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// USER MANAGEMENT
// ============================================

export function getUserId() {
  if (auth.currentUser) {
    console.log('✅ Logged-in user:', auth.currentUser.email);
    return auth.currentUser.uid;
  }
  
  let userId = localStorage.getItem('accounts-wizard-user-id');
  if (!userId) {
    userId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('accounts-wizard-user-id', userId);
    console.log('👤 Anonymous user created:', userId);
  }
  return userId;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign-in:', result.user.email);

    // === MIGRATE anonymous data (if any) into the new signed-in user's account.
    // By default we keep backups of anonymous docs (deleteOld: false).
    try {
      await migrateAnonymousData(result.user.uid, { deleteOld: false });
    } catch (mErr) {
      console.warn('⚠️ Migration attempt failed (non-fatal):', mErr);
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.error('❌ Sign-in error:', error);
    return { success: false, error: error.message };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('✅ Signed out');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign-out error:', error);
    return { success: false, error: error.message };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile() {
  const userId = getUserId();
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    return null;
  }
}

export async function updateLastLogin() {
  const userId = getUserId();
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('❌ Error updating login:', error);
  }
}

// ============================================
// LESSON PROGRESS
// ============================================

export async function submitLessonAttempt(lessonNumber, answers, score, totalQuestions) {
  try {
    const userId = getUserId();
    const percentage = Math.round((score / totalQuestions) * 100);
    const docId = `${userId}_lesson${lessonNumber}`;
    const docRef = doc(db, 'user-progress', docId);
    
    const prevDoc = await getDoc(docRef);
    let shouldSave = true;
    let previousBestScore = 0;
    let previousPercentage = 0;
    
    if (prevDoc.exists()) {
      const prevData = prevDoc.data();
      previousBestScore = prevData.score || 0;
      previousPercentage = prevData.percentage || 0;
      
      if (percentage <= previousPercentage) {
        shouldSave = false;
        console.log(`📊 Previous: ${previousBestScore}/${totalQuestions} = ${previousPercentage}% (Better)`);
        return { 
          success: true, 
          updated: false, 
          currentScore: score,
          bestScore: previousBestScore,
          totalQuestions: totalQuestions,
          percentage: previousPercentage,
          message: `Previous best: ${previousBestScore}/${totalQuestions} (${previousPercentage}%)`
        };
      }
    }
    
    if (shouldSave) {
      const lessonData = {
        userId: userId,
        lessonNumber: lessonNumber,
        answers: answers,
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        timestamp: serverTimestamp(),
        attempts: prevDoc.exists() ? (prevDoc.data().attempts || 1) + 1 : 1,
        type: 'lesson'
      };

      await setDoc(docRef, lessonData);
      console.log('✅ New best lesson score saved!', lessonData);
      
      await updateOverallProgress(userId);
      
      return { 
        success: true, 
        updated: true, 
        currentScore: score,
        bestScore: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        isNewRecord: true,
        message: `New best: ${score}/${totalQuestions} (${percentage}%)`
      };
    }
    
  } catch (error) {
    console.error('❌ Lesson submission error:', error);
    return { success: false, error: error.message };
  }
}

export async function loadPreviousAnswers(lessonNumber) {
  try {
    const userId = getUserId();
    const docRef = doc(db, 'user-progress', `${userId}_lesson${lessonNumber}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('📖 Previous lesson data loaded');
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Load error:', error);
    return null;
  }
}

// ============================================
// 🎯 QUIZ PROGRESS (ENHANCED WITH DETAILED TRACKING!)
// ============================================

export async function submitQuizAttempt(chapterIds, userAnswers, allQuestions, score, totalQuestions, skippedQuestions, timeSpent, questionTimings = [], hintsUsed = []) {
  try {
    const userId = getUserId();
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Create unique ID for this chapter combination
    const chapterKey = chapterIds.sort().join('-');
    const docId = `${userId}_quiz_${chapterKey}`;
    const docRef = doc(db, 'quiz-progress', docId);
    
    const prevDoc = await getDoc(docRef);
    let shouldSave = true;
    let previousBestScore = 0;
    let previousPercentage = 0;
    let currentAttemptNumber = 1;
    
    if (prevDoc.exists()) {
      const prevData = prevDoc.data();
      previousBestScore = prevData.score || 0;
      previousPercentage = prevData.percentage || 0;
      currentAttemptNumber = (prevData.attempts || 1) + 1;
      
      if (percentage <= previousPercentage) {
        shouldSave = false;
        console.log(`📊 Quiz - Previous: ${previousBestScore}/${totalQuestions} = ${previousPercentage}% (Better)`);
        return { 
          success: true, 
          updated: false, 
          isNewRecord: false,
          currentScore: score,
          bestScore: previousBestScore,
          totalQuestions: totalQuestions,
          percentage: previousPercentage,
          message: `Previous best: ${previousBestScore}/${totalQuestions} (${previousPercentage}%)`
        };
      }
    }
    
    if (shouldSave) {
      // Helper: deep-flatten arrays to avoid nested arrays (Firestore rejects nested arrays)
      function deepFlatten(arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? deepFlatten(val) : val), []);
      }

      // Sanitize timings and hints to be simple arrays of numbers
      const sanitizedTimings = Array.isArray(questionTimings)
        ? questionTimings.map(t => (Array.isArray(t) ? Number(deepFlatten(t)[0]) || 0 : Number(t) || 0))
        : [];
      const sanitizedHints = Array.isArray(hintsUsed)
        ? hintsUsed.map(h => (Array.isArray(h) ? Number(deepFlatten(h)[0]) || 0 : Number(h) || 0))
        : [];

      // 📊 Build detailed question breakdown with ALL tracking
      const detailedAnswers = allQuestions.map((q, idx) => {
        const rawUserAns = userAnswers ? userAnswers[idx] : undefined;
        const userAns = Array.isArray(rawUserAns) ? deepFlatten(rawUserAns) : rawUserAns;
        const isSkipped = Array.isArray(skippedQuestions) && skippedQuestions.includes(idx);

        let isCorrect = false;
        if (!isSkipped) {
          if (q.type === 'single') {
            isCorrect = (userAns === q.correct);
          } else if (q.type === 'multiple') {
            const ua = Array.isArray(userAns) ? [...userAns].sort() : [];
            const ca = Array.isArray(q.correct) ? deepFlatten(q.correct) : (Array.isArray(q.correct) ? [...q.correct] : []);
            // ensure ca is a flat array
            const caFlat = Array.isArray(ca) ? [].concat(...ca.map(v => Array.isArray(v) ? deepFlatten(v) : v)).flat() : ca;
            const caSorted = Array.isArray(caFlat) ? [...caFlat].sort() : [];
            isCorrect = JSON.stringify(ua) === JSON.stringify(caSorted);
          }
        }

        // Sanitize options: convert any nested arrays to strings
        const optionsSanitized = (q.options || []).map(opt => Array.isArray(opt) ? deepFlatten(opt).join(' ') : opt);

        return {
          questionNumber: idx + 1,
          chapter: q.sourceChapter || 'Unknown',
          chapterTitle: q.sourceChapterTitle || 'Unknown Chapter',
          question: q.question,
          type: q.type,
          difficulty: q.difficulty || 'medium', // 🆕 DIFFICULTY
          userAnswer: isSkipped ? 'skipped' : userAns,
          correctAnswer: Array.isArray(q.correct) ? deepFlatten(q.correct) : q.correct,
          isCorrect: isCorrect,
          isSkipped: isSkipped,
          options: optionsSanitized,
          explanation: q.explanation || '',
          timeSpent: sanitizedTimings[idx] || 0, // 🆕 TIME PER QUESTION (seconds)
          hintsUsed: sanitizedHints[idx] || 0, // 🆕 HINTS USED
          attemptNumber: currentAttemptNumber // 🆕 WHICH ATTEMPT
        };
      });

      const quizData = {
        userId: userId,
        chapterIds: chapterIds,
        chapterKey: chapterKey,
        answers: detailedAnswers, // 🎯 FULL DETAILED BREAKDOWN
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        correctCount: score,
        wrongCount: totalQuestions - score - skippedQuestions.length,
        skippedCount: skippedQuestions.length,
        totalTimeSpent: timeSpent, // Total quiz time
        averageTimePerQuestion: Math.round(timeSpent / totalQuestions), // Average time
        totalHintsUsed: hintsUsed.reduce((sum, count) => sum + count, 0), // Total hints
        timestamp: serverTimestamp(),
        attempts: currentAttemptNumber,
        type: 'quiz'
      };

      await setDoc(docRef, quizData);
      console.log('✅ New best quiz score saved with FULL details!', quizData);

      await updateOverallProgress(userId);

      return { 
        success: true, 
        updated: true,
        isNewRecord: true,
        currentScore: score,
        bestScore: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        message: `New best: ${score}/${totalQuestions} (${percentage}%)`
      };
    }
    
  } catch (error) {
    console.error('❌ Quiz submission error:', error);
    return { success: false, error: error.message };
  }
}

export async function loadPreviousQuizAttempt(chapterIds) {
  try {
    const userId = getUserId();
    const chapterKey = chapterIds.sort().join('-');
    const docRef = doc(db, 'quiz-progress', `${userId}_quiz_${chapterKey}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('📖 Previous quiz data loaded');
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Quiz load error:', error);
    return null;
  }
}

// ============================================
// OVERALL PROGRESS
// ============================================

async function updateOverallProgress(userId) {
  try {
    // Get all lesson progress
    const lessonsQuery = query(
      collection(db, 'user-progress'),
      where('userId', '==', userId),
      where('type', '==', 'lesson')
    );
    const lessonsSnapshot = await getDocs(lessonsQuery);
    
    let lessonsScore = 0;
    let lessonsTotal = 0;
    let completedLessons = 0;
    
    lessonsSnapshot.forEach((doc) => {
      const data = doc.data();
      lessonsScore += data.score || 0;
      lessonsTotal += data.totalQuestions || 0;
      completedLessons++;
    });
    
    // Get all quiz progress
    const quizzesQuery = query(
      collection(db, 'quiz-progress'),
      where('userId', '==', userId),
      where('type', '==', 'quiz')
    );
    const quizzesSnapshot = await getDocs(quizzesQuery);
    
    let quizzesScore = 0;
    let quizzesTotal = 0;
    let completedQuizzes = 0;
    
    quizzesSnapshot.forEach((doc) => {
      const data = doc.data();
      quizzesScore += data.score || 0;
      quizzesTotal += data.totalQuestions || 0;
      completedQuizzes++;
    });
    
    const totalScore = lessonsScore + quizzesScore;
    const totalQuestions = lessonsTotal + quizzesTotal;
    const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    const overallDocRef = doc(db, 'overall-progress', userId);
    await setDoc(overallDocRef, {
      userId: userId,
      lessons: {
        score: lessonsScore,
        total: lessonsTotal,
        completed: completedLessons,
        percentage: lessonsTotal > 0 ? Math.round((lessonsScore / lessonsTotal) * 100) : 0
      },
      quizzes: {
        score: quizzesScore,
        total: quizzesTotal,
        completed: completedQuizzes,
        percentage: quizzesTotal > 0 ? Math.round((quizzesScore / quizzesTotal) * 100) : 0
      },
      overall: {
        score: totalScore,
        total: totalQuestions,
        percentage: overallPercentage
      },
      lastUpdated: serverTimestamp()
    });
    
    console.log('📈 Overall progress updated');
    return { completedLessons, completedQuizzes, overallPercentage };
    
  } catch (error) {
    console.error('❌ Progress update error:', error);
  }
}

export async function getOverallStats() {
  try {
    const userId = getUserId();
    const docRef = doc(db, 'overall-progress', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {
      lessons: { score: 0, total: 0, completed: 0, percentage: 0 },
      quizzes: { score: 0, total: 0, completed: 0, percentage: 0 },
      overall: { score: 0, total: 0, percentage: 0 }
    };
  } catch (error) {
    console.error('❌ Stats load error:', error);
    return null;
  }
}

// ============================================
// 🧠 MIGRATE ANONYMOUS DATA TO LOGGED-IN ACCOUNT
// ============================================

/**
 * Migrate anonymous-stored docs (prefix: anon_...) into the newly authenticated user's records.
 *
 * @param {string} newUserId  - authenticated user's UID
 * @param {object} options - { deleteOld: boolean } (default: false)
 *
 * Behavior:
 *  - Looks for documents whose IDs start with the anonId in collections:
 *      'user-progress', 'quiz-progress', 'overall-progress'
 *  - Creates equivalent documents replacing the anonId with newUserId
 *  - Optionally deletes old anonymous docs if deleteOld === true
 *  - Removes the localStorage 'accounts-wizard-user-id' key after migration
 */
export async function migrateAnonymousData(newUserId, { deleteOld = false } = {}) {
  const anonId = localStorage.getItem('accounts-wizard-user-id');

  if (!anonId || !anonId.startsWith('anon_')) {
    console.log('ℹ️ No anonymous ID found — nothing to migrate.');
    return;
  }

  if (!newUserId) {
    throw new Error('migrateAnonymousData: newUserId required');
  }

  console.log(`🔄 Migrating data from ${anonId} → ${newUserId} (deleteOld=${deleteOld})`);

  try {
    const collectionsToCheck = ['user-progress', 'quiz-progress', 'overall-progress'];

    for (const col of collectionsToCheck) {
      const colRef = collection(db, col);
      // Firestore doesn't have "startsWith" queries on document ID, so we fetch a reasonable slice.
      // We fetch all docs in the collection and filter client-side by ID prefix.
      const snapshot = await getDocs(colRef);

      for (const docSnap of snapshot.docs) {
        const docId = docSnap.id;
        if (docId.startsWith(anonId)) {
          const data = docSnap.data();

          // Replace userId field if present
          data.userId = newUserId;

          // Generate new doc id by replacing prefix
          const newDocId = docId.replace(anonId, newUserId);

          // Write the migrated document
          await setDoc(doc(db, col, newDocId), data);
          console.log(`✅ Migrated ${col}/${docId} → ${newDocId}`);

          // Optionally delete the old anon doc
          if (deleteOld) {
            await deleteDoc(doc(db, col, docId));
            console.log(`🗑️ Deleted old anon doc ${col}/${docId}`);
          }
        }
      }
    }

    // Clear anon id from localStorage (so future getUserId() will use auth.currentUser.uid)
    localStorage.removeItem('accounts-wizard-user-id');
    console.log('🧹 Migration complete. anon ID cleared from localStorage.');

    // Recompute overall progress for the new user (best-effort)
    try {
      await updateOverallProgress(newUserId);
    } catch (e) {
      console.warn('⚠️ Could not update overall progress after migration:', e);
    }

  } catch (error) {
    console.error('❌ migrateAnonymousData error:', error);
    throw error;
  }
}

// ============================================
// 📊 ADMIN: GET ALL USERS DATA
// ============================================

export async function getAllUsersProgress() {
  try {
    const usersData = [];
    
    // Get all overall progress docs
    const progressSnapshot = await getDocs(collection(db, 'overall-progress'));
    
    for (const progressDoc of progressSnapshot.docs) {
      const progressData = progressDoc.data();
      const userId = progressData.userId;
      
      // Get user profile
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      
      usersData.push({
        userId: userId,
        name: userData.name || 'Anonymous',
        email: userData.email || 'N/A',
        photoURL: userData.photoURL || null,
        progress: progressData,
        lastLogin: userData.lastLogin || null
      });
    }
    
    console.log('✅ Retrieved', usersData.length, 'users');
    return usersData;
  } catch (error) {
    console.error('❌ Admin data error:', error);
    return [];
  }
}

export { db, auth };
