// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Profile Photo Handling
    const profilePhoto = document.getElementById('profile-photo');
    const photoInput = document.getElementById('photo-input');
    const uploadPhotoBtn = document.getElementById('upload-photo-btn');
    const useInitialsBtn = document.getElementById('use-initials-btn');
    const pickEmojiBtn = document.getElementById('pick-emoji-btn');

    console.log('Photo elements initialized:', {
        profilePhoto: !!profilePhoto,
        photoInput: !!photoInput,
        uploadPhotoBtn: !!uploadPhotoBtn,
        useInitialsBtn: !!useInitialsBtn,
        pickEmojiBtn: !!pickEmojiBtn
    });

    // Add loading state function
    function setLoading(isLoading) {
        console.log('Setting loading state:', isLoading);
        const buttons = [uploadPhotoBtn, useInitialsBtn, pickEmojiBtn];
        
        buttons.forEach(btn => {
            if (btn) {
                if (isLoading) {
                    btn.disabled = true;
                    btn.style.opacity = '0.7';
                    btn.style.cursor = 'not-allowed';
                    if (btn === uploadPhotoBtn) {
                        btn.innerHTML = '<span class="loading-spinner"></span> Uploading...';
                    }
                } else {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    if (btn === uploadPhotoBtn) {
                        btn.textContent = 'Upload Photo';
                    }
                }
            }
        });
    }

    // Add click handler for upload button
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', () => {
            console.log('Upload button clicked');
            if (!auth.currentUser) {
                alert('Please sign in to upload a photo.');
                return;
            }
            photoInput.click(); // This will open the file picker dialog
        });
    }

    // Handle file selection
    if (photoInput) {
        photoInput.addEventListener('change', async (e) => {
            console.log('Photo input change event triggered');
            const file = e.target.files[0];
            
            // Clear input value immediately to allow selecting the same file again
            photoInput.value = '';
            
            if (!file) {
                console.log('No file selected');
                return;
            }

            console.log('File selected:', {
                name: file.name,
                type: file.type,
                size: file.size
            });

            // Validate file type
            if (!file.type.startsWith('image/')) {
                console.log('Invalid file type:', file.type);
                alert('Please select an image file (JPEG, PNG, etc.)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                console.log('File too large:', file.size);
                alert('Image size should be less than 5MB');
                return;
            }

            try {
                setLoading(true);
                const user = auth.currentUser;
                console.log('Current user:', user?.uid);
                
                if (!user) throw new Error('Please sign in to upload a photo');

                // Create a reference with a unique file name
                const photoRef = storage.ref().child(`avatars/${user.uid}/${Date.now()}_${file.name}`);
                console.log('Storage reference created');
                
                // Create upload task
                const uploadTask = photoRef.put(file);
                console.log('Upload task created');
                
                // Monitor upload progress
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress);
                        if (uploadPhotoBtn) {
                            uploadPhotoBtn.textContent = `Uploading ${Math.round(progress)}%`;
                        }
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        alert('Error uploading photo: ' + error.message);
                        setLoading(false);
                    },
                    async () => {
                        try {
                            console.log('Upload completed, getting URL');
                            const photoURL = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('Download URL:', photoURL);
                            
                            // Update profile
                            await user.updateProfile({ photoURL });
                            console.log('User profile updated');
                            
                            // Update display
                            if (profilePhoto) {
                                profilePhoto.src = photoURL;
                            }
                            
                            // Update Firestore
                            await db.collection('users').doc(user.uid).update({
                                photoURL: photoURL
                            });
                            console.log('Firestore updated');

                            // Update navigation profile picture
                            const navProfilePic = document.querySelector('.profile-pic');
                            if (navProfilePic) {
                                navProfilePic.src = photoURL;
                                console.log('Navigation profile picture updated');
                            }

                            alert('Photo uploaded successfully!');
                        } catch (error) {
                            console.error('Error in completion handler:', error);
                            alert('Error updating profile: ' + error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                );
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert(error.message || 'Error uploading photo. Please try again.');
                setLoading(false);
            }
        });
    }

    // Handle initials button click
    if (useInitialsBtn) {
        useInitialsBtn.addEventListener('click', () => {
            generateInitialsAvatar();
        });
    }

    // Handle emoji button click
    if (pickEmojiBtn) {
        pickEmojiBtn.addEventListener('click', () => {
            showEmojiPicker();
        });
    }

    function generateInitialsAvatar() {
        const fullName = document.getElementById('full-name').value;
        const initials = fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = '#8854d0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, canvas.width/2, canvas.height/2);

        // Update profile photo
        profilePhoto.src = canvas.toDataURL();
        
        // Save to Firebase
        saveAvatarToFirebase(canvas.toDataURL());
    }

    function showEmojiPicker() {
        // Create emoji picker UI
        const emojiList = ['😊', '🚀', '💫', '🌟', '🎯', '💪', '🎨', '📚', '💡', '✨'];
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2c2046;
            padding: 20px;
            border-radius: 12px;
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            z-index: 1000;
        `;

        emojiList.forEach(emoji => {
            const button = document.createElement('button');
            button.textContent = emoji;
            button.style.cssText = `
                font-size: 24px;
                padding: 10px;
                background: rgba(136, 84, 208, 0.1);
                border: 1px solid rgba(136, 84, 208, 0.3);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            button.addEventListener('click', () => {
                generateEmojiAvatar(emoji);
                document.body.removeChild(picker);
            });
            picker.appendChild(button);
        });

        document.body.appendChild(picker);
    }

    function generateEmojiAvatar(emoji) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = '#8854d0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw emoji
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, canvas.width/2, canvas.height/2);

        // Update profile photo
        profilePhoto.src = canvas.toDataURL();
        
        // Save to Firebase
        saveAvatarToFirebase(canvas.toDataURL());
    }

    async function saveAvatarToFirebase(dataUrl) {
        try {
            const user = auth.currentUser;
            await user.updateProfile({ photoURL: dataUrl });
            await db.collection('users').doc(user.uid).update({
                photoURL: dataUrl
            });
        } catch (error) {
            console.error('Error saving avatar:', error);
            alert('Error saving avatar. Please try again.');
        }
    }

    // Theme Handling
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Save preference
            localStorage.setItem('theme', theme);
            
            // Apply theme
            applyTheme(theme);
        });
    });

    function applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.setProperty('--bg-color', '#f5f5f5');
            root.style.setProperty('--text-color', '#333');
        } else {
            root.style.setProperty('--bg-color', '#1a122b');
            root.style.setProperty('--text-color', '#fff');
        }
    }

    // Load user data
    async function loadUserData() {
        const user = auth.currentUser;
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();

                // Fill form fields
                document.getElementById('full-name').value = userData.fullName || '';
                document.getElementById('display-name').value = userData.displayName || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('mantra').value = userData.mantra || '';
                
                // Load profile photo
                if (userData.photoURL) {
                    profilePhoto.src = userData.photoURL;
                }

                // Load preferences
                document.getElementById('daily-motivation').checked = userData.dailyMotivation ?? true;
                document.getElementById('public-boards').checked = userData.publicBoards ?? false;
                document.getElementById('board-sort').value = userData.boardSort || 'newest';
                document.getElementById('default-board-type').value = userData.defaultBoardType || 'personal';
                document.getElementById('progress-unit').value = userData.progressUnit || 'percentage';
                document.getElementById('enable-reminders').checked = userData.enableReminders ?? true;
                document.getElementById('reminder-frequency').value = userData.reminderFrequency || 'daily';

                // Load stats
                loadUserStats();
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }

    // Load user stats
    async function loadUserStats() {
        const user = auth.currentUser;
        if (user) {
            try {
                const stats = await db.collection('users').doc(user.uid).collection('stats').doc('overview').get();
                const data = stats.data() || {};

                document.getElementById('total-boards').textContent = data.totalBoards || 0;
                document.getElementById('goals-completed').textContent = data.goalsCompleted || 0;
                document.getElementById('current-streak').textContent = `${data.currentStreak || 0} days`;
                document.getElementById('time-active').textContent = formatTimeActive(data.timeActive || 0);
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
    }

    function formatTimeActive(minutes) {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h`;
    }

    // Save user data
    async function saveUserData() {
        const user = auth.currentUser;
        if (user) {
            try {
                const userData = {
                    fullName: document.getElementById('full-name').value,
                    displayName: document.getElementById('display-name').value,
                    mantra: document.getElementById('mantra').value,
                    dailyMotivation: document.getElementById('daily-motivation').checked,
                    publicBoards: document.getElementById('public-boards').checked,
                    boardSort: document.getElementById('board-sort').value,
                    defaultBoardType: document.getElementById('default-board-type').value,
                    progressUnit: document.getElementById('progress-unit').value,
                    enableReminders: document.getElementById('enable-reminders').checked,
                    reminderFrequency: document.getElementById('reminder-frequency').value,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Update user data in Firestore
                await db.collection('users').doc(user.uid).update(userData);
                
                alert('Settings saved successfully!');
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('Error saving settings. Please try again.');
            }
        }
    }

    // Handle password change
    document.getElementById('change-password').addEventListener('click', async () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        try {
            const user = auth.currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            // Reauthenticate
            await user.reauthenticateWithCredential(credential);
            
            // Change password
            await user.updatePassword(newPassword);
            
            alert('Password updated successfully!');
            
            // Clear password fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Error changing password. Please check your current password and try again.');
        }
    });

    // Handle account deletion
    document.getElementById('delete-account').addEventListener('click', () => {
        const modal = document.getElementById('confirm-modal');
        const message = document.getElementById('modal-message');
        
        message.textContent = 'Are you sure you want to delete your account? This action cannot be undone.';
        modal.classList.add('active');

        document.getElementById('modal-confirm').onclick = async () => {
            try {
                const user = auth.currentUser;
                
                // Delete user data
                await db.collection('users').doc(user.uid).delete();
                
                // Delete user account
                await user.delete();
                
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Error deleting account. Please try again.');
            } finally {
                modal.classList.remove('active');
            }
        };

        document.getElementById('modal-cancel').onclick = () => {
            modal.classList.remove('active');
        };
    });

    // Handle logout
    document.getElementById('logout').addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out. Please try again.');
        }
    });

    // Export data
    document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));

    async function exportData(format) {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Fetch user data
            const userData = await db.collection('users').doc(user.uid).get();
            const boards = await db.collection('boards').where('userId', '==', user.uid).get();
            
            const data = {
                user: userData.data(),
                boards: boards.docs.map(doc => doc.data())
            };

            // Convert and download
            if (format === 'json') {
                downloadJSON(data);
            } else {
                downloadCSV(data);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        }
    }

    function downloadJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visionly-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadCSV(data) {
        // Convert data to CSV format
        const rows = [
            ['Board Title', 'Type', 'Created At', 'Goals Completed', 'Total Goals']
        ];

        data.boards.forEach(board => {
            rows.push([
                board.title,
                board.type,
                new Date(board.createdAt?.seconds * 1000).toLocaleDateString(),
                board.goalsCompleted || 0,
                board.totalGoals || 0
            ]);
        });

        const csv = rows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visionly-data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Initialize
    auth.onAuthStateChanged(user => {
        if (user) {
            loadUserData();
        } else {
            window.location.href = 'login.html';
        }
    });
}); 