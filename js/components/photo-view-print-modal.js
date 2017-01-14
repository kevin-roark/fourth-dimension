
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
    canvas.className = 'photo-view-print-modal-image-canvas';
    modal.appendChild(canvas);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize () {
    let width = window.innerWidth >= 800 ? 400 : window.innerWidth * 0.48;
    let height = (window.innerHeight / window.innerWidth) * width;

    this.size = { width, height };
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  setImage (image) {
    let { canvas, size } = this;
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      context.drawImage(image, 0, 0, size.width, size.height);
    } else {
      context.fillStyle = '#878787';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  makeTextBorder (position = 'top') {
    let border = this.div(`photo-view-print-modal-text-border ${position}`, '', 'PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD');
    this.modal.appendChild(border);
  }
}
