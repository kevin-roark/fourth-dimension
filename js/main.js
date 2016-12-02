
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import seriesData from './data';
import ThumbnailPile from './thumbnail-pile';

if (isMobile.any) {
  let mobileWarning = document.createElement('div');
  mobileWarning.className = 'mobile-warning';
  document.body.appendChild(mobileWarning);
  setTimeout(go, 1000);
} else {
  go();
}

function go () {
  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0xffffff);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let scene = new THREE.Scene();
  window.scene = scene;

  let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
  camera.position.z = 20;
  scene.add(camera);

  let container = document.body;
  container.appendChild(renderer.domElement);

  let startTime;

  window.addEventListener('resize', resize);
  resize();

  createScene();
  renderer.render(scene, camera);
  start();

  function resize () {
    let w = window.innerWidth;
    let h = window.innerHeight;

    renderer.setSize(w, h);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function start () {
    update();
  }

  function update (time) {
    if (null == startTime) startTime = time;

    TWEEN.update(time);
    renderer.render(scene, camera);

    window.requestAnimationFrame(update);
  }

  function createScene () {
    makeLights();
    makePiles();
  }

  function makeLights () {
    let ambient = new THREE.AmbientLight(0x888888, 1);
    scene.add(ambient);
  }

  function makePiles () {
    seriesData.forEach((series, idx) => {
      let thumbnailPile = new ThumbnailPile({ series });
      thumbnailPile.load(() => {
        let x = -80 + 160 * (idx / (seriesData.length - 1));
        thumbnailPile.mesh.position.set(x, 0, 0);

        scene.add(thumbnailPile.mesh);
      });
    });
  }
}
