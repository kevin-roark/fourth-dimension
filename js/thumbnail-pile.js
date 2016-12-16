
let THREE = require('three');
import Thumbnail from './Thumbnail';

let styles = ['spread', 'neat'];
export let pileStyles = { spread: 'spread', neat: 'neat' };

export default class ThumbnailPile {
  constructor ({ series, style = 'neat', spread = 10, scale = 10 }) {
    this.series = series;

    this.mesh = new THREE.Object3D();
    this.mesh._pile = this;

    this.state = {
      rps: 0.8,
      scale,
      style,
      spread
    };
  }

  load (callback) {
    let { series, mesh } = this;
    let remaining = series.photos.length;
    let thumbnails = this.thumbnails = [];

    series.photos.forEach(photo => {
      let thumbnail = new Thumbnail({ photo, seriesPath: series.path, scale: this.state.scale });
      thumbnail._pile = this;
      thumbnails.push(thumbnail);

      thumbnail.load(() => {
        mesh.add(thumbnail.mesh);

        remaining -= 1;
        if (callback && remaining === 0) {
          this.setStyle(this.state.style);
          callback();
        }
      });
    });
  }

  sp () {
    return (Math.random() - 0.5) * this.state.spread;
  }

  update (delta) {
    switch (this.state.style) {
      case 'spread':
        this.mesh.rotation.y += this.state.rps * (delta / 1000);
        break;

      case 'neat':
        for (let i = 0; i < this.thumbnails.length; i++) {
          let thumb = this.thumbnails[i];
          thumb.mesh.rotation.y += this.state.rps * (delta / 1000);
        }
        break;
    }
  }

  cycleStyle () {
    let styleIndex = (styles.indexOf(this.state.style) + 1) % styles.length;
    this.setStyle(styles[styleIndex]);
  }

  setStyle (style) {
    let { thumbnails, state } = this;
    state.style = style;

    switch (style) {
      case 'spread':
        thumbnails.forEach(thumbnail => {
          thumbnail.mesh.position.set(this.sp(), this.sp(), this.sp());
          thumbnail.mesh.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        });
        break;

      case 'neat':
        thumbnails.forEach((thumbnail, idx) => {
          thumbnail.mesh.position.set((state.scale + 5) * idx, 0, 0);
          thumbnail.mesh.rotation.set(0, 0, 0, 0);
        });
        break;
    }
  }
}
