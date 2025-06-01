// // Firebase configuration and initialization should be already done in firebase-config.js

// Firebase services are expected to be globally available from firebase-config.js
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
let isCameraOn = false;
let lastSnapshot = null;

// DOM Elements for Camera
const cameraFeed = document.getElementById('camera-feed');
const toggleCameraButton = document.getElementById('toggle-camera');
const takeSnapshotButton = document.getElementById('take-snapshot');
const retakePhotoButton = document.getElementById('retake-photo');
const snapshotContainer = document.getElementById('snapshot-container');
const cameraErrorMessage = document.getElementById('camera-error-message');

// Function to initialize the camera UI to a default "off" state
function initializeCameraUI() {
    console.log('[Debug] Initializing Camera UI...');
    if (toggleCameraButton) toggleCameraButton.textContent = 'Start Camera';
    if (takeSnapshotButton) takeSnapshotButton.disabled = true;
    if (retakePhotoButton) retakePhotoButton.style.display = 'none';
    if (snapshotContainer) snapshotContainer.innerHTML = '';
    if (cameraErrorMessage) {
        cameraErrorMessage.textContent = ''; // Clear any previous error messages
        cameraErrorMessage.style.display = 'none';
    }
    if (cameraFeed) {
        cameraFeed.srcObject = null; // Ensures placeholder is shown via CSS
        cameraFeed.pause(); // Explicitly pause if it was somehow playing
        console.log('[Debug] Camera feed srcObject set to null and paused.');
    } else {
        console.warn('[Debug] cameraFeed element not found during UI init.');
    }
    isCameraOn = false;
    console.log('[Debug] Camera UI initialized to off state. isCameraOn:', isCameraOn);
}

// Start the camera
async function startCamera() {
    console.log('[Debug] Attempting to start camera...');
    if (cameraErrorMessage) { // Clear previous errors at the start
        cameraErrorMessage.textContent = '';
        cameraErrorMessage.style.display = 'none';
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('[Debug] getUserMedia is not supported in this browser.');
        if (cameraErrorMessage) {
            cameraErrorMessage.textContent = 'Camera functionality (getUserMedia) is not supported in your browser.';
            cameraErrorMessage.style.display = 'block';
        }
        return;
    }
    console.log('[Debug] navigator.mediaDevices.getUserMedia is available.');

    try {
        if (stream) {
            console.log('[Debug] Existing stream found. Stopping all tracks.');
            stream.getTracks().forEach(track => {
                console.log(`[Debug] Stopping track: ${track.label}, kind: ${track.kind}, state: ${track.readyState}`);
                track.stop();
            });
            console.log('[Debug] All tracks from existing stream stopped.');
            stream = null; // Ensure stream is reset
        } else {
            console.log('[Debug] No existing stream found.');
        }

        console.log('[Debug] Requesting camera access with constraints:', { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        console.log('[Debug] Camera access granted. Stream object:', stream);
        if (stream.getVideoTracks().length > 0) {
            console.log('[Debug] Video tracks found:', stream.getVideoTracks());
        } else {
            console.warn('[Debug] No video tracks found in the stream, though access was granted.');
        }


        if (cameraFeed) {
            console.log('[Debug] cameraFeed element found. Setting srcObject.');
            cameraFeed.srcObject = stream;
            if (cameraErrorMessage) cameraErrorMessage.style.display = 'none';
            
            cameraFeed.onloadedmetadata = () => {
                console.log('[Debug] onloadedmetadata event triggered for cameraFeed.');
                cameraFeed.play().then(() => {
                    console.log('[Debug] Camera feed playing successfully.');
                    if (toggleCameraButton) toggleCameraButton.textContent = 'Stop Camera';
                    if (takeSnapshotButton) takeSnapshotButton.disabled = false;
                    isCameraOn = true;
                    console.log('[Debug] Camera started successfully and UI updated. isCameraOn:', isCameraOn);
                }).catch(e => {
                    console.error('[Debug] Error playing video feed:', e);
                    if (cameraErrorMessage) {
                        cameraErrorMessage.textContent = `Error playing camera feed: ${e.message}. Ensure another app isn\\\'t using the camera or try a different browser.`;
                        cameraErrorMessage.style.display = 'block';
                    }
                    stopCamera(); // Ensure cleanup if play fails
                });
            };
            cameraFeed.onerror = (e) => {
                console.error('[Debug] Error on cameraFeed element itself:', e);
                if (cameraErrorMessage) {
                    cameraErrorMessage.textContent = 'An error occurred with the camera feed element. It might be corrupted or unsupported.';
                    cameraErrorMessage.style.display = 'block';
                }
                stopCamera(); // Ensure cleanup
            };
        } else {
             console.error('[Debug] Camera feed element (camera-feed) NOT found in DOM after getting stream.');
             if (cameraErrorMessage) {
                cameraErrorMessage.textContent = 'Camera display area not found on page. Please check HTML or refresh.';
                cameraErrorMessage.style.display = 'block';
            }
            // If cameraFeed is missing, we should stop the tracks we just acquired.
            if(stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                console.log('[Debug] Stream tracks stopped because cameraFeed element was missing.');
            }
            return; // Important to return if cameraFeed is not there
        }
    } catch (error) {
        console.error('[Debug] Error accessing camera (in catch block):', error.name, error.message, error);
        if (cameraErrorMessage) {
            let specificMessage = `Unable to access camera: ${error.message}.`;
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                specificMessage = 'Camera access denied. Please enable camera permissions in your browser settings and refresh the page.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                specificMessage = 'No camera found. Please ensure a camera is connected and enabled.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                specificMessage = 'Camera is already in use or cannot be accessed. Try closing other applications using the camera, or restart your browser/computer.';
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                specificMessage = 'The camera does not support the requested settings (e.g., resolution).';
            } else if (error.name === 'AbortError') {
                specificMessage = 'Camera access was aborted. This can happen if the page is reloaded or another request interrupts it.';
            } else if (error.name === 'TypeError') {
                specificMessage = 'A type error occurred, possibly related to how the camera is being accessed. Check browser compatibility.';
            }
            cameraErrorMessage.textContent = specificMessage;
            cameraErrorMessage.style.display = 'block';
            console.log(`[Debug] Displayed error message: ${specificMessage}`);
        }
        // Call stopCamera to ensure UI is reset and any acquired stream (if error happened late) is cleaned up.
        // However, stream might be null if getUserMedia itself failed.
        stopCamera(); // stopCamera also logs, so we'll see its state.
    }
}

// Stop the camera
function stopCamera() {
    console.log('[Debug] Attempting to stop camera...');
    if (stream) {
        console.log('[Debug] Stream exists, stopping tracks.');
        stream.getTracks().forEach(track => {
            console.log(`[Debug] Stopping track: ${track.label}, kind: ${track.kind}, state: ${track.readyState}`);
            track.stop();
        });
        stream = null;
        console.log('[Debug] Camera stream tracks stopped and stream set to null.');
    } else {
        console.log('[Debug] No active stream to stop.');
    }

    if (cameraFeed) {
        cameraFeed.srcObject = null;
        cameraFeed.pause();
        console.log('[Debug] Camera feed srcObject set to null and paused in stopCamera.');
    } else {
        console.warn('[Debug] cameraFeed element not found during stopCamera.');
    }

    if (toggleCameraButton) toggleCameraButton.textContent = 'Start Camera';
    if (takeSnapshotButton) takeSnapshotButton.disabled = true;
    if (retakePhotoButton) retakePhotoButton.style.display = 'none';
    if (snapshotContainer) snapshotContainer.innerHTML = '';
    lastSnapshot = null;
    isCameraOn = false;
    console.log('[Debug] Camera stopped and UI updated to off state. isCameraOn:', isCameraOn);
    // Optionally, clear error message when camera is explicitly stopped by user or code
    // if (cameraErrorMessage) {
    //     cameraErrorMessage.textContent = '';
    //     cameraErrorMessage.style.display = 'none';
    // }
}

// Event Listeners Setup for Camera
function setupCameraEventListeners() {
    if (toggleCameraButton) {
        toggleCameraButton.addEventListener('click', () => {
            if (isCameraOn) {
                stopCamera();
            } else {
                startCamera();
            }
        });
    }

    if (takeSnapshotButton) {
        takeSnapshotButton.addEventListener('click', () => {
            if (!isCameraOn || !cameraFeed || !cameraFeed.srcObject || cameraFeed.paused || cameraFeed.ended || cameraFeed.readyState < 3) {
                console.warn('Camera not ready for snapshot or not active.');
                if (cameraErrorMessage) {
                    cameraErrorMessage.textContent = 'Please start the camera and wait for the feed to appear before taking a snapshot.';
                    cameraErrorMessage.style.display = 'block';
                }
                return;
            }
            if (cameraErrorMessage) cameraErrorMessage.style.display = 'none';

            const canvas = document.createElement('canvas');
            canvas.width = cameraFeed.videoWidth;
            canvas.height = cameraFeed.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);

            if (snapshotContainer) {
                snapshotContainer.innerHTML = '';
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.alt = 'Snapshot';
                snapshotContainer.appendChild(img);
                lastSnapshot = img.src;
            }

            if (retakePhotoButton) retakePhotoButton.style.display = 'inline-block';

            if (cameraFeed) {
                cameraFeed.style.transition = 'filter 0.1s ease-out';
                cameraFeed.style.filter = 'brightness(1.3) contrast(1.1)';
                setTimeout(() => {
                    if (cameraFeed) cameraFeed.style.filter = 'none';
                }, 150);
            }
            console.log('Snapshot taken.');
        });
    }

    if (retakePhotoButton) {
        retakePhotoButton.addEventListener('click', () => {
            if (snapshotContainer) snapshotContainer.innerHTML = '';
            lastSnapshot = null;
            if (retakePhotoButton) retakePhotoButton.style.display = 'none';
            console.log('Snapshot cleared.');
            if (takeSnapshotButton && isCameraOn) {
                takeSnapshotButton.disabled = false;
            }
        });
    }
}

// Cleanup camera stream when leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('Camera stream stopped on page unload.');
    }
});

// ... existing code ...

// Cleanup camera stream when leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('Camera stream stopped on page unload.');
    }
});

// --- Pomodoro Timer, Streaks, and Productivity Logic ---

// Pomodoro Configuration
const POMODORO_WORK_DURATION = 25 * 60; // 25 minutes in seconds
const POMODORO_SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const POMODORO_LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const POMODORO_CYCLES_BEFORE_LONG_BREAK = 4;
const DAILY_PRODUCTIVITY_TARGET_MINUTES = 4 * 60; // 4 hours target

// Pomodoro State
let pomodoroTimeLeft = POMODORO_WORK_DURATION;
let pomodoroIsRunning = false;
let pomodoroCurrentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
let pomodoroInterval = null;
let pomodoroCyclesCompletedThisSession = 0; // Counts cycles for long break logic

// Streak and Productivity State
let pomodoroStreakCount = 0;
let productiveMinutesToday = 0;
// let lastPomodoroDate = new Date().toDateString(); // Not strictly needed if using lastProductiveDate

// DOM Elements for Productivity Tools
let pomodoroDisplayEl, pomodoroStartPauseBtn, pomodoroResetBtn, pomodoroSkipBtn, pomodoroModeEl, pomodoroCyclesEl;
let pomodoroStreakCountEl;
let productiveTimeTodayEl, dailyProductivityPercentageEl, dailyProductivityTargetHoursEl;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updatePomodoroDisplay() {
    if (pomodoroDisplayEl) pomodoroDisplayEl.textContent = formatTime(pomodoroTimeLeft);
    if (pomodoroModeEl) pomodoroModeEl.textContent = `Mode: ${pomodoroCurrentMode === 'work' ? 'Work' : (pomodoroCurrentMode === 'shortBreak' ? 'Short Break' : 'Long Break')}`;
    if (pomodoroCyclesEl) pomodoroCyclesEl.textContent = `Cycles Completed: ${pomodoroCyclesCompletedThisSession}`;
    if (pomodoroStartPauseBtn) pomodoroStartPauseBtn.textContent = pomodoroIsRunning ? 'Pause' : 'Start';
}

function pomodoroCountdown() {
    pomodoroTimeLeft--;
    updatePomodoroDisplay();

    if (pomodoroTimeLeft < 0) {
        clearInterval(pomodoroInterval);
        pomodoroIsRunning = false;

        if (pomodoroCurrentMode === 'work') {
            addProductiveTime(POMODORO_WORK_DURATION / 60);
            incrementPomodoroStreak();
            pomodoroCyclesCompletedThisSession++;
        }
        switchPomodoroMode();
        playNotificationSound();
    }
}

function startPausePomodoro() {
    if (pomodoroIsRunning) {
        clearInterval(pomodoroInterval);
        pomodoroIsRunning = false;
    } else {
        pomodoroIsRunning = true;
        // Ensure the timer starts from the correct duration if it was reset or switched
        if (pomodoroTimeLeft <= 0) { // If timer ended, switchMode would have set new timeLeft
             // If mode switched and timer is 0, it means it's ready for new duration
        } else if (pomodoroCurrentMode === 'work' && pomodoroTimeLeft === POMODORO_WORK_DURATION) {
            // Fresh start or reset
        } else if (pomodoroCurrentMode === 'shortBreak' && pomodoroTimeLeft === POMODORO_SHORT_BREAK_DURATION) {
            // Fresh start or reset
        } else if (pomodoroCurrentMode === 'longBreak' && pomodoroTimeLeft === POMODORO_LONG_BREAK_DURATION) {
            // Fresh start or reset
        }
        // If none of the above, it's resuming, so pomodoroTimeLeft is already correct.
        pomodoroInterval = setInterval(pomodoroCountdown, 1000);
    }
    updatePomodoroDisplay();
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroIsRunning = false;
    // Reset time based on current mode, but don't switch mode
    if (pomodoroCurrentMode === 'work') {
        pomodoroTimeLeft = POMODORO_WORK_DURATION;
    } else if (pomodoroCurrentMode === 'shortBreak') {
        pomodoroTimeLeft = POMODORO_SHORT_BREAK_DURATION;
    } else { // longBreak
        pomodoroTimeLeft = POMODORO_LONG_BREAK_DURATION;
    }
    updatePomodoroDisplay();
}

function skipPomodoroSession() {
    clearInterval(pomodoroInterval);
    pomodoroIsRunning = false;
    if (pomodoroCurrentMode === 'work') {
        pomodoroCyclesCompletedThisSession++;
    }
    switchPomodoroMode(); // This will set the new timeLeft and update display
    // updatePomodoroDisplay(); // switchPomodoroMode calls this
}


function switchPomodoroMode() {
    if (pomodoroCurrentMode === 'work') {
        if (pomodoroCyclesCompletedThisSession > 0 && pomodoroCyclesCompletedThisSession % POMODORO_CYCLES_BEFORE_LONG_BREAK === 0) {
            pomodoroCurrentMode = 'longBreak';
            pomodoroTimeLeft = POMODORO_LONG_BREAK_DURATION;
        } else {
            pomodoroCurrentMode = 'shortBreak';
            pomodoroTimeLeft = POMODORO_SHORT_BREAK_DURATION;
        }
    } else { // currentMode was 'shortBreak' or 'longBreak'
        pomodoroCurrentMode = 'work';
        pomodoroTimeLeft = POMODORO_WORK_DURATION;
    }
    updatePomodoroDisplay();
}

function playNotificationSound() {
    console.log("Pomodoro session ended - play sound!");
    // Example: const alertSound = document.getElementById('alert-sound'); if(alertSound) alertSound.play();
}

// Streak Logic
function loadPomodoroData() {
    const today = new Date().toDateString();
    const storedStreak = localStorage.getItem('pomodoroStreakCount');
    const storedLastStreakDate = localStorage.getItem('pomodoroLastStreakDate');
    const storedProductiveMinutes = localStorage.getItem('productiveMinutesToday');
    const storedLastProductiveDate = localStorage.getItem('lastProductiveDate');

    if (storedStreak && storedLastStreakDate === today) {
        pomodoroStreakCount = parseInt(storedStreak, 10);
    } else if (storedStreak) { // Had a streak, but not today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (storedLastStreakDate === yesterday.toDateString()) {
             pomodoroStreakCount = parseInt(storedStreak, 10); // Keep streak if it was yesterday
        } else {
            pomodoroStreakCount = 0; // Reset if missed more than a day
        }
    } else {
        pomodoroStreakCount = 0;
    }

    if (storedProductiveMinutes && storedLastProductiveDate === today) {
        productiveMinutesToday = parseInt(storedProductiveMinutes, 10);
    } else {
        productiveMinutesToday = 0; // Reset for new day
    }
    // Always update lastProductiveDate to today when loading, to handle daily reset correctly
    localStorage.setItem('lastProductiveDate', today);
}

function savePomodoroData() {
    localStorage.setItem('pomodoroStreakCount', pomodoroStreakCount.toString());
    localStorage.setItem('pomodoroLastStreakDate', new Date().toDateString());
    localStorage.setItem('productiveMinutesToday', productiveMinutesToday.toString());
    // lastProductiveDate is set during load or when adding productive time
}

function updatePomodoroStreakDisplay() {
    if (pomodoroStreakCountEl) pomodoroStreakCountEl.textContent = pomodoroStreakCount;
}

function incrementPomodoroStreak() {
    const today = new Date().toDateString();
    const lastStreakDate = localStorage.getItem('pomodoroLastStreakDate');

    if (lastStreakDate !== today) { // Only increment if it's the first pomodoro of a new day or continuing a streak
        pomodoroStreakCount++;
    } else if (pomodoroStreakCount === 0 && lastStreakDate === today) { // First pomodoro ever on this day
        pomodoroStreakCount = 1;
    }
    // If lastStreakDate IS today and streak > 0, it means they already did one today, so streak count doesn't change for subsequent pomodoros on the same day.
    // The streak is about "days with at least one pomodoro".
    
    updatePomodoroStreakDisplay();
    savePomodoroData(); // This will save the current date as pomodoroLastStreakDate
}

// Productivity Logic
function addProductiveTime(minutes) {
    const today = new Date().toDateString();
    // Ensure productiveMinutesToday is for the current day
    if (localStorage.getItem('lastProductiveDate') !== today) {
        productiveMinutesToday = 0; // Reset if it's a new day and loadPomodoroData hasn't run yet for today
        localStorage.setItem('lastProductiveDate', today);
    }
    productiveMinutesToday += Math.round(minutes);
    updateDailyProductivityDisplay();
    savePomodoroData(); 
}

function updateDailyProductivityDisplay() {
    if (productiveTimeTodayEl) productiveTimeTodayEl.textContent = productiveMinutesToday;
    if (dailyProductivityPercentageEl) {
        const percentage = DAILY_PRODUCTIVITY_TARGET_MINUTES > 0 ?
            Math.min(100, Math.round((productiveMinutesToday / DAILY_PRODUCTIVITY_TARGET_MINUTES) * 100)) : 0;
        dailyProductivityPercentageEl.textContent = percentage;
    }
    if(dailyProductivityTargetHoursEl) dailyProductivityTargetHoursEl.textContent = (DAILY_PRODUCTIVITY_TARGET_MINUTES / 60).toFixed(1);
}

function setupProductivityTools() {
    pomodoroDisplayEl = document.getElementById('pomodoro-display');
    pomodoroStartPauseBtn = document.getElementById('pomodoro-start-pause');
    pomodoroResetBtn = document.getElementById('pomodoro-reset');
    pomodoroSkipBtn = document.getElementById('pomodoro-skip');
    pomodoroModeEl = document.getElementById('pomodoro-mode');
    pomodoroCyclesEl = document.getElementById('pomodoro-cycles');

    pomodoroStreakCountEl = document.getElementById('pomodoro-streak-count');
    productiveTimeTodayEl = document.getElementById('productive-time-today');
    dailyProductivityPercentageEl = document.getElementById('daily-productivity-percentage');
    dailyProductivityTargetHoursEl = document.getElementById('daily-productivity-target-hours');

    if (!pomodoroDisplayEl) { // Basic check
        console.warn("Pomodoro DOM elements not found. Productivity tools may not work.");
        return;
    }

    if (pomodoroStartPauseBtn) pomodoroStartPauseBtn.addEventListener('click', startPausePomodoro);
    if (pomodoroResetBtn) pomodoroResetBtn.addEventListener('click', resetPomodoro);
    if (pomodoroSkipBtn) pomodoroSkipBtn.addEventListener('click', skipPomodoroSession);

    loadPomodoroData(); // Load data from localStorage
    updatePomodoroDisplay(); // Set initial display based on loaded/default state
    updatePomodoroStreakDisplay();
    updateDailyProductivityDisplay();
    console.log('[Debug] Productivity tools initialized.');
}


// Initialize the progress page (non-camera related parts)
async function initializePage() {
    updateDailyQuote();
    updateAIEncouragement();
    await loadUserProgress();
    setupEventListeners(); // General event listeners for other parts of the page
}

// Update the daily quote
function updateDailyQuote() {
    const today = new Date().getDate();
    const quoteIndex = today % quotes.length;
    const quote = quotes[quoteIndex];
    const dailyQuoteEl = document.getElementById('daily-quote');
    const quoteAuthorEl = document.getElementById('quote-author');
    if (dailyQuoteEl) dailyQuoteEl.textContent = quote.text;
    if (quoteAuthorEl) quoteAuthorEl.textContent = `- ${quote.author}`;
}

// Update AI encouragement
function updateAIEncouragement() {
    const encouragementIndex = Math.floor(Math.random() * encouragementMessages.length);
    const aiContainer = document.getElementById('ai-encouragement');
    if (aiContainer) {
        aiContainer.innerHTML = `
            <p style="color: #fff; font-size: 1.1rem;">
                <span style="color: #8854d0;">🤖 AI Assistant:</span> 
                ${encouragementMessages[encouragementIndex]}
            </p>
        `;
    }
}

// Load user's progress data
async function loadUserProgress() {
    const user = auth.currentUser;
    if (!user) {
        console.log('User not logged in, cannot load progress.');
        return;
    }
    try {
        const boardsSnapshot = await db.collection('boards').where('userId', '==', user.uid).get();
        const boards = [];
        let completedTasks = 0;
        boardsSnapshot.forEach(doc => {
            const board = doc.data();
            boards.push({ id: doc.id, ...board });
            if (board.milestones) {
                completedTasks += board.milestones.filter(m => m.completed).length;
            }
        });

        const activeGoalsEl = document.getElementById('active-goals');
        const tasksCompletedEl = document.getElementById('tasks-completed');
        if (activeGoalsEl) activeGoalsEl.textContent = boards.length;
        if (tasksCompletedEl) tasksCompletedEl.textContent = completedTasks;

        const streakDoc = await db.collection('streaks').doc(user.uid).get();
        const streakData = streakDoc.exists ? streakDoc.data() : { currentStreak: 0 };
        const currentStreakEl = document.getElementById('current-streak');
        if (currentStreakEl) currentStreakEl.textContent = `${streakData.currentStreak} days`;

        const journalSnapshot = await db.collection('journal').where('userId', '==', user.uid).get();
        const journalEntriesEl = document.getElementById('journal-entries');
        if (journalEntriesEl) journalEntriesEl.textContent = journalSnapshot.size;

        renderBoardsProgress(boards);
        await loadRecentActivity(user.uid);
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Render boards progress
function renderBoardsProgress(boards) {
    const boardsGrid = document.getElementById('boards-progress-grid');
    if (!boardsGrid) return;
    boardsGrid.innerHTML = '';
    if (boards.length === 0) {
        boardsGrid.innerHTML = '<p>No vision boards yet. Create one to track your progress!</p>';
        return;
    }
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
                ${renderMilestones(board.milestones || [], board.id)}
            </div>
        `;
        boardCard.addEventListener('click', () => {
            console.log(`Navigate to board: ${board.id}`); // Placeholder for navigation
            // window.location.href = `/boards.html?boardId=${board.id}`; // Example navigation
        });
        boardsGrid.appendChild(boardCard);
    });
}

// Render milestones
function renderMilestones(milestones, boardId) {
    if (!milestones || milestones.length === 0) {
        return '<p class="no-milestones">No milestones for this board.</p>';
    }
    return milestones.map(milestone => `
        <div class="milestone-item">
            <div class="milestone-checkbox ${milestone.completed ? 'checked' : ''}" 
                 data-milestone-id="${milestone.id}" 
                 data-board-id="${boardId}" 
                 onclick="event.stopPropagation(); toggleMilestone('${boardId}', '${milestone.id}', this)">
            </div>
            <span class="milestone-text">${milestone.text}</span>
        </div>
    `).join('');
}

// Toggle milestone completion
async function toggleMilestone(boardId, milestoneId, checkboxElement) {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const boardRef = db.collection('boards').doc(boardId);
        const boardDoc = await boardRef.get();
        if (!boardDoc.exists) {
            console.error('Board not found for toggling milestone');
            return;
        }
        const boardData = boardDoc.data();
        const milestoneIndex = boardData.milestones.findIndex(m => m.id === milestoneId);
        if (milestoneIndex === -1) {
            console.error('Milestone not found in board');
            return;
        }
        const newCompletedState = !boardData.milestones[milestoneIndex].completed;
        boardData.milestones[milestoneIndex].completed = newCompletedState;
        await boardRef.update({ milestones: boardData.milestones });
        checkboxElement.classList.toggle('checked', newCompletedState);
        await loadUserProgress(); // Reload all progress to update stats and visuals
        logActivity(user.uid, `Milestone "${boardData.milestones[milestoneIndex].text}" on board "${boardData.title}" marked as ${newCompletedState ? 'complete' : 'incomplete'}.`);
    } catch (error) {
        console.error('Error toggling milestone:', error);
    }
}

// Helper to log activity
async function logActivity(userId, description) {
    try {
        await db.collection('activity').add({
            userId: userId,
            description: description,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

// Load recent activity
async function loadRecentActivity(userId) {
    const timeline = document.getElementById('activity-timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    try {
        const activitySnapshot = await db.collection('activity')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        if (activitySnapshot.empty) {
            timeline.innerHTML = '<p>No recent activity.</p>';
            return;
        }
        activitySnapshot.forEach(doc => {
            const activity = doc.data();
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            const date = activity.timestamp && activity.timestamp.toDate ? activity.timestamp.toDate().toLocaleDateString() : 'N/A';
            const time = activity.timestamp && activity.timestamp.toDate ? activity.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            activityItem.innerHTML = `
                <div class="activity-icon"></div> <!-- Placeholder for an icon -->
                <div class="activity-content">
                    <p class="activity-description">${activity.description}</p>
                    <p class="activity-timestamp">${date} ${time}</p>
                </div>`;
            timeline.appendChild(activityItem);
        });
    } catch (error) {
        console.error('Error loading recent activity:', error);
        timeline.innerHTML = '<p>Could not load activity.</p>';
    }
}

// Format timestamp (if needed elsewhere, currently loadRecentActivity formats directly)
function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Invalid date';
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
}

// General setup event listeners (if any are needed beyond specific component setups)
function setupEventListeners() {
    // Add any other general event listeners here
    console.log("General event listeners setup (if any).");
}

// Single DOMContentLoaded listener to orchestrate all initializations
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed for progress.js');

    // Initialize Camera UI to default "off" state first
    initializeCameraUI();
    
    // Then setup camera specific event listeners
    setupCameraEventListeners();

    // Setup background sound toggle
    const backgroundSound = document.getElementById('background-sound');
    const toggleSoundButton = document.getElementById('toggle-sound');

    if (backgroundSound && toggleSoundButton) {
        // Ensure volume is set and not muted initially for the audio element itself
        // User interaction is still required to play it.
        backgroundSound.volume = 1.0; 
        backgroundSound.muted = false;

        toggleSoundButton.addEventListener('click', () => {
            if (backgroundSound.paused) {
                backgroundSound.play().then(() => {
                    console.log('Background sound is playing.');
                    toggleSoundButton.textContent = 'Turn Off Sound';
                }).catch(err => {
                    console.error('Error playing background sound:', err);
                    // Display a user-friendly message if playout is blocked
                    if (cameraErrorMessage && (err.name === 'NotAllowedError' || err.name === 'NotSupportedError')) {
                        cameraErrorMessage.textContent = 'Audio playback was blocked by the browser. Please interact with the page first or check browser settings.';
                        cameraErrorMessage.style.display = 'block';
                         setTimeout(() => { if (cameraErrorMessage) cameraErrorMessage.style.display = 'none'; }, 5000);
                    }
                });
            } else {
                backgroundSound.pause();
                console.log('Background sound is paused.');
                toggleSoundButton.textContent = 'Turn On Sound';
            }
        });
    } else {
        console.warn('Background sound elements not found.');
    }

    // Auth check and main page initialization
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User is authenticated. Initializing page content.');
            initializePage().then(() => { // Ensure initializePage is defined and handles non-productivity UI
                console.log('Standard page content initialized.');
            }).catch(error => {
                console.error('Error during standard page initialization:', error);
            });
        } else {
            console.log('User not authenticated. Redirecting to auth.html.');
            // window.location.href = 'auth.html'; // Make sure this is intended behavior
        }
    });
});