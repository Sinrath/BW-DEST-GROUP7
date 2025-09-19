// Room 2 - Material Room with puzzle functionality

// Handle material interactions
function handleMaterialClick(event) {
    const material = event.target;
    const materialText = material.parentElement.querySelector('a-text');
    
    if (materialText) {
        const materialName = materialText.getAttribute('value');
        console.log('Material clicked:', materialName);
        
        // Visual feedback - make material glow briefly
        AnimationUtils.emissiveAnimation(material, '#ffffff');
        
        // Update message with auto-reset
        MessageUtils.updateMessageWithReset(
            `Material selected: ${materialName}\n\nArrange materials by sustainability on the table.`,
            'Willkommen zum Materialraum!\n\nOrdne die von Openly verwendeten Baumaterialien entsprechend ihrer Nachhaltigkeit auf dem Tisch an.\n\nHinweise dazu findest du in den Waenden.'
        );
    }
}

// Extend the shared room-navigation to add material interactions
AFRAME.registerComponent('room2-materials', ComponentFactory.createRoomComponent(
    'room2-materials',
    function addMaterialListeners() {
        // Add click listeners to building materials
        const materials = document.querySelectorAll('a-box[color]');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialClick);
            material.classList.add('material');
        });
    }
));

// Initialize when DOM is loaded
DOMUtils.initializeComponent('room2-materials');