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
  const gravity = new RAPIER.Vector3(0.0, -9.81 * 3, 0.0); // Stronger gravity for gameplay
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
  character = new CharacterController(world, scene, {
    position: new THREE.Vector3(0, 5.0, 0), // Start higher for better visual of jumping
    radius: 0.5,
    height: 2.0
  });
  
  // Create third-person camera
  thirdPersonCamera = new ThirdPersonCamera(camera, character.mesh, {
    distance: 5,
    height: 2
  });
  
  // Setup input manager
  inputManager = new InputManager();
  inputManager.initialize();
  
  // Initialize GUI controller
  guiController = new GUIController(world, character, thirdPersonCamera);
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Hide loading screen
  loadingScreen.classList.add('hidden');
  
  // Start the game loop
  physicsClock.start();
  requestAnimationFrame(gameLoop);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Main game loop
function gameLoop() {
  requestAnimationFrame(gameLoop);
  
  const deltaTime = physicsClock.getDelta();
  
  // Step the physics world
  if (world) {
    world.step();
  }
  
  // Update character controller based on inputs
  if (character) {
    character.update({
      forward: inputManager.keys.forward,
      backward: inputManager.keys.backward,
      left: inputManager.keys.left,
      right: inputManager.keys.right,
      jump: inputManager.keys.jump
    }, deltaTime, camera);
  }
  
  // Update camera position
  if (thirdPersonCamera) {
    thirdPersonCamera.update(deltaTime, inputManager.mouseDelta);
    inputManager.resetMouseDelta();
  }
  
  // Render the scene
  if (scene && camera) {
    renderer.render(scene, camera);
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded, initializing game...");
  init();
});