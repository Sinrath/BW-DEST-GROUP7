// Room 5 - Material sorting functionality + Key puzzle

// Global state for material sorting puzzle
let isHoldingMaterial = false;
let heldMaterialType = null;
let placedMaterials = {
    spot1: null,
    spot2: null
};
let hasKey = false;
let puzzleSolved = false;
let doorUnlocked = false;

// Material pickup functionality (from Room 3)
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

// Handle placement on sorting spots (from Room 3)
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

// Handle clicking on placed materials to pick them back up (from Room 3)
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

// Material drop functionality (from Room 3)
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

// Update spot colors based on current state (from Room 3 + key drop)
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
            puzzleSolved = true;

            const message = document.querySelector('#message');
            if (message) {
                message.setAttribute('value', '🎉 Puzzle Complete! Both materials are correctly sorted by sustainability!');
            }

            // Visual celebration - make spots pulse
            spot1.setAttribute('animation', 'property: scale; to: 1.2 1 1.2; dur: 1000; dir: alternate; loop: true');
            spot2.setAttribute('animation', 'property: scale; to: 1.2 1 1.2; dur: 1000; dir: alternate; loop: true');

            // Drop the key after 2 seconds
            setTimeout(() => {
                dropKey();
            }, 2000);

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

// Drop key when puzzle is solved
function dropKey() {
    const key = document.querySelector('#key');
    if (key) {
        key.setAttribute('visible', 'true');
        key.setAttribute('animation', 'property: position; to: 0 2 1; dur: 1000; easing: easeInOutQuad');

        // Ensure position is properly set after animation
        setTimeout(() => {
            key.setAttribute('position', '0 2 1');
        }, 1100);

        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', '🔑 A key has appeared! Click to pick it up and unlock the door.');
        }

        console.log('Key dropped successfully!');
    }
}

// Door unlock with confetti effect
function handleDoorUnlock(event) {
    if (hasKey && !doorUnlocked) {
        doorUnlocked = true;

        // Create confetti effect
        createConfetti();

        // Update message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', '🎉 Door Unlocked! Congratulations! You completed Room 5!');
        }

        console.log('Door unlocked with confetti!');
    }
}

// Create confetti effect
function createConfetti() {
    const scene = document.querySelector('a-scene');
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];

    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('a-box');
        confetti.setAttribute('width', '0.1');
        confetti.setAttribute('height', '0.1');
        confetti.setAttribute('depth', '0.02');
        confetti.setAttribute('material', `color: ${colors[Math.floor(Math.random() * colors.length)]}`);

        // Random starting position around the door
        const startX = (Math.random() - 0.5) * 4;
        const startY = 2 + Math.random() * 2;
        const startZ = -6 + (Math.random() - 0.5) * 2;
        confetti.setAttribute('position', `${startX} ${startY} ${startZ}`);

        // Random fall animation
        const endX = startX + (Math.random() - 0.5) * 6;
        const endY = 0;
        const endZ = startZ + (Math.random() - 0.5) * 4;
        const duration = 3000 + Math.random() * 2000;

        confetti.setAttribute('animation__fall', `property: position; to: ${endX} ${endY} ${endZ}; dur: ${duration}; easing: easeInQuad`);
        confetti.setAttribute('animation__spin', `property: rotation; to: ${Math.random() * 720} ${Math.random() * 720} ${Math.random() * 720}; dur: ${duration}; easing: linear`);

        scene.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, duration + 1000);
    }
}

// Key pickup functionality
function handleKeyPickup(event) {
    if (!hasKey) {
        const key = event.target;
        key.setAttribute('visible', 'false');
        hasKey = true;

        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', '🔑 Key acquired! Click on the locked door to unlock it.');
        }

        // Update door texts
        const doorText = document.querySelector('a-text[value="🔒 LOCKED DOOR"]');
        const doorHint = document.querySelector('a-text[value="Find the key!"]');
        if (doorText) doorText.setAttribute('value', '🔓 UNLOCKABLE DOOR');
        if (doorText) doorText.setAttribute('color', 'green');
        if (doorHint) doorHint.setAttribute('value', 'Click to unlock!');
        if (doorHint) doorHint.setAttribute('color', 'green');

        // Make door interactive
        const door = document.querySelector('#locked-door');
        if (door) {
            door.classList.add('door');
            door.setAttribute('data-target', '../room4/room4.html');  // or wherever you want it to lead

            // Add click listener for confetti effect
            door.addEventListener('click', handleDoorUnlock);
        }

        console.log('Key picked up! Door is now unlockable.');
    }
}

// Room 5 material sorting system component
AFRAME.registerComponent('room5-puzzles', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addPuzzleListeners();
        }, 100);
    },

    addPuzzleListeners: function () {
        // Add click listeners for materials
        const materials = document.querySelectorAll('.material');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialPickup);
        });

        // Add click listeners for sorting spots
        const sortingSpots = document.querySelectorAll('.sorting-spot');
        sortingSpots.forEach(spot => {
            spot.addEventListener('click', handleSpotClick);
        });

        // Add click listener for key
        const key = document.querySelector('.key');
        if (key) {
            key.addEventListener('click', handleKeyPickup);
        }

        // Add keyboard listeners
        document.addEventListener('keydown', (event) => {
            if (event.key === 'q' || event.key === 'Q') {
                if (isHoldingMaterial) {
                    handleMaterialDrop(event);
                }
            }
        });

        console.log('Room 5 material sorting and key puzzle system initialized');
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room5-puzzles', '');
    }

    console.log('🔑 Room 5 - Material Sorting & Key Puzzle Loaded');
    console.log('Sort materials by sustainability to unlock the door!');
});