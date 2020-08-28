import { loadUrl } from './loader';
import { NavPoint } from '../app/types';
import { SideNav } from './sidenav';

const createMenu = (nav: NavPoint[], elem: HTMLElement, sidenav: SideNav) => {

  const createElement = (label: string, src: string) => {
    const li = document.createElement('li');
    li.addEventListener('click', () => {
      loadUrl(src);
    });
    li.textContent = label;
    return li;
  }

  nav.forEach((tab) => {
    const li = createElement(tab.label, tab.src);
    const div = document.createElement('div');
    const ul = document.createElement('ul');
    createMenu(tab.child, ul, sidenav);
    div.appendChild(ul);
    li.appendChild(div);
    elem.appendChild(li);
  });
}

export default createMenu;