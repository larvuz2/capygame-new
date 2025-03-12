import * as dat from 'dat.gui';

export class GUIController {
  constructor(world, character, thirdPersonCamera) {
    this.world = world;
    this.character = character;
    this.thirdPersonCamera = thirdPersonCamera;
    
    // Store original values to allow resetting
    this.originalValues = {
      // Character movement
      maxSpeed: 2.2,
      acceleration: 20.0,
      deceleration: 10.0,
      jumpStrength: 10,
      rotationSpeed: 5.0,
      
      // Camera
      cameraDistance: 6,
      cameraHeight: 2.5,
      cameraSmoothing: 0.05,
      
      // Physics/Gravity
      gravity: -30.0
    };
    
    // Settings object to be manipulated by dat.gui
    this.settings = {
      // Character movement
      maxSpeed: this.originalValues.maxSpeed,
      acceleration: this.originalValues.acceleration,
      deceleration: this.originalValues.deceleration,
      jumpStrength: this.originalValues.jumpStrength,
      rotationSpeed: this.originalValues.rotationSpeed,
      
      // Camera
      cameraDistance: this.originalValues.cameraDistance,
      cameraHeight: this.originalValues.cameraHeight,
      cameraSmoothing: this.originalValues.cameraSmoothing,
      
      // Physics/Gravity
      gravity: this.originalValues.gravity,
      
      // Reset function
      resetAll: () => this.resetToDefaults()
    };
    
    this.initGUI();
  }
  
  initGUI() {
    // Create GUI
    this.gui = new dat.GUI({ width: 300 });
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '10px';
    this.gui.domElement.style.right = '10px';
    
    // Character Movement folder
    const movementFolder = this.gui.addFolder('Character Movement');
    
    movementFolder.add(this.settings, 'maxSpeed', 1, 15)
      .name('Max Speed')
      .onChange(value => {
        this.character.maxSpeed = value;
      });
      
    movementFolder.add(this.settings, 'acceleration', 5, 50)
      .name('Acceleration')
      .onChange(value => {
        this.character.acceleration = value;
      });
      
    movementFolder.add(this.settings, 'deceleration', 5, 30)
      .name('Deceleration')
      .onChange(value => {
        this.character.deceleration = value;
      });
      
    movementFolder.add(this.settings, 'jumpStrength', 10, 50)
      .name('Jump Strength')
      .onChange(value => {
        this.character.jumpStrength = value;
      });
      
    movementFolder.add(this.settings, 'rotationSpeed', 1, 10)
      .name('Rotation Speed')
      .onChange(value => {
        this.character.rotationSpeed = value;
      });
    
    movementFolder.open();
    
    // Camera folder
    const cameraFolder = this.gui.addFolder('Camera Settings');
    
    cameraFolder.add(this.settings, 'cameraDistance', 2, 15)
      .name('Distance')
      .onChange(value => {
        this.thirdPersonCamera.distance = value;
      });
      
    cameraFolder.add(this.settings, 'cameraHeight', 0, 5)
      .name('Height')
      .onChange(value => {
        this.thirdPersonCamera.height = value;
      });
      
    cameraFolder.add(this.settings, 'cameraSmoothing', 0.01, 0.2)
      .name('Smoothing')
      .onChange(value => {
        this.thirdPersonCamera.smoothing = value;
      });
    
    cameraFolder.open();
    
    // Physics folder
    const physicsFolder = this.gui.addFolder('Physics');
    
    physicsFolder.add(this.settings, 'gravity', -30, -1)
      .name('Gravity')
      .onChange(value => {
        this.world.gravity.y = value;
      });
    
    physicsFolder.open();
    
    // Add reset button
    this.gui.add(this.settings, 'resetAll').name('Reset All Settings');
    
    // Add GUI toggle key
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyH') {
        this.toggleGUI();
      }
    });
    
    // Add info about GUI toggle
    const infoElement = document.createElement('div');
    infoElement.id = 'gui-info';
    infoElement.innerHTML = 'Press H to toggle GUI panel';
    infoElement.style.position = 'absolute';
    infoElement.style.bottom = '10px';
    infoElement.style.right = '10px';
    infoElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    infoElement.style.color = 'white';
    infoElement.style.padding = '5px 10px';
    infoElement.style.borderRadius = '5px';
    infoElement.style.fontFamily = 'Arial, sans-serif';
    infoElement.style.fontSize = '14px';
    document.body.appendChild(infoElement);
  }
  
  toggleGUI() {
    this.gui.domElement.style.display = 
      this.gui.domElement.style.display === 'none' ? '' : 'none';
  }
  
  resetToDefaults() {
    // Reset character movement
    this.character.maxSpeed = this.originalValues.maxSpeed;
    this.character.acceleration = this.originalValues.acceleration;
    this.character.deceleration = this.originalValues.deceleration;
    this.character.jumpStrength = this.originalValues.jumpStrength;
    this.character.rotationSpeed = this.originalValues.rotationSpeed;
    
    // Reset camera
    this.thirdPersonCamera.distance = this.originalValues.cameraDistance;
    this.thirdPersonCamera.height = this.originalValues.cameraHeight;
    this.thirdPersonCamera.smoothing = this.originalValues.cameraSmoothing;
    
    // Reset physics/gravity
    this.world.gravity.y = this.originalValues.gravity;
    
    // Update GUI controllers
    for (const controller of Object.values(this.gui.__controllers)) {
      controller.updateDisplay();
    }
    
    // Update folder controllers
    for (const folder of Object.values(this.gui.__folders)) {
      for (const controller of Object.values(folder.__controllers)) {
        controller.updateDisplay();
      }
    }
  }
}