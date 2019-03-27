'use strict';

import * as SmoothScroll from 'smooth-scroll';
import createMenu from './createMenu';
import loadUrl from './loadUrl';

const socket = io();
const $ = name => document.querySelector(name);
const $$ = name => document.querySelectorAll(name);

const sidenav = M.Sidenav.init($('.sidenav'));
M.FloatingActionButton.init($('.fixed-action-btn'));
M.Tooltip.init($$('.tooltipped'));

new SmoothScroll('a[href*="#"]', {
  speed: 150,
  offset: 100
});

$('#bookmark').addEventListener('click', (e) => {
  sidenav.open();
});

socket.on('initialize', (epub) => {
  window.epub = epub;

  // create the menu
  createMenu(epub.navMap, $('#bookmark-sidenav'), sidenav);
  // I don't need to active collapsible any more
  // M.Collapsible.init($$('.collapsible'));

  loadUrl(epub.spine[0]);
});
socket.on('disconnect', (e) => {
  M.toast({ html: 'Lost connection, you need to keep your xepub running background' });
});
let connected = false;
socket.on('connect', () => {
  if (connected) {
    // flush window if reconnected
    window.location = window.location;
  }
  connected = true;
});

document.onscroll = () => {
  const imgs = Array.from(document.querySelectorAll('img[data-src]'));
  imgs.forEach((img) => {
    if (img.getBoundingClientRect().top < window.innerHeight + 100) {
      img.setAttribute('src', img.getAttribute('data-src'));
      img.removeAttribute('data-src');
      img.setAttribute('alt', img.getAttribute('data-alt'));
      img.removeAttribute('data-alt');
      img.onload = () => {
        img.removeAttribute('style');
      }
    }
  })
}

