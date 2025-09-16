// Shared A-Frame components for all rooms

// Auto-centering component for GLTF models
// Usage: <a-gltf-model autocenter-gltf="ground: false">
// - ground: false = center the model in all dimensions (default)
// - ground: true = put the model's bottom at y=0 (useful for objects that should "sit" on surfaces)
AFRAME.registerComponent('autocenter-gltf', {
  schema: { ground: {default: false} }, // ground=true puts the *bottom* at y=0; use false to center on y
  init() {
    this.el.addEventListener('model-loaded', (e) => {
      const obj = e.detail.model;
      if (!obj) return;

      // Ensure matrices are current so Box3 uses correct world transforms
      obj.updateWorldMatrix(true, true);

      // 1) Get world-space bbox
      const bbox = new THREE.Box3().setFromObject(obj);
      const centerWorld = bbox.getCenter(new THREE.Vector3());

      // 2) Convert center to the model's *local* space
      const centerLocal = obj.worldToLocal(centerWorld.clone());

      // 3) Move model so its center is at (0,0,0) in local space
      obj.position.sub(centerLocal);

      // Optional: rest the model on y=0 instead of centering vertically
      if (this.data.ground) {
        obj.updateWorldMatrix(true, true);
        const bbox2 = new THREE.Box3().setFromObject(obj);
        const minWorld = bbox2.min.clone();
        const minLocal = obj.worldToLocal(minWorld);
        obj.position.y -= minLocal.y;
      }

      obj.updateMatrixWorld(true);
    });
  }
});

// Add more shared components here as needed
// Examples:
// - Material highlighting component
// - Sound effect component
// - Animation helpers
// - UI positioning helpers