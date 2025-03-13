import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { CharacterController } from './components/CharacterController.js';
import { createScene } from './components/Scene.js';
import { ThirdPersonCamera } from './components/ThirdPersonCamera.js';
import { InputManager } from './utils/InputManager.js';
import { GUIController } from './utils/GUIController.js';

// Global variables
let world, scene, renderer, camera, character, thirdPersonCamera, inputManager, guiController;
const physicsClock = new THREE.Clock();

// Initialize the game
async function init() {
  // Show loading screen until everything is ready
  const loadingScreen = document.getElementById('loading-screen');
  
  // Wait for RAPIER to initialize
  await RAPIER.init();
  console.log("Rapier initialized successfully");
  
  // Get the canvas element and ensure it exists
  const canvas = document.getElementById('game');
  if (!canvas) {
    console.error("Canvas element with id 'game' not found!");
    return;
  }
  
  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Create physics world with standard Earth gravity
  const gravity = new RAPIER.Vector3(0.0, -30.0, 0.0); // Stronger gravity for gameplay
  world = new RAPIER.World(gravity);
  console.log("Physics world created with gravity:", gravity.y);
  
  // Create scene with ground
  const { sceneObj, ground } = createScene(world);
  scene = sceneObj;
  
  // Create perspective camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Create character controller
  character = new CharacterController(scene, world, {
    position: new THREE.Vector3(0, 3, 0),
    radius: 0.4,
    height: 1.8,
    showDebugVisuals: false
  });
  
  // Create third-person camera controller
  thirdPersonCamera = new ThirdPersonCamera(camera, character.mesh, {
    distance: 5,
    height: 2
  });
  
  // Create input manager
  inputManager = new InputManager();
  inputManager.initialize();
  
  // Add debug GUI if needed
  guiController = new GUIController(character, thirdPersonCamera);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  
  // Hide loading screen
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
  
  // Start game loop
  physicsClock.start();
  requestAnimationFrame(gameLoop);

  // Add character spotlight for better visibility
  const characterLight = addCharacterSpotlight(scene, character);
}

// Game loop
function gameLoop() {
  try {
    // Calculate delta time for physics
    const deltaTime = Math.min(physicsClock.getDelta(), 0.1); // Cap at 0.1 to prevent large jumps
    
    // Step the physics world
    world.step();
    
    // Update character physics with input
    character.applyInput(inputManager, camera, deltaTime);
    character.update(deltaTime);
    
    // Update third-person camera
    thirdPersonCamera.update(deltaTime);
    
    // Reset input flags
    if (inputManager.jumpWasPressed) {
      inputManager.jumpWasPressed = false;
      inputManager.resetMouseDelta();
    }
    
    // Update character spotlight to follow character
    if (characterLight && character) {
      const charPosition = character.mesh.position.clone();
      characterLight.target.position.copy(charPosition);
      characterLight.spotlight.position.set(
        charPosition.x, 
        charPosition.y + 10, 
        charPosition.z
      );
    }
    
    // Render the scene
    renderer.render(scene, camera);
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
  } catch (error) {
    console.error("Error in game loop:", error);
    requestAnimationFrame(gameLoop); // Keep the loop going even if there's an error
  }
}

// Function to add extra lighting specifically for the character
function addCharacterSpotlight(scene, character) {
  // Add a spotlight that follows the character
  const spotlight = new THREE.SpotLight(0xFFFFFF, 2);
  spotlight.position.set(0, 10, 0);
  spotlight.angle = Math.PI / 6;
  spotlight.penumbra = 0.5;
  spotlight.decay = 1;
  spotlight.distance = 30;
  
  spotlight.castShadow = true;
  spotlight.shadow.bias = -0.0001;
  spotlight.shadow.mapSize.width = 1024;
  spotlight.shadow.mapSize.height = 1024;
  
  scene.add(spotlight);
  
  // Target the spotlight at the character
  const spotlightTarget = new THREE.Object3D();
  scene.add(spotlightTarget);
  spotlight.target = spotlightTarget;
  
  // Return the spotlight and target for updates
  return { spotlight, target: spotlightTarget };
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded, initializing game...");
  init();
});
