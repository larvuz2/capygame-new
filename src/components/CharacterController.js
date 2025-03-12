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
        
        // Create a vector to safely store movement
        this.movementVector = new THREE.Vector3();
    }

    async initializeCharacterModel() {
        try {
            const model = await this.characterModel.load();
            if (model) {
                // Set model position directly instead of using vector addition
                model.position.set(0, 0.85, 0); // Adjust based on your model
                model.castShadow = true;
                this.capsule.add(model);
            }
        } catch (error) {
            console.error('Failed to load character model:', error);
        }
    }

    update(deltaTime, moveDirection, isJumping) {
        // Update position
        if (moveDirection) {
            try {
                // Directly update position components
                if (typeof moveDirection.x === 'number') {
                    this.capsule.position.x += moveDirection.x;
                }
                if (typeof moveDirection.y === 'number') {
                    this.capsule.position.y += moveDirection.y;
                }
                if (typeof moveDirection.z === 'number') {
                    this.capsule.position.z += moveDirection.z;
                }
                
                // Calculate if moving based on the values, not vector methods
                const movingX = Math.abs(moveDirection.x || 0) > 0.001;
                const movingZ = Math.abs(moveDirection.z || 0) > 0.001;
                this.isMoving = movingX || movingZ;

                // Rotate character to face movement direction
                if (this.isMoving && typeof moveDirection.x === 'number' && typeof moveDirection.z === 'number') {
                    const angle = Math.atan2(moveDirection.x, moveDirection.z);
                    this.capsule.rotation.y = angle;
                }
            } catch (error) {
                console.error('Error updating character position:', error);
                this.isMoving = false;
            }
        } else {
            this.isMoving = false;
        }

        // Update jumping state
        this.isJumping = !!isJumping; // Convert to boolean

        // Update animations
        if (this.characterModel) {
            if (this.isJumping) {
                this.characterModel.playAnimation('jump');
            } else if (this.isMoving) {
                this.characterModel.playAnimation('walk');
            } else {
                this.characterModel.playAnimation('idle');
            }
            
            try {
                this.characterModel.update(deltaTime);
            } catch (error) {
                console.error('Error updating character animations:', error);
            }
        }
    }

    getPosition() {
        return this.capsule.position;
    }
}