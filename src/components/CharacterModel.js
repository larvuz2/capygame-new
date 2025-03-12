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
    
    // Load the character model and animations
    this.loadModel();
  }
  
  loadModel() {
    const loader = new GLTFLoader();
    
    // Load the character model
    loader.load(
      '/src/assets/models/character/character.glb',
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
        
        console.log('Character model loaded successfully');
        
        // Now load animations
        this.loadAnimations();
      },
      (xhr) => {
        console.log(`Character model ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading character model:', error);
      }
    );
  }
  
  loadAnimations() {
    const loader = new GLTFLoader();
    const animations = [
      { name: 'idle', path: '/src/assets/animations/idle.glb' },
      { name: 'walk', path: '/src/assets/animations/walk.glb' },
      { name: 'jump', path: '/src/assets/animations/jump.glb' }
    ];
    
    let animationsLoaded = 0;
    
    animations.forEach(animation => {
      loader.load(
        animation.path,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0) {
            this.animations[animation.name] = gltf.animations[0];
            console.log(`${animation.name} animation loaded successfully`);
          } else {
            console.warn(`No animations found in ${animation.path}`);
          }
          
          animationsLoaded++;
          
          // When all animations are loaded, set the default animation to idle
          if (animationsLoaded === animations.length) {
            this.loaded = true;
            this.playAnimation('idle');
          }
        },
        (xhr) => {
          console.log(`${animation.name} animation ${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
          console.error(`Error loading ${animation.name} animation:`, error);
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