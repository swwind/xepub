const getScrollTop = () => {
  return document.documentElement.scrollTop || document.body.scrollTop;
}

export const setScrollTop = (top) => {
  document.body.scrollTop = top; // For Safari
  document.documentElement.scrollTop = top; // For Chrome, Firefox, IE and Opera
}

export const scrollTo = (pos, time = 500) => {
  const timefn = x => x*x / (x*x + (1-x)*(1-x));
  const last = Date.now();
  const lastpos = getScrollTop();
  const fn = (now) => {
    now = Date.now() - last;
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

export const flyToElement = (el) => {
  // fake invoke
  if (!el) return;

  console.log('Scrolling to ' + el);

  const elem = document.querySelector(el);
  if (!elem) {
    console.warn('Cannot find element: ' + el);
    return;
  }
  const target = getScrollTop() + elem.getBoundingClientRect().top;

  scrollTo(target - 100);
}
