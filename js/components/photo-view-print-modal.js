
import Component from './component';

export default class PhotoViewPrintModal extends Component {
  constructor ({ closeHandler }) {
    super();

    this.el = this.div('window-wrapper');

    let modal = this.modal = this.div('photo-view-print-modal');
    this.el.appendChild(modal);

    this.closeButton = this.div('photo-view-print-modal-close-button');
    this.closeButton.addEventListener('click', closeHandler, false);
    modal.appendChild(this.closeButton);
  }
}
