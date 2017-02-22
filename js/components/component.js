
export default class Component {

  addToParent (parent) {
    parent.appendChild(this.el);
  }

  removeFromParent () {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }

  div (className, id = null, textContent = '', innerHTML = false) {
    let el = document.createElement('div');
    el.className = className;
    if (id) el.id = id;
    if (innerHTML) el.innerHTML = textContent;
    else el.textContent = textContent;
    return el;
  }

  link ({ url, className, id, text = '', blank = false }) {
    let el = document.createElement('a');
    el.className = className;
    el.textContent = text;
    el.href = url;
    if (id) el.id = id;
    if (blank) el.target = '_blank';
    return el;
  }
}
