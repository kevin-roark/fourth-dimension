
import Component from './component';

export default class PhotoViewPrintModal extends Component {
  constructor ({ closeHandler }) {
    super();

    this.el = this.div('window-wrapper');

    let modal = this.modal = this.div('photo-view-print-modal');
    this.el.appendChild(modal);

    ['top', 'right', 'bottom', 'left'].forEach(p => this.makeTextBorder(p));

    this.closeButton = this.div('photo-view-print-modal-close-button');
    this.closeButton.addEventListener('click', closeHandler, false);
    modal.appendChild(this.closeButton);

    let canvas = this.canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 300;
    canvas.className = 'photo-view-print-modal-image-canvas';
    modal.appendChild(canvas);
  }

  setImage (image) {
    let context = this.canvas.getContext('2d');
    context.clearRect(0, 0, 400, 300);

    if (image) {
      context.drawImage(image, 0, 0, 400, 300);
    } else {
      context.fillStyle = '#878787';
      context.fillRect(0, 0, 400, 300);
    }
  }

  makeTextBorder (position = 'top') {
    let border = this.div(`photo-view-print-modal-text-border ${position}`, '', 'PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD');
    this.modal.appendChild(border);
  }
}
