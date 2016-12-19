
import Component from './component';

export default class PhotoViewInterface extends Component {
  constructor ({ closeHandler, wireframeHandler, textureHandler, lightingHandler, backgroundHandler }) {
    super();

    let el = this.el = this.div('photo-view-interface');

    this.closeButton = this.div('photo-view-close-button');
    this.closeButton.addEventListener('click', closeHandler, false);
    el.appendChild(this.closeButton);

    let buttons = this.controlButtons = this.div('photo-view-control-buttons');
    el.appendChild(buttons);

    this.wireframeButton = this.div('photo-view-control-button', 'wireframe-button', 'WIREFRAME');
    this.wireframeButton.addEventListener('click', wireframeHandler, false);
    buttons.appendChild(this.wireframeButton);

    this.textureButton = this.div('photo-view-control-button', 'texture-button', 'TEXTURE');
    this.textureButton.addEventListener('click', textureHandler, false);
    buttons.appendChild(this.textureButton);

    this.lightingButton = this.div('photo-view-control-button', 'lighting-button', 'LIGHTING');
    this.lightingButton.addEventListener('click', lightingHandler, false);
    buttons.appendChild(this.lightingButton);

    this.backgroundButton = this.div('photo-view-control-button', 'background-button', 'BACKGROUND');
    this.backgroundButton.addEventListener('click', backgroundHandler, false);
    buttons.appendChild(this.backgroundButton);
  }
}
