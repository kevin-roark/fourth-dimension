
let THREE = require('three');
import loadModel from './model-cache';
import createGrid from './grid';

let BACKGROUNDS = ['texture', 'black', 'grid'];

export default class PhotoView {
  constructor ({ photo, scene }) {
    this.photo = photo;
    this.scene = scene;

    this.container = new THREE.Object3D();
    this.state = {
      active: false,
      showTexture: true,
      wireframe: false,
      background: 'texture',
      rps: 2
    };
  }

  load (callback) {
    let { photo, container } = this;

    loadModel(photo, ({ geometry, texture }) => {
      this.geometry = geometry;
      this.texture = texture;

      geometry.center();

      let material = this.material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.3,
        map: texture
      });
      material.side = THREE.DoubleSide;

      let mesh = this.mesh = new THREE.Mesh(geometry, material);
      container.add(mesh);

      this.setWireframe(this.state.wireframe);
      this.setShowTexture(this.state.showTexture);

      if (callback) callback();
    });
  }

  activate () {
    this.state.active = true;
    this.setBackground(this.state.background);
    this.scene.add(this.container);
  }

  deactivate (permanent = true) {
    this.state.active = false;
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.remove(this.container);
    this.grid = null;

    if (permanent) {
      this.container = null;
      this.material = null;
      this.mesh = null;
    }
  }

  update (delta) {
    if (this.state.active) {
      if (this.mesh) {
        this.mesh.rotation.y += this.state.rps * (delta / 1000);
      }
    }
  }

  keydown (ev) {

  }

  mousedown (ev) {

  }

  mouseup (ev) {

  }

  mousemove (ev) {

  }

  wireframeButtonPressed () {
    this.setWireframe(!this.state.wireframe);
  }

  textureButtonPressed () {
    this.setShowTexture(!this.state.showTexture);
  }

  lightingButtonPressed () {

  }

  backgroundButtonPressed () {
    let backgroundIndex = (BACKGROUNDS.indexOf(this.state.background) + 1) % BACKGROUNDS.length;
    this.setBackground(BACKGROUNDS[backgroundIndex]);
  }

  setWireframe (wireframe) {
    this.state.wireframe = wireframe;

    if (this.material) {
      this.material.wireframe = wireframe;
    }
  }

  setShowTexture (showTexture) {
    this.state.showTexture = showTexture;

    if (this.material) {
      if (showTexture) {
        this.material.color.setHex(0xffffff);
        this.material.map = this.texture;
      } else {
        this.material.color.setHex(0x888888);
        this.material.map = null;
      }
    }
  }

  setBackground (background) {
    this.state.background = background;

    switch (background) {
      case 'texture':
        this.scene.background = this.texture;
        break;

      case 'black':
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
  }
}
