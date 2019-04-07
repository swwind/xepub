/*
Load epub page from URL
*/

import { encode, update } from './lazyload';
import * as URL from 'url';
import { flyToElement, flyToElementImmediately } from './animate';
import * as csstree from 'css-tree';
import { setSubTitle, $$ } from './utils';

const elem = document.querySelector('.content');

const resolvePath = (dir) => (html) => {
  const regex = /(href|src)="((?!https?:\/\/)[\s\S]+?)"/gi;
  return html.replace(regex, (match) => {
    regex.lastIndex = 0;
    const res = regex.exec(match);
    return `${res[1]}="${URL.resolve(dir, res[2])}"`;
  });
}
const maybeArray = (fn) => (...args) => {
  const arr = args.shift();
  if (typeof arr.length === 'number') {
    Array.from(arr).forEach((a) => {
      fn(a, ...args);
    });
  } else {
    fn(arr, ...args);
  }
}

// add .fake-body to every css selector
const inlineCSS = (url, css) => {
  const ast = csstree.parse(css);
  csstree.walk(ast, (node) => {
    if (node.type === 'Selector') {
      node.children.prependData({
        type: "WhiteSpace",
        loc: null,
        value: " "
      });
      node.children.prependData({
        type: "ClassSelector",
        name: "fake-body"
      });
    }
    if (node.type === 'Url') {
      node.value.value = URL.resolve(url, node.value.value);
    }
  });
  const res = csstree.generate(ast);
  return res;
}

const removeElem = maybeArray((elem) => elem.remove());
const replaceTag = maybeArray((elem, target) => {
  const div = document.createElement(target);
  div.textContent = elem.textContent;
  elem.parentNode.replaceChild(div, elem);
});
const parseCSSFromStyle = maybeArray((elem, url) => {
  const css = elem.innerHTML;
  elem.innerHTML = inlineCSS(url, css);
});
const parseCSSFromLink = maybeArray((elem) => {
  const url = elem.getAttribute('href');
  fetch(url)
    .then((res) => res.text())
    .then(inlineCSS.bind(null, url))
    .then((css) => {
      const style = document.createElement('style');
      style.innerHTML = css;
      style.setAttribute('data-book', '');
      document.head.appendChild(style);
    })
  elem.remove();
});

// bind <a/> events
const bindEvents = maybeArray((elem) => {
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
  })
})

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
    return [ body.innerHTML, title ];
  } else {
    return [ div.innerHTML, title ];
  }
}

export const loadUrl = (url) => {
  console.log(url);

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
      // remove all inline style
      setTimeout(removeElem, 600, $$('[data-book]'));
    }),
    // fetch content
    fetch(pathname)
      .then(res => res.text())
      .then(resolvePath(url))
      .then(handleHTML.bind(null, url))
  ]).then(([_, [html, title]]) => {
    window.epub.nowpage = pathname;

    // enforce redraw div
    // https://stackoverflow.com/questions/41425785/scrollbar-not-getting-modifed-when-scale-changes-in-chrome
    elem.style.display = 'none';
    elem.innerHTML = html;
    elem.offsetHeight;
    elem.style.display = 'block';

    setSubTitle(title || epub.docTitle);

    // scroll to top or hash
    flyToElementImmediately(hash);

    // update lazy load
    update();

    // fix <a/> links
    bindEvents(elem.querySelectorAll('a[href]'));

    elem.classList.add('open');
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
    M.toast({ html: 'This is the first page!' });
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
    M.toast({ html: 'This is the last page!' });
  }
}
