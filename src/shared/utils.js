// Shared utility functions to reduce code duplication across rooms

/**
 * Common DOM utility functions
 */
const DOMUtils = {
    /**
     * Get scene element with error handling
     * @returns {Element|null} - The a-scene element or null if not found
     */
    getScene: function() {
        return document.querySelector('a-scene');
    },

    /**
     * Initialize component on scene with standard error handling
     * @param {string} componentName - Name of the component to add
     * @param {number} delay - Delay before initialization (default: 100ms)
     */
    initializeComponent: function(componentName, delay = 100) {
        document.addEventListener('DOMContentLoaded', function() {
            const scene = DOMUtils.getScene();
            if (scene) {
                scene.setAttribute(componentName, '');
            }
        });
    },

    /**
     * Add event listener with delay for shared navigation readiness
     * @param {Function} listenerFunction - Function to call after delay
     * @param {number} delay - Delay in milliseconds (default: 100ms)
     */
    addDelayedListener: function(listenerFunction, delay = 100) {
        setTimeout(listenerFunction, delay);
    }
};

/**
 * Animation utility functions
 */
const AnimationUtils = {
    /**
     * Apply scale animation to element
     * @param {Element} element - Element to animate
     * @param {string} toScale - Target scale (e.g., '0 0 0')
     * @param {number} duration - Animation duration in ms (default: 500)
     * @param {string} direction - Animation direction (default: normal)
     */
    scaleAnimation: function(element, toScale, duration = 500, direction = 'normal') {
        if (element) {
            element.setAttribute('animation', `property: scale; to: ${toScale}; dur: ${duration}; dir: ${direction}`);
        }
    },

    /**
     * Apply color animation to element
     * @param {Element} element - Element to animate
     * @param {string} toColor - Target color (e.g., '#00FF00')
     * @param {number} duration - Animation duration in ms (default: 200)
     * @param {string} direction - Animation direction (default: alternate)
     */
    colorAnimation: function(element, toColor, duration = 200, direction = 'alternate') {
        if (element) {
            element.setAttribute('animation', `property: material.color; to: ${toColor}; dur: ${duration}; dir: ${direction}`);
        }
    },

    /**
     * Apply emissive material animation to element
     * @param {Element} element - Element to animate
     * @param {string} toEmissive - Target emissive color (e.g., '#ffffff')
     * @param {number} duration - Animation duration in ms (default: 300)
     * @param {string} direction - Animation direction (default: alternate)
     */
    emissiveAnimation: function(element, toEmissive, duration = 300, direction = 'alternate') {
        if (element) {
            element.setAttribute('animation', `property: material.emissive; to: ${toEmissive}; dur: ${duration}; dir: ${direction}`);
        }
    }
};

/**
 * Message management utility functions
 */
const MessageUtils = {
    /**
     * Update message element with new text
     * @param {string} messageText - Text to display
     * @param {string} selector - CSS selector for message element (default: '#message')
     */
    updateMessage: function(messageText, selector = '#message') {
        const message = document.querySelector(selector);
        if (message) {
            message.setAttribute('value', messageText);
        }
    },

    /**
     * Update message with automatic reset after delay
     * @param {string} messageText - Temporary message text
     * @param {string} resetText - Text to reset to
     * @param {number} delay - Delay before reset in ms (default: 3000)
     * @param {string} selector - CSS selector for message element (default: '#message')
     */
    updateMessageWithReset: function(messageText, resetText, delay = 3000, selector = '#message') {
        MessageUtils.updateMessage(messageText, selector);
        
        setTimeout(() => {
            MessageUtils.updateMessage(resetText, selector);
        }, delay);
    }
};

/**
 * Component factory for creating standardized A-Frame components
 */
const ComponentFactory = {
    /**
     * Create a basic room component with standard initialization pattern
     * @param {string} componentName - Name of the component
     * @param {Function} listenerFunction - Function to add listeners
     * @param {number} delay - Initialization delay (default: 100ms)
     * @returns {Object} - A-Frame component definition
     */
    createRoomComponent: function(componentName, listenerFunction, delay = 100) {
        return {
            init: function() {
                DOMUtils.addDelayedListener(() => {
                    listenerFunction.call(this);
                }, delay);
            }
        };
    }
};

// Export utilities for use in other files
window.DOMUtils = DOMUtils;
window.AnimationUtils = AnimationUtils;
window.MessageUtils = MessageUtils;
window.ComponentFactory = ComponentFactory;