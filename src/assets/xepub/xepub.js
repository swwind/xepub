'use strict';

const $ = (id) => document.querySelector(id);
const $$ = (id) => document.querySelectorAll(id);

const socket = (ws) => {
  const event = {};
  const on = (type, fn) => {
    if (!event[type]) event[type] = [fn];
    else event[type].push(fn);
  }
  const emit = (type, ...args) => {
    args = args || [];
    event[type] && event[type].forEach((fn) => {
      fn(...args);
    });
  }
  ws.onmessage = ({ data }) => {
    const obj = JSON.parse(data);
    emit(obj.type, ...obj.args);
  }
  const eventList = [];
  const remote = (type, ...args) => {
    args = args || [];
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type, args }));
    } else {
      eventList.push({ type, args });
    }
  }
  ws.onopen = () => {
    eventList.forEach(({ type, args }) => {
      remote(type, ...args);
    });
  }
  return { on, emit, remote };
}

let spine = [];
let nowindex = 0;
let epub = {};

let title = '';
const setTitle = (title) => {
  $('title').innerHTML = title;
  $('.title').innerHTML = title;
}

// websocket
const ws = new WebSocket('ws://' + window.location.host);
const server = socket(ws);
ws.onclose = () => { window.close(); }

// toggle menu
const showMenu = () => {
  $('.fix-menu').style.display = 'block';
  setTimeout(() => {
    $('.fix-menu').classList.remove('opacity');
  }, 0);
}
const hideMenu = () => {
  $('.fix-menu').classList.add('opacity');
  setTimeout(() => {
    $('.fix-menu').style.display = 'none';
  }, 200);
}
// bind menu toggle events
document.addEventListener('click', hideMenu);
$('.menu').addEventListener('click', (e) => {
  showMenu();
  e.stopPropagation();
});

// scroll animation
const scrollTo = (pos, time = 500) => {
  const setScrollTop = (top) => {
    document.body.scrollTop = top; // For Safari
    document.documentElement.scrollTop = top; // For Chrome, Firefox, IE and Opera
  }
  const timefn = x => x*x / (x*x + (1-x)*(1-x));
  const last = new Date().getTime();
  const lastpos = document.documentElement.scrollTop || document.body.scrollTop;
  const fn = (now) => {
    now = new Date().getTime() - last;
    if (now < time) {
      const nowpos = (pos - lastpos) * timefn(now / time) + lastpos;
      setScrollTop(nowpos);
      requestAnimationFrame(fn);
    } else {
      setScrollTop(pos);
    }
  }
  requestAnimationFrame(fn);
}

// get reading progress [0, 1)
const getPorgress = () => {
  const top = document.documentElement.scrollTop || document.body.scrollTop;
  return top / document.body.scrollHeight;
}

// resize iframe
const resizeFrame = (iframe, top, time = 0) => {

  if ('string' === typeof top && top.charAt(0) === '#') {
    iframe.style.height = '0px';
    iframe.style.height = Math.max(iframe.contentWindow.document.body.scrollHeight + 50,
        iframe.clientWidth * 1.4142135623730951) + 'px';
    jumpToId(top.slice(1));
  } else {
    const pct = top === undefined ? getPorgress() : top;
    iframe.style.height = '0px';
    iframe.style.height = Math.max(iframe.contentWindow.document.body.scrollHeight + 50,
        iframe.clientWidth * 1.4142135623730951) + 'px';
    scrollTo(document.body.scrollHeight * pct, time);
  }
}

// key events
const _document = document;
const scrolling = (delta) => {
  const setScrollTop = (top) => {
    _document.body.scrollTop = top; // For Safari
    _document.documentElement.scrollTop = top; // For Chrome, Firefox, IE and Opera
  }
  let stoped = false;
  const fn = () => {
    const lastpos = _document.documentElement.scrollTop || _document.body.scrollTop;
    setScrollTop(lastpos + delta);
    if (!stoped) requestAnimationFrame(fn);
  }
  requestAnimationFrame(fn);
  return {
    delta,
    stop: () => {
      stoped = true;
    }
  };
}
// now scrolling task
let scrolls = null;

const keyDownEvent = (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyH') {
    jumpToPrev();
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyL') {
    jumpToNext();
  }
  if (e.code === 'KeyJ') {
    if (!scrolls) {
      scrolls = scrolling(10);
    } else if (scrolls && scrolls.delta < 0) {
      scrolls.stop();
      scrolls = scrolling(10);
    }
  }
  if (e.code === 'KeyK') {
    if (!scrolls) {
      scrolls = scrolling(-10);
    } else if (scrolls && scrolls.delta > 0) {
      scrolls.stop();
      scrolls = scrolling(-10);
    }
  }
}
const keyUpEvent = (e) => {
  if (e.code === 'KeyJ') {
    if (scrolls && scrolls.delta > 0) {
      scrolls.stop();
      scrolls = null;
    }
  }
  if (e.code === 'KeyK') {
    if (scrolls && scrolls.delta < 0) {
      scrolls.stop();
      scrolls = null;
    }
  }
}
// bind key events
window.addEventListener('keydown', keyDownEvent);
window.addEventListener('keyup', keyUpEvent);

let globalFont = '';
let camouflageTitle = '';

// on load iframe
$('iframe').addEventListener('load', (e) => {
  const obj = e.target;

  nowindex = spine.indexOf(obj.contentDocument.location.pathname);
  if (nowindex === -1) {
    // maybe on config page
    $('.prev').classList.add('disabled');
    $('.next').classList.add('disabled');
  } else {
    $('.prev').classList[nowindex === 0                ? 'add' : 'remove']('disabled');
    $('.next').classList[nowindex === spine.length - 1 ? 'add' : 'remove']('disabled');
  }

  // copy theme
  if (nowindex > -1) {
    obj.contentWindow.document.head.innerHTML += '<style>img{max-width:100%;user-select:none;}</style>';
    obj.contentWindow.document.head.innerHTML += '<link rel="stylesheet" type="text/css" href="/xepub/page.css"/>';
    if (globalFont) {
      obj.contentWindow.document.head.innerHTML += `<style>:root{--font-family:${globalFont},sans-serif;}</style>`;
    }
  }
  document.body.className.split(' ').forEach((cls) => {
    obj.contentWindow.document.body.classList.add(cls);
  });

  obj.classList.remove('opacity');
  obj.contentWindow.document.addEventListener('click', hideMenu);
  if (nowindex !== -1) {
    obj.contentWindow.document.addEventListener('keydown', keyDownEvent);
    obj.contentWindow.document.addEventListener('keyup', keyUpEvent);
  }
  // config page need `server` object
  if (obj.contentWindow.__xepub_load) {
    obj.contentWindow.__xepub_load(server, epub);
  }
  Array.from(obj.contentWindow.document.querySelectorAll('a[href]')).forEach((item) => {
    const href = item.getAttribute('href');
    if (/^(https?:)?\/\//.test(href)) {
      item.setAttribute('target', '_blank');
    } else if (/^#/.test(href)) {
      item.addEventListener('click', (e) => {
        jumpToId(href.slice(1));
        e.preventDefault();
      });
    } else {
      const src = path.resolve(path.dirname(obj.contentDocument.location.pathname), href);
      item.addEventListener('click', (e) => {
        jumpToSrc(src);
        e.preventDefault();
      });
    }
  });
  const dataTop = obj.getAttribute('data-top') || '0';
  resizeFrame(obj, dataTop, 500);
  obj.removeAttribute('data-top');
  NProgress.done();
});

// resize iframe
window.addEventListener('resize', () => resizeFrame($('iframe')));

const getFileName = (url) => {
  return path.resolve(path.dirname(url), path.basename(url));
}
const getIdFromUrl = (url) => {
  return url.indexOf('#') > -1 ? url.slice(url.indexOf('#') + 1) : '';
}

const jumpToId = (id) => {
  const to = $('iframe').contentDocument.getElementById(id);
  if (!to) return;

  const rect = to.getBoundingClientRect();
  const win = to.ownerDocument.defaultView;

  scrollTo((rect.top + win.pageYOffset), 500);
  return;
}

// jump to page src with scrollTop = top
const jumpToSrc = (src, top) => {

  const iframe = $('iframe');

  if (getFileName(iframe.src) === getFileName(src)) {
    // just jump refers to id
    const id = getIdFromUrl(src);
    id && jumpToId(id);

  } else {

    const page = getFileName(src);
    const id = getIdFromUrl(src);
    if ('number' !== typeof top) {
      top = id && ('#' + id) || 0;
    }

    iframe.classList.add('opacity');
    NProgress.start();
    setTimeout(() => {
      iframe.src = page;
      console.log(page);
      iframe.setAttribute('data-top', top);
    }, 500);

  }
}
const jumpToPrev = () => {
  if (nowindex === -1 || nowindex === 0) return;
  jumpToSrc(spine[-- nowindex]);
}
const jumpToNext = () => {
  if (nowindex === -1 || nowindex === spine.length - 1) return;
  jumpToSrc(spine[++ nowindex]);
}

$('.prev').addEventListener('click', jumpToPrev);
$('.next').addEventListener('click', jumpToNext);

const init = (_epub) => {
  epub = _epub;

  console.log(epub);

  spine = epub.spine;

  setTitle(title = (epub.metadata.title || epub.docTitle) + ' - Xepub');

  const menu = $('.fix-menu');
  epub.navMap.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = item.label;
    div.addEventListener('click', (e) => {
      jumpToSrc(item.src);
    });
    menu.appendChild(div);
  });

  server.remote('progress');
}

server.on('init', init);
server.on('progress', (progress) => {
  console.log(progress);
  if (progress[title]) {
    jumpToSrc(progress[title].page, progress[title].top);
  } else {
    jumpToSrc(spine[0]);
  }
});

server.on('config-change', config => {
  console.log(config);
  camouflageTitle = config.title;
  globalFont = config.fonts;
  document.body.className = config.theme;
  if (config['use-custom-text-color']) {
    document.body.classList.add('use-custom-text-color');
  }
  if (config['use-custom-font-family']) {
    document.body.classList.add('use-custom-font-family');
  }
});
server.remote('load-config');

const saveProgress = () => {
  // maybe on setting page
  if (nowindex === -1) return;
  const page = spine[nowindex];
  const top = getPorgress();
  server.remote('save', title, page, top);
}

setInterval(saveProgress, 1000);

// on exit
window.addEventListener('beforeunload', (e) => {
  saveProgress();
});

document.addEventListener('visibilitychange', function() {
  if (document.hidden && camouflageTitle) {
    setTitle(camouflageTitle);
  } else {
    setTitle(title);
  }
});

$('.totop').addEventListener('click', () => {
  scrollTo(0, 500);
});
$('.settings').addEventListener('click', () => {
  jumpToSrc('/xepub/config.html');
});
$('.info').addEventListener('click', () => {
  jumpToSrc('/xepub/info.html');
});
