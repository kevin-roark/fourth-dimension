
let THREE = require('three');
import loadModel from './model-cache';

export default class PhotoView {
  constructor ({ photo, scene }) {
    this.photo = photo;
    this.scene = scene;

    this.container = new THREE.Object3D();
    this.state = {
      material: true
    };
  }

  load (callback) {
    let { photo, container } = this;

    loadModel(photo, ({ geometry, texture }) => {
      this.geometry = geometry;
      this.texture = texture;

      let material = this.material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.3,
        map: texture
      });
      material.side = THREE.DoubleSide;

      let mesh = this.mesh = new THREE.Mesh(geometry, material);
      container.add(mesh);

      if (callback) callback();
    });
  }

  activate () {
    this.scene.background = this.texture;
    this.scene.add(this.container);
  }

  deactivate () {
    this.scene.background = null;
    this.scene.remove(this.container);
  }

  keydown (ev) {

  }

  mousedown (ev) {

  }

  mouseup (ev) {

  }

  mousemove (ev) {

  }
}
