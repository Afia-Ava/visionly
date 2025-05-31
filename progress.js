// Firebase configuration and initialization should be already done in firebase-config.js

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Quotes for motivation
const quotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" }
];

// AI encouragement messages
const encouragementMessages = [
    "You're making great progress! Keep pushing forward!",
    "Every small step counts. You're getting closer to your goals!",
    "Remember why you started. Your vision is worth the effort!",
    "You've come so far already. Keep that momentum going!",
    "Your dedication is inspiring. Keep up the amazing work!"
];

// Camera functionality
let stream = null;
let selectedOverlay = null;

navigator.mediaDevices.enumerateDevices().then(devices => {
    console.log('Available devices:', devices);
}).catch(error => {
    console.error('Error enumerating devices:', error);
});

async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 }, // Using same resolution as startCamera for consistency
                height: { ideal: 480 }
            },
            audio: false
        });
        const videoElement = document.getElementById('camera-feed');
        videoElement.srcObject = stream;

        // Update button states to reflect camera is ON
        const toggleButton = document.getElementById('toggle-camera');
        const takeSnapshotButton = document.getElementById('take-snapshot');

        toggleButton.textContent = 'Stop Camera'; // Reflects camera is active
        takeSnapshotButton.disabled = false; // Enable take snapshot
        isCameraOn = true; // Set the state variable

        const errorMessage = document.getElementById('camera-error-message');
        errorMessage.style.display = 'none'; // Hide error if successful

        console.log('Camera initialized successfully!');
    } catch (err) {
        // ... (your existing error handling) ...
        console.error('Error accessing camera during initialization:', err);
        const errorMessage = document.getElementById('camera-error-message');
        if (err.name === 'NotAllowedError') {
            errorMessage.textContent = 'Camera access denied. Please enable camera permissions in your browser settings.';
        } else if (err.name === 'NotFoundError') {
            errorMessage.textContent = 'No camera found. Please connect a camera and try again.';
        } else {
            errorMessage.textContent = 'Unable to access camera. Please try again later.';
        }
        errorMessage.style.display = 'block';
        // Ensure buttons are in correct state if camera fails to start
        document.getElementById('toggle-camera').textContent = 'Start Camera';
        document.getElementById('take-snapshot').disabled = true;
        isCameraOn = false;
    }
}

// Start the camera
async function startCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        
        const videoElement = document.getElementById('camera-feed');
        videoElement.srcObject = stream;
        
        // Update button states
        const toggleButton = document.getElementById('toggle-camera');
        const takeSnapshotButton = document.getElementById('take-snapshot');
        
        toggleButton.textContent = 'Stop Camera';
        takeSnapshotButton.disabled = false;
        isCameraOn = true;
        
        // Hide error messages
        const errorMessage = document.getElementById('camera-error-message');
        errorMessage.style.display = 'none';
        
        console.log('Camera started successfully');
    } catch (error) {
        console.error('Error accessing camera:', error);
        const errorMessage = document.getElementById('camera-error-message');
        if (error.name === 'NotAllowedError') {
            errorMessage.textContent = 'Camera access denied. Please enable camera permissions.';
        } else if (error.name === 'NotFoundError') {
            errorMessage.textContent = 'No camera found. Please connect a camera.';
        } else {
            errorMessage.textContent = 'Unable to access camera. Please check permissions.';
        }
        errorMessage.style.display = 'block';
    }
}


// Stop the camera
function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        stream = null;
        
        const videoElement = document.getElementById('camera-feed');
        videoElement.srcObject = null;
        
        // Update button states
        const toggleButton = document.getElementById('toggle-camera');
        const takeSnapshotButton = document.getElementById('take-snapshot');
        
        toggleButton.textContent = 'Start Camera';
        takeSnapshotButton.disabled = true;
        isCameraOn = false;
        
        console.log('Camera stopped');
    }
}

// Camera state
let isCameraOn = false;
let lastSnapshot = null;

// Toggle camera on/off
document.getElementById('toggle-camera').addEventListener('click', () => {
    if (isCameraOn) {
        stopCamera();
    } else {
        startCamera();
    }
});

// Take snapshot
document.getElementById('take-snapshot').addEventListener('click', () => {
    const videoElement = document.getElementById('camera-feed');
    
    if (!videoElement.srcObject) {
        alert('Please start the camera first!');
        return;
    }
    
    // Create canvas to capture the frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Clear previous snapshots and add new one
    const snapshotContainer = document.getElementById('snapshot-container');
    snapshotContainer.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.alt = 'Snapshot';
    img.style.width = '200px';
    img.style.height = 'auto';
    img.style.margin = '10px';
    img.style.border = '2px solid #fff';
    img.style.borderRadius = '8px';
    
    snapshotContainer.appendChild(img);
    lastSnapshot = img.src;

    // Show retake button
    document.getElementById('retake-photo').style.display = 'inline-block';

    // Add visual feedback
    videoElement.style.filter = 'brightness(1.5)';
    setTimeout(() => {
        videoElement.style.filter = 'none';
    }, 200);
    
    console.log('Snapshot captured successfully!');
});

// Retake photo
document.getElementById('retake-photo').addEventListener('click', () => {
    const snapshotContainer = document.getElementById('snapshot-container');
    snapshotContainer.innerHTML = '';
    lastSnapshot = null;
    document.getElementById('retake-photo').style.display = 'none';
    console.log('Photo cleared, ready for new snapshot');
});

// Initialize camera when page loads
window.addEventListener('load', initCamera);

// Cleanup camera stream when leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Initialize the progress page
async function initializePage() {
    updateDailyQuote();
    updateAIEncouragement();
    await loadUserProgress();
    setupEventListeners();
}

// Update the daily quote
function updateDailyQuote() {
    const today = new Date().getDate();
    const quoteIndex = today % quotes.length;
    const quote = quotes[quoteIndex];
    
    document.getElementById('daily-quote').textContent = quote.text;
    document.getElementById('quote-author').textContent = `- ${quote.author}`;
}

// Update AI encouragement
function updateAIEncouragement() {
    const encouragementIndex = Math.floor(Math.random() * encouragementMessages.length);
    const aiContainer = document.getElementById('ai-encouragement');
    aiContainer.innerHTML = `
        <p style="color: #fff; font-size: 1.1rem;">
            <span style="color: #8854d0;">🤖 AI Assistant:</span> 
            ${encouragementMessages[encouragementIndex]}
        </p>
    `;
}

// Load user's progress data
async function loadUserProgress() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Load boards and their progress
        const boardsSnapshot = await db.collection('boards').where('userId', '==', user.uid).get();
        const boards = [];
        let totalTasks = 0;
        let completedTasks = 0;

        boardsSnapshot.forEach(doc => {
            const board = doc.data();
            boards.push({ id: doc.id, ...board });
            if (board.milestones) {
                totalTasks += board.milestones.length;
                completedTasks += board.milestones.filter(m => m.completed).length;
            }
        });

        // Update stats
        document.getElementById('active-goals').textContent = boards.length;
        document.getElementById('tasks-completed').textContent = completedTasks;

        // Load streak data
        const streakDoc = await db.collection('streaks').doc(user.uid).get();
        const streakData = streakDoc.exists ? streakDoc.data() : { currentStreak: 0 };
        document.getElementById('current-streak').textContent = `${streakData.currentStreak} days`;

        // Load journal entries count
        const journalSnapshot = await db.collection('journal').where('userId', '==', user.uid).get();
        document.getElementById('journal-entries').textContent = journalSnapshot.size;

        // Render boards progress
        renderBoardsProgress(boards);
        
        // Load recent activity
        await loadRecentActivity(user.uid);

    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Render boards progress
function renderBoardsProgress(boards) {
    const boardsGrid = document.getElementById('boards-progress-grid');
    boardsGrid.innerHTML = '';

    boards.forEach(board => {
        const completedMilestones = board.milestones ? board.milestones.filter(m => m.completed).length : 0;
        const totalMilestones = board.milestones ? board.milestones.length : 0;
        const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

        const boardCard = document.createElement('div');
        boardCard.className = 'board-progress-card';
        boardCard.innerHTML = `
            <div class="board-progress-header">
                <h3 class="board-progress-title">${board.title}</h3>
                <span class="progress-percentage">${Math.round(progressPercentage)}%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="milestone-list">
                ${renderMilestones(board.milestones || [])}
            </div>
        `;

        boardsGrid.appendChild(boardCard);
    });
}

// Render milestones
function renderMilestones(milestones) {
    return milestones.map(milestone => `
        <div class="milestone-item">
            <div class="milestone-checkbox ${milestone.completed ? 'checked' : ''}" 
                 data-milestone-id="${milestone.id}" 
                 onclick="toggleMilestone('${milestone.id}')">
            </div>
            <span class="milestone-text">${milestone.text}</span>
        </div>
    `).join('');
}

// Toggle milestone completion
async function toggleMilestone(milestoneId) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const checkbox = document.querySelector(`[data-milestone-id="${milestoneId}"]`);
        const isCompleted = checkbox.classList.contains('checked');
        
        // Update in Firestore
        // Note: You'll need to implement the actual Firestore update logic
        
        // Toggle checkbox
        checkbox.classList.toggle('checked');
        
        // Update progress bar and stats
        await loadUserProgress();
        
    } catch (error) {
        console.error('Error toggling milestone:', error);
    }
}

// Load recent activity
async function loadRecentActivity(userId) {
    try {
        const activitySnapshot = await db.collection('activity')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        const timeline = document.getElementById('activity-timeline');
        timeline.innerHTML = '';

        activitySnapshot.forEach(doc => {
            const activity = doc.data();
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${formatTimestamp(activity.timestamp)}</div>
                </div>
            `;
            timeline.appendChild(activityItem);
        });

    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        return `${diffDays} days ago`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add any necessary event listeners here
}

// Toggle background sound functionality
const backgroundSound = document.getElementById('background-sound');
const toggleSoundButton = document.getElementById('toggle-sound');

// Debugging logs for audio playback
document.addEventListener('DOMContentLoaded', () => {
    const backgroundSound = document.getElementById('background-sound');
    const toggleSoundButton = document.getElementById('toggle-sound');

    // Ensure volume is set and not muted
    backgroundSound.volume = 1.0;
    backgroundSound.muted = false;

    // Wait for user interaction to play sound
    toggleSoundButton.addEventListener('click', () => {
        if (backgroundSound.paused) {
            backgroundSound.play().then(() => {
                console.log('Sound is playing.');
            }).catch(err => console.error('Error playing sound:', err));
            toggleSoundButton.textContent = 'Turn Off Sound';
        } else {
            backgroundSound.pause();
            console.log('Sound is paused.');
            toggleSoundButton.textContent = 'Turn On Sound';
        }
    });
});

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            initializePage();
        } else {
            window.location.href = 'auth.html';
        }
    });
});