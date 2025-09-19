// Entrance area - Extends shared movement with START button functionality

// Entrance-specific START button functionality
AFRAME.registerComponent('entrance-start-button', ComponentFactory.createRoomComponent(
    'entrance-start-button',
    function addStartButtonListener() {
        const startButton = document.querySelector('#start-button');
        if (startButton) {
            startButton.addEventListener('click', handleStartClick);
        }
    }
));

function handleStartClick(event) {
    console.log('START button clicked!');
    
    // Hide welcome elements
    const speechBubble = document.querySelector('#speech-bubble');
    const startButton = document.querySelector('#start-button');
    
    if (speechBubble) {
        AnimationUtils.scaleAnimation(speechBubble, '0 0 0', 500);
        setTimeout(() => {
            speechBubble.setAttribute('visible', 'false');
        }, 500);
    }
    
    if (startButton) {
        AnimationUtils.scaleAnimation(startButton, '0 0 0', 500);
        setTimeout(() => {
            startButton.setAttribute('visible', 'false');
        }, 500);
    }
    
    // Show Room 1 door and message after animation
    setTimeout(() => {
        const door = document.querySelector('#door-room1');
        const doorLabel = document.querySelector('#room1-label');
        const message = document.querySelector('#message');
        
        if (door) {
            door.setAttribute('visible', 'true');
            door.setAttribute('animation', 'property: scale; from: 0 0 0; to: 0.013 0.013 0.013; dur: 800');
            // Make door clickable by adding the door class
            door.classList.add('door');
        }
        
        if (doorLabel) {
            doorLabel.setAttribute('visible', 'true');
            AnimationUtils.scaleAnimation(doorLabel, '1 1 1', 800);
        }
        
        if (message) {
            message.setAttribute('visible', 'true');
            AnimationUtils.scaleAnimation(message, '1 1 1', 800);
        }
    }, 600);
}

// Initialize when DOM is loaded
DOMUtils.initializeComponent('entrance-start-button');