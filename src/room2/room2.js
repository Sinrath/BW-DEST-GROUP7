// Room 2 - Material Room with puzzle functionality

// Handle material interactions
function handleMaterialClick(event) {
    const material = event.target;
    const materialText = material.parentElement.querySelector('a-text');
    
    if (materialText) {
        const materialName = materialText.getAttribute('value');
        console.log('Material clicked:', materialName);
        
        // Visual feedback - make material glow briefly
        material.setAttribute('animation', 'property: material.emissive; to: #ffffff; dur: 300; dir: alternate');
        
        // Update message
        const message = document.querySelector('#message');
        if (message) {
            message.setAttribute('value', `Material selected: ${materialName}\n\nArrange materials by sustainability on the table.`);
            
            // Reset message after 3 seconds
            setTimeout(() => {
                message.setAttribute('value', 'Willkommen zum Materialraum!\n\nOrdne die von Openly verwendeten Baumaterialien entsprechend ihrer Nachhaltigkeit auf dem Tisch an.\n\nHinweise dazu findest du in den Waenden.');
            }, 3000);
        }
    }
}

// Extend the shared room-navigation to add material interactions
AFRAME.registerComponent('room2-materials', {
    init: function () {
        // Wait for shared navigation to be ready
        setTimeout(() => {
            this.addMaterialListeners();
        }, 100);
    },

    addMaterialListeners: function () {
        // Add click listeners to building materials
        const materials = document.querySelectorAll('a-box[color]');
        materials.forEach(material => {
            material.addEventListener('click', handleMaterialClick);
            material.classList.add('material');
        });
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.setAttribute('room2-materials', '');
    }
});