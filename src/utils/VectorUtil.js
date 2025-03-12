import * as THREE from 'three';

// Safe vector utility functions
export const VectorUtil = {
    // Safely create a new vector
    create: (x = 0, y = 0, z = 0) => {
        return new THREE.Vector3(x, y, z);
    },
    
    // Safely add vector components without using .add()
    addVectors: (target, source) => {
        if (!target || !source) return target;
        
        if (typeof target.x === 'number' && typeof source.x === 'number') {
            target.x += source.x;
        }
        
        if (typeof target.y === 'number' && typeof source.y === 'number') {
            target.y += source.y;
        }
        
        if (typeof target.z === 'number' && typeof source.z === 'number') {
            target.z += source.z;
        }
        
        return target;
    },
    
    // Check if a vector has movement (without using .length())
    hasMovement: (vector) => {
        if (!vector) return false;
        const threshold = 0.001;
        return Math.abs(vector.x || 0) > threshold || 
               Math.abs(vector.y || 0) > threshold || 
               Math.abs(vector.z || 0) > threshold;
    },
    
    // Safely get angle for rotation
    getRotationAngle: (vector) => {
        if (!vector || typeof vector.x !== 'number' || typeof vector.z !== 'number') {
            return 0;
        }
        return Math.atan2(vector.x, vector.z);
    },
    
    // Safely apply movement to an object
    applyMovement: (object, movement) => {
        if (!object || !object.position || !movement) return;
        
        if (typeof movement.x === 'number') object.position.x += movement.x;
        if (typeof movement.y === 'number') object.position.y += movement.y;
        if (typeof movement.z === 'number') object.position.z += movement.z;
    }
};

// Patch THREE.Vector3 to make it more robust
const originalVector3 = THREE.Vector3;

// Only patch if not already patched
if (!THREE.Vector3._isPatched) {
    THREE.Vector3 = function(x, y, z) {
        const vector = new originalVector3(x, y, z);
        
        // Make add method more robust
        const originalAdd = vector.add;
        vector.add = function(v) {
            if (!v) return this;
            try {
                return originalAdd.call(this, v);
            } catch (e) {
                console.warn('Safe vector recovery after add() error', e);
                if (typeof v.x === 'number') this.x += v.x;
                if (typeof v.y === 'number') this.y += v.y;
                if (typeof v.z === 'number') this.z += v.z;
                return this;
            }
        };
        
        return vector;
    };
    
    // Copy prototype and constructor
    THREE.Vector3.prototype = originalVector3.prototype;
    THREE.Vector3.constructor = originalVector3;
    
    // Mark as patched
    THREE.Vector3._isPatched = true;
}
