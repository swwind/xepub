const elem = document.querySelector('.toast');

let lasttimeout;
export const toast = (text) => {
  if (!elem.classList.contains('show')) {
    elem.classList.remove('hide');
    elem.classList.add('show');
  }
  elem.innerText = text;
  if (lasttimeout) {
    clearTimeout(lasttimeout);
  }
  lasttimeout = setTimeout(() => {
    elem.classList.add('hide');
    elem.classList.remove('show');
  }, 5000);
}
