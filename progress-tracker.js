// progress-tracker.js - Track lesson progress with scrolling and MCQs
(function() {
    // Auto-detect current lesson from URL
    const currentUrl = window.location.pathname;
    const lessonMatch = currentUrl.match(/lesson-(\d+)\.html/);
    
    // Only run on lesson pages
    if (!lessonMatch) return;
    
    // Get the lesson number
    const lessonId = parseInt(lessonMatch[1]);
    if (isNaN(lessonId)) return;
    
    console.log(`Progress Tracker activated for Lesson ${lessonId}`);
    
    // Initialize progress tracking
    let progressData = {
        scrollProgress: 0,
        mcqProgress: 0,
        maxScrollPercent: 0,
        lastUpdated: Date.now()
    };
    
    // Load existing progress
    function loadProgress() {
        const savedProgress = localStorage.getItem('accountsWizardProgress');
        if (!savedProgress) return {};
        return JSON.parse(savedProgress);
    }
    
    // Save progress
    function saveProgress(progressData) {
        localStorage.setItem('accountsWizardProgress', JSON.stringify(progressData));
    }
    
    // Update lesson progress
    function updateProgress(scrollPercent, mcqCorrect) {
        // Get current progress
        const progress = loadProgress();
        
        // Create lesson entry if it doesn't exist
        const lessonKey = `lesson${lessonId}`;
        if (!progress[lessonKey]) {
            progress[lessonKey] = {
                progress: 0,
                unlocked: lessonId === 1, // Only first lesson unlocked by default
                completed: false,
                lastVisited: Date.now()
            };
        }
        
        // Track highest scroll percentage (70% max from scrolling)
        if (scrollPercent > progressData.maxScrollPercent) {
            progressData.maxScrollPercent = scrollPercent;
            progressData.scrollProgress = Math.min(Math.round(scrollPercent * 70), 70);
        }
        
        // Track MCQ progress (20% max, 4% per correct MCQ)
        if (mcqCorrect !== undefined) {
            // Count total correctly answered MCQs (max 5)
            const mcqsCorrect = Math.min(mcqCorrect, 5);
            progressData.mcqProgress = mcqsCorrect * 4; // 4% per correct MCQ
        }
        
        // Calculate total progress
        const totalProgress = progressData.scrollProgress + progressData.mcqProgress;
        
        // Only update if higher than existing progress
        if (totalProgress > (progress[lessonKey].progress || 0)) {
            progress[lessonKey].progress = totalProgress;
            progress[lessonKey].lastVisited = Date.now();
            
            // Update progress in localStorage
            saveProgress(progress);
            
            // Unlock next lesson when reaching 70% progress
            if (totalProgress >= 70 && lessonId < 14) {
                const nextLessonKey = `lesson${lessonId + 1}`;
                if (!progress[nextLessonKey]) {
                    progress[nextLessonKey] = {
                        progress: 0,
                        unlocked: true,
                        completed: false
                    };
                    saveProgress(progress);
                } else if (!progress[nextLessonKey].unlocked) {
                    progress[nextLessonKey].unlocked = true;
                    saveProgress(progress);
                }
            }
        }
    }
    
    // Track scrolling
    window.addEventListener('scroll', function() {
        // Calculate how far down the page the user has scrolled
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // Calculate scroll percentage
        const scrollPercent = Math.min(scrollTop / (documentHeight - windowHeight), 1);
        
        // Throttle updates to avoid excessive localStorage writes
        const now = Date.now();
        if (now - progressData.lastUpdated > 2000) { // update every 2 seconds max
            progressData.lastUpdated = now;
            updateProgress(scrollPercent);
        }
    });
    
    // Also update on page load
    setTimeout(function() {
        const scrollPercent = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);
        updateProgress(scrollPercent);
    }, 1000);
    
    // Add a "Mark as Complete" button at the bottom of the page
    window.addEventListener('DOMContentLoaded', function() {
        // Create the completion button
        const completionDiv = document.createElement('div');
        completionDiv.className = 'lesson-completion';
        completionDiv.innerHTML = `
            <h3>Lesson Complete?</h3>
            <p>Mark this lesson as completed to track your progress.</p>
            <button id="markComplete" class="mark-complete-btn">Mark Lesson as Completed</button>
        `;
        
        // Add some basic styling
        const style = document.createElement('style');
        style.textContent = `
            .lesson-completion {
                margin: 40px auto;
                padding: 20px;
                border: 1px solid rgba(12, 255, 225, 0.2);
                border-radius: 12px;
                text-align: center;
                max-width: 500px;
                background: rgba(0, 0, 0, 0.2);
            }
            .mark-complete-btn {
                background-color: rgba(12, 255, 225, 0.1);
                color: #0cffe1;
                border: 1px solid rgba(12, 255, 225, 0.3);
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.25s ease;
                margin-top: 20px;
            }
            .mark-complete-btn:hover {
                background-color: rgba(12, 255, 225, 0.2);
                box-shadow: 0 0 15px rgba(12, 255, 225, 0.3);
            }
        `;
        document.head.appendChild(style);
        
        // Add to the page
        document.body.appendChild(completionDiv);
        
        // Add click handler
        document.getElementById('markComplete').addEventListener('click', function() {
            const progress = loadProgress();
            const lessonKey = `lesson${lessonId}`;
            
            if (!progress[lessonKey]) {
                progress[lessonKey] = {
                    unlocked: lessonId === 1, // Only first lesson unlocked by default
                    lastVisited: Date.now()
                };
            }
            
            // Mark as 100% complete
            progress[lessonKey].progress = 100;
            progress[lessonKey].completed = true;
            
            // Unlock next lesson if not the last one
            if (lessonId < 14) {
                const nextLessonKey = `lesson${lessonId + 1}`;
                if (!progress[nextLessonKey]) {
                    progress[nextLessonKey] = {
                        progress: 0,
                        unlocked: true,
                        completed: false
                    };
                } else {
                    progress[nextLessonKey].unlocked = true;
                }
            }
            
            // Save progress
            saveProgress(progress);
            
            // Provide feedback
            this.textContent = "✓ Lesson Completed!";
            this.disabled = true;
            this.style.backgroundColor = "rgba(74, 222, 128, 0.2)";
            this.style.color = "#4ade80";
            this.style.borderColor = "rgba(74, 222, 128, 0.3)";
            
            // Redirect back to lessons page after a delay
            setTimeout(function() {
                window.location.href = "../lessons.html";
            }, 1500);
        });
    });
    
    // Track MCQ completion - hook into existing MCQ script
    // This function will be available to your existing scripts
    window.trackMCQProgress = function(correctCount) {
        updateProgress(progressData.maxScrollPercent, correctCount);
    };
})();