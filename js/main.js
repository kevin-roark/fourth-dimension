
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import seriesData from './data';
import dataUtil from './data-util';
import cameras from './cameras';
import PhotoView from './photo-view';
import HomeView from './home-view';

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

  seriesData.sort(() => Math.random() - 0.5);

  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0xffffff);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let scene = new THREE.Scene();
  window.scene = scene;

  scene.add(cameras.perspectiveCamera);
  scene.add(cameras.orthographicCamera);

  let homeView = new HomeView({ seriesData, camera: cameras.orthographicCamera, renderer, photoClickHandler: viewPhoto });
  homeView.activate(scene);

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
    lastTime: null,
    activeCamera: cameras.orthographicCamera
  };

  window.addEventListener('resize', resize);
  resize();

  createScene(() => {
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

    // url handling
    if (window.location.hash && window.location.hash.length > 0) {
      let photo = dataUtil.hashToPhoto(window.location.hash, seriesData);
      if (photo) {
        viewPhoto(photo);
      } else {
        window.history.replaceState('', document.title, window.location.pathname);
      }
    }
  });

  renderer.render(scene, state.activeCamera);
  start();

  function resize () {
    let w = window.innerWidth;
    let h = window.innerHeight;

    renderer.setSize(w, h);

    cameras.resize(w, h);
    homeView.resize(w, h);
  }

  function start () {
    update();
  }

  function update (time) {
    if (!state.startTime) state.startTime = time;
    let delta = time - (state.lastTime || time);

    TWEEN.update(time);

    if (state.photoInView) {
      state.photoInView.update(delta);
    } else {
      homeView.update(delta);
    }

    renderer.render(scene, state.activeCamera);
    state.lastTime = time;

    window.requestAnimationFrame(update);
  }

  function viewPhoto (photo) {
    if (!!photo === !!state.photoInView) {
      return;
    }
    if (state.loadingPhotoView) {
      return;
    }

    // url updating
    let hash = photo ? `#${dataUtil.photoToHash(photo)}` : '';
    window.history.replaceState('', document.title, `${window.location.pathname}${hash}`);

    if (photo) {
      state.loadingPhotoView = true;
      let photoView = new PhotoView({ photo, scene, camera: cameras.perspectiveCamera });
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
      homeView.deactivate(scene);
      photoView.activate();
    } else {
      state.photoInView.deactivate();
      homeView.activate(scene);
      cameras.resetPerspectiveCamera();
    }

    [dom.info, dom.photoViewInterface, dom.seriesTitle].forEach(el => {
      if (photoView) el.classList.add('photo-view');
      else el.classList.remove('photo-view');
    });

    state.photoInView = photoView;
    state.activeCamera = photoView ? cameras.perspectiveCamera : cameras.orthographicCamera;
    if (homeView.thumbnailIntersector) homeView.thumbnailIntersector.camera = state.activeCamera;
  }

  function createScene (callback) {
    makeLights();
    homeView.load(() => {
      callback();
    });
  }

  function makeLights () {
    let ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
  }
}
