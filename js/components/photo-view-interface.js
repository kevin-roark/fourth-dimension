
import Component from './component';
import PhotoViewPrintModal from './photo-view-print-modal';

export default class PhotoViewInterface extends Component {
  constructor ({ closeHandler, wireframeHandler, textureHandler, lightingHandler, backgroundHandler, printModalHandler, printImageProvider }) {
    super();

    this.printModalHandler = printModalHandler;
    this.printImageProvider = printImageProvider;

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
    this.printButton.addEventListener('click', () => this.showPrintModal(true), false);
    this.printButton.addEventListener('mouseenter', () => this.handlePrintButtonHover(true), false);
    this.printButton.addEventListener('mouseleave', () => this.handlePrintButtonHover(false), false);
    buttons.appendChild(this.printButton);

    this.printModal = new PhotoViewPrintModal({
      closeHandler: () => this.showPrintModal(false)
    });
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
      if (!this.printToolTip) {
        this.printToolTip = this.div('photo-view-tool-tip photo-view-tool-tip-print', '', 'arrange and modify the worldly scan as you like it then press this button to get a still image :)');
        this.el.appendChild(this.printToolTip);
      }

      this.printToolTip.style.display = 'block';
    } else {
      if (this.printToolTip) {
        this.printToolTip.style.display = 'none';
      }
    }
  }

  showPrintModal (show) {
    if (show) {
      this.printModal.setImage(null);
      this.printImageProvider(image => {
        this.printModal.setImage(image);
      })

      this.el.appendChild(this.printModal.el);;
    } else {
      this.el.removeChild(this.printModal.el);
    }

    if (this.printModalHandler) {
      this.printModalHandler(show);
    }
  }
}
