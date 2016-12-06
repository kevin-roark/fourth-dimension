
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import seriesData from './data';
import ThumbnailPile from './thumbnail-pile';
import PhotoView from './photo-view';
import MouseIntersector from './mouse-intersector';

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
  camera.position.z = 30;
  scene.add(camera);

  let container = new THREE.Object3D();
  scene.add(container);

  document.body.appendChild(renderer.domElement);

  let dom = {
    seriesTitle: document.querySelector('.series-title')
  };

  let state = {
    loadingPhotoView: false,
    photoInView: null
  };

  let thumbnailMeshes = [];
  let startTime;

  window.addEventListener('resize', resize);
  resize();

  createScene(() => {
    let thumbnailIntersector = new MouseIntersector({ camera, renderer, meshes: thumbnailMeshes });
    thumbnailIntersector.addHoverListener(mesh => {
      setHoverThumnbail(mesh ? mesh._thumbnail : null);
    });
    thumbnailIntersector.addClickListener(mesh => {
      viewPhoto(mesh ? mesh._thumbnail.photo : null);
    });
  });
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

  function setHoverThumnbail (thumbnail) {
    let title = thumbnail ? `${thumbnail._pile.series.name} — ${thumbnail.photo.name}` : '';
    dom.seriesTitle.textContent = title;

    let cursor = thumbnail ? "url('images/basketball.png'), crosshair" : "url('images/myhand.png'), auto";
    renderer.domElement.style.cursor = cursor;
  }

  function viewPhoto (photo) {
    if (!!photo === !!state.photoInView) {
      return;
    }
    if (state.loadingPhotoView) {
      return;
    }

    if (photo) {
      state.loadingPhotoView = true;
      let photoView = new PhotoView({ photo, scene });
      photoView.load(() => {
        scene.remove(container);
        photoView.activate();
        state.photoInView = photoView;
      });
    } else {
      state.photoInView.deactivate();
      state.photoInView = null;
      scene.add(container);
    }
  }

  function createScene (callback) {
    let remaining = 1;

    makeLights();
    makePiles(loaded);

    function loaded () {
      remaining -= 1;
      if (remaining === 0) callback();
    }
  }

  function makeLights () {
    let ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);
  }

  function makePiles (callback) {
    let remaining = seriesData.length;
    let half = Math.floor(seriesData.length / 2);

    seriesData.forEach((series, idx) => {
      let thumbnailPile = new ThumbnailPile({ series });
      thumbnailPile.load(() => {
        let x = -21 + 60 * ((idx % half) / half);
        let y = idx % 2 === 0 ? 10 : -10;
        thumbnailPile.mesh.position.set(x, y, 0);

        container.add(thumbnailPile.mesh);
        thumbnailMeshes = thumbnailMeshes.concat(thumbnailPile.thumbnails.map(t => t.mesh));

        remaining -= 1;
        if (remaining === 0 && callback) {
          callback();
        }
      });
    });
  }
}
