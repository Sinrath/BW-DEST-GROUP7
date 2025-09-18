// End/Completion Room - Celebration and navigation to individual prototypes

// Create floating celebration particles
function createCelebrationParticles() {
    const particlesContainer = document.querySelector('#particles');
    if (!particlesContainer) return;

    // Create multiple particle systems
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('a-sphere');

        // Random starting position in a circle around the trophy
        const angle = (i / 30) * Math.PI * 2;
        const radius = 2 + Math.random() * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        particle.setAttribute('position', `${x} 0 ${z}`);
        particle.setAttribute('radius', 0.05 + Math.random() * 0.05);

        // Random colors
        const colors = ['#FFD700', '#FF69B4', '#00FFFF', '#FF6600', '#00FF00', '#8A2BE2'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.setAttribute('material', `color: ${color}; emissive: ${color}; emissiveIntensity: 0.5`);

        // Floating animation
        particle.setAttribute('animation__float', {
            property: 'position',
            to: `${x} ${3 + Math.random() * 2} ${z}`,
            dur: 3000 + Math.random() * 2000,
            easing: 'easeInOutSine',
            loop: true,
            dir: 'alternate'
        });

        // Gentle rotation
        particle.setAttribute('animation__rotate', {
            property: 'rotation',
            to: `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`,
            dur: 4000 + Math.random() * 4000,
            easing: 'linear',
            loop: true
        });

        particlesContainer.appendChild(particle);

        // Staggered start
        setTimeout(() => {
            particle.setAttribute('visible', 'true');
        }, i * 100);
    }
}

// Create sparkle effects around the trophy
function createSparkles() {
    setInterval(() => {
        const sparkle = document.createElement('a-sphere');

        // Position around trophy
        const x = (Math.random() - 0.5) * 2;
        const y = 1 + Math.random() * 2;
        const z = (Math.random() - 0.5) * 2;

        sparkle.setAttribute('position', `${x} ${y} ${z}`);
        sparkle.setAttribute('radius', 0.02);
        sparkle.setAttribute('material', 'color: #FFD700; emissive: #FFD700; emissiveIntensity: 1');

        // Fade out and rise animation
        sparkle.setAttribute('animation__fade', {
            property: 'material.opacity',
            from: 1,
            to: 0,
            dur: 2000,
            easing: 'easeOutQuad'
        });

        sparkle.setAttribute('animation__rise', {
            property: 'position',
            to: `${x} ${y + 1} ${z}`,
            dur: 2000,
            easing: 'easeOutQuad'
        });

        document.querySelector('a-scene').appendChild(sparkle);

        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 2500);

    }, 200); // New sparkle every 200ms
}

// Completion celebration component
AFRAME.registerComponent('completion-celebration', {
    init: function () {
        setTimeout(() => {
            this.startCelebration();
        }, 1000); // Start after scene loads
    },

    startCelebration: function () {
        console.log('🎉 Starting completion celebration!');

        // Create particle effects
        createCelebrationParticles();

        // Start sparkle effects
        createSparkles();

        // Success message
        console.log('All prototypes successfully integrated and demonstrated!');

        // Optional: Play celebration sound if audio is available
        this.playCelebrationSound();
    },

    playCelebrationSound: function () {
        // Placeholder for celebration sound
        // In a real implementation, you would load and play audio here
        console.log('🔊 Playing celebration sound (placeholder)');
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('completion-celebration', '');
    }

    console.log('🎯 End room initialized - prototype showcase ready!');
});