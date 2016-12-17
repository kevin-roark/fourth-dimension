
let THREE = require('three');
import Thumbnail from './Thumbnail';
import cameras from './cameras';

export default class ThumbnailPile {
  constructor ({ series, style = 'neat', viewport = cameras.getOrthographicViewport() }) {
    this.series = series;

    this.mesh = new THREE.Object3D();
    this.mesh._pile = this;

    this.state = {
      rps: 0.8,
      collectionWidthPercentage: 0.45,
      collectionHeightPercentage: 0.8,
      crazyWidthPercentage: 0.8,
      crazyHeightPercentage: 0.8,
      style,
      viewport
    };
  }

  load (callback) {
    let { series, mesh } = this;
    let remaining = series.photos.length;
    let thumbnails = this.thumbnails = [];

    series.photos.forEach(photo => {
      let thumbnail = new Thumbnail({ photo, seriesPath: series.path, scale: this.scaleForStyle() });
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

  update (delta) {
    switch (this.state.style) {
      case 'collection':
      case 'crazy':
        this.mesh.rotation.y += this.state.rps * (delta / 1000);
        break;

      case 'neat':
        for (let i = 0; i < this.thumbnails.length; i++) {
          let thumb = this.thumbnails[i];
          // thumb.mesh.rotation.y += this.state.rps * (delta / 1000);
          // thumb.mesh.position.x += (Math.random() - 0.5) * 0.02;
          // thumb.mesh.position.y += (Math.random() - 0.5) * 0.02;
          // thumb.mesh.position.z += (Math.random() - 0.5) * 0.02;
          thumb.mesh.rotation.x += (Math.random() - 0.5) * 0.1;
          thumb.mesh.rotation.y += (Math.random() - 0.5) * 0.1;
          thumb.mesh.rotation.z += (Math.random() - 0.5) * 0.1;
        }
        break;
    }
  }

  setStyle (style = this.state.style) {
    let { thumbnails, state } = this;
    state.style = style;

    let { viewport } = state;
    let scale = this.scaleForStyle(style);
    let ws = viewport.width - scale / 2;
    let hs = viewport.height - scale / 2;

    thumbnails.forEach(t => {
      t.setScale(scale)

      if (t._pedestalMesh && style !== 'neat') {
        this.mesh.remove(t._pedestalMesh);
        t._pedestalMesh = null;
      }
    });

    switch (style) {
      case 'collection':
        thumbnails.forEach(thumbnail => {
          let sp = w => (Math.random() - 0.5) * (w ? (ws * state.collectionWidthPercentage) : (hs * state.collectionHeightPercentage));
          thumbnail.mesh.position.set(sp(true), sp(false), sp(true));
          thumbnail.mesh.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        });
        break;

      case 'crazy':
        thumbnails.forEach(thumbnail => {
          let sp = w => (Math.random() - 0.5) * (w ? (ws * state.crazyWidthPercentage) : (hs * state.crazyHeightPercentage));
          thumbnail.mesh.position.set(sp(true), sp(false), sp(true));
          thumbnail.mesh.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        });
        break;

      case 'neat':
        this.mesh.rotation.y = 0;
        let x = 0;
        let y = 0;
        let space = this.state.viewport.width * 0.025;
        thumbnails.forEach((thumbnail, idx) => {
          thumbnail.mesh.position.set(x, y, 0);
          thumbnail.mesh.rotation.set(0, 0, 0, 0);
          x += scale + space;
          if (x + scale > ws) {
            x = 0;
            y -= (scale + space * 0.2);
          }

          if (!thumbnail._pedestalMesh) {
            let pedestal = thumbnail._pedestalMesh = new THREE.Mesh(
              new THREE.BoxBufferGeometry(1, 0.25, 1),
              new THREE.MeshStandardMaterial({
                color: 0xffffff
              })
            );
            pedestal.receiveShadow = true;
            pedestal.scale.copy(thumbnail.mesh.scale);
            pedestal.position.set(thumbnail.mesh.position.x, thumbnail.mesh.position.y - thumbnail.mesh.scale.y * 1.2, thumbnail.mesh.position.z);
            this.mesh.add(pedestal);
          }
        });
        break;
    }
  }

  setViewport (viewport = this.state.viewport) {
    this.state.viewport = viewport;
    this.setStyle();
  }

  scaleForStyle (style = this.state.style) {
    switch (style) {
      case 'collection':
        return this.state.viewport.width * 0.1;

      case 'crazy':
        return this.state.viewport.width * 0.08;

      case 'neat':
        return this.state.viewport.width * 0.025;
    }
  }

  getHeight () {
    switch (this.state.style) {
      case 'collection':
        return this.state.viewport.height * this.state.collectionHeightPercentage;

      case 'crazy':
        return this.state.viewport.height * this.state.crazyHeightPercentage;

      case 'neat':
        return Math.abs(this.thumbnails[this.thumbnails.length - 1].mesh.position.y) + this.scaleForStyle();
    }
  }
}
