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
    
    // Define the potential paths to try for model loading
    // The order is important - we'll try each until one works
    this.modelPaths = [
      // Relative paths (for development and some deployments)
      './models/character/character.glb',
      '../models/character/character.glb',
      // Absolute paths (for some deployment environments)
      '/models/character/character.glb',
      // Full URL for production (with cache busting)
      `https://capygamevibes.netlify.app/models/character/character.glb?v=${Date.now()}`
    ];
    
    // Animation paths organized by animation name
    this.animationPaths = {
      idle: [
        './models/character/idle.glb',
        '../models/character/idle.glb',
        '/models/character/idle.glb',
        `https://capygamevibes.netlify.app/models/character/idle.glb?v=${Date.now()}`
      ],
      walk: [
        './models/character/walk.glb',
        '../models/character/walk.glb',
        '/models/character/walk.glb',
        `https://capygamevibes.netlify.app/models/character/walk.glb?v=${Date.now()}`
      ],
      jump: [
        './models/character/jump.glb',
        '../models/character/jump.glb',
        '/models/character/jump.glb',
        `https://capygamevibes.netlify.app/models/character/jump.glb?v=${Date.now()}`
      ]
    };
    
    // Verify if model files are accessible
    this.verifyModelAccess();
    
    // Load the character model and animations
    this.loadModel();
  }
  
  // Helper method to verify model accessibility
  verifyModelAccess() {
    // Check the first few URLs to see if they're accessible
    const urlsToCheck = [
      '/models/character/character.glb',
      './models/character/character.glb'
    ];
    
    urlsToCheck.forEach(url => {
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log(`Model URL check (${url}):`, response.ok ? 'Available ✅' : 'Not found ❌', response.status);
        })
        .catch(error => {
          console.error(`Model URL check (${url}): Error`, error);
        });
    });
  }
  
  loadModel() {
    const loader = new GLTFLoader();
    console.log("Attempting to load character model with multiple paths...");
    
    // Try to load the model using each path until one succeeds
    this.tryLoadModelWithPaths(loader, this.modelPaths, 0);
  }
  
  tryLoadModelWithPaths(loader, paths, index) {
    if (index >= paths.length) {
      console.error('All model loading attempts failed');
      return;
    }
    
    const currentPath = paths[index];
    console.log(`Trying to load model from: ${currentPath} (attempt ${index + 1}/${paths.length})`);
    
    loader.load(
      currentPath,
      (gltf) => {
        this.model = gltf.scene;
        
        // Add the model as a child of the parent mesh (capsule collider)
        this.parentMesh.add(this.model);
        
        // Position the model relative to the parent
        this.model.position.set(0, -this.parentMesh.geometry.parameters.height / 2, 0);
        
        // Adjust model scale if needed
        this.model.scale.set(1, 1, 1);
        
        // Make the model cast shadows
        this.model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        // Create animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);
        
        console.log(`Character model loaded successfully from: ${currentPath}`);
        
        // Now load animations
        this.loadAnimations();
      },
      (xhr) => {
        console.log(`Loading progress for ${currentPath}: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error(`Error loading model from ${currentPath}:`, error);
        
        // Try the next path
        this.tryLoadModelWithPaths(loader, paths, index + 1);
      }
    );
  }
  
  loadAnimations() {
    const loader = new GLTFLoader();
    const animationNames = Object.keys(this.animationPaths);
    
    // Keep track of all animations loaded
    this.pendingAnimations = animationNames.length;
    
    // Try to load each animation
    animationNames.forEach(animName => {
      this.tryLoadAnimationWithPaths(loader, animName, this.animationPaths[animName], 0);
    });
  }
  
  tryLoadAnimationWithPaths(loader, animationName, paths, index) {
    if (index >= paths.length) {
      console.error(`All loading attempts for ${animationName} animation failed`);
      this.pendingAnimations--;
      this.checkAnimationsLoaded();
      return;
    }
    
    const currentPath = paths[index];
    console.log(`Trying to load ${animationName} animation from: ${currentPath}`);
    
    loader.load(
      currentPath,
      (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          this.animations[animationName] = gltf.animations[0];
          console.log(`${animationName} animation loaded successfully from ${currentPath}`);
        } else {
          console.warn(`No animations found in ${currentPath}`);
        }
        
        this.pendingAnimations--;
        this.checkAnimationsLoaded();
      },
      (xhr) => {
        console.log(`${animationName} animation ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error(`Error loading ${animationName} animation from ${currentPath}:`, error);
        
        // Try the next path
        this.tryLoadAnimationWithPaths(loader, animationName, paths, index + 1);
      }
    );
  }
  
  checkAnimationsLoaded() {
    if (this.pendingAnimations <= 0) {
      this.loaded = true;
      console.log('All animations loaded successfully!');
      this.playAnimation('idle');
    }
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
    
    console.log(`Playing ${animationName} animation`);
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