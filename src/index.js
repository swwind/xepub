'use strict';

import createMenu from './create-menu';
import loadUrl from './load-url';
import { update } from './lazyload';
import { scrollTo } from './animate';

const socket = io();
const $ = name => document.querySelector(name);
const $$ = name => document.querySelectorAll(name);

const sidenav = M.Sidenav.init($('.sidenav'));
M.FloatingActionButton.init($('.fixed-action-btn'));
M.Tooltip.init($$('.tooltipped'));

$('#bookmark').addEventListener('click', (e) => {
  sidenav.open();
});
$('#totop').addEventListener('click', (e) => {
  scrollTo(0);
});

const setTitle = (title) => {
  $('.brand-logo').textContent = title;
  $('.brand-logo').setAttribute('title', title);
  $('title').textContent = title;
}

socket.on('initialize', (epub) => {
  window.epub = epub;

  // create the menu
  createMenu(epub.navMap, $('#bookmark-sidenav'), sidenav);
  // I don't need to active collapsible any more
  // M.Collapsible.init($$('.collapsible'));

  loadUrl(epub.spine[0]);

  setTitle(epub.docTitle || epub.metadata.title || 'Xepub');
});

socket.on('disconnect', (e) => {
  M.toast({ html: 'Lost connection, you need to keep xepub running in background' });
});

let connected = false;
socket.on('connect', () => {
  if (connected) {
    // flush window if reconnected
    window.location = window.location;
  }
  connected = true;
});

window.onscroll = update;
window.onresize = update;

