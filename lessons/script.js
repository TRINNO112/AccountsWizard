// =============================================
// quiz-validator.js
// SIMPLIFIED - Works 100% offline
// =============================================

console.log('🔄 Loading quiz validator...');

// ==========================
// FIREBASE SAFE LOADING
// ==========================
let db = null;
let getCurrentUser = null;
let doc = null;
let getDoc = null;
let setDoc = null;
let isFirebaseAvailable = false;

// Try to load Firebase (but don't break if it fails)
// ==========================
// FIREBASE SAVE (FIXED FOR YOUR STRUCTURE)
// ==========================
export async function saveToFirebase(results, lessonId) {
  if (!isFirebaseLoaded) {
    console.log('ℹ️ Firebase not loaded - skipping save');
    return false;
  }

  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log("ℹ️ Not logged in - skipping save");
      return false;
    }

    // Calculate score
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Prepare quiz data
    const quizData = {
      lessonId: lessonId,
      score: correctCount,
      totalQuestions: totalQuestions,
      percentage: percentage,
      timestamp: new Date().toISOString(),
      answers: results.map(r => ({
        questionNumber: r.questionNumber,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect
      }))
    };

    console.log('📤 Attempting to save quiz data:', quizData);

    // Get user document reference
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('❌ User document not found!');
      return false;
    }

    // Get existing data
    const userData = userDoc.data();
    let quizScores = userData.quizScores || [];

    // Add new quiz attempt
    quizScores.push(quizData);

    // Update practice attempts
    const practiceAttempts = (userData.practiceAttempts || 0) + 1;

    // Update lessons completed (if not already there)
    let lessonsCompleted = userData.lessonsCompleted || [];
    if (!lessonsCompleted.includes(lessonId) && percentage >= 70) {
      lessonsCompleted.push(lessonId);
    }

    // Save back to Firestore
    await setDoc(
      userRef,
      {
        quizScores: quizScores,
        practiceAttempts: practiceAttempts,
        lessonsCompleted: lessonsCompleted,
        lastActivity: new Date().toISOString()
      },
      { merge: true }
    );

    console.log(`✅ Quiz saved successfully!`);
    console.log(`📊 Score: ${correctCount}/${totalQuestions} (${percentage}%)`);
    console.log(`📈 Total attempts: ${practiceAttempts}`);
    
    // Show success toast
    showSuccessMessage(`Quiz saved! Score: ${percentage}%`);
    
    return true;

  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

// Helper function to show success message
function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  successDiv.textContent = '✅ ' + message;
  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

// Add animations if not already present
if (!document.querySelector('#success-animations')) {
  const style = document.createElement('style');
  style.id = 'success-animations';
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

// ==========================
// PROGRESS TRACKING
// ==========================
function updateProgress(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const mcqs = container.querySelectorAll('.mcq');
  const total = mcqs.length;
  let answered = 0;

  mcqs.forEach(mcq => {
    const inputs = mcq.querySelectorAll('input[type="radio"]');
    const hasAnswer = Array.from(inputs).some(input => input.checked);
    if (hasAnswer) answered++;
  });

  const progressDiv = document.getElementById("quiz-progress");
  if (progressDiv) {
    const percentage = Math.round((answered / total) * 100);
    progressDiv.innerHTML = `
      <div class="progress-info">
        ${answered}/${total} answered
        <div class="progress-bar">
          <div class="progress-bar-inner" style="width:${percentage}%"></div>
        </div>
      </div>
    `;
  }
}

// ==========================
// DESELECT FUNCTIONALITY
// ==========================
function enableDeselect(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', (e) => {
    if (e.target.type === 'radio') {
      const radio = e.target;
      
      if (radio.dataset.checked === 'true') {
        radio.checked = false;
        radio.dataset.checked = 'false';
        updateProgress(containerId);
        return;
      }
      
      const name = radio.name;
      container.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.dataset.checked = 'false';
      });
      radio.dataset.checked = 'true';
      updateProgress(containerId);
    }
  });
}

// ==========================
// VALIDATE ANSWERS
// ==========================
function validateAnswers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  const mcqs = container.querySelectorAll('.mcq');
  const unanswered = [];

  mcqs.forEach((mcq, index) => {
    const inputs = mcq.querySelectorAll('input[type="radio"]');
    const hasAnswer = Array.from(inputs).some(input => input.checked);
    if (!hasAnswer) {
      unanswered.push(index + 1);
    }
  });

  return unanswered;
}

// ==========================
// SUBMIT QUIZ
// ==========================
export function handleSubmit(containerId, lessonId = null) {
  console.log('🎯 Submit button clicked!');
  console.log('Container ID:', containerId);
  console.log('Lesson ID:', lessonId);

  const unanswered = validateAnswers(containerId);
  
  if (unanswered.length > 0) {
    const proceed = confirm(
      `You have ${unanswered.length} unanswered question(s): ${unanswered.join(', ')}. Submit anyway?`
    );
    if (!proceed) {
      console.log('❌ User cancelled submission');
      return;
    }
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container '${containerId}' not found!`);
    alert('Error: Quiz container not found!');
    return;
  }

  const mcqs = container.querySelectorAll('.mcq');
  console.log(`📝 Found ${mcqs.length} questions`);

  let score = 0;
  let total = mcqs.length;
  const results = [];

  mcqs.forEach((mcq, index) => {
    const correctAnswer = mcq.dataset.answer;
    const selectedInput = mcq.querySelector('input[type="radio"]:checked');
    const userAnswer = selectedInput ? selectedInput.value : null;
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) score++;

    results.push({
      questionNumber: index + 1,
      userAnswer: userAnswer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect
    });

    mcq.style.borderLeft = isCorrect ? '4px solid #4ade80' : '4px solid #f87171';
    mcq.style.transition = 'border-left 0.3s ease';
  });

  // Display result
  const resultDiv = document.getElementById("quizResult");
  const retryBtn = document.getElementById("retry-btn");
  
  if (resultDiv) {
    let message = "";
    const percentage = Math.round((score / total) * 100);
    
    if (score === total) {
      message = `🎉 Perfect! You scored ${score}/${total} (${percentage}%) - Excellent work!`;
    } else if (percentage >= 70) {
      message = `👍 Good job! You scored ${score}/${total} (${percentage}%)`;
    } else if (percentage >= 50) {
      message = `📚 Keep practicing! You scored ${score}/${total} (${percentage}%)`;
    } else {
      message = `💪 Don't give up! You scored ${score}/${total} (${percentage}%). Review and try again!`;
    }
    
    resultDiv.innerHTML = message;
    resultDiv.style.display = "block";
    console.log('✅ Result displayed:', message);
  } else {
    console.warn('⚠️ Result div not found!');
  }

  if (retryBtn) {
    retryBtn.style.display = "inline-block";
  }

  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.disabled = true;
  });

  console.log('📊 Quiz Results:', {
    score: `${score}/${total}`,
    percentage: `${Math.round((score / total) * 100)}%`
  });

  // Try to save to Firebase (non-blocking)
  if (lessonId && isFirebaseAvailable) {
    saveToFirebase(results, lessonId).catch(err => {
      console.log('ℹ️ Could not save to Firebase:', err.message);
    });
  } else if (!isFirebaseAvailable) {
    console.log('ℹ️ Firebase not available - results not saved (this is OK!)');
  }

  return results;
}

// ==========================
// RETRY QUIZ
// ==========================
export function enableRetry(containerId) {
  console.log('🔄 Retry button clicked!');

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container '${containerId}' not found!`);
    return;
  }
  
  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.checked = false;
    input.disabled = false;
    input.dataset.checked = 'false';
  });
  
  container.querySelectorAll('.mcq').forEach(mcq => {
    mcq.style.borderLeft = '';
  });
  
  const resultDiv = document.getElementById("quizResult");
  const retryBtn = document.getElementById("retry-btn");
  
  if (resultDiv) resultDiv.style.display = "none";
  if (retryBtn) retryBtn.style.display = "none";
  
  updateProgress(containerId);
  console.log("✅ Quiz reset complete");
}

// ==========================
// INITIALIZE QUIZ
// ==========================
export function initQuiz(containerId) {
  console.log('🚀 Initializing quiz...');
  console.log('Container ID:', containerId);

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ Container '${containerId}' not found!`);
    return;
  }

  const mcqs = container.querySelectorAll('.mcq');
  console.log(`✅ Found ${mcqs.length} MCQs`);

  if (mcqs.length === 0) {
    console.warn('⚠️ No MCQs found! Make sure your HTML has elements with class "mcq"');
    return;
  }

  container.addEventListener('change', () => updateProgress(containerId));
  enableDeselect(containerId);
  updateProgress(containerId);
  
  mcqs.forEach((mcq, index) => {
    mcq.classList.add('fade-in');
    mcq.style.animationDelay = `${index * 0.1}s`;
  });
  
  console.log('✅ Quiz initialized successfully!');
}

// ==========================
// FIREBASE SAVE
// ==========================
async function saveToFirebase(results, lessonId) {
  if (!isFirebaseAvailable) {
    console.log('ℹ️ Firebase not available');
    return false;
  }

  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log("ℹ️ Not logged in - skipping save");
      return false;
    }

    const minimalData = results.map(r => ({
      questionNumber: r.questionNumber,
      userAnswer: r.userAnswer,
      correctAnswer: r.correctAnswer,
      isCorrect: r.isCorrect,
    }));

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    let quizzesData = {};

    if (userDoc.exists() && userDoc.data().quizzes) {
      quizzesData = userDoc.data().quizzes;
    }

    if (!quizzesData[lessonId]) {
      quizzesData[lessonId] = [];
    }

    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    quizzesData[lessonId].push({
      timestamp: new Date().toISOString(),
      attempts: minimalData,
      score: correctCount,
      totalQuestions: totalQuestions,
      percentage: percentage
    });

    await setDoc(
      userRef,
      {
        quizzes: quizzesData,
        lastActivity: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ Saved to Firebase! Score: ${correctCount}/${totalQuestions}`);
    return true;

  } catch (error) {
    console.warn('⚠️ Could not save to Firebase:', error.message);
    return false;
  }
}

console.log('✅ Quiz Validator loaded successfully!');