
import Component from './component';

export default class BigCursor extends Component {
  constructor ({ size = 64 } = {}) {
    super();

    this.size = size;
    this.el = this.div('big-cursor');

    window.addEventListener('mousedown', this.handleMouseEvent.bind(this));
    window.addEventListener('mousemove', this.handleMouseEvent.bind(this));
    window.addEventListener('touchdown', ev => this.handleMouseEvent(ev.touches[0]));
    window.addEventListener('touchmove', ev => this.handleMouseEvent(ev.touches[0]));
  }

  makeBasketball () {
    this.el.classList.add('globe');
    this.el.classList.remove('hand');
  }

  makeHand () {
    this.el.classList.add('hand');
    this.el.classList.remove('globe');
  }

  handleMouseEvent (ev) {
    let { size, el } = this;
    el.style.left = (ev.pageX - size / 2) + 'px';
    el.style.top = (ev.pageY - size / 2) + 'px';
  }
}
