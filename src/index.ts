'use strict';

import './style/xepub.less';

import createMenu from './create-menu';
import * as Loader from './loader';
import { scrollTo } from './scrolling';
import * as Key from './key-events';
import { $, setTitle } from './utils';
import { socket } from './utils';
import * as SideNav from './sidenav';
import * as Modal from './modal';
import { toast } from './toast';
import * as Tooltip from './tooltip';
import * as Buttons from './buttons';
import { EpubInfo } from '../app/types';

const sidenav = SideNav.init($('.sidenav'));
const infoModal = Modal.init($('#infomations-modal'));

Tooltip.init();
Buttons.init();

$('#bookmark').addEventListener('click', () => sidenav.show());
$('#totop').addEventListener('click', () => scrollTo(0));
$('#info').addEventListener('click', () => infoModal.show());

const upperFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

socket.on('initialize', (epub: EpubInfo) => {
  Loader.init(epub);

  // create the menu
  createMenu(epub.navMap, $('.sidenav .nav'), sidenav);

  Loader.loadUrl(epub.spine[0]);
  epub.docTitle = epub.docTitle || epub.metadata.title || 'Xepub';
  epub.docAuthor = epub.docAuthor || epub.metadata.creator || 'unknow author';

  setTitle(`${epub.docTitle} - Xepub`);

  // fill infomations
  const info = $('#informations');
  for (const key of Object.keys(epub.metadata)) {
    const value = epub.metadata[key];
    if (!value) continue;
    const td1 = document.createElement('h4');
    td1.textContent = upperFirst(key);
    info.appendChild(td1);
    const td2 = document.createElement('p');
    td2.textContent = value;
    info.appendChild(td2);
  }
});

socket.on('disconnect', () => {
  toast('Server closed');
});

let connected = false;
socket.on('connect', () => {
  if (connected) {
    // flush window if reconnected
    location.reload();
  }
  connected = true;
});

Key.on('d', 'ArrowRight', Loader.nextPage);
Key.on('a', 'ArrowLeft', Loader.prevPage);
