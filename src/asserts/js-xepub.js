
const mfs = new Map();
const caplist = [];
let nowindex = 0;
let title = '';

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

const scrollTo = (elem, pos, time) => {
  const timefn = x => x*x / (x*x + (1-x)*(1-x));
  let last = new Date().getTime();
  let lastpos = elem.scrollTop;
  let fn = (now) => {
    now = new Date().getTime() - last;
    if (now < time) {
      let nowpos = (pos - lastpos) * timefn(now / time) + lastpos;
      elem.scrollTop = nowpos;
      requestAnimationFrame(fn);
    } else {
      elem.scrollTop = pos;
    }
  }
  requestAnimationFrame(fn);
}

document.body.addEventListener('click', hideMenu);
document.querySelector('.menu').addEventListener('click', (e) => {
  showMenu();
  e.stopPropagation();
});
document.querySelector('iframe').addEventListener('load', (e) => {
  const obj = e.target;
  obj.style.height = Math.max(obj.contentWindow.document.body.scrollHeight + 50, obj.clientWidth * 1.414) + 'px';
  obj.contentWindow.document.head.innerHTML += '<style>img{max-width:100%;user-select:none;}</style>';
  obj.classList.remove('opacity');
  scrollTo(document.querySelector('.container'), + obj.getAttribute('data-top'), 500);
  obj.contentWindow.document.body.addEventListener('click', hideMenu);
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
});

const jumpToSrc = (src, top = 0) => {
  document.querySelector('iframe').classList.add('opacity');
  setTimeout(() => {
    document.querySelector('iframe').src = src + '?data=' + new Date();
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

    const lastRead = JSON.parse(localStorage.getItem(title));
    if (lastRead) {
      jumpToSrc(lastRead.page, lastRead.top);
    } else {
      jumpToSrc(caplist[0]);
    }

    fetchTocNcx(mfs.get('ncx'));
  });

}

fetch('/rootfile')
.then(res => res.text())
.then(fetchContent);

// on exit
window.addEventListener('beforeunload', (e) => {
  const data = {
    page: caplist[nowindex],
    top:  document.querySelector('.container').scrollTop
  }
  localStorage.setItem(title, JSON.stringify(data));
  fetch('/leave-page');
});

document.addEventListener("visibilitychange", function() {
  if (document.hidden){
    document.querySelector('title').innerHTML = '【P2767】树的数量 - 洛谷';
  } else {
    document.querySelector('title').innerHTML = title;
  }
});

const keyEvent = (e) => {
  if (e.code === 'ArrowLeft') {
    jumpToPrev();
  }
  if (e.code === 'ArrowRight') {
    jumpToNext();
  }
}
window.addEventListener('keydown', keyEvent);
