// Firebase Configuration for AccountsWizard
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Your Firebase configuration
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

// ========================================
// USER ID MANAGEMENT (Works for both logged-in and anonymous users)
// ========================================
export function getUserId() {
  // If user is logged in with Google, use their Firebase Auth UID
  if (auth.currentUser) {
    console.log('✅ Logged-in user:', auth.currentUser.email);
    return auth.currentUser.uid; // Returns Firebase Auth UID
  }
  
  // Otherwise, create/use anonymous user ID from localStorage
  let userId = localStorage.getItem('accounts-wizard-user-id');
  if (!userId) {
    userId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('accounts-wizard-user-id', userId);
    console.log('👤 Anonymous user created:', userId);
  } else {
    console.log('👤 Anonymous user loaded:', userId);
  }
  return userId;
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Signed in:', result.user.email);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('❌ Sign-in error:', error);
    return { success: false, error: error.message };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('✅ Signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign-out error:', error);
    return { success: false, error: error.message };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ========================================
// LOAD PREVIOUS LESSON DATA
// ========================================
export async function loadPreviousAnswers(lessonNumber) {
  try {
    const userId = getUserId();
    const docRef = doc(db, 'user-progress', `${userId}_lesson${lessonNumber}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📖 Previous answers loaded:', data);
      return data;
    } else {
      console.log('📝 No previous attempts found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading previous answers:', error);
    return null;
  }
}

// ========================================
// SUBMIT LESSON ATTEMPT (ONLY SAVES IF BETTER SCORE)
// ========================================
export async function submitLessonAttempt(lessonNumber, answers, score, totalQuestions) {
  try {
    const userId = getUserId();
    const percentage = Math.round((score / totalQuestions) * 100);
    const docId = `${userId}_lesson${lessonNumber}`;
    const docRef = doc(db, 'user-progress', docId);
    
    // Check if previous attempt exists
    const prevDoc = await getDoc(docRef);
    let shouldSave = true;
    let previousBestScore = 0;
    let previousPercentage = 0;
    let previousTotalQuestions = totalQuestions;
    
    if (prevDoc.exists()) {
      const prevData = prevDoc.data();
      previousBestScore = prevData.score || 0;
      previousPercentage = prevData.percentage || 0;
      previousTotalQuestions = prevData.totalQuestions || totalQuestions;
      
      // ✅ COMPARE PERCENTAGES (NOT RAW SCORES)
      if (percentage <= previousPercentage) {
        shouldSave = false;
        console.log(`📊 Previous score (${previousBestScore}/${previousTotalQuestions} = ${previousPercentage}%) was equal or better. Not updating.`);
        return { 
          success: true, 
          updated: false, 
          currentScore: score,
          bestScore: previousBestScore,
          totalQuestions: previousTotalQuestions,
          percentage: previousPercentage,
          message: `Previous best: ${previousBestScore}/${previousTotalQuestions} (${previousPercentage}%)`
        };
      }
    }
    
    if (shouldSave) {
      const lessonData = {
        userId: userId,
        lessonNumber: lessonNumber,
        answers: answers, // Object: { q1: {selected: 'a', correct: 'b', isCorrect: false}, ... }
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        timestamp: serverTimestamp(),
        attempts: prevDoc.exists() ? (prevDoc.data().attempts || 1) + 1 : 1
      };

      await setDoc(docRef, lessonData);
      console.log('✅ New best score saved!', lessonData);
      
      // Update overall progress across all lessons
      await updateOverallProgress(userId);
      
      return { 
        success: true, 
        updated: true, 
        currentScore: score,
        bestScore: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        isNewRecord: true,
        message: `New best score: ${score}/${totalQuestions} (${percentage}%)`
      };
    }
    
  } catch (error) {
    console.error('❌ Error submitting lesson attempt:', error);
    return { success: false, error: error.message };
  }
}

// ========================================
// UPDATE OVERALL PROGRESS (ALL 14 LESSONS)
// ========================================
async function updateOverallProgress(userId) {
  try {
    const progressRef = collection(db, 'user-progress');
    const q = query(progressRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let totalScore = 0;
    let totalQuestions = 0;
    let completedLessons = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalScore += data.score || 0;
      totalQuestions += data.totalQuestions || 0;
      completedLessons++;
    });
    
    const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    // Save overall progress
    const overallDocRef = doc(db, 'overall-progress', userId);
    await setDoc(overallDocRef, {
      userId: userId,
      totalScore: totalScore,
      totalQuestions: totalQuestions,
      overallPercentage: overallPercentage,
      completedLessons: completedLessons,
      totalLessons: 14, // Your total number of lessons
      lastUpdated: serverTimestamp()
    });
    
    console.log('📈 Overall progress updated:', { completedLessons, overallPercentage });
    return { completedLessons, overallPercentage };
    
  } catch (error) {
    console.error('❌ Error updating overall progress:', error);
  }
}

// ========================================
// GET OVERALL PROGRESS (FOR INDEX PAGE)
// ========================================
export async function getOverallProgress() {
  try {
    const userId = getUserId();
    const docRef = doc(db, 'overall-progress', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return {
        completedLessons: 0,
        totalLessons: 14,
        overallPercentage: 0,
        totalScore: 0,
        totalQuestions: 0
      };
    }
  } catch (error) {
    console.error('❌ Error getting overall progress:', error);
    return { completedLessons: 0, totalLessons: 14, overallPercentage: 0 };
  }
}

// Export db and auth for other uses
export { db, auth };