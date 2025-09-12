// Entrance area - Custom collision for 8x8 area

// Override collision system for smaller entrance area
AFRAME.registerComponent('entrance-collision', {
    init: function () {
        this.maxDistance = 3.5; // Stay within 8x8 area (±3.5 from center)
        this.previousPosition = new THREE.Vector3();
        this.el.addEventListener('componentchanged', this.checkBounds.bind(this));
    },

    tick: function () {
        this.checkBounds();
    },

    checkBounds: function () {
        const position = this.el.getAttribute('position');
        const currentPos = new THREE.Vector3(position.x, position.y, position.z);
        
        const originalY = currentPos.y;
        let corrected = false;
        
        if (Math.abs(currentPos.x) > this.maxDistance) {
            currentPos.x = Math.sign(currentPos.x) * this.maxDistance;
            corrected = true;
        }
        
        if (Math.abs(currentPos.z) > this.maxDistance) {
            currentPos.z = Math.sign(currentPos.z) * this.maxDistance;
            corrected = true;
        }
        
        if (corrected) {
            this.el.setAttribute('position', {
                x: currentPos.x,
                y: originalY,
                z: currentPos.z
            });
        }
    }
});

// Initialize entrance navigation
AFRAME.registerComponent('entrance-navigation', {
    init: function () {
        console.log('Entrance navigation initialized');
        this.setupEventListeners();
    },

    setupEventListeners: function () {
        const scene = document.querySelector('a-scene');
        
        if (scene.hasLoaded) {
            this.addClickListeners();
        } else {
            scene.addEventListener('loaded', () => {
                this.addClickListeners();
            });
        }
    },

    addClickListeners: function () {
        // Add click listeners to all doors
        const doors = document.querySelectorAll('.door');
        doors.forEach(door => {
            door.addEventListener('click', handleDoorClick);
        });

        // Add click listener to START button
        const startButton = document.querySelector('#start-button');
        if (startButton) {
            startButton.addEventListener('click', handleStartClick);
        }

        // Add specific click listener to door (handles GLTF models better)
        const doorElement = document.querySelector('#door-room1');
        if (doorElement) {
            doorElement.addEventListener('click', handleDoorClick);
        }
    }
});

function handleStartClick(event) {
    console.log('START button clicked!');
    
    // Hide welcome elements
    const speechBubble = document.querySelector('#speech-bubble');
    const startButton = document.querySelector('#start-button');
    
    if (speechBubble) {
        speechBubble.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 500');
        setTimeout(() => {
            speechBubble.setAttribute('visible', 'false');
        }, 500);
    }
    
    if (startButton) {
        startButton.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 500');
        setTimeout(() => {
            startButton.setAttribute('visible', 'false');
        }, 500);
    }
    
    // Show Room 1 door and message after animation
    setTimeout(() => {
        const door = document.querySelector('#door-room1');
        const doorLabel = document.querySelector('#room1-label');
        const message = document.querySelector('#message');
        
        if (door) {
            door.setAttribute('visible', 'true');
            door.setAttribute('animation', 'property: scale; from: 0 0 0; to: 0.013 0.013 0.013; dur: 800');
            // Make door clickable by adding the door class
            door.classList.add('door');
        }
        
        if (doorLabel) {
            doorLabel.setAttribute('visible', 'true');
            doorLabel.setAttribute('animation', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 800');
        }
        
        if (message) {
            message.setAttribute('visible', 'true');
            message.setAttribute('animation', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 800');
        }
    }, 600);
}

function handleDoorClick(event) {
    const door = event.target;
    const targetRoom = door.getAttribute('data-target');
    
    if (targetRoom) {
        console.log('Navigating to:', targetRoom);
        
        // Navigate immediately without animation
        navigateToRoom(targetRoom);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('entrance-navigation', '');
    }
});