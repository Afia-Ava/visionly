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

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('mousemove', (e) => {
        // Create a random number of sprinkles (1 or 2) for a more subtle effect
        const numberOfSprinkles = Math.floor(Math.random() * 2) + 1; // Generates 1 or 2

        for (let i = 0; i < numberOfSprinkles; i++) {
            const sprinkle = document.createElement('div');
            sprinkle.classList.add('sprinkle');

            // Select a random purple shade from the array (matching button colors)
            const randomPurple = darkPurpleShades[Math.floor(Math.random() * darkPurpleShades.length)];
            sprinkle.style.backgroundColor = randomPurple;

            // Add slight random offsets to create a "sprinkle" effect around the pointer
            const offsetX = (Math.random() - 0.5) * 30; // -15px to +15px
            const offsetY = (Math.random() - 0.5) * 30; // -15px to +15px

            // Set initial position of the sprinkle
            sprinkle.style.left = `${e.clientX + offsetX}px`;
            sprinkle.style.top = `${e.clientY + offsetY}px`;

            // Set a random initial size for the sprinkle to add variety
            const size = Math.random() * 8 + 4; // Size between 4px and 12px
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

            // Append the sprinkle to the body
            document.body.appendChild(sprinkle);

            // Trigger the fade-out animation after a very short delay
            setTimeout(() => {
                sprinkle.style.opacity = '0';
                sprinkle.style.transform = 'scale(0.5) translateY(-20px)';
            }, 10); // 10ms delay

            // Remove the sprinkle from the DOM after its animation completes
            setTimeout(() => {
                sprinkle.remove();
            }, 1600); // 1600ms
        }
    });
});
