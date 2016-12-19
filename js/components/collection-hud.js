
import Component from './component';

export default class CollectionHud extends Component {
  constructor ({ arrowHandler }) {
    super();

    let el = this.el = this.div('home-view-collection-hud');

    let label = this.label = this.div('home-view-collection-hud-label', null, 'collection');
    el.appendChild(label);

    let title = this.title = this.div('home-view-collection-hud-title');
    el.appendChild(title);

    let arrowContainer = this.arrowContainer = this.div('home-view-collection-hud-arrow-container');
    el.appendChild(arrowContainer);

    let leftArrow = this.leftArrow = this.div('home-view-collection-hud-arrow', null, 'PREV');
    leftArrow.addEventListener('click', () => {
      if (arrowHandler) arrowHandler(-1);
    }, false);
    arrowContainer.appendChild(leftArrow);

    let rightArrow = this.rightArrow = this.div('home-view-collection-hud-arrow', null, 'NEXT');
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
}
