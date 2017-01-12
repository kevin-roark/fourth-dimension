
import Component from './component';

export default class PhotoViewInterface extends Component {
  constructor ({ closeHandler, wireframeHandler, textureHandler, lightingHandler, backgroundHandler, printHandler }) {
    super();

    let el = this.el = this.div('photo-view-interface');

    let flashEl = this.flashEl = this.div('photo-view-parameter-flash');
    el.appendChild(flashEl);

    this.closeButton = this.div('photo-view-close-button');
    this.closeButton.addEventListener('click', closeHandler, false);
    el.appendChild(this.closeButton);

    let buttons = this.controlButtons = this.div('photo-view-control-buttons');
    el.appendChild(buttons);

    this.wireframeButton = this.div('photo-view-control-button', 'wireframe-button', 'Wireframe');
    this.wireframeButton.addEventListener('click', wireframeHandler, false);
    buttons.appendChild(this.wireframeButton);

    this.textureButton = this.div('photo-view-control-button', 'texture-button', 'Texture');
    this.textureButton.addEventListener('click', textureHandler, false);
    buttons.appendChild(this.textureButton);

    this.lightingButton = this.div('photo-view-control-button', 'lighting-button', 'Lighting');
    this.lightingButton.addEventListener('click', lightingHandler, false);
    buttons.appendChild(this.lightingButton);

    this.backgroundButton = this.div('photo-view-control-button', 'background-button', 'Background');
    this.backgroundButton.addEventListener('click', backgroundHandler, false);
    buttons.appendChild(this.backgroundButton);

    this.printButton = this.div('photo-view-control-button photo-view-print-button', 'print-button', 'PRINT');
    this.printButton.addEventListener('click', printHandler, false);
    buttons.appendChild(this.printButton);
  }

  flashParameter (name, duration = 300) {
    this.flashEl.classList.add('active');
    this.flashEl.textContent = name;

    setTimeout(() => {
      this.flashEl.textContent = '';
      this.flashEl.classList.remove('active');
    }, duration);
  }
}
