// Room 4 - Material analysis and pickup system

// Global state
let hasScanner = false;
let isHoldingMaterial = false;
let heldMaterialType = null;

// UI update functions - updates both HTML overlay and world-space fallback
function updateInventoryUI() {
    const scannerText = hasScanner ? '🔧 Scanner: Ready' : '🔧 Scanner: Not Found';
    const scannerColor = hasScanner ? 'green' : 'red';

    // Update HTML overlay
    const htmlTools = document.querySelector('#tools');
    if (htmlTools) {
        htmlTools.textContent = scannerText;
        htmlTools.style.color = hasScanner ? '#00ff00' : '#ff4444';
    }

    // Update world-space fallback
    const worldTools = document.querySelector('#world-inventory-tools');
    if (worldTools) {
        worldTools.setAttribute('value', scannerText);
        worldTools.setAttribute('color', scannerColor === 'green' ? 'lime' : 'red');
    }

}

function updateHandUI() {
    const handText = isHoldingMaterial ? `📦 ${heldMaterialType.toUpperCase()}` : '📦 Empty';
    const handColor = isHoldingMaterial ? 'white' : 'gray';

    // Update HTML overlay
    const htmlHand = document.querySelector('#hand');
    if (htmlHand) {
        htmlHand.textContent = handText;
        htmlHand.style.color = isHoldingMaterial ? '#ffffff' : '#888888';
    }

    // Update world-space fallback
    const worldHand = document.querySelector('#world-hand-content');
    if (worldHand) {
        worldHand.setAttribute('value', handText);
        worldHand.setAttribute('color', handColor);
    }
}

// Scanner pickup functionality
function handleScannerPickup(event) {
    console.log('Scanner clicked!', event.target);

    if (!hasScanner) {
        console.log('Picking up scanner!');

        // Hide entire scanner group from scene
        const scannerGroup = document.querySelector('#scanner-group');
        if (scannerGroup) {
            scannerGroup.setAttribute('visible', 'false');
        }

        // Set scanner state
        hasScanner = true;

        // Update UI
        updateInventoryUI();

        // Update message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Scanner acquired! Click materials to pick up, E to scan what you look at, Q to drop.');
        }

        console.log('Scanner is now in inventory!');

    } else {
        console.log('Scanner already picked up');
    }
}

// Scanning functionality - scan what you're looking at with E key
function handleScan(event) {
    if (hasScanner) {
        // Get what the player is currently looking at using raycaster
        const playerCam = document.querySelector('#playerCam');
        const cursor = document.querySelector('a-cursor');

        if (cursor) {
            const raycaster = cursor.components.raycaster;
            const intersections = raycaster.intersections;

            if (intersections.length > 0) {
                // Find the first scannable material
                const intersection = intersections.find(hit =>
                    hit.object.el && hit.object.el.classList.contains('scannable')
                );

                if (intersection) {
                    const material = intersection.object.el;
                    const materialInfo = material.getAttribute('data-info');
                    const materialType = material.getAttribute('data-material');

                    console.log('Scanning material:', materialType);

                    // Show scan info tooltip
                    const scanTooltip = document.querySelector('#scan-tooltip');
                    const scanInfo = document.querySelector('#scan-info');
                    if (scanTooltip && scanInfo) {
                        scanInfo.setAttribute('value', `SCAN RESULT:\n${materialInfo}`);
                        scanTooltip.setAttribute('visible', 'true');

                        // Hide after 7 seconds
                        setTimeout(() => {
                            scanTooltip.setAttribute('visible', 'false');
                        }, 7000);
                    }

                    // No visual animation - just scan silently

                    // Update message
                    const message = document.querySelector('#message');
                    if (message) {
                        message.setAttribute('value', `Scanning ${materialType}... Analysis complete!`);
                    }

                } else {
                    // Not looking at scannable material
                    const message = document.querySelector('#message');
                    if (message) {
                        message.setAttribute('value', 'Look at a material and press E to scan it!');
                    }
                }
            }
        }
    } else {
        // No scanner message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'You need the scanner first! Find the scanner tool.');
        }
    }
}

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

        // Update UI
        updateHandUI();

        // Update message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `Holding ${materialType}! Press E to scan anything you look at, Q to drop.`);
        }

        console.log('Material is now held!');

    } else {
        console.log('Already holding a material');
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `Already holding ${heldMaterialType}! Press Q to drop it first.`);
        }
    }
}

// Material drop functionality
function handleMaterialDrop(event) {
    if (isHoldingMaterial) {
        const heldMaterial = document.querySelector('#held-material');
        const playerRig = document.querySelector('#rig');
        const playerCam = document.querySelector('#playerCam');
        const playerPos = playerRig.getAttribute('position');

        // Calculate drop position based on camera look direction
        const dropDistance = 2;

        // Get the camera's world direction vector
        const cameraEl = playerCam;
        const worldDirection = new THREE.Vector3();
        cameraEl.object3D.getWorldDirection(worldDirection);

        // Calculate drop position in the direction the camera is facing
        const dropX = playerPos.x - worldDirection.x * dropDistance;
        const dropZ = playerPos.z - worldDirection.z * dropDistance;

        // Calculate height based on camera look direction
        const cameraHeight = playerPos.y;
        const dropY = Math.max(0.25, cameraHeight - worldDirection.y * dropDistance);

        // Remove held material from camera
        if (heldMaterial) {
            heldMaterial.remove();
        }

        // Show original material where you're looking
        const originalMaterial = heldMaterialType === 'wood' ?
            document.querySelector('#wood-block') :
            document.querySelector(`#material-${heldMaterialType}`);

        if (originalMaterial) {
            originalMaterial.setAttribute('position', `${dropX} ${dropY} ${dropZ}`);
            originalMaterial.setAttribute('visible', 'true');
        }

        // Reset holding state
        const droppedMaterialType = heldMaterialType;
        isHoldingMaterial = false;
        heldMaterialType = null;

        // Update UI
        updateHandUI();

        // Update message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `${droppedMaterialType} dropped! Click to pick up, E to scan what you look at.`);
        }

        console.log('Material dropped where you were looking!');
    }
}

// Room 4 material system component
AFRAME.registerComponent('room4-materials', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addMaterialListeners();
        }, 100);
    },

    addMaterialListeners: function () {
        // Add click listeners for scanner (targeting the trigger box)
        const scannerTrigger = document.querySelector('#scanner-trigger');
        if (scannerTrigger) {
            console.log('Adding click listener to scanner trigger');
            scannerTrigger.addEventListener('click', (event) => {
                console.log('Scanner clicked!', event.target);
                // Only allow pickup if we don't already have the scanner
                if (!hasScanner) {
                    handleScannerPickup(event);
                } else {
                    console.log('Scanner already picked up');
                }
            });
        }

        // Add click listeners for materials
        const materials = document.querySelectorAll('.material');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialPickup);
        });

        // Add keyboard listeners
        document.addEventListener('keydown', (event) => {
            if (event.key === 'q' || event.key === 'Q') {
                if (isHoldingMaterial) {
                    handleMaterialDrop(event);
                }
            } else if (event.key === 'e' || event.key === 'E') {
                handleScan(event);
            }
        });

        // Initialize UI
        updateInventoryUI();
        updateHandUI();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room4-materials', '');
    }
});