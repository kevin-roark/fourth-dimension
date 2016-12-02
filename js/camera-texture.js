
// Based on stemkoski.github.io/Three.js/Camera-Texture.html
// WebGLRenderTarget docs http://threejs.org/docs/api/renderers/WebGLRenderTarget.html

let THREE = window.THREE || require('three');

export default class CameraTexture {
  constructor (options) {
    let {
      renderer, scene,
      renderTargetSize = { width: renderer.getSize().width, height: renderer.getSize().height },
      renderTargetSizeMirrorsWindow = true,
      cameraProvider = () => {
        return new THREE.PerspectiveCamera(75, renderTargetSize.width / renderTargetSize.height, 0.01, 10000);
      }
    } = options;

    this.renderer = renderer;
    this.scene = scene;
    this.renderTargetSize = renderTargetSize;
    this.renderTargetSizeMirrorsWindow = renderTargetSizeMirrorsWindow;
    this.camera = cameraProvider();

    this.cameraParent = new THREE.Object3D();
    this.cameraParent.add(this.camera);
    this.scene.add(this.cameraParent);

    this.finalRenderTarget = new THREE.WebGLRenderTarget(renderTargetSize.width, renderTargetSize.height, { format: THREE.RGBFormat });
    this.texture = this.finalRenderTarget.texture;

    // This is all for fixing the mirrored texture we get directly from alt camera
    this.screenScene = new THREE.Scene();
    this.screenCamera = this._makeScreenCamera();
    this.screenScene.add(this.screenCamera);

    this.mirroredRenderTarget = new THREE.WebGLRenderTarget(renderTargetSize.width, renderTargetSize.height, { format: THREE.RGBFormat });
    this.screenMaterial = new THREE.MeshBasicMaterial({ map: this.mirroredRenderTarget.texture });

    this.screen = this._makeScreen();
    this.screenScene.add(this.screen);

    window.addEventListener('resize', this._resize.bind(this));
  }

  _resize () {
    let s = this.renderer.getSize();

    if (this.renderTargetSizeMirrorsWindow) {
      this.finalRenderTarget.setSize(s.width, s.height);
      this.mirroredRenderTarget.setSize(s.width, s.height);
    }

    this.camera.aspect = s.width / s.height;
    this.camera.updateProjectionMatrix();

    this.screenScene.remove(this.screenCamera);
    this.screenCamera = this._makeScreenCamera();
    this.screenScene.add(this.screenCamera);

    this.screenScene.remove(this.screen);
    this.screen = this._makeScreen();
    this.screenScene.add(this.screen);
  }

  _makeScreenCamera () {
    let s = this.renderer.getSize();

    var camera = new THREE.OrthographicCamera(
      s.width / -2, s.width / 2,
      s.height / 2, s.height / -2,
      -10000, 10000
    );
    camera.position.z = 1;
    return camera;
  }

  _makeScreen () {
    let s = this.renderer.getSize();
    var screenGeometry = new THREE.PlaneBufferGeometry(s.width, s.height);
    return new THREE.Mesh(screenGeometry, this.screenMaterial);
  }

  update () {
    this.renderer.render(this.scene, this.camera, this.mirroredRenderTarget, true);
    this.renderer.render(this.screenScene, this.screenCamera, this.finalRenderTarget, true);
  }

  getCameraParent () {
    return this.cameraParent;
  }

  getCamera () {
    return this.camera;
  }
}
