
export default class Component {

  addToParent (parent) {
    parent.appendChild(this.el);
  }

  removeFromParent () {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }

  div (className, id = null, textContent = '') {
    let el = document.createElement('div');
    el.className = className;
    if (id) el.id = id;
    el.textContent = textContent;
    return el;
  }
}
