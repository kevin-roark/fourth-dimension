
let THREE = require('three');

let textureLoader = new THREE.TextureLoader();

export default class Thumbnail {
  constructor ({ photo, scale = 1 }) {
    this.photo = photo;
    this.scale = scale;
  }

  load (callback) {
    let { photo } = this;

    let texturePath = `models/${photo.seriesPath}/${photo.path}/Thumbnail.jpg`;
    textureLoader.load(texturePath, texture => {
      let geometry = new THREE.BoxBufferGeometry(1, 1, 1);

      let material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.05,
        map: texture
      });

      let mesh = this.mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh._thumbnail = this;
      this.setScale();
      if (callback) callback(mesh);
    });
  }

  setScale (scale = this.scale) {
    this.scale = scale;
    if (this.mesh) {
      this.mesh.scale.set(scale, scale, scale);
    }
  }

  multiplyScale (f = 3) {
    if (!this.mesh) return;
    let s = this.scale * f;
    this.mesh.scale.set(s, s, s);
  }
}
