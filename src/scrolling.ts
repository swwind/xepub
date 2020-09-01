import { animate } from "./animate";

const elem = document.querySelector('.content');

/**
 * get scroll top
 */
const getScrollTop = () => {
  return elem.scrollTop;
}

/**
 * set scroll top
 */
export const setScrollTop = (top: number) => {
  elem.scrollTop = top; // For Safari
}

/**
 * Scroll to the specific position
 */
export const scrollTo = (pos: number, duration: number = 500) => {
  const lastpos = getScrollTop();
  return animate((x) => {
    setScrollTop((pos - lastpos) * x + lastpos);
  }, duration);
}

/**
 * fly to element
 */
export const flyToElement = async (el: string) => {
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

  scrollTo(target - 100, 500);

  elem.classList.add('xepub-highlight');
}

/**
 * fly to an element or top without animations
 */
export const flyToElementImmediately = (el?: string) => {

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

export const flyToPercentImmediately = (percent: number) => {
  setScrollTop(elem.clientHeight * percent);
}

export const getPercent = () => {
  return getScrollTop() / elem.clientHeight;
}
