/*
Load epub page from URL
*/

import { encode } from './lazyload';
import { resolve, parse } from 'url';
import { flyToElement, flyToElementImmediately } from './scrolling';
import { setSubTitle, $, $$, socket } from './utils';
import { toast } from './toast';

/**
 * Resolve relative path
 * @param {string} path current file path
 * @returns {(html: string) => string}
 */
const resolvePath = (path) => (html) => {
  const regex = /(href|src)="((?!https?:\/\/)[\s\S]+?)"/gi;
  return html.replace(regex, (_, p1, p2) => {
    return `${p1}="${resolve(path, p2)}"`;
  });
}

/**
 * It's too hard to explain what is this
 */
const maybeArray = (fn) => (arr, ...args) => {
  if (typeof arr.length === 'number') {
    for (const a of arr) {
      fn(a, ...args);
    }
  } else {
    fn(arr, ...args);
  }
}

// add .fake-body to every css selector
const addCSS = (url, css) => {
  socket.emit('css', url, css);
}
socket.on('css', (css) => {
  const style = document.createElement('style');
  style.innerHTML = css;
  style.setAttribute('data-book', '');
  document.head.appendChild(style);
});

const removeElem = maybeArray((elem) => elem.remove());
const replaceTag = maybeArray((elem, target) => {
  const div = document.createElement(target);
  div.textContent = elem.textContent;
  elem.parentNode.replaceChild(div, elem);
});
const parseCSSFromStyle = maybeArray((elem, url) => {
  addCSS(url, elem.innerHTML);
  elem.remove();
});
const parseCSSFromLink = maybeArray((elem) => {
  const url = elem.getAttribute('href');
  fetch(url)
    .then((res) => res.text())
    .then((css) => addCSS(url, css));
  elem.remove();
});

// bind <a/> events
const bindEvents = maybeArray((elem) => {
  const href = elem.getAttribute('href');
  if (/^(?:[a-z]+:)?\/\//i.test(href) || elem.hasAttribute('xepub-target-blank')) {
    // external link
    // console.log('ignored ' + href);
    return;
  }

  elem.addEventListener('click', (e) => {
    loadUrl(href);
    e.preventDefault();
    return true;
  });
});

/**
 * Preload a new page
 * @param {string} url current page path
 * @param {string} html page content
 */
const handleHTML = (url, html) => {

  const div = document.createElement('div');
  div.innerHTML = html;

  // remove all custom style
  parseCSSFromStyle(div.querySelectorAll('style'), url);
  // link[rel="stylesheet"] put into auto load
  parseCSSFromLink(div.querySelectorAll('link[rel="stylesheet"]'));

  // remove title element
  const titleElem = div.querySelector('title');
  const title = titleElem && titleElem.textContent;
  titleElem && titleElem.remove();

  // smaller header
  for (let i = 3; i; -- i) {
    replaceTag(div.querySelectorAll('h' + i), 'h' + (i + 3));
  }
  // lazyload all images
  encode(div.querySelectorAll('img[src]'));

  const body = div.querySelector('body');
  if (body) {
    body.outerHTML = body.outerHTML.replace(/<body/gi, '<div').replace(/<\/body>/gi, '<div>');
    return [ body, title ];
  } else {
    return [ div, title ];
  }
}

export const loadUrl = (url) => {
  console.log(`Navigating to ${url}`);

  const { pathname, hash } = parse(url);
  if (window.epub.nowpage === pathname) {
    flyToElement(hash);
    return;
  }
  const content = $('.content');
  Promise.all([
    // animation
    new Promise((resolve) => {
      content.classList.remove('open');
      // wait for animation
      setTimeout(resolve, 300);
      // remove all inline style
      setTimeout(removeElem, 300, $$('[data-book]'));
    }),
    // fetch content
    fetch(pathname)
      .then(res => res.text())
      .then(resolvePath(url))
      .then((elem) => handleHTML(url, elem))
  ]).then(([_, [elem, title]]) => {
    window.epub.nowpage = pathname;

    // enforce redraw div
    // https://stackoverflow.com/questions/41425785/scrollbar-not-getting-modifed-when-scale-changes-in-chrome
    // seems not working...

    // elem.style.display = 'none';
    elem.classList.add('fake-body');
    content.replaceChild(elem, content.children[0]);
    // elem.offsetHeight;
    // elem.style.display = 'block';

    setSubTitle(title || epub.docTitle);

    // scroll to top or hash
    flyToElementImmediately(hash);

    // fix <a/> links
    bindEvents(content.querySelectorAll('a[href]'));

    content.classList.add('open');
  })
}

export const prevPage = () => {
  const now = window.epub.spine.indexOf(window.epub.nowpage);
  if (now === -1) {
    console.error('Not exist page');
    return;
  }
  if (now > 0) {
    loadUrl(window.epub.spine[now - 1]);
  } else {
    toast('This is the first page!');
  }
}
export const nextPage = () => {
  const now = window.epub.spine.indexOf(window.epub.nowpage);
  if (now === -1) {
    console.error('Not exist page');
    return;
  }
  if (now < window.epub.spine.length - 1) {
    loadUrl(window.epub.spine[now + 1]);
  } else {
    toast('This is the last page!');
  }
}
