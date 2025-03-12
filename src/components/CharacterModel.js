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
    
    // Try to load with various paths - deployed environment can be different
    const modelPaths = [
      '/models/character/character.glb',  // For production build
      'models/character/character.glb',   // Alternative without leading slash
      '/assets/models/character/character.glb' // Another possibility
    ];
    
    // Create a fallback mesh in case model loading fails
    // This ensures the game still works even if the model is missing
    const createFallbackMesh = () => {
      console.log('Creating fallback mesh for character');
      // Create a simple mesh as fallback
      const geometry = new THREE.BoxGeometry(1, 2, 0.5);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x0088ff,
        roughness: 0.7,
        metalness: 0.2
      });
      this.model = new THREE.Mesh(geometry, material);
      this.model.castShadow = true;
      this.model.receiveShadow = true;
      
      // Add to parent
      this.parentMesh.add(this.model);
      
      // Position appropriately
      this.model.position.set(0, 0, 0);
      
      // Create animation mixer for the fallback
      this.mixer = new THREE.AnimationMixer(this.model);
      
      // Create dummy animations so the system still works
      this.loaded = true;
      console.log('Fallback character created');
      
      // Dummy animation system
      const createDummyAnimation = () => {
        // This just creates a placeholder so the animation system doesn't break
        // In a real scenario, we'd provide better fallbacks
        return {
          duration: 1
        };
      };
      
      // Add dummy animations
      this.animations.idle = createDummyAnimation();
      this.animations.walk = createDummyAnimation();
      this.animations.jump = createDummyAnimation();
      
      this.currentAnimation = null;
      this.playAnimation('idle');
    };
    
    // Try loading from the first path
    const tryLoadModel = (pathIndex) => {
      if (pathIndex >= modelPaths.length) {
        // All paths failed, create fallback
        createFallbackMesh();
        return;
      }
      
      console.log(`Trying to load character model from: ${modelPaths[pathIndex]}`);
      
      loader.load(
        modelPaths[pathIndex],
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
          console.log(`Character model ${(xhr.loaded / xhr.total) * 100}% loaded from ${modelPaths[pathIndex]}`);
        },
        (error) => {
          console.warn(`Error loading character model from ${modelPaths[pathIndex]}:`, error);
          // Try next path
          tryLoadModel(pathIndex + 1);
        }
      );
    };
    
    // Start trying paths
    tryLoadModel(0);
  }
  
  loadAnimations() {
    const loader = new GLTFLoader();
    
    // Similar approach for animations with multiple paths
    const animationSets = [
      // First set of paths
      [
        { name: 'idle', path: '/models/animations/idle.glb' },
        { name: 'walk', path: '/models/animations/walk.glb' },
        { name: 'jump', path: '/models/animations/jump.glb' }
      ],
      // Second set of paths (without leading slash)
      [
        { name: 'idle', path: 'models/animations/idle.glb' },
        { name: 'walk', path: 'models/animations/walk.glb' },
        { name: 'jump', path: 'models/animations/jump.glb' }
      ],
      // Third set of paths (with assets)
      [
        { name: 'idle', path: '/assets/animations/idle.glb' },
        { name: 'walk', path: '/assets/animations/walk.glb' },
        { name: 'jump', path: '/assets/animations/jump.glb' }
      ]
    ];
    
    // Try loading from a set of paths
    const tryLoadAnimations = (setIndex) => {
      if (setIndex >= animationSets.length) {
        // All sets failed, but we can still use the model without animations
        console.warn('Could not load any animations, using model without animations');
        this.loaded = true;
        return;
      }
      
      console.log(`Trying to load animations from set ${setIndex + 1}`);
      const animations = animationSets[setIndex];
      let animationsLoaded = 0;
      let animationsFailed = 0;
      
      animations.forEach(animation => {
        loader.load(
          animation.path,
          (gltf) => {
            if (gltf.animations && gltf.animations.length > 0) {
              this.animations[animation.name] = gltf.animations[0];
              console.log(`${animation.name} animation loaded successfully`);
              animationsLoaded++;
            } else {
              console.warn(`No animations found in ${animation.path}`);
              animationsFailed++;
            }
            
            // When all animations processed
            if (animationsLoaded + animationsFailed === animations.length) {
              if (animationsLoaded > 0) {
                // At least some animations loaded successfully
                this.loaded = true;
                this.playAnimation('idle');
              } else {
                // All animations in this set failed, try next set
                tryLoadAnimations(setIndex + 1);
              }
            }
          },
          (xhr) => {
            console.log(`${animation.name} animation ${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          (error) => {
            console.warn(`Error loading ${animation.name} animation from ${animation.path}:`, error);
            animationsFailed++;
            
            // When all animations processed
            if (animationsLoaded + animationsFailed === animations.length) {
              if (animationsLoaded > 0) {
                // At least some animations loaded successfully
                this.loaded = true;
                this.playAnimation('idle');
              } else {
                // All animations in this set failed, try next set
                tryLoadAnimations(setIndex + 1);
              }
            }
          }
        );
      });
    };
    
    // Start trying animation sets
    tryLoadAnimations(0);
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