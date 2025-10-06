// =============================================
// quiz-validator.js
// Validates MCQs that are already present in HTML markup
// =============================================

// ==========================
// IMPORTS (must be at top)
// ==========================
import { db, getCurrentUser } from './firebase-config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
// DESELECT FUNCTIONALITY (Misclick Fix)
// ==========================
function enableDeselect(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', (e) => {
    if (e.target.type === 'radio') {
      const radio = e.target;
      
      // If already checked, uncheck it
      if (radio.dataset.checked === 'true') {
        radio.checked = false;
        radio.dataset.checked = 'false';
        updateProgress(containerId);
        return;
      }
      
      // Mark this one as checked, unmark others in same group
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
export function handleSubmit(containerId) {
  const unanswered = validateAnswers(containerId);
  
  if (unanswered.length > 0) {
    const proceed = confirm(
      `You have ${unanswered.length} unanswered question(s): ${unanswered.join(', ')}. Submit anyway?`
    );
    if (!proceed) return;
  }

  const container = document.getElementById(containerId);
  const mcqs = container.querySelectorAll('.mcq');
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

    // Visual feedback
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
      message = `💪 Don't give up! You scored ${score}/${total} (${percentage}%). Review the notes and try again!`;
    }
    
    resultDiv.innerHTML = message;
    resultDiv.style.display = "block";
  }

  if (retryBtn) {
    retryBtn.style.display = "inline-block";
  }

  // Disable further changes
  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.disabled = true;
  });

  console.log('Quiz Results:', results);
  return results;
}

// ==========================
// RETRY QUIZ
// ==========================
export function enableRetry(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear all selections and enable inputs
  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.checked = false;
    input.disabled = false;
    input.dataset.checked = 'false';
  });
  
  // Remove visual feedback
  container.querySelectorAll('.mcq').forEach(mcq => {
    mcq.style.borderLeft = '';
  });
  
  // Hide result and retry button
  const resultDiv = document.getElementById("quizResult");
  const retryBtn = document.getElementById("retry-btn");
  
  if (resultDiv) resultDiv.style.display = "none";
  if (retryBtn) retryBtn.style.display = "none";
  
  // Reset progress
  updateProgress(containerId);
  
  console.log("Quiz reset");
}

// ==========================
// INITIALIZE QUIZ
// ==========================
export function initQuiz(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const mcqs = container.querySelectorAll('.mcq');
  console.log(`Found ${mcqs.length} MCQs in the page`);

  // Add change listeners for progress tracking
  container.addEventListener('change', () => updateProgress(containerId));
  
  // Enable deselect functionality
  enableDeselect(containerId);
  
  // Initial progress update
  updateProgress(containerId);
  
  // Add fade-in animation to MCQs
  mcqs.forEach((mcq, index) => {
    mcq.classList.add('fade-in');
    mcq.style.animationDelay = `${index * 0.1}s`;
  });
  
  console.log('Quiz initialized successfully');
}

// ==========================
// FIREBASE INTEGRATION (Fixed)
// ==========================
export async function saveToFirebase(results, userId, lessonId) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.warn("⚠️ User not logged in — cannot save quiz results.");
      return;
    }

    // Prepare minimal data structure
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

    // Initialize lesson array if missing
    if (!quizzesData[lessonId]) {
      quizzesData[lessonId] = [];
    }

    // Add new attempt
    quizzesData[lessonId].push({
      timestamp: new Date().toISOString(),
      attempts: minimalData,
      score: results.filter(r => r.isCorrect).length,
      totalQuestions: results.length,
      percentage: Math.round(
        (results.filter(r => r.isCorrect).length / results.length) * 100
      )
    });

    // Save back to Firestore
    await setDoc(
      userRef,
      {
        quizzes: quizzesData,
        lastActivity: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ Quiz data saved for ${lessonId}!`);
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
  }
}
