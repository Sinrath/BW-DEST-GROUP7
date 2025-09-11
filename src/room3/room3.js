// Room 3 navigation

// Collision system for 16x16 room
AFRAME.registerComponent('simple-collision', {
    init: function () {
        this.maxDistance = 7.5; // Stay within 16x16 area (±7.5 from center)
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

// Room navigation system
function navigateToRoom(roomUrl) {
    window.location.href = roomUrl;
}

// Initialize room navigation
AFRAME.registerComponent('room-navigation', {
    init: function () {
        console.log('Room navigation initialized');
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
    }
});

function handleDoorClick(event) {
    const door = event.target;
    const targetRoom = door.getAttribute('data-target');
    
    if (targetRoom) {
        console.log('Navigating to:', targetRoom);
        
        // Visual feedback
        door.setAttribute('animation', 'property: material.color; to: #00FF00; dur: 200; dir: alternate');
        
        // Navigate after short delay for visual feedback
        setTimeout(() => {
            navigateToRoom(targetRoom);
        }, 300);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room-navigation', '');
    }
});