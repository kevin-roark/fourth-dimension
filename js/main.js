
let THREE = require('three');
let TWEEN = require('tween.js');
let isMobile = require('ismobilejs');

import seriesData from './data';
import dataUtil from './data-util';
import cameras from './cameras';
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
  window.THREE = THREE;

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
    lastTime: null,
    activeCamera: cameras.orthographicCamera,
    pileStyle: 'spread'
  };

  let objects = {
    thumbnailPiles: [],
    thumbnailMeshes: [],
    thumbnailIntersector: null,
    homeLights: new THREE.Object3D()
  };
  container.add(objects.homeLights);

  window.addEventListener('resize', resize);
  resize();

  createScene(() => {
    let thumbnailIntersector = objects.thumbnailIntersector = new MouseIntersector({ camera: state.activeCamera, renderer, meshes: objects.thumbnailMeshes });
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

    cameras.resize();
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
      for (let i = 0; i < objects.thumbnailPiles.length; i++) {
        objects.thumbnailPiles[i].update(delta);
      }
    }

    renderer.render(scene, state.activeCamera);
    state.lastTime = time;

    window.requestAnimationFrame(update);
  }

  function setHoverThumnbail (thumbnail) {
    let title = thumbnail ? `${thumbnail._pile.series.name} — ${thumbnail.photo.name}` : '';
    dom.seriesTitle.textContent = title;

    let cursor = thumbnail ? "url('images/basketball.png'), crosshair" : "url('images/myhand.png'), auto";
    dom.photoViewInterface.style.cursor = cursor;
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
      scene.remove(container);
      photoView.activate();
    } else {
      state.photoInView.deactivate();
      scene.add(container);
      cameras.resetPerspectiveCamera();
    }

    [dom.info, dom.photoViewInterface, dom.seriesTitle].forEach(el => {
      if (photoView) el.classList.add('photo-view');
      else el.classList.remove('photo-view');
    });

    state.photoInView = photoView;
    state.activeCamera = photoView || state.pileStyle !== 'neat' ? cameras.perspectiveCamera : cameras.orthographicCamera;
    if (objects.thumbnailIntersector) objects.thumbnailIntersector.camera = state.activeCamera;
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
    let ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    let spotlight = new THREE.SpotLight(0xffffff, 2, 5000, 3.14, 0, 1);
    spotlight.position.set(100, 100, 100);
    shadowConfig(spotlight);
    objects.homeLights.add(spotlight);

    let spotlight2 = new THREE.SpotLight(0xffffff, 2, 5000, 3.14, 0, 1);
    spotlight2.position.set(-100, 100, -100);
    shadowConfig(spotlight2);
    objects.homeLights.add(spotlight2);

    function shadowConfig (light) {
      light.castShadow = true;
      light.shadow.mapSize.width = spotlight.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 1;
      light.shadow.camera.far = 500;
      light.shadow.camera.fov = 30;
    }
  }

  function makePiles (callback) {
    let remaining = seriesData.length;

    seriesData.forEach((series, idx) => {
      let thumbnailPile = new ThumbnailPile({ series, style: state.pileStyle });
      thumbnailPile.load(() => {
        objects.thumbnailPiles.push(thumbnailPile);
        container.add(thumbnailPile.mesh);
        objects.thumbnailMeshes = objects.thumbnailMeshes.concat(thumbnailPile.thumbnails.map(t => t.mesh));

        remaining -= 1;
        if (remaining === 0 && callback) {
          arrangePiles(state.pileStyle);
          callback();
        }
      });
    });
  }

  function arrangePiles (style) {
    let half = Math.floor(seriesData.length / 2);

    objects.thumbnailPiles.forEach((pile, idx) => {
      let x, y;
      let z = 0;
      switch (style) {
        case 'spread':
          x = -21 + 60 * ((idx % half) / half);
          y = idx % 2 === 0 ? 10 : -10;
          break;

        case 'neat':
          x = -window.innerWidth / 2 + 5;
          y = window.innerHeight / 2 - 5 - idx * 15;
          break;
      }
      pile.mesh.position.set(x, y, z);
    });
  }
}
