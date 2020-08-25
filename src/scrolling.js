import { walk, timings } from "./animate";

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
export const scrollTo = (pos, time = 500) => {
  const lastpos = getScrollTop();
  return walk((x) => {
    setScrollTop((pos - lastpos) * x + lastpos);
  }, time);
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
  const target = elem.getBoundingClientRect().top;
  elem.classList.remove('xepub-highlight');

  scrollTo(target - 100, 500)
    .then(() => elem.classList.add('xepub-highlight'));
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
  const target = elem.getBoundingClientRect().top;

  setScrollTop(target - 100);
}
