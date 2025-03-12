import * as THREE from 'three';
import { CharacterModel } from './CharacterModel';
import { VectorUtil } from '../utils/VectorUtil';

export class CharacterController {
    constructor(scene) {
        this.scene = scene;
        this.characterModel = new CharacterModel();
        
        // Create capsule for physics
        const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.0
        });
        this.capsule = new THREE.Mesh(geometry, material);
        this.capsule.castShadow = false;
        this.capsule.position.y = 2;
        scene.add(this.capsule);

        // Initialize character model
        this.initializeCharacterModel();

        // Movement state
        this.isMoving = false;
        this.isJumping = false;
    }

    async initializeCharacterModel() {
        try {
            const model = await this.characterModel.load();
            if (model) {
                // Set model position directly
                model.position.set(0, 0.85, 0);
                model.castShadow = true;
                this.capsule.add(model);
            }
        } catch (error) {
            console.error('Failed to load character model:', error);
        }
    }

    update(deltaTime, moveDirection, isJumping) {
        try {
            // Update position using safe vector utility
            if (moveDirection) {
                VectorUtil.applyMovement(this.capsule, moveDirection);
                this.isMoving = VectorUtil.hasMovement(moveDirection);

                // Rotate character to face movement direction
                if (this.isMoving) {
                    this.capsule.rotation.y = VectorUtil.getRotationAngle(moveDirection);
                }
            } else {
                this.isMoving = false;
            }

            // Update jumping state
            this.isJumping = !!isJumping;

            // Update animations
            if (this.characterModel) {
                if (this.isJumping) {
                    this.characterModel.playAnimation('jump');
                } else if (this.isMoving) {
                    this.characterModel.playAnimation('walk');
                } else {
                    this.characterModel.playAnimation('idle');
                }
                
                if (typeof deltaTime === 'number') {
                    this.characterModel.update(deltaTime);
                }
            }
        } catch (error) {
            console.error('Error in CharacterController update:', error);
        }
    }

    getPosition() {
        return this.capsule.position;
    }
}