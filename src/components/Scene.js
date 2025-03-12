import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

export function createScene(world) {
  // Create Three.js scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Add directional light with shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);
  
  // Add ground
  const groundSize = 50;
  const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x4CAF50,
    roughness: 0.8,
    metalness: 0.1
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
  
  // Create ground rigid body
  const groundRigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
  const groundRigidBody = world.createRigidBody(groundRigidBodyDesc);
  
  // Create ground collider
  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(groundSize / 2, 0.1, groundSize / 2);
  world.createCollider(groundColliderDesc, groundRigidBody);
  
  // Add some obstacles to make the environment more interesting
  addObstacles(scene, world);
  
  return { sceneObj: scene, ground: groundMesh };
}

function addObstacles(scene, world) {
  // Create several boxes of different sizes
  const boxPositions = [
    { pos: new THREE.Vector3(5, 1, 5), size: new THREE.Vector3(2, 2, 2) },
    { pos: new THREE.Vector3(-5, 0.5, -5), size: new THREE.Vector3(1, 1, 1) },
    { pos: new THREE.Vector3(0, 0.75, 8), size: new THREE.Vector3(1.5, 1.5, 1.5) },
    { pos: new THREE.Vector3(-8, 0.75, 3), size: new THREE.Vector3(1.5, 1.5, 1.5) }
  ];
  
  // Create boxes with different colors
  const colors = [0xF44336, 0x2196F3, 0xFFC107, 0x9C27B0];
  
  boxPositions.forEach((box, index) => {
    // Create box mesh
    const boxGeometry = new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: colors[index % colors.length],
      roughness: 0.7,
      metalness: 0.2
    });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.copy(box.pos);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    scene.add(boxMesh);
    
    // Create box rigid body
    const boxRigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(box.pos.x, box.pos.y, box.pos.z);
    const boxRigidBody = world.createRigidBody(boxRigidBodyDesc);
    
    // Create box collider
    const boxColliderDesc = RAPIER.ColliderDesc.cuboid(
      box.size.x / 2,
      box.size.y / 2,
      box.size.z / 2
    );
    world.createCollider(boxColliderDesc, boxRigidBody);
  });
  
  // Create a ramp
  const rampSize = { width: 4, height: 0.5, depth: 8 };
  const rampPosition = new THREE.Vector3(8, rampSize.height / 2, 0);
  const rampRotation = new THREE.Euler(Math.PI / 8, 0, 0);
  
  const rampGeometry = new THREE.BoxGeometry(rampSize.width, rampSize.height, rampSize.depth);
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: 0x795548,
    roughness: 0.6,
    metalness: 0.1
  });
  const rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
  rampMesh.position.copy(rampPosition);
  rampMesh.rotation.copy(rampRotation);
  rampMesh.castShadow = true;
  rampMesh.receiveShadow = true;
  scene.add(rampMesh);
  
  // Create ramp rigid body
  const rampRigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
    .setTranslation(rampPosition.x, rampPosition.y, rampPosition.z)
    .setRotation(rampRotation);
  const rampRigidBody = world.createRigidBody(rampRigidBodyDesc);
  
  // Create ramp collider
  const rampColliderDesc = RAPIER.ColliderDesc.cuboid(
    rampSize.width / 2,
    rampSize.height / 2,
    rampSize.depth / 2
  );
  world.createCollider(rampColliderDesc, rampRigidBody);
}