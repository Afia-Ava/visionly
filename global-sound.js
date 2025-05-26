document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired on:', window.location.pathname);

    const backgroundSound = document.getElementById('background-sound');
    const toggleSoundButton = document.getElementById('toggle-sound');
    const soundIcon = document.getElementById('sound-icon');

    console.log('Elements found:', { 
        backgroundSound: !!backgroundSound, 
        toggleSoundButton: !!toggleSoundButton, 
        soundIcon: !!soundIcon 
    });

    if (!backgroundSound || !toggleSoundButton || !soundIcon) {
        console.error('Sound control elements not found on this page! Check IDs: background-sound, toggle-sound, sound-icon');
        return;
    }

    // Auto-play sound on page load
    backgroundSound.volume = 1.0;
    backgroundSound.muted = false; 
    const playPromise = backgroundSound.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            console.log('Audio auto-play initiated for:', window.location.pathname);
            if (soundIcon) soundIcon.src = 'assets/speaker-on-icon.png'; // Ensure icon is on if autoplay succeeds
        }).catch(error => {
            console.error('Error auto-playing sound for:', window.location.pathname, error);
            // Autoplay was prevented. This often happens if the user hasn't interacted with the page yet.
            // Consider setting the icon to 'off' if autoplay fails and sound is not already playing.
            if (backgroundSound.paused && soundIcon) { // Check if it's actually paused
                 soundIcon.src = 'assets/speaker-off-icon.png';
                 soundIcon.alt = 'Sound Off';
            }
        });
    }

    // Toggle sound on button click
    toggleSoundButton.addEventListener('click', () => {
        console.log('Toggle sound button clicked on:', window.location.pathname);
        if (backgroundSound.paused) {
            const playOnClickPromise = backgroundSound.play();
            if (playOnClickPromise !== undefined) {
                playOnClickPromise.then(_ => {
                    if (soundIcon) {
                        soundIcon.src = 'assets/speaker-on-icon.png';
                        soundIcon.alt = 'Sound On';
                    }
                    console.log('Audio playing via click on:', window.location.pathname);
                }).catch(error => {
                    console.error('Error playing sound on click for:', window.location.pathname, error);
                });
            }
        } else {
            backgroundSound.pause();
            if (soundIcon) {
                soundIcon.src = 'assets/speaker-off-icon.png';
                soundIcon.alt = 'Sound Off';
            }
            console.log('Audio paused via click on:', window.location.pathname);
        }
    });
});