
let THREE = require('three');
let TWEEN = require('tween.js');

export default class LightCloud {
  constructor (options = {}) {
    let { count = 3, spread = 8, color = 0xffffff, intensity = 1, distance = 10, decay = 2 } = options;
    this.count = count;
    this.spread = spread;

    this.active = false;
    this.container = new THREE.Object3D();

    this.lights = [];
    for (let i = 0; i < count; i++) {
      let light = new THREE.PointLight(color, intensity, distance, decay);
      let pos = this.pos();
      light.position.set(pos.x, pos.y, pos.z);
      this.lights.push(light);
      this.container.add(light);
    }
  }

  setActive (active) {
    if (active === this.active) {
      return;
    }

    this.active = active;
    if (active) {
      let setupPositionTween = light => {
        new TWEEN.Tween(light.position)
          .to(this.pos(), 1000 + Math.random() * 6000)
          .start()
          .onComplete(() => setupPositionTween(light));
      };

      this.lights.forEach(setupPositionTween);
    } else {
      this.lights.forEach(light => {
        if (light._tween) {
          light._tween.stop();
          light._tween = null;
        }
      });
    }
  }

  setIntensity (intensity) {
    this.lights.forEach(l => (l.intensity = intensity));
  }

  setColor (color) {
    this.lights.forEach(l => (l.color.set(color)));
  }

  pos () {
    let { spread } = this;
    return new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
  }
}
