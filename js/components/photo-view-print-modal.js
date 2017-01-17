
import Component from './component';
import { uploadImage } from '../print-service';

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

    let previewImage = this.previewImage = document.createElement('img');
    previewImage.className = 'photo-view-print-modal-image-preview';
    previewImage.addEventListener('click', () => {
      window.open(previewImage.src, '_blank');
    }, false);
    modal.appendChild(previewImage);

    this.tip = this.div('photo-view-print-modal-text-tip', '',
      `You can download the above model-image by clicking it. Please enjoy!!<br><br>
       You can receive a high-quality physical print of the image and support my work in the process
       by sending me some money on PayPal — be sure to enter the image ID shown when you click below and your shipping
       address in the personal note!
       You are welcome to contact me at kevin.e.roark@gmail.com with any questions or comments!
       Thank you for entering MY WORLD.`,
    true);
    modal.append(this.tip);

    this.eightInchButton = this.div('photo-view-print-modal-buy-button', '', 'Order 8" Print - $5');
    this.eightInchButton.addEventListener('click', () => this.buyButtonClick('https://paypal.me/Roark/5'));
    modal.appendChild(this.eightInchButton);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize () {

  }

  setImageData (imageData) {
    this.imageData = imageData;
    this.previewImage.src = imageData || '';
  }

  makeTextBorder (position = 'top') {
    let border = this.div(`photo-view-print-modal-text-border ${position}`, '', 'PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD');
    this.modal.appendChild(border);
  }

  buyButtonClick (successURL) {
    uploadImage(this.imageData, (err, res) => {
      if (err) {
        // TODO: error state
        console.log(err);
        return;
      }

      // TODO: show the ID
      console.log(res.id, res.url);

      window.open(successURL, '_blank');
    });
  }
}
