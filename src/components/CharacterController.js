import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { CharacterModel } from './CharacterModel.js';

export class CharacterController {
  constructor(scene, world, params = {}) {
    // Get required parameters or use defaults
    this.scene = scene;
    this.world = world;
    this.position = params.position || new THREE.Vector3(0, 2, 0);
    this.radius = params.radius || 0.4;
    this.height = params.height || 1.8;
    this.maxSpeed = params.maxSpeed || 5.0;
    this.turnSpeed = params.turnSpeed || 10.0;
    this.acceleration = params.acceleration || 15.0;
    this.deceleration = params.deceleration || 25.0;
    this.jumpForce = params.jumpForce || 10.0;
    
    // State variables
    this.moveDirection = new THREE.Vector3(0, 0, 0);
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.isMoving = false;
    this.isJumping = false;
    this.isGrounded = false;
    this.canJump = true;
    this.direction = 0; // Direction angle in radians
    
    // Debug properties
    this.showDebugVisuals = params.showDebugVisuals || false;
    this.debugRay = null;
    this.debugRayPositions = null;
    
    // Create elements
    this.createMesh();
    this.createRigidBody();
    
    if (this.showDebugVisuals) {
      this.createDebugVisuals();
    }
    
    // Create 3D character model
    this.characterModel = new CharacterModel(scene, this.mesh);
    
    // Add a debug model that will be shown if the character model fails to load
    this.createFallbackModel();
  }
  
  // Create a fallback model that will be visible if the main model fails to load
  createFallbackModel() {
    // Create a simple humanoid shape using basic geometries
    const debugGroup = new THREE.Group();
    
    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.75;
    debugGroup.add(head);
    
    // Body (box)
    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    debugGroup.add(body);
    
    // Arms (cylinders)
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.35, 0.3, 0);
    leftArm.rotation.z = Math.PI / 2;
    debugGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.35, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 2;
    debugGroup.add(rightArm);
    
    // Legs (cylinders)
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.7);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, -0.35, 0);
    debugGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, -0.35, 0);
    debugGroup.add(rightLeg);
    
    // Add the debug model to the mesh but hide it initially
    debugGroup.visible = false;
    debugGroup.name = "fallbackModel";
    debugGroup.position.y = -this.height / 2;
    this.mesh.add(debugGroup);
    this.fallbackModel = debugGroup;
    
    // Check after 5 seconds if the model loaded, if not show the fallback
    setTimeout(() => {
      if (!this.characterModel.loaded) {
        console.warn("Character model didn't load after 5 seconds, showing fallback model");
        this.fallbackModel.visible = true;
      }
    }, 5000);
  }
  
  createMesh() {
    const capsuleHeight = this.height - this.radius * 2;
    const geometry = new THREE.CapsuleGeometry(this.radius, capsuleHeight, 8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4CAF50,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.0 // Make the capsule invisible
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    this.scene.add(this.mesh);
    
    const indicatorGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.0 // Make the direction indicator invisible too
    });
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
    
    this.debugRay = new THREE.Line(rayGeometry, rayMaterial);
    this.scene.add(this.debugRay);
    this.debugRayPositions = rayPositions;
  }
  
  createRigidBody() {
    try {
      // Create rigid body for character physics
      const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(this.position.x, this.position.y, this.position.z);
        
      this.rigidBody = this.world.createRigidBody(rigidBodyDesc);
      
      // Create collider for character capsule
      const capsuleHeight = this.height - this.radius * 2;
      const colliderDesc = RAPIER.ColliderDesc.capsule(capsuleHeight / 2, this.radius)
        .setTranslation(0, 0, 0);
        
      // Add friction and restitution
      colliderDesc.setFriction(0.1);
      colliderDesc.setRestitution(0.0);
      
      // Disable rotation to keep character upright
      this.rigidBody.setEnabledRotations(false, false, false, true);
      
      this.collider = this.world.createCollider(colliderDesc, this.rigidBody);
      
      console.log("Character physics body created at:", this.rigidBody.translation());
    } catch (error) {
      console.error("Error creating character physics body:", error);
    }
  }
  
  applyInput(input, camera, deltaTime) {
    try {
      // Get camera forward and right directions (ignoring Y to keep character grounded)
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      
      camera.getWorldDirection(cameraForward);
      cameraForward.y = 0;
      cameraForward.normalize();
      
      cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraForward).normalize();
      
      // Process WASD movement
      this.moveDirection.set(0, 0, 0);
      
      if (input.moveForward) {
        this.moveDirection.add(cameraForward);
      }
      if (input.moveBackward) {
        this.moveDirection.sub(cameraForward);
      }
      if (input.moveLeft) {
        this.moveDirection.sub(cameraRight);
      }
      if (input.moveRight) {
        this.moveDirection.add(cameraRight);
      }
      
      // Normalize movement vector to prevent faster diagonal movement
      if (this.moveDirection.lengthSq() > 0) {
        this.moveDirection.normalize();
        this.isMoving = true;
        
        // Set direction to match movement
        if (this.moveDirection.lengthSq() > 0.01) {
          this.direction = Math.atan2(this.moveDirection.x, this.moveDirection.z);
        }
      } else {
        this.isMoving = false;
      }
      
      // Handle jumping
      if (input.jump && this.canJump && this.isGrounded) {
        // Apply an upward impulse for jumping
        const jumpVelocity = new RAPIER.Vector3(0.0, this.jumpForce, 0.0);
        this.rigidBody.applyImpulse(jumpVelocity, true);
        this.isJumping = true;
        this.canJump = false; // Prevent multiple jumps
        
        // Allow jumping again after a short delay
        setTimeout(() => {
          this.canJump = true;
        }, 200);
      }
      
      // Update mesh rotation to face movement direction
      if (this.isMoving) {
        const targetRotation = this.direction;
        
        // Smoothly interpolate current rotation to target rotation
        const currentRotation = this.mesh.rotation.y;
        let angleDiff = targetRotation - currentRotation;
        
        // Handle angle wrapping
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Apply smooth rotation
        this.mesh.rotation.y += angleDiff * this.turnSpeed * deltaTime;
      }
      
    } catch (error) {
      console.error("Error in character input:", error);
    }
  }
  
  checkGrounded() {
    try {
      // Get current position
      const position = this.rigidBody.translation();
      
      // Cast a ray downward to check if the character is grounded
      const rayDir = { x: 0.0, y: -1.0, z: 0.0 };
      const rayOrigin = { x: position.x, y: position.y, z: position.z };
      const rayLength = this.radius + 0.1; // Slightly more than the radius
      
      if (this.showDebugVisuals && this.debugRayPositions) {
        // Update debug ray visualization
        this.debugRayPositions[0] = rayOrigin.x;
        this.debugRayPositions[1] = rayOrigin.y;
        this.debugRayPositions[2] = rayOrigin.z;
        this.debugRayPositions[3] = rayOrigin.x;
        this.debugRayPositions[4] = rayOrigin.y - rayLength;
        this.debugRayPositions[5] = rayOrigin.z;
        
        this.debugRay.geometry.attributes.position.needsUpdate = true;
      }
      
      // Perform the raycast
      const ray = new RAPIER.Ray(rayOrigin, rayDir);
      const hit = this.world.castRay(ray, rayLength, true);
      
      // Character is grounded if the ray hits something
      const wasGrounded = this.isGrounded;
      this.isGrounded = hit != null;
      
      // If just landed, reset jumping state
      if (this.isGrounded && !wasGrounded) {
        this.isJumping = false;
      }
      
      // Log ground state changes for debugging
      if (this.isGrounded !== wasGrounded) {
        console.log("Grounded state changed to:", this.isGrounded);
      }
      
    } catch (error) {
      console.error("Error in check grounded:", error);
    }
  }
  
  update(deltaTime) {
    try {
      // Check if the character is on the ground
      this.checkGrounded();
      
      // Get current velocity
      const velocity = this.rigidBody.linvel();
      
      // Handle movement and acceleration
      if (this.isMoving) {
        // Accelerate towards target speed
        this.targetSpeed = this.maxSpeed;
        this.currentSpeed += this.acceleration * deltaTime;
        
        if (this.currentSpeed > this.maxSpeed) {
          this.currentSpeed = this.maxSpeed;
        }
      } else {
        // Decelerate to stop
        this.currentSpeed -= this.deceleration * deltaTime;
        if (this.currentSpeed < 0) {
          this.currentSpeed = 0;
        }
      }
      
      // Calculate final velocity vector
      const moveVelocity = this.moveDirection.clone().multiplyScalar(this.currentSpeed);
      
      // Set the new velocity, preserving vertical velocity for jumps and falls
      const linvel = new RAPIER.Vector3(
        moveVelocity.x,
        velocity.y, // Preserve vertical velocity
        moveVelocity.z
      );
      this.rigidBody.setLinvel(linvel, true);
      
      // Sync the mesh position with the physics body
      const translation = this.rigidBody.translation();
      this.mesh.position.set(translation.x, translation.y, translation.z);
      
      // Update the character model animations
      if (this.characterModel) {
        this.characterModel.update(deltaTime, this.isMoving, this.isGrounded);
      }
      
    } catch (error) {
      console.error("Error in character update:", error);
    }
  }
}