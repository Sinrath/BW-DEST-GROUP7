// Main Integrated Room - Combines all prototype functions
// Room 4: Scanner + materials, Room 5: Sorting

// Simplified material facts for scanner
const MATERIAL_FACTS = {
  kupfer: [
    "KUPFER:",
    "Sehr hohe CO₂-Belastung bei Gewinnung",
    "Recycelbar, aber energieintensiv"
  ].join("\n"),

  holz: [
    "HOLZ:",
    "Speichert CO₂ (nachwachsend)",
    "Mittelmässige CO₂-Bilanz"
  ].join("\n"),

  kork: [
    "KORK:",
    "Natürlich & erneuerbar",
    "Gute Dämmung, mittlere CO₂-Bilanz"
  ].join("\n"),

  lehm: [
    "LEHM:",
    "Geringe CO₂-Belastung",
    "Reguliert Feuchtigkeit im Raum"
  ].join("\n"),

  sumpfkalk: [
    "SUMPFKALK:",
    "Nimmt CO₂ wieder auf",
    "Traditionelles Baumaterial"
  ].join("\n"),

  pflanzenkohle: [
    "PFLANZENKOHLE-BETON:",
    "Innovative Technologie",
    "Bindet zusätzlich CO₂"
  ].join("\n"),

  hanfziegel: [
    "HANFZIEGEL:",
    "Fast CO₂-neutral",
    "Leicht & gut dämmend"
  ].join("\n"),

  hanfbeton: [
    "HANFBETON:",
    "Sehr gute CO₂-Bilanz (negativ!)",
    "Dämmend & atmungsaktiv"
  ].join("\n")
};

// Detailed technical facts (from openly.systems)
const DETAILED_MATERIAL_FACTS = {
  hanfbeton: [
    "HANFBETON (Hemplime / CANCRETE)",
    "Netto CO₂-Bilanz: ca. -100 kg/m³",
    "Diffusionsoffen, sehr gute Dämmung"
  ].join("\n"),

  hanfziegel: [
    "HANFZIEGEL (Schönthaler / CANCRETE)",
    "CO₂: -0.22 kg CO₂e/kg",
    "Speicherung: bis ~236 kg CO₂/m³",
    "Nicht tragend; mit Holzständer einsetzen"
  ].join("\n"),

  holz: [
    "HOLZ (Konstruktionsholz)",
    "Herstellung: ~80 kg CO₂/m³",
    "Netto-negativ möglich: ca. -727 kg CO₂/m³",
    "Hohe Tragfähigkeit bei geringem Eigengewicht"
  ].join("\n"),

  kork: [
    "KORK",
    "CO₂-Capturing:",
    "expandierter Kork ~180 kg/m³",
    "Korkplatten ~716 kg/m³",
  ].join("\n"),

  pflanzenkohle: [
    "PFLANZENKOHLE-BETON:",
    "Signifikante CO₂-Senke über Biochar im Beton",
    "Richtwert: >100 kg CO₂ Senkenleistung pro m³",
    "Industriell skaliert mit CarStorCon"
  ].join("\n"),

  kupfer: [
    "KUPFER:",
    "Primär-Kupfer: ~2.21 kg CO₂/kg",
    "Blech 3 mm: ~59 kg CO₂/m²",
    "Rohr 1/2\": ~0.66 kg CO₂/m²"
  ].join("\n"),

  lehm: [
    "LEHM",
    "Lehm-Bauplatten: ~23.37 kg CO₂/m³",
    "Lehmputz: ~98.62 kg CO₂/m³",
    "A1 nach EN 13501-1"
  ].join("\n"),

  sumpfkalk: [
    "SUMPFKALK:",
    "Kalk bindet CO₂ durch Karbonatisieren",
    "Konkrete Zahlen: Noch nicht Aktuell in Openly."
  ].join("\n")
};

// Track last scanned element for re-scanning
let lastScannedEl = null;

// On load, push simple facts into the scene (detailed facts are accessed directly)
function applyMaterialFacts() {
  Object.entries(MATERIAL_FACTS).forEach(([key, text]) => {
    const el = document.querySelector(`#material-${key}`);
    if (el) el.setAttribute("data-info", text);
  });
}


// Global state (following Room 4 and Room 5 patterns)
let hasScanner = false;
let isHoldingMaterial = false;
let heldMaterialType = null;
let materialsScanned = 0;
let materialsSorted = 0;
let placedMaterials = {
    spot1: null,
    spot2: null,
    spot3: null,
    spot4: null,
    spot5: null,
    spot6: null,
    spot7: null,
    spot8: null
};
let hasKey = false;
let puzzleCompleted = false;

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

function updateMaterialsUI() {
    const materialsText = `📊 Richtig sortiert: ${materialsSorted}/8`;

    // Update HTML overlay
    const htmlMaterials = document.querySelector('#materials');
    if (htmlMaterials) {
        htmlMaterials.textContent = materialsText;
    }

    // Update world-space fallback
    const worldMaterials = document.querySelector('#world-materials');
    if (worldMaterials) {
        worldMaterials.setAttribute('value', materialsText);
    }
}

// Scanner pickup functionality (from Room 4)
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
            message.setAttribute('value', 'Scanner acquired! Look at materials and press E to scan them.');
        }

        console.log('Scanner is now in inventory!');

    } else {
        console.log('Scanner already picked up');
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'You already have the scanner in your inventory.');
        }
    }
}

// Scanning functionality (from Room 4)
function scanMaterial(useDetailedInfo = false) {
    if (!hasScanner) {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'You need the scanner first! Find the scanner tool.');
        }
        return;
    }

    const cursor = document.querySelector('a-cursor');
    if (cursor) {
        const raycaster = cursor.components.raycaster;
        const intersections = raycaster.intersections;

        if (intersections.length > 0) {
            const materialIntersection = intersections.find(hit =>
                hit.object.el && hit.object.el.classList.contains('scannable')
            );

            if (materialIntersection) {
                const material = materialIntersection.object.el;
                lastScannedEl = material; // Remember this for detail toggle
                const materialType = material.getAttribute('data-material');

                // Get the appropriate info based on scan type
                const facts = useDetailedInfo ? DETAILED_MATERIAL_FACTS : MATERIAL_FACTS;
                const materialInfo = facts[materialType] || material.getAttribute('data-info');

                console.log('Scanning material:', materialType, useDetailedInfo ? '(detailed)' : '(normal)');

                // Show scan info tooltip
                const scanTooltip = document.querySelector('#scan-tooltip');
                const scanInfo = document.querySelector('#scan-info');
                if (scanTooltip && scanInfo) {
                    const infoMode = useDetailedInfo ? 'DETAILINFO' : 'EINFACH';
                    const scanResult = `SCAN RESULT (${infoMode}):\n\n${materialInfo}`;
                    scanInfo.setAttribute('value', scanResult);
                    scanTooltip.setAttribute('visible', 'true');

                    // Hide after 8 seconds for normal, 12 seconds for detailed
                    const displayTime = useDetailedInfo ? 12000 : 8000;
                    setTimeout(() => {
                        scanTooltip.setAttribute('visible', 'false');
                    }, displayTime);
                }

                // Update message
                const message = document.querySelector('#message');
                if (message) {
                    message.setAttribute('value', `Scanning ${materialType}... Analysis complete!`);
                }

                materialsScanned++;

            } else {
                // Not looking at scannable material
                const message = document.querySelector('#message');
                if (message) {
                    message.setAttribute('value', 'Look at a material and press E to scan it!');
                }
            }
        }
    }
}

// Material pickup functionality (from Room 4)
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

        // Use consistent box geometry for all materials
        heldMaterial.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.3; depth: 0.3');
        heldMaterial.setAttribute('material', material.getAttribute('material'));

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

// Material drop functionality (from Room 4)
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
        const originalMaterial = document.querySelector(`#material-${heldMaterialType}`);

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
            message.setAttribute('value', `Dropped ${droppedMaterialType}! You can pick it up again or find other materials.`);
        }

        console.log(`Dropped ${droppedMaterialType} at position:`, dropX, dropY, dropZ);

    } else {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Not holding anything to drop!');
        }
    }
}

// Sorting spot interaction (from Room 5)
function handleSortingSpot(event) {
    const spot = event.target;
    const spotId = spot.getAttribute('id');
    const correctMaterial = spot.getAttribute('data-correct-material');

    if (isHoldingMaterial) {
        console.log('Placing material on spot:', spotId);

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
        const spotPos = spot.getAttribute('position');
        placedMaterial.setAttribute('position', `${spotPos.x} ${spotPos.y + 0.2} ${spotPos.z}`);
        placedMaterial.setAttribute('class', 'placed-material scannable');
        placedMaterial.setAttribute('data-material', heldMaterialType);
        placedMaterial.setAttribute('data-spot', spotId);

        // Add scan info and material properties from original material
        const originalMaterial = document.querySelector(`#material-${heldMaterialType}`);
        if (originalMaterial) {
            const originalInfo = originalMaterial.getAttribute('data-info');
            if (originalInfo) {
                placedMaterial.setAttribute('data-info', originalInfo);
            }
            placedMaterial.setAttribute('material', originalMaterial.getAttribute('material'));
        }

        // Set consistent material appearance
        placedMaterial.setAttribute('geometry', 'primitive: box; width: 0.4; height: 0.4; depth: 0.4');

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

        // Update UI
        updateHandUI();
        updateSpotColors();

        // Update message
        const message = document.querySelector('#message');
        if (message) {
            const spotNames = {
                'spot1': 'worst CO2',
                'spot2': '2nd worst',
                'spot3': '3rd spot',
                'spot4': '4th spot',
                'spot5': '5th spot',
                'spot6': '6th spot',
                'spot7': '2nd best',
                'spot8': 'best CO2'
            };
            message.setAttribute('value', `${currentMaterialType} placed on ${spotNames[spotId] || spotId} spot. Sort all 8 materials by CO2 impact!`);
        }

    } else {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Pick up a material first!');
        }
    }
}

// Handle clicking on placed materials to pick them back up (from Room 5)
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

    // Use consistent box geometry for all materials
    heldMaterial.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.3; depth: 0.3');
    heldMaterial.setAttribute('material', placedMaterial.getAttribute('material'));

    playerCam.appendChild(heldMaterial);
    isHoldingMaterial = true;
    heldMaterialType = materialType;

    // Update UI
    updateHandUI();
    updateSpotColors();

    // Update message
    const message = document.querySelector('#message');
    if (message) {
        message.setAttribute('value', `Picked up ${materialType} again! Click on a sorting spot to place it.`);
    }

    console.log('Material picked up from spot:', materialType);
}

// Update spot colors based on correctness (from Room 5)
function updateSpotColors() {
    // Get all spots
    const spots = [
        { id: 'spot1', material: 'kupfer' },
        { id: 'spot2', material: 'holz' },
        { id: 'spot3', material: 'kork' },
        { id: 'spot4', material: 'lehm' },
        { id: 'spot5', material: 'sumpfkalk' },
        { id: 'spot6', material: 'pflanzenkohle' },
        { id: 'spot7', material: 'hanfziegel' },
        { id: 'spot8', material: 'hanfbeton' }
    ];

    // Count correct placements
    let correctPlacements = 0;

    // Check each spot
    spots.forEach(spotInfo => {
        const spot = document.querySelector(`#${spotInfo.id}`);
        if (!spot) return;

        // Reset to gray first
        spot.setAttribute('material', 'color: gray; opacity: 0.6');

        const placedMaterial = placedMaterials[spotInfo.id];

        if (placedMaterial === spotInfo.material) {
            // Correct material
            spot.setAttribute('material', 'color: green; opacity: 0.8');
            correctPlacements++;
        } else if (placedMaterial !== null) {
            // Wrong material
            spot.setAttribute('material', 'color: red; opacity: 0.8');
        }
    });

    // Update materials sorted count
    materialsSorted = correctPlacements;
    updateMaterialsUI();

    // Check if puzzle is solved
    if (correctPlacements === 8) {
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Perfect! Materials sorted correctly. A key has appeared!');
        }
        dropKey();
    }
}

// Key drop and pickup (from Room 5)
function dropKey() {
    const key = document.querySelector('#key');
    if (key) {
        key.setAttribute('visible', 'true');
        key.setAttribute('animation', 'property: position; to: 7.5 1.5 0.5; dur: 1000; easing: easeInOutQuad');

        // Ensure position is properly set after animation
        setTimeout(() => {
            key.setAttribute('position', '7.5 1.5 0.5');
        }, 1100);

        // Add celebration confetti effect
        setTimeout(() => {
            createConfetti();
        }, 500);
    }
}

function handleKeyPickup(event) {
    if (!hasKey) {
        const key = document.querySelector('#key');
        if (key) {
            key.setAttribute('visible', 'false');
        }
        hasKey = true;
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Schluessel erhalten! Raetsel geloest! Der Ausgang ist nun freigeschaltet - klicke auf die Tuer!');
        }
        completePuzzle();
    }
}

// Puzzle completion
function completePuzzle() {
    if (puzzleCompleted) return;

    puzzleCompleted = true;

    // Unlock exit door
    const exitDoor = document.querySelector('#exit-door');
    const exitText = document.querySelector('#exit-text');

    if (exitDoor) {
        exitDoor.setAttribute('material', 'color: green');
        exitDoor.setAttribute('class', 'door clickable');
        exitDoor.setAttribute('data-target', '../end/end.html');

        // Add click listener for navigation (similar to entrance.js)
        exitDoor.addEventListener('click', () => {
            const target = exitDoor.getAttribute('data-target');
            if (target) {
                window.location.href = target;
            }
        });
    }

    if (exitText) {
        exitText.setAttribute('value', '🔓 AUSGANG FREIGESCHALTET');
        exitText.setAttribute('color', 'green');
    }

    // Celebration effect
    createConfetti();

    const message = document.querySelector('#message');
    if (message) {
        message.setAttribute('value', '🎉 PUZZLE COMPLETED! 🎉\nAll prototypes integrated successfully!\nClick the green exit door to finish.');
    }
}

// Confetti effect
function createConfetti() {
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('a-box');
        confetti.setAttribute('position', `${Math.random() * 6 - 3} 4 ${Math.random() * 6 - 3}`);
        confetti.setAttribute('scale', '0.1 0.1 0.1');
        confetti.setAttribute('material', `color: ${['red', 'blue', 'yellow', 'green', 'purple', 'orange'][Math.floor(Math.random() * 6)]}`);
        confetti.setAttribute('animation', {
            property: 'position',
            to: `${Math.random() * 6 - 3} 0 ${Math.random() * 6 - 3}`,
            dur: 3000,
            easing: 'easeInQuad'
        });

        document.querySelector('a-scene').appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3500);
    }
}

// Message updates
function updateMessage(text) {
    const message = document.querySelector('#message');
    if (message) {
        message.setAttribute('value', text);
    }
}

// Main integrated room component
AFRAME.registerComponent('main-integrated', {
    init: function () {
        setTimeout(() => {
            applyMaterialFacts();   // Apply real CO2 data to materials
            this.addEventListeners();
        }, 100);
    },

    addEventListeners: function () {
        // Tool pickup listeners
        const scannerTrigger = document.querySelector('#scanner-trigger');
        if (scannerTrigger) {
            scannerTrigger.addEventListener('click', handleScannerPickup);
        }

        // Material pickup listeners
        const materials = document.querySelectorAll('.material');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialPickup);
        });

        // Sorting spot listeners
        const sortingSpots = document.querySelectorAll('.sorting-spot');
        sortingSpots.forEach(spot => {
            spot.addEventListener('click', handleSortingSpot);
        });

        // Key pickup listener
        const key = document.querySelector('#key');
        if (key) {
            key.addEventListener('click', handleKeyPickup);
        }

        // Keyboard listeners
        document.addEventListener('keydown', (event) => {
            if (event.key === 'e' || event.key === 'E') {
                event.preventDefault();
                scanMaterial(false); // Normal scan
            }
            if (event.key === 'r' || event.key === 'R') {
                event.preventDefault();
                scanMaterial(true); // Detailed scan
            }
            if (event.key === 'q' || event.key === 'Q') {
                event.preventDefault();
                handleMaterialDrop();
            }
        });

        // Initialize UI
        updateInventoryUI();
        updateHandUI();
        updateMaterialsUI();
    }
});

// Initialize when A-Frame scene is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        if (scene.hasLoaded) {
            scene.setAttribute('main-integrated', '');
        } else {
            scene.addEventListener('loaded', function() {
                scene.setAttribute('main-integrated', '');
            });
        }
    }
});
