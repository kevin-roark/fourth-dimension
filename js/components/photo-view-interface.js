
import Component from './component';
import PhotoViewPrintModal from './photo-view-print-modal';
import playSound from '../audio';

export default class PhotoViewInterface extends Component {
  constructor ({ modelName, closeHandler, resetCameraHandler, wireframeHandler, textureHandler, lightingHandler, backgroundHandler, printModalHandler, printImageProvider }) {
    super();

    this.modelName = modelName;
    this.printModalHandler = printModalHandler;
    this.printImageProvider = printImageProvider;

    let el = this.el = this.div('photo-view-interface');

    let flashEl = this.flashEl = this.div('photo-view-parameter-flash');
    el.appendChild(flashEl);

    this.closeButton = this.div('photo-view-close-button');
    this.closeButton.addEventListener('click', () => {
      playSound('buzzer');
      if (closeHandler) {
        closeHandler();
      }
    }, false);
    el.appendChild(this.closeButton);

    let movementTip = this.div('photo-view-movement-tip', '', 'Move and pan to explore :)');
    el.appendChild(movementTip);

    let buttons = this.controlButtons = this.div('photo-view-control-buttons');
    el.appendChild(buttons);

    this.resetCameraButton = this.div('photo-view-control-button', 'reset-position-button', 'Reset Camera');
    this.setupButton(this.resetCameraButton, resetCameraHandler, 'spacebar');
    buttons.appendChild(this.resetCameraButton);

    this.wireframeButton = this.div('photo-view-control-button', 'wireframe-button', 'Wireframe');
    this.setupButton(this.wireframeButton, wireframeHandler, '"M"');
    buttons.appendChild(this.wireframeButton);

    this.textureButton = this.div('photo-view-control-button', 'texture-button', 'Texture');
    this.setupButton(this.textureButton, textureHandler, '"T"');
    buttons.appendChild(this.textureButton);

    this.lightingButton = this.div('photo-view-control-button', 'lighting-button', 'Lighting');
    this.setupButton(this.lightingButton, lightingHandler, '"L"');
    buttons.appendChild(this.lightingButton);

    this.backgroundButton = this.div('photo-view-control-button', 'background-button', 'Background');
    this.setupButton(this.backgroundButton, backgroundHandler, '"B"');
    buttons.appendChild(this.backgroundButton);

    this.printButton = this.div('photo-view-control-button photo-view-print-button', 'print-button', 'PRINT');
    this.setupButton(this.printButton, () => this.showPrintModal(true));
    this.printButton.addEventListener('mouseenter', () => this.handlePrintButtonHover(true), false);
    this.printButton.addEventListener('mouseleave', () => this.handlePrintButtonHover(false), false);
    buttons.appendChild(this.printButton);

    this.toolTip = this.div('photo-view-tool-tip');
    this.el.appendChild(this.toolTip);
  }

  setupButton (button, handler, shortcut) {
    if (shortcut) {
      button.addEventListener('mouseenter', () => {
        this.toolTip.textContent = `Shortcut: ${shortcut}`;
      });
      button.addEventListener('mouseleave', () => {
        this.toolTip.textContent = '';
      });
    }

    button.addEventListener('click', () => {
      playSound();
      if (handler) {
        handler();
      }
    }, false);
  }

  flashParameter (name, duration = 300) {
    this.flashEl.classList.add('active');
    this.flashEl.textContent = name;

    setTimeout(() => {
      this.flashEl.textContent = '';
      this.flashEl.classList.remove('active');
    }, duration);
  }

  handlePrintButtonHover (hovering) {
    if (hovering) {
      this.toolTip.textContent = 'arrange and modify the worldly scan as you like it then press this button to get a still image :)';
    } else {
      this.toolTip.textContent = '';
    }
  }

  showPrintModal (show) {
    if (show) {
      this.printModal = new PhotoViewPrintModal({
        modelName: this.modelName,
        closeHandler: () => this.showPrintModal(false)
      });

      this.printImageProvider(imageData => {
        this.printModal.setImageData(imageData);
      });

      this.el.appendChild(this.printModal.el);
    } else {
      this.el.removeChild(this.printModal.el);
      this.printModal = null;
    }

    if (this.printModalHandler) {
      this.printModalHandler(show);
    }
  }
}
