// End/Completion Room - Celebration and navigation to individual prototypes

// Create floating celebration particles
function createCelebrationParticles() {
    const particlesContainer = document.querySelector('#particles');
    if (!particlesContainer) return;

    // Create multiple particle systems
    for (let i = 0; i < 45; i++) {
        const particle = document.createElement('a-sphere');

        // Random starting position in a circle around the trophy
        const angle = (i / 45) * Math.PI * 2;
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

        // Sparkle effects removed for better performance

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
