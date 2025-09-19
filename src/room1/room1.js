// Room 1 - Scanner and material analysis puzzle

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
        MessageUtils.updateMessage('Scanner acquired! Click on materials to analyze them.');
        
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
        // No scanner message with auto-reset
        MessageUtils.updateMessageWithReset(
            'You need the scanner first! Look around the room.',
            'Find the scanner and analyze the materials'
        );
    }
}

// Extend the shared room-navigation to add scanner and material interactions
AFRAME.registerComponent('room1-puzzles', ComponentFactory.createRoomComponent(
    'room1-puzzles',
    function addPuzzleListeners() {
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
));

// Initialize when DOM is loaded
DOMUtils.initializeComponent('room1-puzzles');