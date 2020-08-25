import { $$ } from "./utils";
import { mount } from "./imageview";

/**
 * prepare for lazyload
 * @param {HTMLElement | HTMLElement[]} elem 
 */
export const encode = (elem) => {

  if (elem.length !== undefined) {
    Array.from(elem).forEach(encode);
    return;
  }

  
  const src = decodeURIComponent(elem.getAttribute('src'));
  const size = window.epub.sizes[src];
  if (size) {
    if (size.width <= 50 && size.height <= 50) {
      // small image
      // consider like emojis
      return;
    }
    elem.setAttribute('loading', 'lazy');
    const oldstyle = elem.getAttribute('style');
    elem.style.width = size.width + 'px';
    elem.style.paddingBottom = (size.height / size.width * 100) + '%';
    elem.style.backgroundColor = '#dcdcdc';
    elem.onload = () => {
      if (oldstyle) {
        elem.setAttribute('style', oldstyle);
      } else {
        elem.removeAttribute('style');
      }

      mount(elem);
    }
  } else {
    console.warn(`image not in manifest: ${src}`);

    elem.onload = () => {
      mount(elem);
    }
  }
}
