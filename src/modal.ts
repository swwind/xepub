export interface Modal {
  show(): void;
  hide(): void;
}

export const init = (elem: HTMLElement): Modal => {
  const ok = elem.querySelector('.ok.button') as HTMLDivElement;
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
    setTimeout(() => {
      elem.classList.add('open');
    });
  }

  const hide = () => {
    elem.classList.remove('open');
    setTimeout(() => {
      elem.style.display = 'none';
    }, 200);
  }

  return {
    show,
    hide
  }
}
