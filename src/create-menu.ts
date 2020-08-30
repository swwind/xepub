import { loadUrl } from './loader';
import { NavPoint } from '../app/types';
import { SideNav } from './sidenav';

const createElement = (label: string, src: string, level: number) => {
  const li = document.createElement('li');
  li.addEventListener('click', () => {
    loadUrl(src);
  });
  li.textContent = label;
  li.classList.add(`level-${level}`);
  return li;
}

const createMenu = (nav: NavPoint[], elem: HTMLElement, sidenav: SideNav, level: number = 0) => {
  nav.forEach((tab) => {
    const li = createElement(tab.label, tab.src, level);
    elem.appendChild(li);
    createMenu(tab.child, elem, sidenav, level + 1);
  });
}

export default createMenu;