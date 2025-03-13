import * as THREE from 'three';

export class InputManager {
  constructor() {
    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    // Mouse state
    this.mouse = {
      x: 0,
      y: 0,
      down: false
    };
    
    this.mouseDelta = new THREE.Vector2();
    this.previousMousePosition = new THREE.Vector2();
    
    // Initialize event listeners
    this.initialize();
    
    console.log('InputManager initialized');
  }
  
  initialize() {
    // Keyboard event listeners
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse event listeners
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    console.log('Input event listeners added');
  }
  
  handleKeyDown(event) {
    this.updateKeyState(event.code, true);
  }
  
  handleKeyUp(event) {
    this.updateKeyState(event.code, false);
  }
  
  updateKeyState(code, pressed) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = pressed;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = pressed;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = pressed;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = pressed;
        break;
      case 'Space':
        this.keys.jump = pressed;
        break;
    }
  }
  
  handleMouseMove(event) {
    // Calculate mouse delta
    this.mouseDelta.x = event.clientX - this.previousMousePosition.x;
    this.mouseDelta.y = event.clientY - this.previousMousePosition.y;
    
    // Update mouse position
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    
    // Store current position for next frame
    this.previousMousePosition.x = event.clientX;
    this.previousMousePosition.y = event.clientY;
  }
  
  handleMouseDown(event) {
    this.mouse.down = true;
  }
  
  handleMouseUp(event) {
    this.mouse.down = false;
  }
  
  resetMouseDelta() {
    this.mouseDelta.set(0, 0);
  }
  
  // Get all inputs for character controller
  getInputs() {
    return {
      forward: this.keys.forward,
      backward: this.keys.backward,
      left: this.keys.left,
      right: this.keys.right,
      jump: this.keys.jump,
      mouseDelta: this.mouseDelta.clone()
    };
  }
} 