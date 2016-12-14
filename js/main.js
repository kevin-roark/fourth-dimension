
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import seriesData from './data';
import ThumbnailPile from './thumbnail-pile';
import PhotoView from './photo-view';
import MouseIntersector from './mouse-intersector';

let HOME_CAMERA_POSITION = 30;

if (isMobile.any) {
  let mobileWarning = document.createElement('div');
  mobileWarning.className = 'mobile-warning';
  document.body.appendChild(mobileWarning);
  setTimeout(go, 1000);
} else {
  go();
}

function go () {
  window.THREE = THREE;

  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0xffffff);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let scene = new THREE.Scene();
  window.scene = scene;

  let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
  camera.position.z = HOME_CAMERA_POSITION;
  scene.add(camera);

  let container = new THREE.Object3D();
  scene.add(container);

  document.body.appendChild(renderer.domElement);

  let dom = {
    info: document.querySelector('.info'),
    seriesTitle: document.querySelector('.series-title'),
    photoViewInterface: document.querySelector('.photo-view-interface'),
    photoViewCloseButton: document.querySelector('.photo-view-close-button'),
    photoViewControlButtons: {
      wireframe: document.querySelector('#wireframe-button'),
      texture: document.querySelector('#texture-button'),
      lighting: document.querySelector('#lighting-button'),
      background: document.querySelector('#background-button')
    }
  };

  let state = {
    loadingPhotoView: false,
    photoInView: null,
    startTime: null,
    lastTime: null
  };

  let thumbnailMeshes = [];

  window.addEventListener('resize', resize);
  resize();

  createScene(() => {
    let thumbnailIntersector = new MouseIntersector({ camera, renderer, meshes: thumbnailMeshes });
    thumbnailIntersector.addHoverListener(mesh => {
      if (state.photoInView || state.loadingPhotoView) return;
      setHoverThumnbail(mesh ? mesh._thumbnail : null);
    });
    thumbnailIntersector.addClickListener(mesh => {
      if (state.photoInView || state.loadingPhotoView) return;
      viewPhoto(mesh ? mesh._thumbnail.photo : null);
    });

    document.addEventListener('keydown', ev => {
      switch (ev.keyCode) {
        case 27: // escape
          exitCurrentPhotoView();
          break;
        default:
          if (state.photoInView) state.photoInView.keydown(ev);
          break;
      }
    });
    document.addEventListener('keyup', ev => {
      if (state.photoInView) state.photoInView.keyup(ev);
    });

    document.addEventListener('mousedown', ev => {
      if (state.photoInView) state.photoInView.mousedown(ev);
    });
    document.addEventListener('mouseup', ev => {
      if (state.photoInView) state.photoInView.mouseup(ev);
    });
    document.addEventListener('mousemove', ev => {
      if (state.photoInView) state.photoInView.mousemove(ev);
    });

    dom.photoViewCloseButton.addEventListener('click', exitCurrentPhotoView);

    dom.photoViewControlButtons.wireframe.addEventListener('click', () => {
      if (state.photoInView) state.photoInView.wireframeButtonPressed();
    });
    dom.photoViewControlButtons.texture.addEventListener('click', () => {
      if (state.photoInView) state.photoInView.textureButtonPressed();
    });
    dom.photoViewControlButtons.lighting.addEventListener('click', () => {
      if (state.photoInView) state.photoInView.lightingButtonPressed();
    });
    dom.photoViewControlButtons.background.addEventListener('click', () => {
      if (state.photoInView) state.photoInView.backgroundButtonPressed();
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
    if (!state.startTime) state.startTime = time;
    let delta = time - (state.lastTime || time);

    TWEEN.update(time);

    if (state.photoInView) state.photoInView.update(delta);

    renderer.render(scene, camera);
    state.lastTime = time;

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
      let photoView = new PhotoView({ photo, scene, camera });
      photoView.load(() => {
        state.loadingPhotoView = false;
        setPhotoView(photoView);
      });
    } else {
      setPhotoView(null);
    }
  }

  function exitCurrentPhotoView () {
    if (state.photoInView) {
      viewPhoto(null);
    }
  }

  function setPhotoView (photoView) {
    if (photoView) {
      scene.remove(container);
      photoView.activate();
    } else {
      state.photoInView.deactivate();
      scene.add(container);
      camera.position.z = HOME_CAMERA_POSITION;
    }

    [dom.info, dom.photoViewInterface, dom.seriesTitle].forEach(el => {
      if (photoView) el.classList.add('photo-view');
      else el.classList.remove('photo-view');
    });

    state.photoInView = photoView;
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
