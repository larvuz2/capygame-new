import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class CharacterModel {
  constructor(scene, parentMesh) {
    this.scene = scene;
    this.parentMesh = parentMesh;
    this.model = null;
    this.mixer = null;
    this.animations = {
      idle: null,
      walk: null,
      jump: null
    };
    this.currentAnimation = null;
    this.currentAnimationName = '';
    this.loaded = false;
    
    // Get base URL for assets - handle both development and production
    const baseUrl = import.meta.env.PROD ? './' : '/';
    console.log(`Using base URL for models: ${baseUrl}`);
    
    // Use the baseUrl for model paths
    this.modelPath = `${baseUrl}models/character/character.glb`;
    this.animationPaths = {
      idle: `${baseUrl}models/character/idle.glb`,
      walk: `${baseUrl}models/character/walk.glb`,
      jump: `${baseUrl}models/character/jump.glb`
    };
    
    console.log('Starting character model loading process...');
    console.log(`Character model path: ${this.modelPath}`);
    
    // Load the character model
    this.loadModel();
  }
  
  loadModel() {
    const loader = new GLTFLoader();
    
    // Load the character model with a single, consistent path
    console.log(`Loading character model from: ${this.modelPath}`);
    
    loader.load(
      this.modelPath,
      (gltf) => {
        this.model = gltf.scene;
        
        // Log the model structure before adding it
        console.log('Model structure:', this.model);
        
        // Add the model as a child of the parent mesh (capsule collider)
        this.parentMesh.add(this.model);
        
        // Increase model scale for better visibility
        this.model.scale.set(3, 3, 3);
        
        // Position the model relative to the parent capsule - adjust Y position to ensure visibility
        this.model.position.set(0, -this.parentMesh.geometry.parameters.height / 2 + 0.5, 0);
        
        // Log model position for debugging
        console.log('Model position:', this.model.position);
        console.log('Parent mesh position:', this.parentMesh.position);
        console.log('Parent mesh height:', this.parentMesh.geometry.parameters.height);
        
        // Make the model cast shadows and ensure visibility
        this.model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Ensure the material is visible
            if (node.material) {
              // Clone the material to avoid affecting other objects
              if (Array.isArray(node.material)) {
                node.material = node.material.map(mat => {
                  const newMat = mat.clone();
                  newMat.transparent = false;
                  newMat.opacity = 1.0;
                  newMat.visible = true;
                  newMat.needsUpdate = true;
                  return newMat;
                });
              } else {
                node.material = node.material.clone();
                node.material.transparent = false;
                node.material.opacity = 1.0;
                node.material.visible = true;
                node.material.needsUpdate = true;
              }
              
              // Add a bright color to make it very visible for debugging
              if (!node.material.emissive) {
                node.material.emissive = new THREE.Color(0x333333);
                node.material.emissiveIntensity = 0.5;
              }
              
              console.log(`Made mesh visible: ${node.name || 'unnamed mesh'} - Material:`, node.material);
            }
            node.visible = true;
          }
        });
        
        // Create animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);
        
        console.log('Character model loaded successfully');
        
        // Now load animations
        this.loadAnimations();
      },
      (xhr) => {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        if (percent % 25 === 0) { // Only log at 0%, 25%, 50%, 75%, 100%
          console.log(`Loading character model: ${percent}%`);
        }
      },
      (error) => {
        console.error('Error loading character model:', error);
      }
    );
  }
  
  loadAnimations() {
    const loader = new GLTFLoader();
    const animationNames = Object.keys(this.animationPaths);
    
    console.log('Loading character animations...');
    
    // Track animation loading progress
    let animationsLoaded = 0;
    const totalAnimations = animationNames.length;
    
    // Load each animation
    animationNames.forEach(animName => {
      const path = this.animationPaths[animName];
      
      loader.load(
        path,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0) {
            this.animations[animName] = gltf.animations[0];
          } else {
            console.warn(`No animations found in ${path}`);
          }
          
          animationsLoaded++;
          
          // When all animations are loaded, set the default animation to idle
          if (animationsLoaded === totalAnimations) {
            this.loaded = true;
            console.log('All animations loaded successfully');
            this.playAnimation('idle');
          }
        },
        null, // Skip progress callback for animations to reduce console spam
        (error) => {
          console.error(`Error loading ${animName} animation:`, error);
          animationsLoaded++;
        }
      );
    });
  }
  
  playAnimation(animationName) {
    if (!this.loaded || !this.mixer || !this.animations[animationName]) {
      return false;
    }
    
    // Don't restart the same animation
    if (this.currentAnimationName === animationName) {
      return true;
    }
    
    // Stop current animation
    if (this.currentAnimation) {
      this.currentAnimation.fadeOut(0.5);
    }
    
    // Play new animation
    this.currentAnimation = this.mixer.clipAction(this.animations[animationName]);
    this.currentAnimation.reset().fadeIn(0.5).play();
    this.currentAnimationName = animationName;
    
    return true;
  }
  
  update(deltaTime, isMoving, isGrounded) {
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    
    // Update animation based on character state
    if (this.loaded) {
      if (!isGrounded) {
        this.playAnimation('jump');
      } else if (isMoving) {
        this.playAnimation('walk');
      } else {
        this.playAnimation('idle');
      }
    }
  }
}