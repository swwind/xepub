/*
Create bookmark element
*/

import { loadUrl } from './loader';

const createMenu = (nav, elem, sidenav) => {

  const createElement = (label, src) => {
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