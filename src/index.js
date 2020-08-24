'use strict';

import createMenu from './create-menu';
import { loadUrl, nextPage, prevPage } from './loader';
import { update } from './lazyload';
import { scrollTo } from './animate';
import * as Key from './key-events';
import { $, $$, setTitle } from './utils';
import { socket } from './utils';

const sidenav = M.Sidenav.init($('.sidenav'));
M.FloatingActionButton.init($('.fixed-action-btn'));
M.Tooltip.init($$('.tooltipped'));
const infoModal = M.Modal.init($('.modal'));

$('#bookmark').addEventListener('click', () => sidenav.open());
$('#totop').addEventListener('click', () => scrollTo(0));
$('#info').addEventListener('click', () => infoModal.open());

const upperFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

socket.on('initialize', (epub) => {
  window.epub = epub;

  // create the menu
  createMenu(epub.navMap, $('#bookmark-sidenav'), sidenav);

  loadUrl(epub.spine[0]);
  // epub.docTitle = epub.docTitle || epub.metadata.title || 'Xepub';
  // epub.docAuthor = epub.docAuthor || epub.metadata.author || 'unknow author';

  setTitle(epub.docTitle);

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
  M.toast({ html: 'Server closed' });
});

let connected = false;
socket.on('connect', () => {
  if (connected) {
    // flush window if reconnected
    location.reload();
  }
  connected = true;
});

Key.on('d', 'ArrowRight', nextPage);
Key.on('a', 'ArrowLeft', prevPage);

window.addEventListener('scroll', update);
window.addEventListener('resize', update);
