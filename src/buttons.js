const { $ } = require("./utils");
const { walk, timings } = require("./animate");

const fadeIn = (delay, button) => {
  setTimeout(() => {
    walk((x) => {
      button.style.transform = `translateY(${24 - x * 24}px)`;
      button.style.opacity = x;
    }, 200, timings.linear);
  }, delay);
}
const submenu = $('#submenu');
const menu = $('#menu');
const buttons = $('.buttons');

export const init = () => {
  let shown = false;
  
  menu.addEventListener('click', () => {
    if (shown) {
      return;
    }
    shown = true;
    submenu.style.display = 'block';
    submenu.childNodes.forEach((button, index) => {
      if (button instanceof HTMLLIElement) {
        fadeIn(index * 20, button);
      }
    });
    buttons.style.height = '300px';
  });

  buttons.addEventListener('mouseleave', async () => {
    await walk((x) => {
      for (const node of submenu.childNodes) {
        if (node instanceof HTMLLIElement) {
          node.style.opacity = 1 - x;
        }
      }
    });
    submenu.style.display = 'none';
    buttons.style.height = '90px';
    shown = false;
  });
  
}