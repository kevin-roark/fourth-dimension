
import Component from './component';
import { uploadImage } from '../print-service';
import { toPath } from '../data-util';
import playSound from '../audio';

export default class PhotoViewPrintModal extends Component {
  constructor ({ modelName, closeHandler }) {
    super();

    this.modelName = modelName;
    this.state = {
      uploading: false,
      uploaded: false
    };

    let close = () => {
      playSound('buzzer');
      if (closeHandler) closeHandler();
    };

    this.el = this.div('window-wrapper');
    this.el.addEventListener('click', ev => {
      if (ev.target === this.el) {
        close();
      }
    }, false);

    let modal = this.modal = this.div('photo-view-print-modal');
    this.el.appendChild(modal);

    ['top', 'right', 'bottom', 'left'].forEach(p => this.makeTextBorder(p));

    this.closeButton = this.div('photo-view-print-modal-close-button');
    this.closeButton.addEventListener('click', close, false);
    modal.appendChild(this.closeButton);

    let content = this.content = this.div('photo-view-print-modal-content');
    modal.appendChild(content);

    let previewImage = this.previewImage = document.createElement('img');
    previewImage.className = 'photo-view-print-modal-image-preview';
    previewImage.addEventListener('click', () => {
      window.open(previewImage.src, '_blank');
    }, false);
    previewImage.addEventListener('load', () => {
      if (previewImage.height > previewImage.width) {
        previewImage.classList.remove('horizontal');
        previewImage.classList.add('vertical');
      } else {
        previewImage.classList.remove('vertical');
        previewImage.classList.add('horizontal');
      }
    });
    content.appendChild(previewImage);

    this.tip = this.div('photo-view-print-modal-text-tip', '',
      `You can download the above model-image by clicking it. Please enjoy and cherish your image!!<br><br>
       Thank you thank you thank you for entering... <b>MY WORLD</b>.<br><br>
       Also, you can purchase a high-quality paper print of the image and support my work in the process
       just by sending me some money on PayPal — sounds fun yes!!?`,
    true);
    content.append(this.tip);

    this.errorZone = this.div('photo-view-print-modal-error');
    content.append(this.errorZone);

    this.uploadZone = this.div('photo-view-print-modal-upload-zone', '', '¡Click here to upload your image for printing!');
    this.uploadZone.addEventListener('click', this.uploadZoneClick.bind(this));
    content.append(this.uploadZone);

    let buyZone = this.buyZone = this.div('photo-view-print-modal-buy-zone');
    content.append(buyZone);

    this.eightInchButton = this.link({
      className: 'photo-view-print-modal-buy-button',
      url: 'https://paypal.me/Roark/5',
      text: 'Order 8" Print - $5',
      blank: true
    });
    buyZone.appendChild(this.eightInchButton);

    this.twentyFourInchButton = this.link({
      className: 'photo-view-print-modal-buy-button',
      url: 'https://paypal.me/Roark/12',
      text: 'Order 24" Print - $12',
      blank: true
    });
    buyZone.appendChild(this.twentyFourInchButton);
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

    this.errorZone.textContent = '';
    this.errorZone.style.opacity = 0;

    this.modal.classList.add('image-uploading');
    this.state.uploading = true;

    uploadImage(toPath(this.modelName), this.imageData, (err, res) => {
      this.modal.classList.remove('image-uploading');
      this.state.uploading = false;

      if (err) {
        this.errorZone.textContent = 'I failed to upload the image from MY WORLD. Please let me try again.';
        this.errorZone.style.opacity = 1;
        return;
      }

      this.uploadZone.innerHTML =
        `Your image ID is — <span class="print-image-id">${res.id}</span><br/></br>
        Be <b>sure</b> to copy and paste your image ID into your personal PayPal note below, as well as your <b>shipping address</b> so that I can help you!
        If you forget to do this or just wanna talk you are welcome and encouraged to contact me at <a href="mailto:kevin.e.roark@gmail.com">kevin.e.roark@gmail.com</a>!`;
      this.state.uploaded = true;
      this.modal.classList.add('image-uploaded');
    });
  }
}
