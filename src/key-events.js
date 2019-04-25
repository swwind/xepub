export const on = (...keyname) => {
  const callback = keyname.reverse().shift();
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }
    if (keyname.indexOf(e.key) > -1) {
      callback();
    }
  })
}
