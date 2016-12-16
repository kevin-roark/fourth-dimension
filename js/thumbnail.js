
let THREE = require('three');

let textureLoader = new THREE.TextureLoader();

export default class Thumbnail {
  constructor ({ photo, scale = 1 }) {
    this.photo = photo;
    this.scale = scale;
  }

  load (callback) {
    let { photo, scale } = this;

    let texturePath = `models/${photo.seriesPath}/${photo.path}/Thumbnail.jpg`;
    textureLoader.load(texturePath, texture => {
      let length = 1 * scale;
      let geometry = new THREE.BoxBufferGeometry(length, length, length);

      let material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.3,
        map: texture
      });
      material.side = THREE.DoubleSide;

      let mesh = this.mesh = new THREE.Mesh(geometry, material);
      mesh._thumbnail = this;
      if (callback) callback(mesh);
    });
  }
}
