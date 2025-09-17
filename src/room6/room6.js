// Room 6 - Saw pickup and wall cutting system

// Global state
let hasSaw = false;
let wallCut = false;
let lookingAtWall = false;

// UI update functions - updates both HTML overlay and world-space fallback
function updateInventoryUI() {
    const sawText = hasSaw ? '🔧 Saw: In Inventory' : '🔧 Saw: Available';
    const sawColor = hasSaw ? 'green' : 'orange';

    // Update HTML overlay
    const htmlTools = document.querySelector('#tools');
    if (htmlTools) {
        htmlTools.textContent = sawText;
        htmlTools.style.color = hasSaw ? '#00ff00' : '#ff8800';
    }

    // Update world-space fallback
    const worldTools = document.querySelector('#world-inventory-tools');
    if (worldTools) {
        worldTools.setAttribute('value', sawText);
        worldTools.setAttribute('color', sawColor === 'green' ? 'lime' : 'orange');
    }
}

function updateUsageHint() {
    let hintText = '';
    if (!hasSaw) {
        hintText = 'Click to pick up | R = Use Saw';
    } else if (wallCut) {
        hintText = 'Wall cut! View material layers | R = Use Saw';
    } else if (lookingAtWall) {
        hintText = 'Press R to use saw on wall';
    } else {
        hintText = 'Look at highlighted wall to use saw | R = Use Saw';
    }

    // Update HTML overlay
    const htmlHint = document.querySelector('#usage-hint');
    if (htmlHint) {
        htmlHint.textContent = hintText;
    }
}

// Saw pickup functionality
function handleSawPickup(event) {
    console.log('Saw clicked!', event.target);

    if (!hasSaw) {
        console.log('Picking up saw!');

        // Hide entire saw group from scene
        const sawGroup = document.querySelector('#saw-group');
        if (sawGroup) {
            sawGroup.setAttribute('visible', 'false');
        }

        // Set saw state
        hasSaw = true;

        // Update UI
        updateInventoryUI();
        updateUsageHint();

        // Update message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Saw acquired! Look at the highlighted wall section and press R to cut it.');
        }

        console.log('Saw is now in inventory!');

    } else {
        console.log('Saw already picked up');
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'You already have the saw in your inventory.');
        }
    }
}

// Wall cutting functionality
function cutWall() {
    if (!hasSaw) {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'You need the saw first! Find and pick up the saw.');
        }
        return;
    }

    if (wallCut) {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Wall already cut! You can see all the material layers.');
        }
        return;
    }

    if (!lookingAtWall) {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Look at the highlighted wall section to use the saw.');
        }
        return;
    }

    console.log('Cutting wall with saw!');
    wallCut = true;

    // Don't show layers immediately - they'll animate in after the wall opens
    const wallLayers = document.querySelector('#wall-layers');
    if (wallLayers) {
        // Keep layers invisible initially, they'll animate in later
        wallLayers.setAttribute('visible', 'false');
    }

    // Animate outer wall opening like a door using A-Frame animation
    const outerWallPivot = document.querySelector('#outer-wall-pivot');
    console.log('Outer wall pivot found:', outerWallPivot);

    if (outerWallPivot) {
        console.log('Starting wall animation...');

        // Try multiple animation approaches - using same 75° angle as layers
        // Method 1: Rotation animation
        outerWallPivot.setAttribute('animation__rotation', {
            property: 'rotation',
            to: '0 75 0',
            dur: 3000,
            easing: 'easeOutQuad'
        });

        // Method 2: Position animation as backup - move further toward room center
        outerWallPivot.setAttribute('animation__position', {
            property: 'position',
            to: '3.0 0 -1.5',
            dur: 3000,
            easing: 'easeOutQuad',
            delay: 500
        });

        // Method 3: Direct Three.js manipulation as ultimate fallback
        setTimeout(() => {
            if (outerWallPivot.object3D) {
                outerWallPivot.object3D.rotation.set(0, THREE.MathUtils.degToRad(75), 0);
                console.log('Applied direct rotation');
            }
        }, 500);

        // Log for debugging
        console.log('Current rotation:', outerWallPivot.getAttribute('rotation'));
        console.log('Current position:', outerWallPivot.getAttribute('position'));
        console.log('Target rotation: 0 120 0');

        // Animate the layers appearing after wall starts opening
        setTimeout(() => {
            animateLayersReveal();
        }, 1000); // Start showing layers 1 second after wall starts opening

    } else {
        console.error('Could not find outer wall pivot element!');
        // Still show layers even if wall animation fails
        setTimeout(() => {
            animateLayersReveal();
        }, 500);
    }

    // Hide yellow highlight
    const sawTarget = document.querySelector('#saw-target');
    if (sawTarget) {
        sawTarget.setAttribute('visible', 'false');
    }

    // Update UI and message
    updateUsageHint();
    const message = document.querySelector('#message');
    if (message) {
        message.setAttribute('value', 'Wall cut successfully! You can now see all the material layers from Room 2.');
    }

    console.log('Wall cutting complete!');
}

// Animate the material layers appearing one by one as doors opening
function animateLayersReveal() {
    console.log('Starting layer reveal animation...');

    const wallLayers = document.querySelector('#wall-layers');
    if (!wallLayers) {
        console.error('Wall layers not found!');
        return;
    }

    // Make the container visible
    wallLayers.setAttribute('visible', 'true');

    // Get all the layer pivot entities
    const layerPivots = wallLayers.querySelectorAll('.layer-pivot');

    console.log(`Found ${layerPivots.length} layer pivots`);

    // Initially make all layers visible (they'll be closed initially)
    layerPivots.forEach((pivot, index) => {
        pivot.setAttribute('visible', 'true');
        console.log(`Layer pivot ${index + 1} made visible`);
    });

    // Animate each layer opening like a door with staggered timing (reverse order)
    layerPivots.forEach((pivot, index) => {
        // Reverse the order: start with last layer (Sumpfkalk), end with first layer (Hanfbeton)
        const reverseIndex = layerPivots.length - 1 - index;
        const delay = reverseIndex * 800; // 800ms delay between each layer (slower)

        setTimeout(() => {
            console.log(`Opening door for layer ${index + 1} (${pivot.querySelector('a-text')?.getAttribute('value')})...`);

            // Animate the pivot rotation to open like a door (bigger angles)
            const rotationAngle = 75; // Increased angle for better visibility

            pivot.setAttribute('animation__door_open', {
                property: 'rotation',
                to: `0 ${rotationAngle} 0`,
                dur: 2000, // Slower door opening (2 seconds instead of 1)
                easing: 'easeOutQuad'
            });

            // Add sliding effect - ALL layers slide toward room center in X direction (right)
            const currentPos = pivot.getAttribute('position');
            // Sumpfkalk (index 7) slides most to the right toward room center
            // Formula: index * 0.1 = slides from 0.0 (Hanfbeton) to +0.7 (Sumpfkalk)
            const slideDistance = index * 0.1;

            pivot.setAttribute('animation__slide', {
                property: 'position',
                to: `${currentPos.x + slideDistance} ${currentPos.y} ${currentPos.z}`,
                dur: 2000, // Same duration as door opening
                easing: 'easeOutQuad',
                delay: 500 // Start sliding 0.5 seconds after door starts opening
            });

        }, delay);
    });

    // Update message after all layers have opened (longer time due to slower animation)
    setTimeout(() => {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Wall cut successfully! All material layers opened and arranged for perfect viewing!');
        }
    }, layerPivots.length * 800 + 2500);
}

// Check if player is looking at layers and show/hide text accordingly
function checkLayerLookDirection() {
    const cursor = document.querySelector('a-cursor');
    if (!cursor || !wallCut) return; // Only check after wall is cut

    const raycaster = cursor.components.raycaster;
    const intersections = raycaster.intersections;

    // Hide all layer texts first
    const allLayerTexts = document.querySelectorAll('.layer-pivot a-text');
    const allLayerPlanes = document.querySelectorAll('.layer-pivot a-plane');

    allLayerTexts.forEach(text => text.setAttribute('visible', 'false'));
    allLayerPlanes.forEach(plane => plane.setAttribute('visible', 'false'));

    if (intersections.length > 0) {
        // Check if looking at any material layer
        const layerIntersection = intersections.find(hit =>
            hit.object.el && hit.object.el.classList.contains('material-layer')
        );

        if (layerIntersection) {
            // Find the parent layer-pivot and show its text
            const layerPivot = layerIntersection.object.el.parentElement;
            if (layerPivot && layerPivot.classList.contains('layer-pivot')) {
                const layerText = layerPivot.querySelector('a-text');
                const layerPlane = layerPivot.querySelector('a-plane');
                if (layerText) layerText.setAttribute('visible', 'true');
                if (layerPlane) layerPlane.setAttribute('visible', 'true');
            }
        }
    }
}

// Check if player is looking at the cuttable wall
function checkWallLookDirection() {
    const playerCam = document.querySelector('#playerCam');
    const cursor = document.querySelector('a-cursor');
    const sawTarget = document.querySelector('#saw-target');

    if (cursor && !wallCut) {
        const raycaster = cursor.components.raycaster;
        const intersections = raycaster.intersections;

        const wasLookingAtWall = lookingAtWall;
        lookingAtWall = false;

        if (intersections.length > 0) {
            // Check if looking at the cuttable wall
            const intersection = intersections.find(hit =>
                hit.object.el && (
                    hit.object.el.classList.contains('cuttable-wall') ||
                    hit.object.el.classList.contains('saw-interactive')
                )
            );

            if (intersection) {
                lookingAtWall = true;

                // Change highlight color when looking at wall
                if (sawTarget) {
                    sawTarget.setAttribute('material', 'color: orange; opacity: 0.5');
                }
            }
        }

        // Reset highlight color when not looking at wall
        if (!lookingAtWall && sawTarget) {
            sawTarget.setAttribute('material', 'color: yellow; opacity: 0.3');
        }

        // Update UI if look state changed
        if (wasLookingAtWall !== lookingAtWall) {
            updateUsageHint();
        }
    }

    // Hide highlight completely when wall is cut
    if (wallCut && sawTarget) {
        sawTarget.setAttribute('visible', 'false');
    }

    // Check layer visibility after wall is cut
    checkLayerLookDirection();
}

// Room 6 saw system component
AFRAME.registerComponent('room6-saw', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addSawListeners();
            this.startWallChecking();
        }, 100);
    },

    addSawListeners: function () {
        // Add click listeners for saw (targeting the trigger box)
        const sawTrigger = document.querySelector('#saw-trigger');
        if (sawTrigger) {
            console.log('Adding click listener to saw trigger');
            sawTrigger.addEventListener('click', (event) => {
                console.log('Saw clicked!', event.target);
                // Only allow pickup if we don't already have the saw
                if (!hasSaw) {
                    handleSawPickup(event);
                } else {
                    console.log('Saw already picked up');
                }
            });
        }

        // Add keyboard listener for R key (saw usage)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'r' || event.key === 'R') {
                event.preventDefault(); // Prevent default R behavior
                if (hasSaw && !wallCut) {
                    cutWall();
                }
            }
        });

        // Initialize UI
        updateInventoryUI();
        updateUsageHint();
    },

    startWallChecking: function () {
        // Check wall look direction continuously
        setInterval(() => {
            checkWallLookDirection();
        }, 100); // Check every 100ms
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room6-saw', '');
    }
});