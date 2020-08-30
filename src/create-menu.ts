import { loadUrl } from './loader';
import { NavPoint } from '../app/types';

const createElement = (label: string, src: string, level: number) => {
  const li = document.createElement('li');
  li.addEventListener('click', () => {
    loadUrl(src);
  });
  li.textContent = label;
  li.classList.add(`level-${level}`);
  return li;
}

export default (nav: NavPoint[], elem: HTMLElement, level: number = 0) => {
  const createMenu = (nav: NavPoint[], level: number) => {
    nav.forEach((tab) => {
      const li = createElement(tab.label, tab.src, level);
      elem.appendChild(li);
      createMenu(tab.child, level + 1);
    });
  }

  createMenu(nav, level);
};
