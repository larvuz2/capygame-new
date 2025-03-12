import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

export class CharacterController {
  constructor(world, scene, options = {}) {
    this.world = world;
    this.scene = scene;
    
    // Character parameters
    this.radius = options.radius || 0.5;
    this.height = options.height || 2.0;
    this.position = options.position || new THREE.Vector3(0, 3, 0);
    this.maxSpeed = options.maxSpeed || 5.0;
    this.rotationSpeed = options.rotationSpeed || 5.0;
    
    // Simplified physics parameters
    this.moveDirection = new THREE.Vector3();
    this.isGrounded = false;
    this.jumpStrength = 25; // Simple strong jump force
    this.jumpRequested = false;
    
    // Movement enhancement parameters
    this.acceleration = options.acceleration || 20.0;
    this.deceleration = options.deceleration || 10.0;
    this.currentSpeed = 0;
    
    // Debug flag
    this.debugMode = true;
    
    // Create character visual representation
    this.createMesh();
    
    // Create character physics body
    this.createPhysicsBody();
    
    // Add simple debug visuals
    this.createDebugVisuals();
  }
  
  createMesh() {
    const capsuleHeight = this.height - this.radius * 2;
    const geometry = new THREE.CapsuleGeometry(this.radius, capsuleHeight, 8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4CAF50,
      roughness: 0.8,
      metalness: 0.2
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    this.scene.add(this.mesh);
    
    const indicatorGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.directionIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    this.directionIndicator.position.set(0, 0, this.radius + 0.1);
    this.mesh.add(this.directionIndicator);
  }
  
  createDebugVisuals() {
    // Simple ground check debug ray
    const rayGeometry = new THREE.BufferGeometry();
    const rayMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    
    // Initial positions
    const rayPositions = new Float32Array(6);
    rayGeometry.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
    
    this.rayVisual = new THREE.Line(rayGeometry, rayMaterial);
    this.scene.add(this.rayVisual);
    
    // Jump indicator - a simple sphere that appears when jumping
    const jumpIndicatorGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const jumpIndicatorMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.7
    });
    this.jumpIndicator = new THREE.Mesh(jumpIndicatorGeometry, jumpIndicatorMaterial);
    this.jumpIndicator.visible = false;
    this.scene.add(this.jumpIndicator);
  }
  
  createPhysicsBody() {
    // Create a dynamic rigid body for the character
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(this.position.x, this.position.y, this.position.z)
      .lockRotations(); // Prevent tipping over
    
    this.rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
    // Create a capsule collider
    const capsuleHeight = this.height - this.radius * 2;
    const colliderDesc = RAPIER.ColliderDesc.capsule(capsuleHeight / 2, this.radius)
      .setFriction(0.7)
      .setRestitution(0.0);
    
    this.collider = this.world.createCollider(colliderDesc, this.rigidBody);
    
    // Debug log
    console.log("Character physics body created at:", this.position);
  }

  checkGrounded() {
    try {
      const translation = this.rigidBody.translation();
      
      // Simple ground check with a short ray
      const rayOrigin = {
        x: translation.x,
        y: translation.y - (this.height / 2) + 0.1, // Just above bottom of capsule
        z: translation.z
      };
      
      const rayEnd = {
        x: translation.x,
        y: translation.y - (this.height / 2) - 0.2, // Short distance below
        z: translation.z
      };
      
      // Update debug ray
      if (this.rayVisual) {
        const positions = this.rayVisual.geometry.attributes.position.array;
        positions[0] = rayOrigin.x;
        positions[1] = rayOrigin.y;
        positions[2] = rayOrigin.z;
        positions[3] = rayEnd.x;
        positions[4] = rayEnd.y;
        positions[5] = rayEnd.z;
        this.rayVisual.geometry.attributes.position.needsUpdate = true;
      }
      
      // Cast ray using Rapier
      const rayDir = new RAPIER.Vector3(0, -1, 0);
      const ray = new RAPIER.Ray(
        new RAPIER.Vector3(rayOrigin.x, rayOrigin.y, rayOrigin.z), 
        rayDir
      );
      
      // Cast the ray excluding character's own collider
      const hit = this.world.castRay(ray, 0.3, true, null, null, this.collider);
      
      // Update grounded state
      const wasGrounded = this.isGrounded;
      this.isGrounded = hit !== null;
      
      // Change ray color based on grounded state
      if (this.rayVisual) {
        this.rayVisual.material.color.set(this.isGrounded ? 0x00ff00 : 0xff0000);
      }
      
      // Debug log ground state changes
      if (wasGrounded !== this.isGrounded) {
        console.log("Grounded state changed to:", this.isGrounded);
      }
      
      return this.isGrounded;
      
    } catch (error) {
      console.error("Error in checkGrounded:", error);
      return false;
    }
  }
  
  jump() {
    if (!this.isGrounded) return false;
    
    try {
      // Get current velocity
      const velocity = this.rigidBody.linvel();
      
      // Create an upward velocity vector, preserving horizontal movement
      const jumpVelocity = new RAPIER.Vector3(
        velocity.x,
        this.jumpStrength, // Strong upward force
        velocity.z
      );
      
      // Apply the velocity directly
      this.rigidBody.setLinvel(jumpVelocity, true);
      
      // Make sure body is awake
      this.rigidBody.wakeUp();
      
      // Show jump indicator
      if (this.jumpIndicator) {
        const pos = this.rigidBody.translation();
        this.jumpIndicator.position.set(pos.x, pos.y - 1, pos.z);
        this.jumpIndicator.visible = true;
        
        // Hide after 0.5 seconds
        setTimeout(() => {
          this.jumpIndicator.visible = false;
        }, 500);
      }
      
      console.log("JUMP EXECUTED with velocity:", jumpVelocity.y);
      return true;
      
    } catch (error) {
      console.error("Error in jump:", error);
      return false;
    }
  }
  
  update(inputs, deltaTime, camera) {
    try {
      if (!this.rigidBody) return;
      
      // Check if the character is on the ground
      this.checkGrounded();
      
      // Handle jump input - Simple approach!
      if (inputs.jump && !this.jumpRequested && this.isGrounded) {
        this.jump();
        this.jumpRequested = true;
      }
      
      if (!inputs.jump) {
        this.jumpRequested = false;
      }
      
      // Get current velocity
      const velocity = this.rigidBody.linvel();
      
      // Debug output - log velocity periodically
      if (this.debugMode && Math.random() < 0.01) {
        console.log("Velocity:", {
          x: velocity.x.toFixed(2),
          y: velocity.y.toFixed(2),
          z: velocity.z.toFixed(2)
        });
      }
      
      // Handle movement
      this.moveDirection.set(0, 0, 0);
      
      // Get camera-relative directions
      const cameraQuaternion = camera ? camera.quaternion : new THREE.Quaternion();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuaternion);
      forward.y = 0;
      forward.normalize();
      
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraQuaternion);
      right.y = 0;
      right.normalize();
      
      // Set movement direction based on inputs
      if (inputs.forward) this.moveDirection.add(forward);
      if (inputs.backward) this.moveDirection.sub(forward);
      if (inputs.left) this.moveDirection.sub(right);
      if (inputs.right) this.moveDirection.add(right);
      
      // Update character rotation
      const isMoving = this.moveDirection.lengthSq() > 0;
      if (isMoving) {
        this.moveDirection.normalize();
        const targetRotation = new THREE.Quaternion();
        targetRotation.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.moveDirection);
        this.mesh.quaternion.slerp(targetRotation, deltaTime * this.rotationSpeed);
      }
      
      // Update speed with acceleration/deceleration
      const targetSpeed = isMoving ? this.maxSpeed : 0;
      
      this.currentSpeed = isMoving
        ? Math.min(this.currentSpeed + this.acceleration * deltaTime, targetSpeed)
        : Math.max(this.currentSpeed - this.deceleration * deltaTime, 0);
      
      // Set horizontal velocity while preserving vertical velocity
      // This simple approach keeps the jump physics separate from movement
      const moveVelocity = new RAPIER.Vector3(
        this.moveDirection.x * this.currentSpeed,
        velocity.y, // Preserve the vertical velocity from jumping/gravity
        this.moveDirection.z * this.currentSpeed
      );
      
      this.rigidBody.setLinvel(moveVelocity, true);
      
      // Update mesh position from physics
      const position = this.rigidBody.translation();
      this.mesh.position.set(position.x, position.y, position.z);
      
    } catch (error) {
      console.error("Error in update:", error);
    }
  }
}