
let THREE = require('three');

let HOME_CAMERA_POSITION = { x: 0, y: 0, z: 30 };

let perspectiveCamera = new THREE.PerspectiveCamera(70, 1, 0.01, 10000);
perspectiveCamera.position.copy(HOME_CAMERA_POSITION);

let orthographicViewportWidth = 100;
let orthographicCamera = new THREE.OrthographicCamera(-orthographicViewportWidth / 2, orthographicViewportWidth / 2, 1, 1, 0.01, 10000);
orthographicCamera.position.copy(HOME_CAMERA_POSITION);

resize();

function resize () {
  let w = window.innerWidth;
  let h = window.innerHeight;

  let aspect = perspectiveCamera.aspect = w / h;
  perspectiveCamera.updateProjectionMatrix();

  let orthographicHeight = orthographicViewportWidth / aspect;
  orthographicCamera.top = orthographicHeight / 2;
  orthographicCamera.bottom = -orthographicHeight / 2;
  orthographicCamera.updateProjectionMatrix();

  console.log(getCameraViewport(35.5));
}

function getCameraViewport (zDist) {
  let vFOV = perspectiveCamera.fov * Math.PI / 180;
  let height = 2 * Math.tan(vFOV / 2) * zDist;
  let width = height * perspectiveCamera.aspect;
  return { width, height, x: -width / 2, y: height / 2 };
}

function getOrthographicViewport () {
  let aspect = perspectiveCamera.aspect;
  return { width: orthographicViewportWidth, height: orthographicViewportWidth / aspect };
}

export default {
  perspectiveCamera,
  orthographicCamera,
  getCameraViewport,
  getOrthographicViewport,
  resize
};
