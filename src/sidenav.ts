import { animate } from "./animate";

export interface SideNav {
  show(): void;
  hide(): void;
}

export const init = (elem: HTMLElement): SideNav => {
  const bg: HTMLDivElement = elem.querySelector('.background');
  const nv: HTMLDivElement = elem.querySelector('.nav');

  elem.addEventListener('click', (e) => {
    hide();
  });

  const show = () => {
    elem.style.display = 'block';
    animate((x) => {
      bg.style.backgroundColor = `rgba(0, 0, 0, ${x * .5})`;
      nv.style.left = `${300 * x - 300}px`;
    });
  }

  const hide = () => {
    animate((x) => {
      bg.style.backgroundColor = `rgba(0, 0, 0, ${.5 - x * .5})`;
      nv.style.left = `${- 300 * x}px`;
    }).then(() => {
      elem.style.display = 'none';
    });
  }

  return {
    show,
    hide
  }
}
