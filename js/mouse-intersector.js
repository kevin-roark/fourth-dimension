
let THREE = require('three');

export default class MouseIntersector {
  constructor ({ camera, renderer, meshes }) {
    this.camera = camera;
    this.meshes = meshes;
    this.renderer = renderer;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoverListeners = [];
    this.clickListeners = [];

    document.addEventListener('mousemove', this.move.bind(this));
    document.addEventListener('click', this.click.bind(this));
  }

  addHoverListener (fn) {
    this.hoverListeners.push(fn);
  }

  addClickListener (fn) {
    this.clickListeners.push(fn);
  }

  move (ev) {
    let intersects = this.getIntersections(ev);
    this.notifyListeners(intersects, this.hoverListeners);
  }

  click (ev) {
    let intersects = this.getIntersections(ev);
    this.notifyListeners(intersects, this.clickListeners);
  }

  notifyListeners (intersects, listeners) {
    let firstObject = intersects.length > 0 ? intersects[0].object : null;
    listeners.forEach(listener => {
      listener(firstObject, intersects);
    });
  }

  getIntersections (ev) {
    this.mouse.x = (ev.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    let intersects = this.raycaster.intersectObjects(this.meshes);
    return intersects;
  }
}
