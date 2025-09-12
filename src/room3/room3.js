// Room 3 - Wood pickup functionality

// Global state for wood pickup
let isHoldingWood = false;

// Wood pickup functionality
function handleWoodPickup(event) {
    const wood = event.target;
    const playerCam = document.querySelector('#playerCam');
    
    if (!isHoldingWood) {
        console.log('Picking up wood!');
        
        // Hide original wood
        wood.setAttribute('visible', 'false');
        
        // Create "held" wood that's always visible in camera
        const heldWood = document.createElement('a-gltf-model');
        heldWood.setAttribute('id', 'held-wood');
        heldWood.setAttribute('src', '#woodModel');
        heldWood.setAttribute('position', '0.5 -0.6 -0.7');
        heldWood.setAttribute('scale', '0.06 0.06 0.06');
        heldWood.setAttribute('rotation', '0 0 0');
        
        // Add to camera so it follows view
        playerCam.appendChild(heldWood);
        isHoldingWood = true;
        
        // Update UI message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Wood picked up! You can see it in your hand. Press Q to drop.');
        }
        
        console.log('Wood is now held!');
        
    } else {
        console.log('Already holding wood');
    }
}

// Drop wood functionality (optional)
function handleWoodDrop(event) {
    if (isHoldingWood) {
        const originalWood = document.querySelector('#wood-sample');
        const heldWood = document.querySelector('#held-wood');
        const playerRig = document.querySelector('#rig');
        const playerCam = document.querySelector('#playerCam');
        const playerPos = playerRig.getAttribute('position');
        const cameraRotation = playerCam.getAttribute('rotation');
        
        // Calculate drop position based on camera look direction using A-Frame's method
        const dropDistance = 2;
        
        // Get the camera's world direction vector
        const cameraEl = playerCam;
        const worldDirection = new THREE.Vector3();
        cameraEl.object3D.getWorldDirection(worldDirection);
        
        // Calculate drop position in the direction the camera is facing (flip direction)
        const dropX = playerPos.x - worldDirection.x * dropDistance;
        const dropZ = playerPos.z - worldDirection.z * dropDistance;
        
        // Calculate height based on camera look direction (up/down) - flip Y direction too
        const cameraHeight = playerPos.y; // Player's current height
        const dropY = Math.max(0.1, cameraHeight - worldDirection.y * dropDistance); // Don't drop below ground
        
        // Remove held wood from camera
        if (heldWood) {
            heldWood.remove();
        }
        
        // Show original wood where you're looking (including height)
        originalWood.setAttribute('position', `${dropX} ${dropY} ${dropZ}`);
        originalWood.setAttribute('visible', 'true');
        isHoldingWood = false;
        
        // Update UI message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Wood dropped where you were looking! Click to pick up again.');
        }
        
        console.log('Wood dropped where you were looking!');
    }
}

// Extend the shared room-navigation to add wood pickup
AFRAME.registerComponent('room3-wood-pickup', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addWoodListeners();
        }, 100);
    },

    addWoodListeners: function () {
        // Add click listener for wood pickup
        const wood = document.querySelector('#wood-sample');
        if (wood) {
            wood.addEventListener('click', handleWoodPickup);
            wood.classList.add('pickupable');
        }

        // Optional: Add drop listener (right-click or long press)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'q' || event.key === 'Q') {
                handleWoodDrop(event);
            }
        });
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room3-wood-pickup', '');
    }
});