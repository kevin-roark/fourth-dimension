
let THREE = require('three');
let TWEEN = require('tween.js');

export default class LightRing {
  constructor (options = {}) {
    let {
      count = 6,
      radius = 150,
      y = 20,
      yRange = null,
      saturation = 1.0,
      lightness = 0.5,
      intensity = 1,
      distance = 500,
      angle = 0.4,
      penumbra = 0,
      decay = 2,
      revolutionSpeed = 0.002
    } = options;

    this.count = count;
    this.intensity = intensity;
    this.y = y;
    this.yRange = yRange;

    this.obj = new THREE.Object3D();

    this.lights = [];
    for (let i = 0; i < count; i++) {
      let hue = (i / count) * 1.0;
      let color = new THREE.Color().setHSL(hue, saturation, lightness);

      let light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
      light.castShadow = true;
      light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
      light.shadow.camera.far = 4000;
      light.shadow.camera.fov = 30;

      this.obj.add(light);
      this.lights.push(light);
    }

    this.setRadius(radius);

    this.rotate();
    this.rotating = true;
    this.revolutionSpeed = revolutionSpeed;
  }

  update () {
    if (this.rotating) {
      let speed = this.revolutionSpeed;
      this.rotate(speed, { relative: true });

      if (this.yRange) {
        for (let i = 0; i < this.lights.length; i++) {
          let light = this.lights[i];
          let up = light._yDirection === 'up';
          light.position.y += up ? speed : -speed;
          if (up && light.position.y > this.y + this.yRange) {
            light._yDirection = 'down';
          } else if (!up && light.position.y < this.y - this.yRange) {
            light._yDirection = 'up';
          }
        }
      }
    }
  }

  setRevolutionSpeed (rs) {
    this.revolutionSpeed = rs;
    return this;
  }

  setIntensity (i, { duration = 0 } = {}) {
    if (duration <= 0) {
      this.intensity = i;
      this.lights.forEach(light => {
        light.intensity = i;
      });
    } else {
      let tweener = { i: this.intensity };
      new TWEEN.Tween(tweener).to({ i }, duration).onUpdate(() => {
        for (var idx = 0; idx < this.lights.length; idx++) {
          this.lights[idx].intensity = tweener.i;
        }
      }).start();
    }

    return this;
  }

  rotate (y = Math.random() * 2 * Math.PI, { duration = 0, relative = false } = {}) {
    if (duration <= 0) {
      this.obj.rotation.y = relative ? this.obj.rotation.y + y : y;
    } else {
      let target = { y };
      if (relative) target.y += this.obj.rotation.y;
      new TWEEN.Tween(this.obj.rotation).to(target, duration).start();
    }

    return this;
  }

  setRadius (r) {
    this.radius = r;

    this.lights.forEach((light, i) => {
      let radialAngle = (i / this.count) * Math.PI * 2;
      let x = r * Math.cos(radialAngle);
      let z = r * Math.sin(radialAngle);
      let y = this.yRange ? (this.y - this.yRange) + ((i / (this.count - 1)) * this.yRange * 2) : this.y;
      console.log(y);
      light.position.set(x, y, z);
      light._yDirection = i < this.count / 2 ? 'up' : 'down';
    });

    return this;
  }

}
