
export default class Controls {
  constructor ({ camera }) {
    this.camera = camera;
    this.speed = { x: 2, y: 2, z: -5 };

    this.state = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
  }

  update (delta) {
    let { camera, state, speed } = this;
    let { forward, backward, left, right, up, down } = state;

    let mult = delta / 1000;

    if (forward) camera.position.z += speed.z * mult;
    if (backward) camera.position.z -= speed.z * mult;
    if (left) camera.position.x += speed.x * mult;
    if (right) camera.position.x -= speed.x * mult;
    if (up) camera.position.y += speed.y * mult;
    if (down) camera.position.y -= speed.y * mult;
  }

  keydown (ev) {
    switch (ev.keyCode) {
      case 90:
        this.state.forward = true;
        break;

      case 88:
        this.state.backward = true;
        break;

      case 87:
      case 38:
        this.state.up = true;
        break;

      case 83:
      case 40:
        this.state.down = true;
        break;

      case 81:
      case 37:
        this.state.right = true;
        break;

      case 68:
      case 39:
        this.state.left = true;
        break;
    }
  }

  keyup (ev) {
    switch (ev.keyCode) {
      case 90:
        this.state.forward = false;
        break;

      case 88:
        this.state.backward = false;
        break;

      case 87:
      case 38:
        this.state.up = false;
        break;

      case 83:
      case 40:
        this.state.down = false;
        break;

      case 81:
      case 37:
        this.state.right = false;
        break;

      case 68:
      case 39:
        this.state.left = false;
        break;
    }
  }
}
