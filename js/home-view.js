
let THREE = require('three');

import ThumbnailPile from './thumbnail-pile';
import MouseIntersector from './mouse-intersector';

// Modes
// Pile per collection that you arrow through
// One huge pile that you explore
// splayed out
export default class HomeView {
  constructor ({ seriesData, camera, renderer, photoClickHandler }) {
    this.seriesData = seriesData;
    this.camera = camera;
    this.renderer = renderer;
    this.photoClickHandler = photoClickHandler;

    this.piles = [];
    this.thumbnailMeshes = [];
    this.thumbnailIntersector = null;
    this.container = new THREE.Object3D();

    this.lights = new THREE.Object3D();
    this.container.add(this.lights);

    this.dom = {
      seriesTitle: document.querySelector('.series-title'),
      photoViewInterface: document.querySelector('.photo-view-interface')
    };

    this.state = {
      active: false,
      pileStyle: 'spread'
    };
  }

  update (delta) {
    for (let i = 0; i < this.piles.length; i++) {
      this.piles[i].update(delta);
    }
  }

  load (callback) {
    let { renderer, camera } = this;

    this.makeLights();
    this.makePiles(() => {
      let thumbnailIntersector = this.thumbnailIntersector = new MouseIntersector({ camera, renderer, meshes: this.thumbnailMeshes });
      thumbnailIntersector.addHoverListener(mesh => {
        if (this.state.active) {
          this.setHoverThumnbail(mesh ? mesh._thumbnail : null);
        }
      });
      thumbnailIntersector.addClickListener(mesh => {
        if (this.state.active) {
          if (this.photoClickHandler) {
            this.photoClickHandler(mesh ? mesh._thumbnail.photo : null);
          }
        }
      });

      if (callback) callback();
    });
  }

  activate (scene) {
    this.state.active = true;
    scene.add(this.container);
  }

  deactivate (scene) {
    this.state.active = false;
    scene.remove(this.container);
  }

  setHoverThumnbail (thumbnail) {
    let title = thumbnail ? `${thumbnail._pile.series.name} — ${thumbnail.photo.name}` : '';
    this.dom.seriesTitle.textContent = title;

    let cursor = thumbnail ? "url('images/basketball.png'), crosshair" : "url('images/myhand.png'), auto";
    this.dom.photoViewInterface.style.cursor = cursor;
  }

  makeLights () {
    let spotlight = new THREE.SpotLight(0xffffff, 2, 5000, 3.14, 0, 1);
    spotlight.position.set(100, 100, 100);
    shadowConfig(spotlight);
    this.lights.add(spotlight);

    let spotlight2 = new THREE.SpotLight(0xffffff, 2, 5000, 3.14, 0, 1);
    spotlight2.position.set(-100, 100, -100);
    shadowConfig(spotlight2);
    this.lights.add(spotlight2);

    function shadowConfig (light) {
      light.castShadow = true;
      light.shadow.mapSize.width = spotlight.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 1;
      light.shadow.camera.far = 500;
      light.shadow.camera.fov = 30;
    }
  }

  makePiles (callback) {
    let { seriesData, container, piles, state } = this;
    let remaining = seriesData.length;

    seriesData.forEach((series, idx) => {
      let pile = new ThumbnailPile({ series, style: state.pileStyle });
      pile.load(() => {
        piles.push(pile);
        container.add(pile.mesh);
        this.thumbnailMeshes = this.thumbnailMeshes.concat(pile.thumbnails.map(t => t.mesh));

        remaining -= 1;
        if (remaining === 0 && callback) {
          this.arrangePiles();
          callback();
        }
      });
    });
  }

  arrangePiles () {
    let style = this.state.pileStyle;
    let half = Math.floor(this.seriesData.length / 2);

    this.piles.forEach((pile, idx) => {
      let x, y;
      let z = 0;
      switch (style) {
        case 'spread': // although this does look beautiful if they are all in one big pile
          x = -21 + 60 * ((idx % half) / half);
          y = idx % 2 === 0 ? 10 : -10;
          break;

        case 'neat':
          x = -window.innerWidth / 2 + 5;
          y = window.innerHeight / 2 - 5 - idx * 15;
          break;
      }
      pile.mesh.position.set(x, y, z);
    });
  }

}
