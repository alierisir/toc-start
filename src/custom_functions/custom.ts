import * as THREE from "three";
import * as OBC from "openbim-components";

const viewer = new OBC.Components();
const cameraComponent = new OBC.SimpleCamera(viewer);
const sceneComponent = new OBC.SimpleScene(viewer);
viewer.scene = sceneComponent;
const scene = sceneComponent.get();
viewer.camera = cameraComponent;

//Code below can be copied directly to the index file

const createDummyCube = (components: OBC.Components | THREE.Mesh = viewer) => {
  const cubeG = new THREE.BoxGeometry(2, 2, 2);
  const cubeM = new THREE.MeshStandardMaterial();
  const cube = new THREE.Mesh(cubeG, cubeM);
  if (components instanceof OBC.Components) {
    const scene = components.scene.get();
    scene.add(cube);
  }
  if (components instanceof THREE.Mesh) {
    cube.position.set(5, 0, 0);
    components.add(cube);
  }
  return cube;
};

const cube = createDummyCube();
const moon = createDummyCube(cube);

const cubeMatrix = [1, -1, 1];
const moonMatrix = [1, -20, 1];

const movement = (mesh: THREE.Mesh, iterator: number, limit: number) => {
  if (iterator < limit) {
    const [a, b, c] = cubeMatrix;
    cameraComponent.get().position.set(0, 100, 0);
    cameraComponent.get().lookAt(0, 0, 0);
    const angle = (iterator * Math.PI) / 180;
    mesh.position.x = 50 * Math.cos(angle * a);
    mesh.position.z = 50 * Math.sin(angle * b);
    mesh.position.y = 0 * Math.cos(angle * c);
    console.log(iterator);
  }
};

const createClone = (mesh: THREE.Mesh) => {
  const clone = mesh.clone();
  clone.scale.set(0.3, 0.3, 0.3);
  scene.add(clone);
};

const getPosition = (mesh: THREE.Mesh) => {
  return { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
};

const orbit = (
  mesh: THREE.Mesh,
  moonMesh: THREE.Mesh,
  iterator: number,
  limit: number
) => {
  if (iterator <= limit) {
    const { x, y, z } = getPosition(mesh);
    const [a, b, c] = moonMatrix;
    const angle = (iterator * Math.PI) / 180;
    moonMesh.position.x = 5 * Math.cos(angle * a);
    moonMesh.position.z = 5 * Math.sin(angle * b);
    moonMesh.position.y = 0 * Math.cos(angle * c);
    const clone = moonMesh.clone();
    clone.position.set(
      moonMesh.position.x + x,
      moonMesh.position.y + y,
      moonMesh.position.z + z
    );
    clone.scale.set(0.2, 0.2, 0.2);
    scene.add(clone);
  }
};

let iterator = 0;
function animation() {
  movement(cube, iterator, 5000);
  orbit(cube, moon, iterator, 5000);
  iterator += 1;
  requestAnimationFrame(animation);
}
