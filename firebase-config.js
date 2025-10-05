// firebase-config.js
// Place this file in your root directory (same level as index.html)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGOz3UUPcADFyNcPlkP-qk8WwYPaOnB1o",
  authDomain: "accountswizard-70571.firebaseapp.com",
  projectId: "accountswizard-70571",
  storageBucket: "accountswizard-70571.firebasestorage.app",
  messagingSenderId: "435745784169",
  appId: "1:435745784169:web:52baea854e564bf30dfdf8",
  measurementId: "G-7P8Q8N4JQ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Current user variable
let currentUser = null;

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    showToast(`Welcome ${result.user.displayName}! 🎉`);
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    showToast('Failed to sign in. Please try again.');
    return null;
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    currentUser = null;
    showToast('Signed out successfully!');
  } catch (error) {
    console.error('Error signing out:', error);
    showToast('Sign out failed.');
  }
}

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Function to call when auth state changes
 */
export function onAuthChange(callback) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

// ============================================
// FIRESTORE DATA FUNCTIONS
// ============================================

/**
 * Save lesson progress to Firestore
 * @param {string} lessonId - Lesson ID (e.g., "lesson-1")
 * @param {number} progress - Progress percentage (0-100)
 * @param {number} score - Quiz score
 * @param {number} totalQuestions - Total number of questions
 */
export async function saveLessonProgress(lessonId, progress, score, totalQuestions) {
  if (!currentUser) {
    console.warn('User not logged in. Progress not saved.');
    showToast('⚠️ Sign in to save your progress!');
    return false;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    let lessonsData = {};
    if (userDoc.exists() && userDoc.data().lessons) {
      lessonsData = userDoc.data().lessons;
    }

    // Update lesson data
    lessonsData[lessonId] = {
      progress: progress,
      score: score,
      totalQuestions: totalQuestions,
      completed: progress === 100,
      lastUpdated: new Date().toISOString()
    };

    await setDoc(userRef, {
      lessons: lessonsData,
      lastActivity: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Lesson ${lessonId} progress saved!`);
    return true;
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    showToast('❌ Failed to save progress. Please try again.');
    return false;
  }
}

/**
 * Get lesson progress from Firestore
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object|null>} Lesson progress data
 */
export async function getLessonProgress(lessonId) {
  if (!currentUser) {
    return null;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().lessons) {
      return userDoc.data().lessons[lessonId] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting lesson progress:', error);
    return null;
  }
}

/**
 * Get all lessons progress
 * @returns {Promise<Object>} All lessons progress data
 */
export async function getAllLessonsProgress() {
  if (!currentUser) {
    return {};
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().lessons) {
      return userDoc.data().lessons;
    }
    return {};
  } catch (error) {
    console.error('Error getting all lessons progress:', error);
    return {};
  }
}

/**
 * Save quiz results to Firestore
 * @param {string} quizId - Quiz ID
 * @param {number} score - Score achieved
 * @param {number} totalQuestions - Total questions
 * @param {Array} answers - User's answers
 */
export async function saveQuizResult(quizId, score, totalQuestions, answers = []) {
  if (!currentUser) {
    console.warn('User not logged in. Quiz result not saved.');
    showToast('⚠️ Sign in to save your quiz results!');
    return false;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    let quizzesData = {};
    if (userDoc.exists() && userDoc.data().quizzes) {
      quizzesData = userDoc.data().quizzes;
    }

    // Initialize quiz array if doesn't exist
    if (!quizzesData[quizId]) {
      quizzesData[quizId] = [];
    }

    // Add new attempt
    quizzesData[quizId].push({
      score: score,
      totalQuestions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      answers: answers,
      timestamp: new Date().toISOString()
    });

    await setDoc(userRef, {
      quizzes: quizzesData,
      lastActivity: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Quiz ${quizId} result saved!`);
    return true;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    showToast('❌ Failed to save quiz result. Please try again.');
    return false;
  }
}

/**
 * Get quiz history
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Array>} Array of quiz attempts
 */
export async function getQuizHistory(quizId) {
  if (!currentUser) {
    return [];
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().quizzes && userDoc.data().quizzes[quizId]) {
      return userDoc.data().quizzes[quizId];
    }
    return [];
  } catch (error) {
    console.error('Error getting quiz history:', error);
    return [];
  }
}

/**
 * Initialize or update user profile
 * @param {Object} user - Firebase user object
 */
export async function initializeUserProfile(user) {
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lessons: {},
        quizzes: {},
        totalProgress: 0
      });
      console.log('✅ New user profile created!');
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      });
      console.log('✅ User profile updated!');
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
  }
}

/**
 * Calculate total progress across all lessons
 * @returns {Promise<number>} Total progress percentage
 */
export async function calculateTotalProgress() {
  if (!currentUser) {
    return 0;
  }

  try {
    const lessonsProgress = await getAllLessonsProgress();
    const lessonIds = Object.keys(lessonsProgress);
    
    if (lessonIds.length === 0) {
      return 0;
    }

    const totalProgress = lessonIds.reduce((sum, lessonId) => {
      return sum + (lessonsProgress[lessonId].progress || 0);
    }, 0);

    return Math.round(totalProgress / lessonIds.length);
  } catch (error) {
    console.error('Error calculating total progress:', error);
    return 0;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(90deg, #7c4dff, #00e5ff);
    color: #0b1020;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Export auth and db for advanced usage
export { auth, db };