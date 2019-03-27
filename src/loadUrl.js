'use strict';

import * as path from 'path';
import { encode, update } from './lazyload';
import * as URL from 'url';
import { flyToElement } from './animate';

const elem = document.querySelector('.content');

const resolvePath = (dir) => (html) => {
  const regex = /(href|src)="((?!https?:\/\/)[\s\S]+?)"/gi;
  return html.replace(regex, (match) => {
    regex.lastIndex = 0;
    const res = regex.exec(match);
    return `${res[1]}="${path.join(dir, res[2])}"`;
  });
}
const removeAll = (elems) => {
  Array.from(elems).forEach((elem) => elem.remove());
}
const replaceTag = (elems, target) => {
  Array.from(elems).forEach((elem) => {
    const div = document.createElement(target);
    div.textContent = elem.textContent;
    elem.parentNode.replaceChild(div, elem);
  })
}
const removeCSS = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  // remove all custom style
  removeAll(div.querySelectorAll('style'));
  removeAll(div.querySelectorAll('link[rel="stylesheet"]'));
  // remove title element
  removeAll(div.querySelectorAll('title'));
  // remove all <meta/> tag
  removeAll(div.querySelectorAll('meta'));
  // smaller header
  for (let i = 3; i; -- i) {
    replaceTag(div.querySelectorAll('h' + i), 'h' + (i + 3));
  }
  encode(div.querySelectorAll('img[src]'));
  return div.innerHTML;
}

const setScrollTop = (top) => {
  document.body.scrollTop = top; // For Safari
  document.documentElement.scrollTop = top; // For Chrome, Firefox, IE and Opera
}

const loadUrl = (url) => {
  console.log('switching to ' + url);
  const { pathname, hash } = URL.parse(url);
  if (window.epub.nowpage === pathname) {
    flyToElement(hash);
    return;
  }
  Promise.all([
    // animation
    new Promise((resolve) => {
      elem.classList.remove('open');
      setTimeout(resolve, 1000);
    }),
    // fetch content
    fetch(pathname)
      .then(res => res.text())
      .then(resolvePath(path.dirname(url)))
      .then(removeCSS)
  ]).then(([_, html]) => {
    window.epub.nowpage = pathname;
    setScrollTop(0);
    elem.innerHTML = html;
    update();
    elem.classList.add('open');

    setTimeout(flyToElement, 500, hash);
  })
}

export default loadUrl;
