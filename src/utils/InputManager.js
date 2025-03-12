export class InputManager {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    this.mouseDelta = {
      x: 0,
      y: 0
    };
    
    this.mousePosition = {
      x: 0,
      y: 0
    };
    
    this.isPointerLocked = false;
  }
  
  initialize() {
    // Add keyboard event listeners
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Add mouse event listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Add pointer lock event listeners
    const gameContainer = document.getElementById('game-container');
    gameContainer.addEventListener('click', this.requestPointerLock.bind(this));
    
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.addEventListener('pointerlockerror', this.onPointerLockError.bind(this));
  }
  
  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = true;
        break;
      case 'KeyS':
        this.keys.backward = true;
        break;
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.jump = true;
        console.log('Space pressed - jump true');
        break;
    }
  }
  
  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = false;
        break;
      case 'KeyS':
        this.keys.backward = false;
        break;
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        console.log('Space released - jump false');
        break;
    }
  }
  
  onMouseMove(event) {
    if (this.isPointerLocked) {
      // Store mouse movement delta for camera control
      this.mouseDelta.x += event.movementX * 0.003;
      this.mouseDelta.y += event.movementY * 0.003;
      
      // Clamp vertical rotation to prevent camera flipping
      this.mouseDelta.y = Math.max(Math.min(this.mouseDelta.y, Math.PI / 2 - 0.01), -Math.PI / 2 + 0.01);
    }
  }
  
  resetMouseDelta() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }
  
  requestPointerLock() {
    const canvas = document.getElementById('game');
    canvas.requestPointerLock();
  }
  
  onPointerLockChange() {
    if (document.pointerLockElement === document.getElementById('game')) {
      this.isPointerLocked = true;
      document.getElementById('controls-hint').classList.add('hidden');
    } else {
      this.isPointerLocked = false;
      document.getElementById('controls-hint').classList.remove('hidden');
    }
  }
  
  onPointerLockError() {
    console.error('Pointer lock error');
  }
}