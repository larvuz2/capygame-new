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
            const characterGltf = await loader.loadAsync('/models/character/character.glb');
            this.model = characterGltf.scene;
            
            // Load animations
            const [idleGltf, walkGltf, jumpGltf] = await Promise.all([
                loader.loadAsync('/models/character/idle.glb'),
                loader.loadAsync('/models/character/walk.glb'),
                loader.loadAsync('/models/character/jump.glb')
            ]);

            // Set up animation mixer
            this.mixer = new THREE.AnimationMixer(this.model);
            
            // Store animations
            if (idleGltf.animations.length > 0) this.animations.idle = idleGltf.animations[0];
            if (walkGltf.animations.length > 0) this.animations.walk = walkGltf.animations[0];
            if (jumpGltf.animations.length > 0) this.animations.jump = jumpGltf.animations[0];
            
            // Play idle animation by default
            this.playAnimation('idle');
            
            return this.model;
        } catch (error) {
            console.error('Error loading character model or animations:', error);
            throw error;
        }
    }

    playAnimation(animationName) {
        const animation = this.animations[animationName];
        if (!animation || !this.mixer) return;

        // Stop current animation
        if (this.currentAnimation) {
            this.currentAnimation.fadeOut(0.5);
        }

        // Play new animation
        this.currentAnimation = this.mixer.clipAction(animation);
        this.currentAnimation.reset().fadeIn(0.5).play();
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
}
