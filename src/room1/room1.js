// Room 1 navigation

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

        // Add click listeners for scanner pickup
        const scanner = document.querySelector('#scanner');
        if (scanner) {
            scanner.addEventListener('click', handleScannerPickup);
        }

        // Add click listeners for material scanning
        const materials = document.querySelectorAll('.scannable');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialScan);
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

// Global state for scanner
let hasScanner = false;

// Scanner pickup functionality
function handleScannerPickup(event) {
    console.log('Scanner clicked!', event.target);
    
    if (!hasScanner) {
        const scanner = event.target;
        console.log('Picking up scanner!');
        
        // Hide scanner from ground
        scanner.setAttribute('visible', 'false');
        
        // Set scanner state
        hasScanner = true;
        
        // Update UI message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'Scanner acquired! Click on materials to analyze them.');
        }
        
        // Visual feedback
        scanner.setAttribute('animation', 'property: scale; to: 0.12 0.12 0.12; dur: 200; dir: alternate');
    } else {
        console.log('Scanner already picked up');
    }
}

// Material scanning functionality
function handleMaterialScan(event) {
    if (hasScanner) {
        const material = event.target;
        const materialInfo = material.getAttribute('data-info');
        const materialType = material.getAttribute('data-material');
        
        console.log('Scanning material:', materialType);
        
        // Show scan info tooltip
        const scanTooltip = document.querySelector('#scan-tooltip');
        const scanInfo = document.querySelector('#scan-info');
        if (scanTooltip && scanInfo) {
            scanInfo.setAttribute('value', `SCAN RESULT:\n${materialInfo}`);
            scanTooltip.setAttribute('visible', 'true');
            
            // Hide after 5 seconds
            setTimeout(() => {
                scanTooltip.setAttribute('visible', 'false');
            }, 5000);
        }
        
        // Visual feedback on material - scale based on material type
        let newScale;
        if (materialType === 'wood') {
            newScale = '0.09 0.09 0.09';  // Wood is 4x bigger
        } else if (materialType === 'concrete') {
            newScale = '0.45 0.45 0.45';  // Concrete is 20x bigger
        }
        material.setAttribute('animation', `property: scale; to: ${newScale}; dur: 500; dir: alternate`);
        
    } else {
        // No scanner message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', 'You need the scanner first! Look around the room.');
        }
        
        // Reset message after 3 seconds
        setTimeout(() => {
            const msg = document.querySelector('#message');
            if (msg) {
                msg.setAttribute('value', 'Find the scanner and analyze the materials');
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room-navigation', '');
    }
});