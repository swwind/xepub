/*
Create bookmark element
*/

import { loadUrl } from './loader';

const createMenu = (nav, elem, sidenav) => {

  const createElement = (label, src) => {
    const li = document.createElement('li');
    li.classList.add('bold');
    const a = document.createElement('a');
    a.classList.add('waves-effect');
    a.addEventListener('click', () => {
      sidenav.close();
      Array.from(document.querySelectorAll('li.active')).forEach((li) => {
        li.classList.remove('active');
      });
      li.classList.add('active');
      loadUrl(src);
    });
    a.classList.add('collapsible-header');
    a.textContent = label;
    li.appendChild(a);
    return li;
  }

  nav.forEach((tab) => {
    const li = createElement(tab.label, tab.src);
    const div = document.createElement('div');
    div.classList.add('collapsible-body');
    div.style.display = 'block';
    const ul = document.createElement('ul');
    ul.classList.add('collapsible');
    createMenu(tab.child, ul, sidenav);
    div.appendChild(ul);
    li.appendChild(div);
    elem.appendChild(li);
  });
}

export default createMenu;