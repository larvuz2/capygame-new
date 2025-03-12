import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class CharacterModel {
    constructor() {
        this.model = null;
        this.mixer = null;
        this.animations = {
            idle: null,
            walk: null,
            jump: null
        };
        this.currentAnimation = null;
    }

    async load() {
        const loader = new GLTFLoader();
        
        try {
            // Load the character model
            console.log('Attempting to load character model from: /models/character/character.glb');
            const characterGltf = await loader.loadAsync('/models/character/character.glb');
            this.model = characterGltf.scene;
            console.log('Character model loaded successfully');
            
            try {
                // Load animations one by one with error handling
                console.log('Attempting to load idle animation');
                const idleGltf = await loader.loadAsync('/models/character/idle.glb');
                if (idleGltf.animations && idleGltf.animations.length > 0) {
                    this.animations.idle = idleGltf.animations[0];
                    console.log('Idle animation loaded successfully');
                }
            } catch (error) {
                console.error('Failed to load idle animation:', error);
            }
            
            try {
                console.log('Attempting to load walk animation');
                const walkGltf = await loader.loadAsync('/models/character/walk.glb');
                if (walkGltf.animations && walkGltf.animations.length > 0) {
                    this.animations.walk = walkGltf.animations[0];
                    console.log('Walk animation loaded successfully');
                }
            } catch (error) {
                console.error('Failed to load walk animation:', error);
            }
            
            try {
                console.log('Attempting to load jump animation');
                const jumpGltf = await loader.loadAsync('/models/character/jump.glb');
                if (jumpGltf.animations && jumpGltf.animations.length > 0) {
                    this.animations.jump = jumpGltf.animations[0];
                    console.log('Jump animation loaded successfully');
                }
            } catch (error) {
                console.error('Failed to load jump animation:', error);
            }

            // Set up animation mixer
            if (this.model) {
                this.mixer = new THREE.AnimationMixer(this.model);
                console.log('Animation mixer created');
                
                // Play idle animation by default if available
                if (this.animations.idle) {
                    this.playAnimation('idle');
                }
            }
            
            return this.model;
        } catch (error) {
            console.error('Error loading character model:', error);
            return null;
        }
    }

    playAnimation(animationName) {
        // Validate inputs
        if (!this.mixer || !animationName || !this.animations[animationName]) {
            return;
        }

        try {
            // Stop current animation with proper error handling
            if (this.currentAnimation) {
                try {
                    this.currentAnimation.fadeOut(0.5);
                } catch (error) {
                    console.error('Error fading out animation:', error);
                }
            }

            // Play new animation with proper error handling
            const animation = this.animations[animationName];
            if (animation) {
                this.currentAnimation = this.mixer.clipAction(animation);
                this.currentAnimation.reset().fadeIn(0.5).play();
                console.log(`Playing ${animationName} animation`);
            }
        } catch (error) {
            console.error(`Failed to play ${animationName} animation:`, error);
        }
    }

    update(deltaTime) {
        if (this.mixer && typeof deltaTime === 'number') {
            this.mixer.update(deltaTime);
        }
    }
}