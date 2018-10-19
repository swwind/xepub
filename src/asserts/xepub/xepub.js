'use strict';

const mfs = new Map();
const caplist = [];
let nowindex = 0;
let title = '';
let readingProgress;

const ws = new WebSocket('ws://' + window.location.host);
ws.onmessage = ({ data }) => {
  if (data === 'close') {
    window.close();
    return;
  }
  readingProgress = new Map(JSON.parse(data));
  const progress = readingProgress.get(title);
  if (!progress) {
    jumpToSrc(caplist[0]);
  } else {
    jumpToSrc(progress.page, progress.top);
  }
}

const showMenu = () => {
  document.querySelector('.fix-menu').style.display = 'block';
  setTimeout(() => {
    document.querySelector('.fix-menu').classList.remove('opacity');
  }, 0)
}
const hideMenu = () => {
  document.querySelector('.fix-menu').classList.add('opacity');
  setTimeout(() => {
    document.querySelector('.fix-menu').style.display = 'none';
  }, 200);
}

const scrollTo = (pos, time) => {
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

document.addEventListener('click', hideMenu);
document.querySelector('.menu').addEventListener('click', (e) => {
  showMenu();
  e.stopPropagation();
});

const resizeFrame = (iframe) => {
  iframe.style.height = Math.max(iframe.contentWindow.document.body.scrollHeight + 50,
      iframe.clientWidth * 1.4142135623730951) + 'px';
}

const keyEvent = (e) => {
  if (e.code === 'ArrowLeft') {
    jumpToPrev();
  }
  if (e.code === 'ArrowRight') {
    jumpToNext();
  }
}
window.addEventListener('keydown', keyEvent);

// on load iframe
document.querySelector('iframe').addEventListener('load', (e) => {
  const obj = e.target;
  obj.contentWindow.document.head.innerHTML += '<style>img{max-width:100%;user-select:none;}</style>';
  resizeFrame(obj);
  obj.classList.remove('opacity');
  scrollTo(+ obj.getAttribute('data-top'), 500);
  obj.contentWindow.document.addEventListener('click', hideMenu);
  obj.contentWindow.document.addEventListener('keydown', keyEvent);
  Array.from(obj.contentWindow.document.querySelectorAll('a')).forEach((item) => {
    let href = item.getAttribute('href');
    if (/^#/.test(href)) return;
    href = href.replace(/^\.?\.?\//, '');
    item.addEventListener('click', (e) => {
      jumpToSrc(href);
      e.preventDefault();
    })
  });
  NProgress.done();
});

// resize iframe
window.addEventListener('resize', () => resizeFrame(document.querySelector('iframe')));

// jump to page src with scrollTop = top
const jumpToSrc = (src, top = 0) => {
  document.querySelector('iframe').classList.add('opacity');
  NProgress.start();
  setTimeout(() => {
    document.querySelector('iframe').src = src + '?data=' + new Date().getTime();
    document.querySelector('iframe').setAttribute('data-top', top);
  }, 500);
  nowindex = caplist.indexOf(src);
  document.querySelector('.prev').classList[nowindex === 0                  ? 'add' : 'remove']('disabled');
  document.querySelector('.next').classList[nowindex === caplist.length - 1 ? 'add' : 'remove']('disabled');
}
const jumpToPrev = () => {
  if (nowindex === 0) return;
  jumpToSrc(caplist[-- nowindex]);
}
const jumpToNext = () => {
  if (nowindex === caplist.length - 1) return;
  jumpToSrc(caplist[++ nowindex]);
}

document.querySelector('.prev').addEventListener('click', jumpToPrev);
document.querySelector('.next').addEventListener('click', jumpToNext);

const fetchTocNcx = (tocPath) => {

  fetch(tocPath)
  .then(response => response.text())
  .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
  .then(data => {
    const navMap = data.querySelector('navMap');
    Array.from(navMap.querySelectorAll('navPoint')).sort((a, b) => {
      return (+ a.getAttribute('playOrder')) - (+ b.getAttribute('playOrder'));
    }).forEach((item) => {
      const menu = document.querySelector('.fix-menu');
      const div = document.createElement('div');
      div.classList.add('item');
      div.innerHTML = item.querySelector('text').innerHTML;
      div.addEventListener('click', (e) => {
        jumpToSrc(item.querySelector('content').getAttribute('src'));
      });
      menu.appendChild(div);
    });
  });

}

const fetchContent = (contentPath) => {

  fetch(contentPath)
  .then(response => response.text())
  .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
  .then(data => {
    const manifest = data.querySelector('manifest');
    Array.from(manifest.querySelectorAll('item')).forEach((item) => {
      mfs.set(item.getAttribute('id'), item.getAttribute('href'));
    });
    const spine = data.querySelector('spine');
    Array.from(spine.querySelectorAll('itemref')).forEach((item) => {
      caplist.push(mfs.get(item.getAttribute('idref')));
    });
    
    title = data.querySelector('metadata title').innerHTML;
    document.querySelector('title').innerHTML = title;
    document.querySelector('.title').innerHTML = title;

    ws.send('reading-progress');

    fetchTocNcx(mfs.get('ncx'));
  });

}

fetch('/rootfile')
.then(res => res.text())
.then(fetchContent);

const saveProgress = () => {
  const page = caplist[nowindex];
  const top = document.documentElement.scrollTop || document.body.scrollTop;
  ws.send(JSON.stringify([title, page, top]));
}

// on exit
window.addEventListener('beforeunload', (e) => {
  saveProgress();
  fetch('/leave-page');
});

document.addEventListener('visibilitychange', function() {
  if (document.hidden){
    document.querySelector('title').innerHTML = '【P2767】树的数量 - 洛谷';
    saveProgress();
  } else {
    document.querySelector('title').innerHTML = title;
  }
});
