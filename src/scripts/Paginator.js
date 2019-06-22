export default class Paginator {
  constructor(activeSlide, slidesCount, duration) {
    this.activeSlide = activeSlide;
    this.slidesCount = slidesCount;
    this.duration = duration;
    this.canSlide = true;
    this.swipeStart = false;

    this.navContainer = document.querySelector('#navigation');
    this.backNavBtn = this.navContainer.querySelector('#back-nav');
    this.forwardNavBtn = this.navContainer.querySelector('#forward-nav');
    this.slidesNav = this.navContainer.querySelector('.slides-nav');
    this.lastGeneratedNavItem = -1;
    this.initNavigation();

    this.addScrollListeners();
    this.addTouchListeners();
    this.addKeyListeners();
    this.addClickListeners();
  }

  scrollHandler(evt) {
    if (!this.canSlide) return;

    evt = evt || window.event;
    let delta = evt.deltaY || evt.detail || -evt.wheelDelta;
    let direction = delta > 0 ? 1 : -1;
    this.gotoSlide(direction);
  }

  addScrollListeners() {
    if ('onwheel' in document) {
      // IE9+, FF17+, Ch31+
      window.addEventListener('wheel', this.scrollHandler.bind(this), { passive: true });
    } else if ('onmousewheel' in document) {
      // устаревший вариант события
      window.addEventListener('mousewheel', this.scrollHandler.bind(this), { passive: true });
    } else {
      // Firefox < 17
      window.addEventListener('MozMousePixelScroll', this.scrollHandler.bind(this), { passive: true });
    }
  }

  touchStartHandler(evt) {
    if (!this.canSlide) return;

    this.swipeStart = true;
    this.touchX = evt.changedTouches[0].clientX;
  }

  touchEndHandler(evt) {
    if (this.swipeStart) {
      this.swipeStart = false;
      let deltaX = evt.changedTouches[0].clientX - this.touchX;
      let direction = 0;

      if (Math.abs(deltaX) > 50) { // swipe is long enough
        direction = deltaX < 0 ? 1 : -1;
      }

      this.gotoSlide(direction);
    }
  }

  addTouchListeners() {
    window.addEventListener('touchstart', this.touchStartHandler.bind(this));
    window.addEventListener('touchend', this.touchEndHandler.bind(this));
  }

  keyDownHandler(evt) {
    if (!this.canSlide) return;

    let key = evt.keyCode;
    let direction = 0;

    if (key === 37 || key === 38) {
      direction = -1;
    } else if (key === 39 || key === 40) {
      direction = 1;
    }

    this.gotoSlide(direction);
  }

  addKeyListeners() {
    if (document.addEventListener) {
      document.addEventListener('keydown', this.keyDownHandler.bind(this));
    }
  }

  addClickListeners() {
    let links = document.querySelectorAll('.index');
    [].forEach.call(links, link => {
      link.addEventListener('click', evt => {
        if (!this.canSlide) return;
        this.gotoSlide(1);
      });
    });
  }

  gotoSlide(direction) {
    let newSlide = +this.activeSlide + direction;
    if (newSlide >= this.slidesCount || newSlide < 0 || newSlide === this.activeSlide) return;
    this.canSlide = false;

    PubSub.publish('gotoSlide', {
      from: this.activeSlide,
      to: newSlide
    });

    this.activeSlide = newSlide;
    this.updateNavigationView();

    window.setTimeout(() => {
      this.canSlide = true;
    }, this.duration * 1000);
  }

  initNavigation() {
    this.initNavigationBehavior();
    this.createNavItem();
    this.setActiveNavItem();
    this.defineNavArrowsClickHandler();
  }

  initNavigationBehavior() {
    const that = this;
    this.slidesNav.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const desiredPage = ev.target;
      const slideIndex = [...this.slidesNav.children].indexOf(desiredPage);
      that.gotoSlide(slideIndex - this.activeSlide);
    });
  }

  createNavItem() {
    const navItem = this.generateOneSlideNavItem();

    this.slidesNav.append(navItem);
    this.lastGeneratedNavItem = this.activeSlide;
  }

  generateOneSlideNavItem() {
    return this.createNavListElement();
  }

  createNavListElement(num) {
    const li = document.createElement('li');

    li.className = 'slides-nav__item';
    li.innerHTML = this.activeSlide + 1;

    return li;
  }

  setActiveNavItem() {
    const prevSlide = this.slidesNav.querySelector('.active');
    if (prevSlide) {
      prevSlide.classList.remove('active');
    }
    this.blinkSlideNav();
    const navItems = this.slidesNav.children;
    navItems[this.activeSlide].classList.add('active');
  }

  blinkSlideNav() {
    this.slidesNav.style.opacity = 0;
    setTimeout(() => {
      this.slidesNav.style.opacity = 1;
    }, 10);
  }

  defineNavArrowsClickHandler() {
    this.forwardNavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.gotoSlide(1);
    });

    this.backNavBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.gotoSlide(-1);
    });
  }

  updateNavigationView() {
    if (this.lastGeneratedNavItem < this.activeSlide) {
      this.createNavItem();
    }
    this.toggleNavArrows();
    this.setActiveNavItem();
  }

  toggleNavArrows() {
    this.toggleNavBackArrow();
    this.toggleNavForwardArrow();
  }

  toggleNavBackArrow() {
    if (this.activeSlide > 0) {
      this.backNavBtn.removeAttribute('hidden');
    } else {
      this.backNavBtn.setAttribute('hidden', true);
    }
  }

  toggleNavForwardArrow() {
    if (this.activeSlide < this.slidesCount - 1) {
      this.forwardNavBtn.removeAttribute('hidden');
    } else {
      this.forwardNavBtn.setAttribute('hidden', true);
    }
  }
}
