
import Component from './component';
import { uploadImage } from '../print-service';
import { toPath } from '../data-util';

export default class PhotoViewPrintModal extends Component {
  constructor ({ modelName, closeHandler }) {
    super();

    this.modelName = modelName;
    this.state = {
      uploading: false,
      uploaded: false
    };

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
       Also, you can receive a high-quality physical print of the image and support my work in the process
       just by sending me some money on PayPal — sounds fun!!
       Thank you thank you thank you for entering... <b>MY WORLD</b>.`,
    true);
    modal.append(this.tip);

    this.uploadZone = this.div('photo-view-print-modal-upload-zone', '', '¡Click here to upload your image for printing!');
    this.uploadZone.addEventListener('click', this.uploadZoneClick.bind(this));
    modal.append(this.uploadZone);

    this.eightInchButton = this.link({
      className: 'photo-view-print-modal-buy-button',
      url: 'https://paypal.me/Roark/5',
      text: 'Order 8" Print - $5',
      blank: true
    });
    modal.appendChild(this.eightInchButton);
  }

  setImageData (imageData) {
    this.imageData = imageData;
    this.previewImage.src = imageData || '';
  }

  makeTextBorder (position = 'top') {
    let border = this.div(`photo-view-print-modal-text-border ${position}`, '', 'PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD PRINT MY WORLD');
    this.modal.appendChild(border);
  }

  uploadZoneClick () {
    if (this.state.uploading || this.state.uploaded) return;

    this.modal.classList.add('image-uploading');
    this.state.uploading = true;

    uploadImage(toPath(this.modelName), this.imageData, (err, res) => {
      this.modal.classList.remove('image-uploading');
      this.state.uploading = false;

      if (err) {
        // TODO: error state
        console.log(err);
        return;
      }

      this.uploadZone.innerHTML =
        `Your image ID: ${res.id}.<br/></br>
        Be <b>sure</b> to include this in your personal PayPal note, as well as your <b>shipping address</b> so I can know what to print!
        You are welcome and encouraged to contact me at <a href="mailto:kevin.e.roark@gmail.com">kevin.e.roark@gmail.com</a> with any questions or sentences!`;
      this.state.uploaded = true;
      this.modal.classList.add('image-uploaded');
    });
  }
}
