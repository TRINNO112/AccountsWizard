// firebase-config.js
// Enhanced version with offline support

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
let app, auth, db, provider;
let isFirebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();
  isFirebaseInitialized = true;
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed (offline mode):', error.message);
  isFirebaseInitialized = false;
}

// Current user variable
let currentUser = null;

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Check if Firebase is available
 * @returns {boolean}
 */
export function isFirebaseAvailable() {
  return isFirebaseInitialized;
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object
 */
export async function signInWithGoogle() {
  if (!isFirebaseInitialized) {
    showToast('⚠️ Firebase not available. Working offline.');
    return null;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    await initializeUserProfile(currentUser);
    showToast(`Welcome ${currentUser.displayName}!`);
    return currentUser;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    showToast('❌ Sign in failed. Please try again.');
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  if (!isFirebaseInitialized) {
    return;
  }

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
 * Get current user (SAFE VERSION)
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
  if (!isFirebaseInitialized) {
    return null;
  }
  return currentUser;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Function to call when auth state changes
 */
export function onAuthChange(callback) {
  if (!isFirebaseInitialized) {
    callback(null);
    return;
  }

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
 */
export async function saveLessonProgress(lessonId, progress, score, totalQuestions) {
  if (!isFirebaseInitialized) {
    console.log('ℹ️ Firebase not available - progress not saved');
    return false;
  }

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
 */
export async function getLessonProgress(lessonId) {
  if (!isFirebaseInitialized || !currentUser) {
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
 */
export async function getAllLessonsProgress() {
  if (!isFirebaseInitialized || !currentUser) {
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
 */
export async function saveQuizResult(quizId, score, totalQuestions, answers = [], correctAnswers = []) {
  if (!isFirebaseInitialized) {
    console.log('ℹ️ Firebase not available - quiz results not saved');
    return false;
  }

  if (!currentUser) {
    console.warn('User not logged in. Quiz result not saved.');
    return false;
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    let quizzesData = {};
    if (userDoc.exists() && userDoc.data().quizzes) {
      quizzesData = userDoc.data().quizzes;
    }

    if (!quizzesData[quizId]) {
      quizzesData[quizId] = [];
    }

    quizzesData[quizId].push({
      score: score,
      totalQuestions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      answers: answers,
      correctAnswers: correctAnswers,
      timestamp: new Date().toISOString()
    });

    await setDoc(userRef, {
      quizzes: quizzesData,
      lastActivity: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Quiz ${quizId} result saved!`);
    showToast('✅ Quiz results saved!');
    return true;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return false;
  }
}

/**
 * Get quiz history
 */
export async function getQuizHistory(quizId) {
  if (!isFirebaseInitialized || !currentUser) {
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
 */
export async function initializeUserProfile(user) {
  if (!user || !isFirebaseInitialized) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
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
 * Calculate total progress
 */
export async function calculateTotalProgress() {
  if (!isFirebaseInitialized || !currentUser) {
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

function showToast(message) {
  const existingToasts = document.querySelectorAll('.firebase-toast');
  existingToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = 'firebase-toast';
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
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

if (!document.querySelector('#firebase-toast-styles')) {
  const style = document.createElement('style');
  style.id = 'firebase-toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export { auth, db, provider };