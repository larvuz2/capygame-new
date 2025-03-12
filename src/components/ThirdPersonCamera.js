import * as THREE from 'three';

export class ThirdPersonCamera {
  constructor(camera, target, options = {}) {
    this.camera = camera;
    this.target = target;
    
    // Camera parameters
    this.distance = options.distance || 6;
    this.height = options.height || 2.5;
    this.smoothing = options.smoothing || 0.05;
    
    // Camera angles
    this.phi = 0; // Horizontal angle
    this.theta = 0; // Vertical angle
    
    // Current camera position
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
  }
  
  update(deltaTime, mouseDelta = { x: 0, y: 0 }) {
    // Update camera angles based on mouse input
    this.phi -= mouseDelta.x;
    this.theta -= mouseDelta.y;
    
    // Clamp vertical angle to prevent flipping
    this.theta = Math.max(Math.min(this.theta, Math.PI / 3), -Math.PI / 3);
    
    // Calculate target position (character position)
    const targetPosition = this.target.position.clone();
    
    // Add height offset to look slightly above the character
    targetPosition.y += this.height;
    
    // Calculate camera position based on distance and angles
    const cameraPosition = new THREE.Vector3();
    cameraPosition.x = targetPosition.x + this.distance * Math.sin(this.phi) * Math.cos(this.theta);
    cameraPosition.y = targetPosition.y + this.distance * Math.sin(this.theta);
    cameraPosition.z = targetPosition.z + this.distance * Math.cos(this.phi) * Math.cos(this.theta);
    
    // Apply smoothing to camera movement (lerp current position to target position)
    this.currentPosition.lerp(cameraPosition, this.smoothing);
    this.currentLookAt.lerp(targetPosition, this.smoothing);
    
    // Update camera position and look at
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
  
  // Reset camera to be directly behind the character
  resetPosition() {
    this.phi = 0;
    this.theta = 0;
  }
}