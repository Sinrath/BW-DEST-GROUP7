// Room 3 - Material sorting functionality

// Global state for material sorting puzzle
let isHoldingMaterial = false;
let heldMaterialType = null;
let placedMaterials = {
    spot1: null,
    spot2: null
};


// Material pickup functionality
function handleMaterialPickup(event) {

    const material = event.target;
    const materialType = material.getAttribute('data-material');
    const playerCam = document.querySelector('#playerCam');

    if (!isHoldingMaterial) {
        console.log('Picking up material:', materialType);

        // Hide original material
        material.setAttribute('visible', 'false');

        // Create "held" material that's always visible in camera
        const heldMaterial = document.createElement('a-entity');
        heldMaterial.setAttribute('id', 'held-material');
        heldMaterial.setAttribute('position', '0.3 -0.4 -0.5');
        heldMaterial.setAttribute('data-material', materialType);

        // Use different display based on material type
        if (materialType === 'wood') {
            heldMaterial.setAttribute('gltf-model', '#woodBlockModel');
            heldMaterial.setAttribute('scale', '0.03 0.03 0.03');
        } else {
            heldMaterial.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.3; depth: 0.3');
            heldMaterial.setAttribute('material', material.getAttribute('material'));
        }

        // Add to camera so it follows view
        playerCam.appendChild(heldMaterial);
        isHoldingMaterial = true;
        heldMaterialType = materialType;

        // Update UI message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `Holding ${materialType}! Click on a sorting spot to place it.`);
        }

        console.log('Material is now held!');

    } else {
        console.log('Already holding a material');
    }
}

// Handle placement on sorting spots
function handleSpotClick(event) {
    const spot = event.target;
    const spotId = spot.getAttribute('id');
    const correctMaterial = spot.getAttribute('data-correct-material');

    if (isHoldingMaterial) {
        console.log('Placing material on spot:', spotId);

        // Check if it's the correct material
        const isCorrect = heldMaterialType === correctMaterial;

        // Remove held material from camera
        const heldMaterial = document.querySelector('#held-material');
        if (heldMaterial) {
            heldMaterial.remove();
        }

        // Remove any existing placed material on this spot
        const existingPlaced = document.querySelector(`[data-spot="${spotId}"]`);
        if (existingPlaced) {
            existingPlaced.remove();
        }

        // Create material on the spot
        const placedMaterial = document.createElement('a-entity');
        placedMaterial.setAttribute('position', spot.getAttribute('position'));
        placedMaterial.getAttribute('position').y = 1.25; // Place above the spot
        placedMaterial.setAttribute('class', 'placed-material');
        placedMaterial.setAttribute('data-material', heldMaterialType);
        placedMaterial.setAttribute('data-spot', spotId);

        // Set material appearance based on type
        if (heldMaterialType === 'wood') {
            placedMaterial.setAttribute('gltf-model', '#woodBlockModel');
            placedMaterial.setAttribute('scale', '0.05 0.05 0.05');
        } else {
            placedMaterial.setAttribute('geometry', 'primitive: box; width: 0.4; height: 0.4; depth: 0.4');
            const originalMaterial = document.querySelector(`#material-${heldMaterialType}`);
            if (originalMaterial) {
                placedMaterial.setAttribute('material', originalMaterial.getAttribute('material'));
            }
        }

        // Add click listener to remove material
        placedMaterial.addEventListener('click', handlePlacedMaterialClick);

        // Add to scene
        const scene = document.querySelector('a-scene');
        scene.appendChild(placedMaterial);

        // Update placed materials state
        placedMaterials[spotId] = heldMaterialType;

        // Reset holding state
        const currentMaterialType = heldMaterialType;
        isHoldingMaterial = false;
        heldMaterialType = null;

        // Update UI message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `${currentMaterialType} placed on ${spotId === 'spot1' ? 'left' : 'right'} spot. Place both materials to see if they're correct!`);
        }

        // Update spot colors and check completion
        updateSpotColors();

    } else {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Pick up a material first!');
        }
    }
}

// Handle clicking on placed materials to pick them back up
function handlePlacedMaterialClick(event) {
    if (isHoldingMaterial) {
        return; // Already holding something
    }

    const placedMaterial = event.target;
    const materialType = placedMaterial.getAttribute('data-material');
    const spotId = placedMaterial.getAttribute('data-spot');

    // Remove the placed material
    placedMaterial.remove();

    // Reset the spot state
    placedMaterials[spotId] = null;

    // Create held material in camera
    const playerCam = document.querySelector('#playerCam');
    const heldMaterial = document.createElement('a-entity');
    heldMaterial.setAttribute('id', 'held-material');
    heldMaterial.setAttribute('position', '0.3 -0.4 -0.5');
    heldMaterial.setAttribute('data-material', materialType);

    // Use different display based on material type
    if (materialType === 'wood') {
        heldMaterial.setAttribute('gltf-model', '#woodBlockModel');
        heldMaterial.setAttribute('scale', '0.03 0.03 0.03');
    } else {
        heldMaterial.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.3; depth: 0.3');
        heldMaterial.setAttribute('material', placedMaterial.getAttribute('material'));
    }

    playerCam.appendChild(heldMaterial);
    isHoldingMaterial = true;
    heldMaterialType = materialType;

    // Update UI message
    const message = document.querySelector('#message');
    if (message) {
        message.setAttribute('value', `Picked up ${materialType} again! Click on a sorting spot to place it.`);
    }

    // Update spot colors after removal
    updateSpotColors();

    console.log('Material picked up from spot:', materialType);
}

// Material drop functionality (similar to wood drop)
function handleMaterialDrop(event) {
    if (isHoldingMaterial) {
        const heldMaterial = document.querySelector('#held-material');
        const playerRig = document.querySelector('#rig');
        const playerCam = document.querySelector('#playerCam');
        const playerPos = playerRig.getAttribute('position');

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
        const dropY = Math.max(0.25, cameraHeight - worldDirection.y * dropDistance); // Don't drop below ground

        // Remove held material from camera
        if (heldMaterial) {
            heldMaterial.remove();
        }

        // Show original material where you're looking (including height)
        const originalMaterial = heldMaterialType === 'wood' ?
            document.querySelector('#wood-sample') :
            document.querySelector(`#material-${heldMaterialType}`);

        if (originalMaterial) {
            originalMaterial.setAttribute('position', `${dropX} ${dropY} ${dropZ}`);
            originalMaterial.setAttribute('visible', 'true');
        }

        // Reset holding state
        const droppedMaterialType = heldMaterialType;
        isHoldingMaterial = false;
        heldMaterialType = null;

        // Update UI message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `${droppedMaterialType} dropped where you were looking! Click to pick up again.`);
        }

        console.log('Material dropped where you were looking!');
    }
}

// Update spot colors based on current state
function updateSpotColors() {
    const spot1 = document.querySelector('#spot1');
    const spot2 = document.querySelector('#spot2');

    // Check if both spots have materials
    const bothPlaced = placedMaterials.spot1 && placedMaterials.spot2;

    if (bothPlaced) {
        // Check correctness
        const spot1Correct = placedMaterials.spot1 === spot1.getAttribute('data-correct-material');
        const spot2Correct = placedMaterials.spot2 === spot2.getAttribute('data-correct-material');

        // Set colors based on correctness
        spot1.setAttribute('material', spot1Correct ? 'color: green; opacity: 0.8' : 'color: red; opacity: 0.8');
        spot2.setAttribute('material', spot2Correct ? 'color: green; opacity: 0.8' : 'color: red; opacity: 0.8');

        // Check if puzzle is complete
        if (spot1Correct && spot2Correct) {
            const message = document.querySelector('#message');
            if (message) {
                message.setAttribute('value', '🎉 Puzzle Complete! Both materials are correctly sorted by sustainability!');
            }

            // Visual celebration - make spots pulse
            spot1.setAttribute('animation', 'property: scale; to: 1.2 1 1.2; dur: 1000; dir: alternate; loop: true');
            spot2.setAttribute('animation', 'property: scale; to: 1.2 1 1.2; dur: 1000; dir: alternate; loop: true');

            console.log('Sorting puzzle completed!');
        } else {
            const message = document.querySelector('#message');
            if (message) {
                message.setAttribute('value', 'Some materials are in wrong spots! Click them to pick up and try again.');
            }
        }
    } else {
        // Not both placed - keep spots gray
        spot1.setAttribute('material', 'color: gray; opacity: 0.6');
        spot2.setAttribute('material', 'color: gray; opacity: 0.6');
    }
}

// Extend the shared room-navigation to add material sorting
AFRAME.registerComponent('room3-puzzles', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addAllListeners();
        }, 100);
    },

    addAllListeners: function () {
        // Add click listeners for all materials (including wood block)
        const materials = document.querySelectorAll('.material');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialPickup);
        });

        // Add click listeners for sorting spots
        const spots = document.querySelectorAll('.sorting-spot');
        spots.forEach(spot => {
            spot.addEventListener('click', handleSpotClick);
        });

        // Add drop listener for materials (Q key)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'q' || event.key === 'Q') {
                if (isHoldingMaterial) {
                    handleMaterialDrop(event);
                }
            }
        });
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room3-puzzles', '');
    }
});