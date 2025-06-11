// Define an array of purple shades matching the button color (#2d1a45) and lighter variations
const darkPurpleShades = [
    '#2d1a45', // Exact button color
    '#4a2f6b', // Lighter variation
    '#5e3a7f', // Even lighter
    '#3e2455', // Slightly lighter than button
    '#6b4593', // Much lighter
    '#7851a6', // Light purple
    '#8a5fb8', // Very light purple
    '#2a1740'  // Slightly darker than button
];

// Time capsule configuration
const timeCapsule = {
    enabled: false, // Disable time capsule feature to prevent automatic sprinkles
    mouseScript: [],  // Store mouse positions as a script
    maxScriptLength: 500,
    replayDelay: 5000, // 5 seconds delay before replay
    lastReplayTime: 0,
    recording: false,
    lastPosition: null
};

document.addEventListener('DOMContentLoaded', function() {
    // Create a container for sprinkles if it doesn't exist
    let sprinklesContainer = document.getElementById('sprinkles-container');
    if (!sprinklesContainer) {
        sprinklesContainer = document.createElement('div');
        sprinklesContainer.id = 'sprinkles-container';
        sprinklesContainer.style.position = 'fixed';
        sprinklesContainer.style.top = '0';
        sprinklesContainer.style.left = '0';
        sprinklesContainer.style.width = '100%';
        sprinklesContainer.style.height = '100%';
        sprinklesContainer.style.pointerEvents = 'none';
        sprinklesContainer.style.zIndex = '9999';
        document.body.appendChild(sprinklesContainer);
    }
    
    // Configuration
    const config = {
        colors: ['#8b5fbf', '#6b46c1', '#9d78c9', '#c9a9ff'],
        size: 6,
        maxCount: 150,
        mouseOnly: true // Ensure this is true to only show sprinkles with mouse movement
    };
    
    // Clear any existing event listeners to avoid duplicates
    // This is the main issue - we have conflicting handlers
    
    // Remove all existing mousemove handlers that might interfere
    document.onmousemove = null;
    
    // Add a single mousemove listener that creates sprinkles
    document.addEventListener('mousemove', function(e) {
        // Create a random number of sprinkles (1 or 2) for a subtle effect
        const numberOfSprinkles = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numberOfSprinkles; i++) {
            const sprinkle = document.createElement('div');
            sprinkle.classList.add('sprinkle');
            
            // Select a random purple shade
            const randomPurple = darkPurpleShades[Math.floor(Math.random() * darkPurpleShades.length)];
            sprinkle.style.backgroundColor = randomPurple;
            
            // Add slight random offsets
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            
            // Set position
            sprinkle.style.left = `${e.clientX + offsetX}px`;
            sprinkle.style.top = `${e.clientY + offsetY}px`;
            
            // Set size
            const size = Math.random() * 8 + 4;
            sprinkle.style.width = `${size}px`;
            sprinkle.style.height = `${size}px`;
            
            // Apply styles
            sprinkle.style.position = 'fixed';
            sprinkle.style.borderRadius = '50%';
            sprinkle.style.pointerEvents = 'none';
            sprinkle.style.opacity = '1';
            sprinkle.style.transform = 'scale(1)';
            sprinkle.style.transition = 'opacity 1.6s ease-out, transform 1.6s ease-out, top 1.6s ease-out';
            sprinkle.style.zIndex = '9999';
            
            // Add to document
            document.body.appendChild(sprinkle);
            
            // Fade out
            setTimeout(() => {
                sprinkle.style.opacity = '0';
                sprinkle.style.transform = 'scale(0.5) translateY(-20px)';
            }, 10);
            
            // Remove from DOM
            setTimeout(() => {
                sprinkle.remove();
            }, 1600);
        }
    });
    
    // Function to record mouse position to script
    function recordMousePosition(x, y) {
        if (!timeCapsule.enabled) return; // Exit if time capsule is disabled
        
        // Start recording if this is the first position or if we're not already recording
        if (!timeCapsule.recording) {
            timeCapsule.recording = true;
            timeCapsule.mouseScript = []; // Clear previous script
        }
        
        // Only record if position has changed significantly (to reduce unnecessary data)
        if (!timeCapsule.lastPosition || 
            Math.abs(timeCapsule.lastPosition.x - x) > 5 || 
            Math.abs(timeCapsule.lastPosition.y - y) > 5) {
            
            timeCapsule.mouseScript.push({
                x: x,
                y: y,
                timestamp: Date.now()
            });
            
            timeCapsule.lastPosition = { x, y };
            
            // Limit script length
            if (timeCapsule.mouseScript.length > timeCapsule.maxScriptLength) {
                timeCapsule.mouseScript.shift();
            }
            
            // Check if we should replay
            checkReplayTimeCapsule();
        }
    }
    
    // Function to check and replay time capsule script
    function checkReplayTimeCapsule() {
        if (!timeCapsule.enabled) return; // Exit if time capsule is disabled
        
        const now = Date.now();
        if (now - timeCapsule.lastReplayTime > timeCapsule.replayDelay && 
            timeCapsule.mouseScript.length > 10) { // Only replay if we have enough points
            
            timeCapsule.lastReplayTime = now;
            replayMouseScript();
        }
    }
    
    // Function to replay stored mouse script
    function replayMouseScript() {
        const script = [...timeCapsule.mouseScript]; // Create a copy to replay
        let startTime = null;
        
        // Get the timestamps relative to start
        const startTimestamp = script[0].timestamp;
        
        // Replay the script with timing based on original recording
        script.forEach((point, index) => {
            const relativeTime = point.timestamp - startTimestamp;
            
            setTimeout(() => {
                // Create multiple sprinkles at this point to simulate mouse movement
                for (let i = 0; i < 2; i++) {
                    createSprinkleAtPosition(point.x, point.y);
                }
            }, relativeTime * 0.7); // Replay at 70% of original speed for dramatic effect
        });
    }
    
    // Create a sprinkle at a specific position
    function createSprinkleAtPosition(x, y) {
        // Select a random purple shade from the array
        const randomPurple = darkPurpleShades[Math.floor(Math.random() * darkPurpleShades.length)];
        
        // Add slight random offsets
        const offsetX = (Math.random() - 0.5) * 30; 
        const offsetY = (Math.random() - 0.5) * 30;
        
        // Random size
        const size = Math.random() * 8 + 4;
        
        const sprinkle = document.createElement('div');
        sprinkle.classList.add('sprinkle', 'memory-sprinkle');
        
        sprinkle.style.backgroundColor = randomPurple;
        sprinkle.style.left = `${x + offsetX}px`;
        sprinkle.style.top = `${y + offsetY}px`;
        sprinkle.style.width = `${size}px`;
        sprinkle.style.height = `${size}px`;
        
        // Apply sprinkle styles
        sprinkle.style.position = 'fixed';
        sprinkle.style.borderRadius = '50%';
        sprinkle.style.pointerEvents = 'none';
        sprinkle.style.opacity = '1';
        sprinkle.style.transform = 'scale(1)';
        sprinkle.style.transition = 'opacity 1.6s ease-out, transform 1.6s ease-out, top 1.6s ease-out';
        sprinkle.style.zIndex = '9999';
        
        // Add a subtle glow effect to indicate it's from time capsule
        sprinkle.style.boxShadow = '0 0 5px 2px rgba(255, 255, 255, 0.3)';
        
        document.body.appendChild(sprinkle);
        
        // Trigger the fade-out animation
        setTimeout(() => {
            sprinkle.style.opacity = '0';
            sprinkle.style.transform = 'scale(0.5) translateY(-20px)';
        }, 10);
        
        // Remove the sprinkle from the DOM after its animation completes
        setTimeout(() => {
            sprinkle.remove();
        }, 1600);
    }
});
