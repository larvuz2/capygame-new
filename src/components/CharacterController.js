import * as THREE from 'three';
import { CharacterModel } from './CharacterModel';

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
            model.position.y = 0.85; // Adjust based on your model
            model.castShadow = true;
            this.capsule.add(model);
        } catch (error) {
            console.error('Failed to load character model:', error);
        }
    }

    update(deltaTime, moveDirection, isJumping) {
        // Update position
        if (moveDirection && moveDirection instanceof THREE.Vector3) {
            // Create a copy of the vector to avoid modifying the original
            const movement = moveDirection.clone();
            this.capsule.position.x += movement.x;
            this.capsule.position.y += movement.y;
            this.capsule.position.z += movement.z;
            
            this.isMoving = movement.length() > 0;

            // Rotate character to face movement direction
            if (this.isMoving) {
                const angle = Math.atan2(movement.x, movement.z);
                this.capsule.rotation.y = angle;
            }
        } else {
            this.isMoving = false;
        }

        // Update jumping state
        this.isJumping = isJumping;

        // Update animations
        if (this.characterModel) {
            if (this.isJumping) {
                this.characterModel.playAnimation('jump');
            } else if (this.isMoving) {
                this.characterModel.playAnimation('walk');
            } else {
                this.characterModel.playAnimation('idle');
            }
            this.characterModel.update(deltaTime);
        }
    }

    getPosition() {
        return this.capsule.position;
    }
}