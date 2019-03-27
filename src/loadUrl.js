'use strict';

import * as path from 'path';

const elem = document.querySelector('.content');

const resolvePath = (dir) => (html) => {
  // console.log(html);
  const regex = /(href|src)="([^"]+)"/gi;
  return html.replace(regex, (match) => {
    regex.lastIndex = 0;
    const res = regex.exec(match);
    return `${res[1]}="${path.join(dir, res[2])}"`;
  });
}
const removeAll = (elems) => {
  Array.from(elems).forEach((elem) => elem.remove());
}
const levelUp = (elems, target) => {
  Array.from(elems).forEach((elem) => {
    const div = document.createElement(target);
    div.textContent = elem.textContent;
    elem.parentNode.replaceChild(div, elem);
  })
}
const lazyload = (elems) => {
  Array.from(elems).forEach((elem) => {
    const src = elem.getAttribute('src');
    const size = window.epub.sizes[src];
    if (size) {
      elem.setAttribute('data-src', src);
      elem.setAttribute('data-alt', elem.getAttribute('alt'));
      elem.removeAttribute('src');
      elem.removeAttribute('alt');
      elem.style.width = size.width + 'px';
      elem.style.height = size.height + 'px';
    } else {
      console.warn('image not find ' + src);
    }
  })
}
const removeCSS = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  removeAll(div.querySelectorAll('style'));
  removeAll(div.querySelectorAll('link[rel="stylesheet"]'));
  removeAll(div.querySelectorAll('title'));
  removeAll(div.querySelectorAll('meta'));
  // reduce head tag
  for (let i = 3; i; -- i) {
    levelUp(div.querySelectorAll('h' + i), 'h' + (i + 3));
  }
  lazyload(div.querySelectorAll('img[src]'));
  return div.innerHTML;
}

const setScrollTop = (top) => {
  document.body.scrollTop = top; // For Safari
  document.documentElement.scrollTop = top; // For Chrome, Firefox, IE and Opera
}

const loadUrl = (url) => {
  Promise.all([
    // animation
    new Promise((resolve, reject) => {
      elem.classList.remove('open');
      setTimeout(resolve, 1000);
    }),
    // fetch content
    fetch(url)
      .then(res => res.text())
      .then(resolvePath(path.dirname(url)))
      .then(removeCSS)
  ]).then(([_, html]) => {
    setScrollTop(0);
    elem.innerHTML = html;
    document.onscroll();
    elem.classList.add('open');
  })
}

export default loadUrl;
