
let THREE = require('three');
let TWEEN = require('tween.js');

import loadModel from './model-cache';
import createGrid from './grid';
import LightRing from './light-ring';
import Controls from './controls';
import PhotoViewInterface from './components/photo-view-interface';

let BACKGROUNDS = ['texture', 'blank', 'mosaic', 'grid', 'dark grid'];
let LIGHTINGS = ['white', 'white front', 'white back', 'primary', 'cops', 'red', 'blue', 'green', 'yellow'];
let TEXTURES = ['default', 'toon', 'empty', 'purple', 'cyan', 'yellow'];
let DEFAULT_CAMERA_POSITION = 10;
let MODEL_SCALE_FACTOR = 3.5;

export default class PhotoView {
  constructor ({ photo, scene, renderer, camera, closeHandler }) {
    this.photo = photo;
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;

    let controls = this.controls = new Controls(camera);
    controls.dynamicDampingFactor = 0.25;
    controls.zoomSpeed = 0.01;
    controls.panSpeed = 0.1;
    controls.minDistance = 0.01;
    controls.maxDistance = 40;
    controls.enabled = false;
    controls.addActivityMonitor(this.controlActivityMonitor.bind(this));

    let container = this.container = new THREE.Object3D();

    let spotlight = this.spotlight = new THREE.SpotLight(0xffffff, 2, 100, 0.5, 0, 1.5); // color, intensity, distance, angle, penumbra, decay
    spotlight.castShadow = true;
    container.add(spotlight);

    let ring = this.lightRing = new LightRing({ count: 3, radius: 15, y: 10, yRange: 6, distance: 200, angle: 0.5, revolutionSpeed: 0.004, castShadow: false });
    container.add(ring.obj);

    this.copsLightRing = new LightRing({ hues: [0, 0.67], radius: 10, y: 7.5, yRange: 7.5, distance: 200, angle: 0.22, revolutionSpeed: 0.003, castShadow: true });
    container.add(this.copsLightRing.obj);

    this.interface = new PhotoViewInterface({
      closeHandler,
      modelName: photo.name,
      resetCameraHandler: this.resetCamera.bind(this),
      wireframeHandler: this.wireframeButtonPressed.bind(this),
      textureHandler: this.textureButtonPressed.bind(this),
      lightingHandler: this.lightingButtonPressed.bind(this),
      backgroundHandler: this.backgroundButtonPressed.bind(this),
      printModalHandler: this.printModalHandler.bind(this),
      printImageProvider: callback => {
        let imageData = this.mostRecentPrintImageData = this.renderer.domElement.toDataURL();
        callback(imageData);
      }
    });

    this.state = {
      active: false,
      wireframe: false,
      texture: TEXTURES[0],
      background: BACKGROUNDS[0],
      lighting: LIGHTINGS[0],
      rps: 1,
      showingPrintModal: false
    };
  }

  load (callback) {
    let { photo, container, spotlight, controls } = this;

    loadModel(photo, ({ geometry, texture }) => {
      this.geometry = geometry;
      this.texture = texture;

      let mosaicTexture = this.mosaicTexture = texture.clone();
      mosaicTexture.wrapS = mosaicTexture.wrapT = THREE.RepeatWrapping;
      mosaicTexture.repeat.set(8, 8);
      mosaicTexture.needsUpdate = true;

      geometry.center();
      geometry.computeBoundingBox();
      let material = this.material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.3,
        map: texture
      });

      let toonMaterial = this.toonMaterial = new THREE.MeshToonMaterial({
        map: this.texture,
        shininess: 666,
        specular: 0x888888
      });

      material.side = toonMaterial.side = THREE.DoubleSide;

      let mesh = this.mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 1;
      mesh.castShadow = true;

      let size = geometry.boundingBox.getSize();
      let scale = MODEL_SCALE_FACTOR / size.y;
      mesh.scale.set(scale, scale, scale);

      if (photo.upsideDown) {
        mesh.rotation.x = Math.PI;
      }

      controls.modifyTarget(mesh.position);

      container.add(mesh);

      this.setWireframe(this.state.wireframe);
      this.setTexture(this.state.texture);
      this.setLighting(this.state.lighting);

      let platform = this.platform = new THREE.Mesh(
        new THREE.BoxBufferGeometry(size.x + 5, 0.25, size.z + 5),
        new THREE.MeshStandardMaterial({
          color: 0xffffff
        })
      );
      platform.receiveShadow = true;
      platform.position.set(0, -(size.y / 2) - 2, -size.z * 0.75);
      container.add(platform);

      this.setSpotlightPosition();

      if (callback) callback();
    });
  }

  setSpotlightPosition (style = 'top') {
    let { spotlight, geometry } = this;

    let size = geometry.boundingBox.getSize();
    switch (style) {
      case 'front':
        spotlight.position.set(0, size.y + 1, size.z + 10);
        break;

      case 'back':
        spotlight.position.set(0, size.y + 3, -size.z - 25);
        break;

      case 'top':
      default:
        spotlight.position.set(0, size.y + 8, size.z + 2);
        break;
    }
  }

  activate () {
    this.state.active = true;
    this.setBackground(this.state.background);
    this.scene.add(this.container);
    this.controls.enabled = true;
    this.resetCamera();

    this.interface.addToParent(document.body);
    setTimeout(() => {
      this.interface.el.classList.add('active');
    }, 0);
  }

  deactivate (permanent = true) {
    this.state.active = false;
    this.scene.background = new THREE.Color(0x000000);
    this.scene.remove(this.container);
    this.scene.remove(this.grid);
    this.grid = null;
    this.scene.remove(this.darkGrid);
    this.darkGrid = null;
    this.controls.enabled = false;

    this.interface.el.classList.remove('active');
    setTimeout(() => {
      if (!this.state.active) {
        this.interface.removeFromParent();
      }
    }, 250);

    if (permanent) {
      this.container = null;
      this.material = null;
      this.mesh = null;
      this.controls.dispose();
    }
  }

  resetCamera () {
    this.camera.position.set(0, 0, DEFAULT_CAMERA_POSITION);
    this.camera.rotation.set(0, 0, 0, 0);
    this.controls.setDefaultPosition(this.camera.position);
    this.controls.reset();
    this.state.rps = 1;
  }

  update (delta) {
    if (this.state.active && !this.state.showingPrintModal) {
      let { lighting, rps } = this.state;
      if (this.mesh && rps > 0) {
        this.mesh.rotation.y += rps * (delta / 1000);
      }

      if (lighting === 'primary') {
        this.lightRing.update(delta);
      } else if (lighting === 'cops') {
        this.copsLightRing.update(delta);
      }

      this.controls.update(delta);
    }
  }

  keydown (ev) {
    if (this.state.showingPrintModal) {
      switch (ev.keyCode) {
        case 27: // ESC
          this.interface.showPrintModal(false);
          break;
      }
      return;
    }

    switch (ev.keyCode) {
      case 32: // space
        this.resetCamera();
        break;

      case 76: // L
        this.lightingButtonPressed();
        break;

      case 84: // T
        this.textureButtonPressed();
        break;

      case 66: // B
        this.backgroundButtonPressed();
        break;

      case 77: // M
        this.wireframeButtonPressed();
        break;

      case 80: // P
        this.interface.showPrintModal(true);
        break;
    }
  }

  keyup (ev) {

  }

  mousedown (ev) {

  }

  mouseup (ev) {

  }

  mousemove (ev) {

  }

  controlActivityMonitor (isActive) {
    if (isActive) {
      this.state.rps = 0;
    }
  }

  wireframeButtonPressed () {
    this.setWireframe(!this.state.wireframe);
  }

  textureButtonPressed () {
    let index = (TEXTURES.indexOf(this.state.texture) + 1) % TEXTURES.length;
    this.setTexture(TEXTURES[index]);
  }

  lightingButtonPressed () {
    let index = (LIGHTINGS.indexOf(this.state.lighting) + 1) % LIGHTINGS.length;
    this.setLighting(LIGHTINGS[index]);
  }

  backgroundButtonPressed () {
    let backgroundIndex = (BACKGROUNDS.indexOf(this.state.background) + 1) % BACKGROUNDS.length;
    this.setBackground(BACKGROUNDS[backgroundIndex]);
  }

  printModalHandler (showing) {
    this.state.showingPrintModal = showing;
    this.controls.enabled = !showing;
  }

  setWireframe (wireframe) {
    this.state.wireframe = wireframe;

    if (this.material) {
      this.material.wireframe = wireframe;
    }

    this.interface.flashParameter(`wireframe: ${wireframe}`);
  }

  setTexture (texture) {
    this.state.texture = texture;

    if (!this.material) return;

    switch (texture) {
      case 'default':
        this.material.map = this.texture;
        this.material.color.set(0xffffff);
        this.mesh.material = this.material;
        break;

      case 'toon':
        this.mesh.material = this.toonMaterial;
        break;

      case 'empty':
      case 'purple':
      case 'yellow':
      case 'cyan':
        let colorMap = { empty: 0x666666, white: 0xffffff, yellow: 0xffff00, purple: 0xff00ff, cyan: 0x00ffff };
        this.material.map = null;
        this.material.color.set(colorMap[texture]);
        this.mesh.material = this.material;
        break;
    }

    this.mesh.needsUpdate = true;
    this.material.needsUpdate = true;

    this.interface.flashParameter(texture);
  }

  setLighting (lighting) {
    let { spotlight, lightRing, copsLightRing, state } = this;
    state.lighting = lighting;

    switch (lighting) {
      case 'white':
      case 'red':
      case 'green':
      case 'blue':
      case 'yellow':
        spotlight.intensity = lighting === 'white' ? 2 : 5;
        this.setSpotlightPosition('top');

        let colorMap = { white: 0xffffff, red: 0xff0000, green: 0x00ff00, blue: 0x0000ff, yellow: 0xffff00 };
        spotlight.color.set(colorMap[lighting]);
        break;

      case 'white front':
      case 'white back':
        spotlight.intensity = 3;
        spotlight.color.set(0xffffff);
        this.setSpotlightPosition(lighting === 'white front' ? 'front' : 'back');
        break;

      case 'primary':
        lightRing.setIntensity(1.4);
        break;

      case 'cops':
        copsLightRing.setIntensity(1.6);
        break;
    }

    if (lighting !== 'primary') lightRing.setIntensity(0);
    if (lighting !== 'cops') copsLightRing.setIntensity(0);
    if (lighting === 'primary' || lighting === 'cops') spotlight.intensity = 0;

    this.interface.flashParameter(lighting);
  }

  setBackground (background) {
    this.state.background = background;

    switch (background) {
      case 'texture':
        this.scene.background = this.texture;
        break;

      case 'mosaic':
        this.scene.background = this.mosaicTexture;
        break;

      case 'blank':
        this.scene.background = new THREE.Color(0x000000);
        break;

      case 'grid':
        this.scene.background = new THREE.Color(0xffffff);
        if (!this.grid) this.grid = createGrid({ length: 60, gridLength: 20 });
        this.scene.add(this.grid);
        break;

      case 'dark grid':
        this.scene.background = new THREE.Color(0x000000);
        if (!this.darkGrid) this.darkGrid = createGrid({ length: 60, gridLength: 10, color: 0x00ff00 });
        this.scene.add(this.darkGrid);
    }

    if (background !== 'grid' && this.grid) {
      this.scene.remove(this.grid);
    }
    if (background !== 'dark grid' && this.darkGrid) {
      this.scene.remove(this.darkGrid);
    }

    this.interface.flashParameter(background);
  }
}
