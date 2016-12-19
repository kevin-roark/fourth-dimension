
export default class CollectionHud {
  constructor ({ arrowHandler }) {
    let el = this.el = div('home-view-collection-hud');

    let label = this.label = div('home-view-collection-hud-label');
    label.textContent = 'collection';
    el.appendChild(label);

    let title = this.title = div('home-view-collection-hud-title');
    el.appendChild(title);

    let arrowContainer = this.arrowContainer = div('home-view-collection-hud-arrow-container');
    el.appendChild(arrowContainer);

    let leftArrow = this.leftArrow = div('home-view-collection-hud-arrow');
    leftArrow.textContent = 'PREV';
    leftArrow.addEventListener('click', () => {
      if (arrowHandler) arrowHandler(-1);
    }, false);
    arrowContainer.appendChild(leftArrow);

    let rightArrow = this.rightArrow = div('home-view-collection-hud-arrow');
    rightArrow.textContent = 'NEXT';
    rightArrow.addEventListener('click', () => {
      if (arrowHandler) arrowHandler(1);
    }, false);
    arrowContainer.appendChild(rightArrow);

    this.state = {
      titleCount: 0
    };
  }

  setTitle (title) {
    this.title.textContent = title;

    this.state.titleCount += 1;
    let count = this.state.titleCount;
    this.el.classList.add('active');
    setTimeout(() => {
      if (count === this.state.titleCount) {
        this.el.classList.remove('active');
      }
    }, 500);
  }

  addToParent (parent) {
    parent.appendChild(this.el);
  }

  removeFromParent () {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

function div (className) {
  let div = document.createElement('div');
  div.className = className;
  return div;
}
