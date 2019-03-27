export const encode = (elem) => {

  if (elem.length !== undefined) {
    Array.from(elem).forEach(encode);
    return;
  }

  const src = elem.getAttribute('src');
  const size = window.epub.sizes[src];
  if (size) {
    elem.setAttribute('data-src', src);
    elem.removeAttribute('src');
    if (elem.hasAttribute('alt')) {
      elem.setAttribute('data-alt', elem.getAttribute('alt'));
      elem.removeAttribute('alt');
    }
    elem.style.width = size.width + 'px';
    elem.style.height = size.height + 'px';
  } else {
    console.warn('image not in manifest: ' + src);
  }
}

export const update = () => {
  const imgs = Array.from(document.querySelectorAll('img[data-src]'));

  imgs.forEach((img) => {

    const { top, bottom } = img.getBoundingClientRect();
    if (top < window.innerHeight + 500 && bottom > - 500) {

      img.setAttribute('src', img.getAttribute('data-src'));
      img.removeAttribute('data-src');

      if (img.hasAttribute('data-alt')) {
        img.setAttribute('alt', img.getAttribute('data-alt'));
        img.removeAttribute('data-alt');
      }

      // remove fixed width and height
      img.onload = () => {
        img.removeAttribute('style');
      }
    }
  })
}
