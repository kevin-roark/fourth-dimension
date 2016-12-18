
let THREE = require('three');
let TWEEN = require('tween.js');

import ThumbnailPile from './thumbnail-pile';
import MouseIntersector from './mouse-intersector';
import cameras from './cameras';

let pileStyles = ['collection', 'crazy', 'neat'];

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
      photoViewInterface: document.querySelector('.photo-view-interface'),
      neatTitleContainer: this.createNeatTitleContainer()
    };

    this.state = {
      active: false,
      pileStyle: 'collection',
      collectionPile: null,
      pileOverflowTween: null,
      hoverThumbnail: null
    };

    window.addEventListener('keydown', this.keydown.bind(this), false);
  }

  update (delta) {
    for (let i = 0; i < this.piles.length; i++) {
      this.piles[i].update(delta);
    }

    for (let i = 0; i < this.lights.children.length; i++) {
      if (this.lights.children[i]._helper) {
        this.lights.children[i]._helper.update();
      }
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

  keydown (ev) {
    if (!this.state.active) return;

    switch (ev.keyCode) {
      case 37:
        this.cycleCollectionPile(false);
        break;

      case 39:
        this.cycleCollectionPile(true);
        break;

      case 32:
        this.cyclePileStyle();
        break;
    }
  }

  resize () {
    this.arrangePiles();
  }

  setHoverThumnbail (thumbnail) {
    let title = thumbnail ? `${thumbnail._pile.series.name} — ${thumbnail.photo.name}` : '';
    this.dom.seriesTitle.textContent = title;

    let cursor = thumbnail ? "url('images/basketball.png'), crosshair" : "url('images/myhand.png'), auto";
    this.dom.photoViewInterface.style.cursor = cursor;

    if (this.state.hoverThumbnail) {
      this.state.hoverThumbnail.setScale();
    }

    if (thumbnail) {
      thumbnail.multiplyScale(this.hoverScaleForPileStyle());
    }

    this.state.hoverThumbnail = thumbnail;
  }

  makeLights () {
    let shadowConfig = light => {
      light.castShadow = true;
      light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 1;
      light.shadow.camera.far = 1000;
      light.shadow.camera.fov = 120;
    };

    let setupPositionTween = light => {
      let viewport = cameras.getOrthographicViewport();
      console.log(light.position);
      new TWEEN.Tween(light.position)
        .to({
          x: (Math.random() - 0.5) * viewport.width * 2,
          y: (Math.random() - 0.5) * viewport.height * 2,
          z: -50 + Math.random() * 450
        }, 5000)
        .start()
        .onComplete(() => setupPositionTween(light));
    };

    let pointlight0 = new THREE.PointLight(0xffffff, 0.4, 5000, 2);
    pointlight0.position.set(100, 100, 300);
    shadowConfig(pointlight0);
    this.lights.add(pointlight0);

    let pointlight1 = new THREE.PointLight(0x0000ff, 0.3, 5000, 2);
    pointlight1.position.set(-100, -25, 300);
    shadowConfig(pointlight1);
    setupPositionTween(pointlight1);
    this.lights.add(pointlight1);

    let pointlight2 = new THREE.PointLight(0xff0000, 0.3, 5000, 2);
    pointlight2.position.set(100, 25, 300);
    shadowConfig(pointlight2);
    setupPositionTween(pointlight2);
    this.lights.add(pointlight2);

    let pointlight3 = new THREE.PointLight(0xffff00, 0.3, 5000, 2);
    pointlight3.position.set(0, 0, 300);
    shadowConfig(pointlight3);
    setupPositionTween(pointlight3);
    this.lights.add(pointlight3);
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
          this.state.collectionPile = piles[0];
          this.arrangePiles();
          callback();
        }
      });
    });
  }

  cyclePileStyle () {
    let styleIndex = (pileStyles.indexOf(this.state.pileStyle) + 1) % pileStyles.length;
    this.setPileStyle(pileStyles[styleIndex]);
  }

  setPileStyle (pileStyle = this.state.pileStyle) {
    this.state.pileStyle = pileStyle;
    this.arrangePiles();
  }

  arrangePiles () {
    let style = this.state.pileStyle;
    let viewport = cameras.getOrthographicViewport();

    if (this.state.pileOverflowTween) {
      this.state.pileOverflowTween.stop();
      this.camera.position.y = 0;
    }

    this.piles.forEach((pile, idx) => {
      pile.state.viewport = viewport;
      pile.setStyle(style);
    });

    switch (style) {
      case 'collection':
        let collectionPileIndex = this.piles.indexOf(this.state.collectionPile);
        this.piles.forEach((p, idx) => p.mesh.position.set((idx - collectionPileIndex) * viewport.width, 0, -25));
        break;

      case 'crazy':
        this.piles.forEach(p => p.mesh.position.set((Math.random() - 0.5) * viewport.width * 0.25, (Math.random() - 0.5) * viewport.height * 0.25, -50));
        break;

      case 'neat': {
        let rowSpacing = 6;
        let y = viewport.height / 2 - 5;
        this.piles.forEach(p => {
          p.mesh.position.set(-viewport.width / 2 + 5, y, 0);
          y -= (p.getHeight() + rowSpacing);
        });

        let overflow = (viewport.height / -2) - (y + rowSpacing);
        if (overflow > 0) {
          let to = { y: -overflow };
          let speed = 1.5; // units per second
          let duration = (overflow / speed) * 1000;
          this.state.pileOverflowTween = new TWEEN.Tween(this.camera.position).to(to, duration).delay(3000).repeat(Infinity).yoyo(true).start();
        }
      } break;
    }
  }

  hoverScaleForPileStyle (style = this.state.pileStyle) {
    switch (style) {
      case 'neat':
        return 4;

      case 'collection':
      case 'crazy':
      default:
        return 1.4;
    }
  }

  cycleCollectionPile (forward = true) {
    let delta = forward ? 1 : -1;
    let collectionPileIndex = this.piles.indexOf(this.state.collectionPile) + delta;
    if (collectionPileIndex < 0) collectionPileIndex = this.piles.length - 1;
    if (collectionPileIndex > this.piles.length - 1) collectionPileIndex = 0;
    this.setCollectionPile(this.piles[collectionPileIndex]);
  }

  setCollectionPile (collectionPile) {
    this.state.collectionPile = collectionPile;

    let viewport = cameras.getOrthographicViewport();
    let collectionPileIndex = this.piles.indexOf(collectionPile);

    if (this.state.pileStyle === 'collection') {
      this.piles.forEach((pile, idx) => {
        if (pile._collectionTween) {
          pile._collectionTween.stop();
        }

        let to = { x: (idx - collectionPileIndex) * viewport.width };
        pile._collectionTween = new TWEEN.Tween(pile.mesh.position).to(to, 500).easing(TWEEN.Easing.Quadratic.InOut).start();
      });
    }
  }

  createNeatTitleContainer () {
    let el = document.createElement('div');
    el.className = 'home-view-neat-title-container';
    return el;
  }

  activateNeatTitles () {
    let viewport = cameras.getOrthographicViewport();

    this.piles.forEach(pile => {
      let el = document.createElement('div');
      el.className = 'home-view-neat-title';
      el.textContent = pile.series.name;
      console.log(pile.series.name, pile.mesh.position.y, cameras.worldUnitsInPixels(pile.mesh.position.y), viewport.height / 2);
      el.style.bottom = cameras.worldUnitsInPixels(pile.mesh.position.y + viewport.height / 2) + 'px';
      this.dom.neatTitleContainer.appendChild(el);
    });

    document.body.appendChild(this.dom.neatTitleContainer);
  }

  deactivateNeatTitles () {
    this.dom.neatTitleContainer.innerHTML = '';
    if (this.dom.neatTitleContainer.parentNode) {
      this.dom.neatTitleContainer.parentNode.removeChild(this.dom.neatTitleContainer);
    }
  }
}
