import { $ } from './utils';
import { animate } from "./animate";
import { linear } from './timings';

const fadeInDelay = (delay: number, button: HTMLElement) => {
  setTimeout(() => {
    animate((x) => {
      button.style.transform = `translateY(${24 - x * 24}px)`;
      button.style.opacity = String(x);
    }, 200, linear);
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
        fadeInDelay(index * 20, button);
      }
    });
    buttons.style.height = '300px';
  });

  const closeBtnEvent = async () => {
    if (!shown) {
      return;
    }
    await animate((x) => {
      for (const node of Array.from(submenu.childNodes)) {
        if (node instanceof HTMLLIElement) {
          node.style.opacity = String(1 - x);
        }
      }
    });
    submenu.style.display = 'none';
    buttons.style.height = '90px';
    shown = false;
  }

  buttons.addEventListener('mouseleave', closeBtnEvent);
  submenu.childNodes.forEach((button) => {
    if (button instanceof HTMLLIElement) {
      button.addEventListener('click', closeBtnEvent);
    }
  });
}
