/*
Load epub page from URL
*/

import { lazyload } from './lazyload';
import { resolve, parse } from 'url';
import { flyToElement, flyToElementImmediately } from './scrolling';
import { setSubTitle, $, $$, socket } from './utils';
import { toast } from './toast';
import { EpubInfo } from '../app/types';

/**
 * Resolve relative path
 */
const resolvePath = (path: string) => (html: string) => {
  const regex = /(href|src)="((?!https?:\/\/)[\s\S]+?)"/gi;
  return html.replace(regex, (_, p1, p2) => {
    return `${p1}="${resolve(path, p2)}"`;
  });
}

// add .fake-body to every css selector
// send to backend to process
const addCSS = (url: string, css: string) => {
  socket.remote('css', url, css);
}
socket.on('css', (css: string) => {
  const style = document.createElement('style');
  style.innerHTML = css;
  style.setAttribute('data-book', '');
  document.head.appendChild(style);
  console.log(style);
});


const removeElem = (elem: Element) => elem.remove();
const replaceTag = (elem: Element, target: string) => {
  const div = document.createElement(target);
  div.textContent = elem.textContent;
  elem.parentNode.replaceChild(div, elem);
};
const parseCSSFromStyle = (elem: Element, url: string) => {
  addCSS(url, elem.innerHTML);
  elem.remove();
};
const parseCSSFromLink = (elem: Element) => {
  const url = elem.getAttribute('href');
  fetch(url)
    .then((res) => res.text())
    .then((css) => addCSS(url, css));
  elem.remove();
};

// bind <a/> events
const bindEvents = (elem: Element) => {
  const href = elem.getAttribute('href');
  if (/^(?:[a-z]+:)?\/\//i.test(href)) {
    // external link
    // console.log('ignored ' + href);
    return;
  }

  elem.addEventListener('click', (e) => {
    loadUrl(href);
    e.preventDefault();
    return true;
  });
}

/**
 * Preload a new page
 */
const handleHTML = (url: string, html: string) => {

  const div = document.createElement('div');
  div.innerHTML = html;

  // remove all custom style
  div.querySelectorAll('style').forEach((elem) => {
    parseCSSFromStyle(elem, url);
  });
  // link[rel="stylesheet"] put into auto load
  div.querySelectorAll('link[rel="stylesheet"]')
    .forEach(parseCSSFromLink);

  // remove title element
  const titleElem = div.querySelector('title');
  const title = titleElem && titleElem.textContent;
  titleElem && titleElem.remove();

  // smaller header
  for (let i = 3; i; -- i) {
    div.querySelectorAll('h' + i).forEach((elem) => {
      replaceTag(elem, 'h' + (i + 3))
    });
  }
  // lazyload all images
  div.querySelectorAll('img[src]').forEach((elem: HTMLImageElement) => {
    lazyload(elem, epub.sizes);
  });

  const body = div.querySelector('body');
  if (body) {
    const ddiv = document.createElement('div');
    ddiv.outerHTML = body.outerHTML.replace(/<body/gi, '<div').replace(/<\/body>/gi, '<div>');
    return {
      body: ddiv,
      title
    }
  } else {
    return {
      body: div,
      title
    }
  }
}

let nowpage: string = null;
let epub: EpubInfo = null;

export const init = (_epub: EpubInfo) => {
  epub = _epub;
}

export const loadUrl = (url: string) => {
  console.log(`Navigating to ${url}`);

  const { pathname, hash } = parse(url);
  if (nowpage === pathname) {
    flyToElement(hash);
    return;
  }
  const content = $('.content');
  Promise.all([
    // animation
    new Promise<void>((resolve) => {
      content.classList.remove('open');
      const elems = $$('[data-book]');
      // remove all inline style
      setTimeout(() => {
        elems.forEach(removeElem);
        resolve();
      }, 300);
    }),
    // fetch content
    fetch(pathname)
      .then(res => res.text())
      .then(resolvePath(url))
      .then((elem) => handleHTML(url, elem))
  ]).then(([_, { body, title }]) => {
    nowpage = pathname;

    body.classList.add('fake-body');
    content.replaceChild(body, content.children[0]);

    setSubTitle(title || epub.docTitle);

    // scroll to top or hash
    flyToElementImmediately(hash);

    // fix <a/> links
    content.querySelectorAll('a[href]').forEach(bindEvents);

    content.classList.add('open');
  });
}

export const prevPage = () => {
  const now = epub.spine.indexOf(nowpage);
  if (now === -1) {
    console.error('Not exist page');
    toast('Page not exist');
    return;
  }
  if (now > 0) {
    loadUrl(epub.spine[now - 1]);
  } else {
    toast('This is the first page!');
  }
}
export const nextPage = () => {
  const now = epub.spine.indexOf(nowpage);
  if (now === -1) {
    console.error('Not exist page');
    return;
  }
  if (now < epub.spine.length - 1) {
    loadUrl(epub.spine[now + 1]);
  } else {
    toast('This is the last page!');
  }
}
