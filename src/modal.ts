import { walk } from "./animate";
import { linear } from "./timings";

export interface Modal {
  show(): void;
  hide(): void;
}

export const init = (elem: HTMLElement): Modal => {
  const ok = elem.querySelector('.ok.button') as HTMLDivElement;
  const bg = elem.querySelector('.background') as HTMLDivElement;
  const ct = elem.querySelector('.container') as HTMLDivElement;
  ok.addEventListener('click', () => {
    hide();
  });

  elem.addEventListener('click', () => {
    hide();
  });
  const container = elem.querySelector('.container');
  container.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const show = () => {
    elem.style.display = 'block';
    walk((x) => {
      bg.style.backgroundColor = `rgba(0, 0, 0, ${x * .5})`;
      ct.style.transform = `scale(${.8 + .2 * x})`;
      ct.style.opacity = String(x);
    });
  }

  const hide = () => {
    walk((x) => {
      bg.style.backgroundColor = `rgba(0, 0, 0, ${.5 - x * .5})`;
      ct.style.transform = `scale(${1 - .2 * x})`;
      ct.style.opacity = String(1 - x);
    }).then(() => {
      elem.style.display = 'none';
    });
  }

  return {
    show,
    hide
  }
}
