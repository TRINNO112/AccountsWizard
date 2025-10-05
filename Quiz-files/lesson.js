// Import our database connection from the config file
import { db } from './firebaseConfig.js';
// Import the specific Firebase functions we need
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Get the HTML elements we need to interact with
const completeButton = document.getElementById('completeButton');
const statusElement = document.getElementById('status');

// Make sure the button actually exists on the page before we add a listener
if (completeButton) {
    // Get the unique lesson ID from the button's data-lesson-id attribute
    const lessonId = completeButton.dataset.lessonId;

    // Listen for a click on the button
    completeButton.addEventListener('click', async () => {
        // Disable the button to prevent multiple clicks while we save the data
        completeButton.disabled = true;
        completeButton.textContent = 'Recording...';
        statusElement.textContent = `Recording progress for ${lessonId}...`;

        try {
            // Add a new document to the "lessons" collection in your Firestore database
            const docRef = await addDoc(collection(db, "lessons"), {
                lessonId: lessonId, // The ID from the button's data attribute
                completedAt: serverTimestamp(), // The time the lesson was completed
                userId: "user_placeholder_id" // TODO: Replace with a real user ID later
            });

            console.log("Document written with ID: ", docRef.id);
            statusElement.textContent = `Successfully recorded progress!`;
            completeButton.textContent = 'Completed!';

        } catch (e) {
            console.error("Error adding document: ", e);
            statusElement.textContent = 'Failed to record progress. Check the console for details.';
            // Re-enable the button if there was an error so the user can try again
            completeButton.disabled = false;
            completeButton.textContent = 'Try Again';
        }
    });
}
