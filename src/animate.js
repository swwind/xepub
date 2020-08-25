const elem = document.querySelector('.content');

/**
 * get scroll top
 * @returns {number}
 */
const getScrollTop = () => {
  return elem.scrollTop;
}

/**
 * set scroll top
 * @param {number} top 
 */
export const setScrollTop = (top) => {
  elem.scrollTop = top; // For Safari
}

/**
 * Scroll to the specific position
 * @param {number} pos position
 * @param {number} time million second
 */
export const scrollTo = (pos, time = 500, onend) => {
  const timefn = x => x*x / (x*x + (1-x)*(1-x));
  const last = Date.now();
  const lastpos = getScrollTop();
  const fn = (now) => {
    now = Date.now() - last;
    if (now < time) {
      const nowpos = (pos - lastpos) * timefn(now / time) + lastpos;
      setScrollTop(nowpos);
      requestAnimationFrame(fn);
    } else {
      setScrollTop(pos);
      onend && onend();
    }
  }
  requestAnimationFrame(fn);
}

/**
 * fly to element
 * @param {string} el selector
 */
export const flyToElement = (el) => {
  // fake invoke
  if (!el) return;

  console.log('Scrolling to ' + el);

  const elem = document.querySelector(el);
  if (!elem) {
    console.warn('Cannot find element: ' + el);
    return;
  }
  const target = getScrollTop() + elem.getBoundingClientRect().top;
  elem.classList.remove('xepub-highlight');

  scrollTo(target - 100, 500, () => {
    elem.classList.add('xepub-highlight');
  });
}

/**
 * fly to an element or top without animations
 * @param {string} el selector
 */
export const flyToElementImmediately = (el) => {

  if (!el) {
    setScrollTop(0);
    return;
  }

  const elem = document.querySelector(el);
  if (!elem) {
    setScrollTop(0);
    return;
  }
  const target = getScrollTop() + elem.getBoundingClientRect().top;

  setScrollTop(target - 100);
}
