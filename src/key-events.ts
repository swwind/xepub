
const f = (b: boolean, t: string) => b ? t : '';

/**
 * Mount a couple of keys to a callback
 * 
 * Matches: [Ctrl+][Shift+][Alt+]{e.key}
 */
export const on = (...keyname) => {
  const callback = keyname.reverse().shift();
  window.addEventListener('keydown', (e) => {
    const key = f(e.ctrlKey, 'Ctrl+') + f(e.shiftKey, 'Shift+') + f(e.altKey, 'Alt+') + e.key;
    if (keyname.indexOf(key) > -1) {
      callback();
    }
  });
}
