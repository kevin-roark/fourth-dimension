
import THREE from 'three';
import Thumbnail from './Thumbnail';

export default class ThumbnailPile {
  constructor ({ series, spread = 5 }) {
    this.series = series;
    this.spread = spread;
    this.mesh = new THREE.Object3d();
  }

  load (callback) {
    let { series, mesh } = this;
    let remaining = series.photos.length;
    let thumbnails = this.thumbnails = [];

    series.photos.forEach(photo => {
      let thumbnail = new Thumbnail({ seriesPath: series.path, modelPath: photo.path });
      thumbnails.push(thumbnail);

      thumbnail.load(() => {
        thumbnail.position.set(this.sp(), this.sp(), this.sp());
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
