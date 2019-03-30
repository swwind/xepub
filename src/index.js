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
const infoModal = M.Modal.init($('.modal'));

$('#bookmark').addEventListener('click', (e) => {
  sidenav.open();
});
$('#totop').addEventListener('click', (e) => {
  scrollTo(0);
});
$('#info').addEventListener('click', (e) => {
  infoModal.open();
});

const setTitle = (title) => {
  $('.brand-logo').textContent = title;
  $('.brand-logo').setAttribute('title', title);
  $('title').textContent = title;
}
const upperFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

socket.on('initialize', (epub) => {
  window.epub = epub;

  // create the menu
  createMenu(epub.navMap, $('#bookmark-sidenav'), sidenav);

  loadUrl(epub.spine[0]);

  setTitle(epub.docTitle || epub.metadata.title || 'Xepub');

  // fill infomations
  for (const key of Object.keys(epub.metadata)) {
    const value = epub.metadata[key];
    if (!value) continue;
    const td1 = document.createElement('h5');
    td1.textContent = upperFirst(key);
    $('.info-add').append(td1);
    const td2 = document.createElement('p');
    td2.textContent = value;
    $('.info-add').append(td2);
  }
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

