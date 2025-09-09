// VR Escape Room Game Logic
let gameState = {
    hasKey: false,
    hasCode: false,
    hasExitKey: false,
    safeCode: "1234",
    currentCode: "0000"
};

let inventory = [];

// Rock-solid collision system
AFRAME.registerComponent('simple-collision', {
    init: function () {
        this.maxDistance = 2.9; // Stay within 6x6 area (±2.9 from center)
        this.previousPosition = new THREE.Vector3();
        this.el.addEventListener('componentchanged', this.checkBounds.bind(this));
    },

    tick: function () {
        this.checkBounds();
    },

    checkBounds: function () {
        const position = this.el.getAttribute('position');
        const currentPos = new THREE.Vector3(position.x, position.y, position.z);
        
        // Store Y position (don't constrain vertical movement)
        const originalY = currentPos.y;
        
        // Check if outside bounds
        let corrected = false;
        
        if (Math.abs(currentPos.x) > this.maxDistance) {
            currentPos.x = Math.sign(currentPos.x) * this.maxDistance;
            corrected = true;
        }
        
        if (Math.abs(currentPos.z) > this.maxDistance) {
            currentPos.z = Math.sign(currentPos.z) * this.maxDistance;
            corrected = true;
        }
        
        // Apply correction
        if (corrected) {
            this.el.setAttribute('position', {
                x: currentPos.x,
                y: originalY,
                z: currentPos.z
            });
        }
    }
});



// Initialize the game when A-Frame is loaded
AFRAME.registerComponent('escape-room', {
    init: function () {
        console.log('Escape Room initialized');
        this.setupEventListeners();
    },

    setupEventListeners: function () {
        const scene = document.querySelector('a-scene');
        
        // Wait for scene to load
        if (scene.hasLoaded) {
            this.addClickListeners();
        } else {
            scene.addEventListener('loaded', () => {
                this.addClickListeners();
            });
        }
    },

    addClickListeners: function () {
        // Painting interaction
        const painting = document.querySelector('#painting');
        if (painting) {
            painting.addEventListener('click', handlePaintingClick);
        }

        // Key interaction  
        const key = document.querySelector('#key');
        if (key) {
            key.addEventListener('click', handleKeyClick);
        }

        // Puzzle box interaction
        const puzzlebox = document.querySelector('#puzzlebox');
        if (puzzlebox) {
            puzzlebox.addEventListener('click', handlePuzzleBoxClick);
        }

        // Safe interaction
        const safe = document.querySelector('#safe');
        if (safe) {
            safe.addEventListener('click', handleSafeClick);
        }

        // Exit key interaction
        const exitkey = document.querySelector('#exitkey');
        if (exitkey) {
            exitkey.addEventListener('click', handleExitKeyClick);
        }

        // Door interaction
        const door = document.querySelector('#door');
        if (door) {
            door.addEventListener('click', handleDoorClick);
        }
    }
});

// Event handlers
function handlePaintingClick(event) {
    console.log('Painting clicked');
    const key = document.querySelector('#key');
    const message = document.querySelector('#message');
    const cursor = document.querySelector('a-cursor');
    
    if (key && !gameState.hasKey && !key.getAttribute('visible')) {
        key.setAttribute('visible', 'true');
        message.setAttribute('value', 'You found a hidden key! Click on it to pick it up.');
        
        // Add sparkle effect
        key.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 2000; loop: true');
        
        // Update raycaster to include the now-visible key
        if (cursor) {
            const raycaster = cursor.getAttribute('raycaster');
            cursor.setAttribute('raycaster', 'objects: .painting, #key, .puzzlebox, .safe, .door, #exitkey; showLine: true');
        }
    }
}

function handleKeyClick(event) {
    console.log('Key clicked');
    if (!gameState.hasKey) {
        gameState.hasKey = true;
        inventory.push('Golden Key');
        
        const key = document.querySelector('#key');
        const message = document.querySelector('#message');
        const inventoryText = document.querySelector('#inventory');
        
        if (key) key.setAttribute('visible', 'false');
        if (message) message.setAttribute('value', 'You picked up the golden key!');
        updateInventoryDisplay();
    }
}

function handlePuzzleBoxClick(event) {
    console.log('Puzzle box clicked');
    const message = document.querySelector('#message');
    
    if (!gameState.hasKey) {
        message.setAttribute('value', 'This box is locked. You need a key!');
        return;
    }

    if (!gameState.hasCode) {
        gameState.hasCode = true;
        message.setAttribute('value', 'You unlocked the box! Inside you found the safe code: ' + gameState.safeCode);
        
        // Change puzzle box appearance
        const puzzlebox = document.querySelector('#puzzlebox');
        const lockText = puzzlebox.parentNode.querySelector('a-text');
        if (puzzlebox) puzzlebox.setAttribute('material', 'color: #90EE90');
        if (lockText) lockText.setAttribute('value', '🔓');
    }
}

function handleSafeClick(event) {
    console.log('Safe clicked');
    const message = document.querySelector('#message');
    
    if (!gameState.hasCode) {
        message.setAttribute('value', 'The safe is locked with a 4-digit code.');
        return;
    }

    // Simulate code entry (in a real game, you'd have a proper UI)
    const userCode = prompt('Enter the 4-digit code:');
    
    if (userCode === gameState.safeCode) {
        const exitkey = document.querySelector('#exitkey');
        const cursor = document.querySelector('a-cursor');
        
        if (exitkey) {
            exitkey.setAttribute('visible', 'true');
            exitkey.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 2000; loop: true');
        }
        
        // Update raycaster to include the now-visible exit key
        if (cursor) {
            cursor.setAttribute('raycaster', 'objects: .painting, #key, .puzzlebox, .safe, .door, #exitkey; showLine: true');
        }
        
        message.setAttribute('value', 'Safe opened! You found the exit key! Click on it to pick it up.');
    } else {
        message.setAttribute('value', 'Wrong code! Try again.');
    }
}

function handleExitKeyClick(event) {
    console.log('Exit key clicked');
    if (!gameState.hasExitKey) {
        gameState.hasExitKey = true;
        inventory.push('Exit Key');
        
        const exitkey = document.querySelector('#exitkey');
        const message = document.querySelector('#message');
        
        if (exitkey) exitkey.setAttribute('visible', 'false');
        if (message) message.setAttribute('value', 'You picked up the exit key!');
        updateInventoryDisplay();
    }
}

function handleDoorClick(event) {
    console.log('Door clicked');
    const message = document.querySelector('#message');
    const door = document.querySelector('#door');
    const doorText = door.parentNode.querySelector('a-text');
    
    if (!gameState.hasExitKey) {
        message.setAttribute('value', 'The door is locked. You need the exit key!');
        return;
    }

    // Win condition - create end screen
    createEndScreen();
    
    if (door) door.setAttribute('material', 'color: #00FF00');
    if (doorText) {
        doorText.setAttribute('value', 'OPEN');
        doorText.setAttribute('color', 'green');
    }
    
    // Victory animation
    door.setAttribute('animation', 'property: position; to: 0 1.5 5; dur: 3000');
    
    // Confetti effect
    createConfetti();
    
    // Victory sound effect (placeholder)
    playVictorySequence();
}

function updateInventoryDisplay() {
    const inventoryText = document.querySelector('#inventory');
    if (inventoryText) {
        let display = 'Inventory:\n';
        inventory.forEach(item => {
            display += '• ' + item + '\n';
        });
        inventoryText.setAttribute('value', display);
    }
}

function createEndScreen() {
    const scene = document.querySelector('a-scene');
    
    // Create semi-transparent overlay
    const overlay = document.createElement('a-box');
    overlay.setAttribute('id', 'victory-overlay');
    overlay.setAttribute('position', '0 1.6 -2');
    overlay.setAttribute('width', '6');
    overlay.setAttribute('height', '4');
    overlay.setAttribute('depth', '0.01');
    overlay.setAttribute('material', 'color: black; opacity: 0.8; transparent: true');
    overlay.setAttribute('animation', 'property: material.opacity; from: 0; to: 0.8; dur: 1000');
    
    // Victory title
    const title = document.createElement('a-text');
    title.setAttribute('position', '0 2.5 -1.9');
    title.setAttribute('value', '🎉 VICTORY! 🎉');
    title.setAttribute('align', 'center');
    title.setAttribute('color', 'gold');
    title.setAttribute('scale', '1.5 1.5 1.5');
    title.setAttribute('animation__pulse', 'property: scale; to: 1.8 1.8 1.8; dir: alternate; dur: 1000; loop: true');
    
    // Completion message
    const completionMsg = document.createElement('a-text');
    completionMsg.setAttribute('position', '0 1.8 -1.9');
    completionMsg.setAttribute('value', 'You Successfully Escaped the Room!');
    completionMsg.setAttribute('align', 'center');
    completionMsg.setAttribute('color', 'white');
    completionMsg.setAttribute('scale', '0.8 0.8 0.8');
    
    // Stats
    const stats = document.createElement('a-text');
    stats.setAttribute('position', '0 1.2 -1.9');
    stats.setAttribute('value', `Items Collected: ${inventory.length}\nPuzzles Solved: 3\nTime: Amazing!`);
    stats.setAttribute('align', 'center');
    stats.setAttribute('color', 'cyan');
    stats.setAttribute('scale', '0.5 0.5 0.5');
    
    // Play again hint
    const playAgain = document.createElement('a-text');
    playAgain.setAttribute('position', '0 0.6 -1.9');
    playAgain.setAttribute('value', 'Refresh the page to play again!');
    playAgain.setAttribute('align', 'center');
    playAgain.setAttribute('color', 'lightgreen');
    playAgain.setAttribute('scale', '0.4 0.4 0.4');
    playAgain.setAttribute('animation__blink', 'property: visible; to: false; dir: alternate; dur: 1500; loop: true');
    
    // Add all elements to scene
    scene.appendChild(overlay);
    scene.appendChild(title);
    scene.appendChild(completionMsg);
    scene.appendChild(stats);
    scene.appendChild(playAgain);
    
    // Remove end screen after 10 seconds
    setTimeout(() => {
        [overlay, title, completionMsg, stats, playAgain].forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }, 10000);
}

function createConfetti() {
    // Create enhanced confetti particles
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('a-box');
        confetti.setAttribute('position', {
            x: Math.random() * 6 - 3,
            y: 4,
            z: Math.random() * 6 - 3
        });
        confetti.setAttribute('width', 0.1);
        confetti.setAttribute('height', 0.1);
        confetti.setAttribute('depth', 0.1);
        confetti.setAttribute('material', {
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
        confetti.setAttribute('animation__fall', {
            property: 'position',
            to: `${Math.random() * 6 - 3} -1 ${Math.random() * 6 - 3}`,
            dur: 4000
        });
        confetti.setAttribute('animation__spin', {
            property: 'rotation',
            to: `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`,
            dur: 2000,
            loop: true
        });
        
        document.querySelector('a-scene').appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 4000);
    }
}

function playVictorySequence() {
    // Change room lighting for celebration
    const lights = document.querySelectorAll('a-light');
    lights.forEach((light, index) => {
        setTimeout(() => {
            light.setAttribute('animation', 'property: light.intensity; to: 1.5; dir: alternate; dur: 500; loop: 3');
        }, index * 200);
    });
    
    // Flash background colors
    const scene = document.querySelector('a-scene');
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'];
    colors.forEach((color, index) => {
        setTimeout(() => {
            scene.setAttribute('background', `color: ${color}`);
        }, index * 300);
    });
    
    console.log('🎉 Victory! The player has escaped the room! 🎉');
}

// Initialize the escape room when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('escape-room', '');
    }
});

// Add some ambient sounds (optional - requires audio files)
function playSound(soundId) {
    // Placeholder for sound effects
    console.log('Playing sound:', soundId);
}

// Debug helper
window.gameState = gameState;
window.inventory = inventory;