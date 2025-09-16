// Room 5 - Prototype Development Space

// Global state for Room 5
let room5State = {
    developmentPhase: 'planning',
    prototypesCreated: 0,
    currentFocus: 'concept'
};

// UI update functions - updates both HTML overlay and world-space fallback
function updateRoom5UI() {
    const statusText = getStatusText();
    const progressText = getProgressText();

    // Update HTML overlay
    const htmlStatus = document.querySelector('#status');
    const htmlProgress = document.querySelector('#progress');
    if (htmlStatus) {
        htmlStatus.textContent = statusText;
    }
    if (htmlProgress) {
        htmlProgress.textContent = progressText;
    }

    // Update world-space fallback
    const worldStatus = document.querySelector('#world-status');
    const worldProgress = document.querySelector('#world-progress');
    if (worldStatus) {
        worldStatus.setAttribute('value', statusText);
    }
    if (worldProgress) {
        worldProgress.setAttribute('value', progressText);
    }
}

function getStatusText() {
    switch (room5State.developmentPhase) {
        case 'planning': return '🏗️ Room 5: Ready for Development';
        case 'prototyping': return '⚡ Room 5: Active Prototyping';
        case 'testing': return '🧪 Room 5: Testing Phase';
        case 'complete': return '✅ Room 5: Prototype Complete';
        default: return '🏗️ Room 5: Ready for Development';
    }
}

function getProgressText() {
    return `📋 Prototypes: ${room5State.prototypesCreated} | Focus: ${room5State.currentFocus}`;
}

// Placeholder interaction handler
function handlePlaceholderInteraction(event) {
    console.log('Room 5 placeholder interacted with:', event.target);

    // Advance development phase
    const phases = ['planning', 'prototyping', 'testing', 'complete'];
    const currentIndex = phases.indexOf(room5State.developmentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;
    room5State.developmentPhase = phases[nextIndex];
    room5State.prototypesCreated++;

    // Update focus areas
    const focusAreas = ['concept', 'mechanics', 'UI/UX', 'polish'];
    room5State.currentFocus = focusAreas[Math.floor(Math.random() * focusAreas.length)];

    // Update UI
    updateRoom5UI();

    // Update message
    const message = document.querySelector('#message');
    if (message) {
        message.setAttribute('value',
            `Room 5 Development Progress!\nPhase: ${room5State.developmentPhase} | Prototypes: ${room5State.prototypesCreated}`);
    }

    // Visual feedback
    const target = event.target;
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    target.setAttribute('material', `color: ${randomColor}; roughness: 0.3`);
    target.setAttribute('animation', 'property: scale; to: 1.2 1.2 1.2; dur: 300; dir: alternate');
}

// Action handler (triggered by E key or Action button)
function handleAction(event) {
    console.log('Room 5 action triggered');

    // Example action: cycle through development phases
    handlePlaceholderInteraction({target: document.querySelector('.placeholder')});
}

// Room 5 development component
AFRAME.registerComponent('room5-development', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addInteractionListeners();
        }, 100);
    },

    addInteractionListeners: function () {
        // Add click listeners for placeholder elements
        const placeholders = document.querySelectorAll('.placeholder');
        placeholders.forEach(placeholder => {
            placeholder.addEventListener('click', handlePlaceholderInteraction);
        });

        // Add keyboard listeners
        document.addEventListener('keydown', (event) => {
            if (event.key === 'e' || event.key === 'E') {
                handleAction(event);
            }
        });

        // Initialize UI
        updateRoom5UI();

        console.log('Room 5 development system initialized');
        console.log('Available interactions:');
        console.log('- Click the green cube to advance development phases');
        console.log('- Press E to trigger actions');
        console.log('- Press I to toggle VR interface');
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room5-development', '');
    }

    console.log('🚀 Room 5 - Prototype Development Space Loaded');
    console.log('This room is ready for your next innovative puzzle concept!');
});