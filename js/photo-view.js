
let THREE = require('three');
let TWEEN = require('tween.js');

import loadModel from './model-cache';
import createGrid from './grid';
import LightRing from './light-ring';
import Controls from './controls';
import PhotoViewInterface from './components/photo-view-interface';

let BACKGROUNDS = ['texture', 'blank', 'grid'];
let LIGHTINGS = ['white', 'red', 'blue', 'green', 'yellow', 'primary'];
let TEXTURES = ['default', 'toon', 'empty'];
let DEFAULT_CAMERA_POSITION = 10;
let MODEL_SCALE_FACTOR = 3.5;

export default class PhotoView {
  constructor ({ photo, scene, camera, closeHandler }) {
    this.photo = photo;
    this.scene = scene;
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

    let ring = this.lightRing = new LightRing({ count: 3, radius: 15, y: 10, yRange: 6, distance: 200, angle: 0.5, revolutionSpeed: 0.004 });
    container.add(ring.obj);

    this.interface = new PhotoViewInterface({
      closeHandler,
      wireframeHandler: this.wireframeButtonPressed.bind(this),
      textureHandler: this.textureButtonPressed.bind(this),
      lightingHandler: this.lightingButtonPressed.bind(this),
      backgroundHandler: this.backgroundButtonPressed.bind(this),
      printHandler: this.printButtonPressed.bind(this)
    });

    this.state = {
      active: false,
      wireframe: false,
      texture: TEXTURES[0],
      background: BACKGROUNDS[0],
      lighting: LIGHTINGS[0],
      rps: 1
    };
  }

  load (callback) {
    let { photo, container, spotlight, controls } = this;

    loadModel(photo, ({ geometry, texture }) => {
      this.geometry = geometry;
      this.texture = texture;

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

      spotlight.position.set(0, size.y + 8, size.z + 2);

      if (callback) callback();
    });
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
    if (this.state.active) {
      let { lighting, rps } = this.state;
      if (this.mesh) {
        this.mesh.rotation.y += rps * (delta / 1000);
      }

      if (lighting === 'primary') {
        this.lightRing.update(delta);
      }

      this.controls.update(delta);
    }
  }

  keydown (ev) {
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
    let to = { rps: isActive ? 0 : 1 };
    let easing = isActive ? TWEEN.Easing.Quadratic.Out : TWEEN.Easing.Quadratic.In;
    let duration = 2500 * Math.abs(this.state.rps - to.rps);

    if (this.activityTween) {
      this.activityTween.stop();
      this.activityTween = null;
    }

    this.activityTween = new TWEEN.Tween(this.state).to(to, duration).easing(easing).start();
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

  printButtonPressed () {

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

      case 'empty':
        this.material.map = null;
        this.material.color.set(0x666666);
        this.mesh.material = this.material;
        break;

      case 'toon':
        this.mesh.material = this.toonMaterial;
        break;
    }

    this.mesh.needsUpdate = true;
    this.material.needsUpdate = true;

    this.interface.flashParameter(texture);
  }

  setLighting (lighting) {
    let { spotlight, lightRing, state } = this;
    state.lighting = lighting;

    switch (lighting) {
      case 'white':
      case 'red':
      case 'green':
      case 'blue':
      case 'yellow':
        spotlight.intensity = lighting === 'white' ? 2 : 5;
        lightRing.setIntensity(0);

        let colorMap = { white: 0xffffff, red: 0xff0000, green: 0x00ff00, blue: 0x0000ff, yellow: 0xffff00 };
        spotlight.color.set(colorMap[lighting]);
        break;

      case 'primary':
        spotlight.intensity = 0;
        lightRing.setIntensity(1.4);
        break;
    }

    this.interface.flashParameter(lighting);
  }

  setBackground (background) {
    this.state.background = background;

    switch (background) {
      case 'texture':
        this.scene.background = this.texture;
        break;

      case 'blank':
        this.scene.background = new THREE.Color(0x000000);
        break;

      case 'grid':
        this.scene.background = new THREE.Color(0xffffff);
        if (!this.grid) this.grid = createGrid({ length: 60, gridLength: 20 });
        this.scene.add(this.grid);
        break;
    }

    if (background !== 'grid' && this.grid) {
      this.scene.remove(this.grid);
    }

    this.interface.flashParameter(background);
  }
}
