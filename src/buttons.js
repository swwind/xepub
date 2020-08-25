const { $ } = require("./utils");
const { walk } = require("./animate");

const fadeIn = (delay, button) => {
  setTimeout(() => {
    walk((x) => {
      button.style.transform = `translateY(${24 - x * 24}px)`;
      button.style.opacity = x;
    });
  }, delay);
}
const submenu = $('#submenu');

export const init = () => {
  let shown = false;
  
  $('#menu').addEventListener('click', () => {
    shown = true;
    submenu.childNodes.forEach((button, index) => {
      if (button instanceof HTMLLIElement) {
        button.style.visibility = 'visible';
        fadeIn(index * 20, button);
      }
    });
  });

  $('.buttons').addEventListener('mouseleave', async () => {
    await walk((x) => {
      for (const node of submenu.childNodes) {
        if (node instanceof HTMLLIElement) {
          node.style.opacity = 1 - x;
        }
      }
    });
    for (const node of submenu.childNodes) {
      if (node instanceof HTMLLIElement) {
        node.style.visibility = 'hidden';
      }
    }
    shown = false;
  });
  
}