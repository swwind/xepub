import { mount } from "./imageview";
import { Size, KeyMap } from "../app/types";

/**
 * prepare for lazyload
 */
export const lazyload = (elem: HTMLImageElement, sizes: KeyMap<Size>) => {

  const src = decodeURIComponent(elem.getAttribute('src'));
  const size = sizes[src];
  if (size) {
    if (size.width <= 50 && size.height <= 50) {
      // small image
      // consider like emojis
      return;
    }

    let parent: HTMLElement = elem;
    while (parent = parent.parentElement) {
      if (parent.nodeName.toLowerCase() === 'a') {
        // link
        return;
      }
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
