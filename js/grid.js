
let THREE = require('three');

export default function createGrid ({ length = 1000, gridLength = 50, ceiling = true, color = 0x888888 } = {}) {
  let container = new THREE.Object3D();
  let wallY = ceiling ? 0 : length;

  let floorGrid = new THREE.GridHelper(length, gridLength, color, color);
  floorGrid.position.y = ceiling ? -length : 0;
  container.add(floorGrid);

  if (ceiling) {
    let ceilingGrid = new THREE.GridHelper(length, gridLength, color, color);
    ceilingGrid.position.y = length;
    container.add(ceilingGrid);
  }

  let wallGrid1 = new THREE.GridHelper(length, gridLength, color, color);
  wallGrid1.rotation.x = Math.PI / 2;
  wallGrid1.position.set(0, wallY, length);
  container.add(wallGrid1);

  let wallGrid2 = new THREE.GridHelper(length, gridLength, color, color);
  wallGrid2.rotation.x = Math.PI / 2;
  wallGrid2.position.set(0, wallY, -length);
  container.add(wallGrid2);

  let wallGrid3 = new THREE.GridHelper(length, gridLength, color, color);
  wallGrid3.rotation.z = Math.PI / 2;
  wallGrid3.position.set(length, wallY, 0);
  container.add(wallGrid3);

  let wallGrid4 = new THREE.GridHelper(length, gridLength, color, color);
  wallGrid4.rotation.z = Math.PI / 2;
  wallGrid4.position.set(-length, wallY, 0);
  container.add(wallGrid4);

  return container;
}
