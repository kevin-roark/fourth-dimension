
let THREE = require('three');
import Thumbnail from './Thumbnail';

export default class ThumbnailPile {
  constructor ({ series, spread = 5 }) {
    this.series = series;
    this.spread = spread;
    this.mesh = new THREE.Object3D();
  }

  load (callback) {
    let { series, mesh } = this;
    let remaining = series.photos.length;
    let thumbnails = this.thumbnails = [];

    series.photos.forEach(photo => {
      let thumbnail = new Thumbnail({ seriesPath: series.path, modelPath: photo.path, scale: 2 });
      thumbnails.push(thumbnail);

      thumbnail.load(() => {
        thumbnail.mesh.position.set(this.sp(), this.sp(), this.sp());
        thumbnail.mesh.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        mesh.add(thumbnail.mesh);

        remaining -= 1;
        if (callback && remaining === 0) {
          callback();
        }
      });
    });
  }

  sp () {
    return (Math.random() - 0.5) * this.spread;
  }
}
