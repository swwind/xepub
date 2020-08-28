
export interface SideNav {
  show(): void;
  hide(): void;
}

export const init = (elem: HTMLElement): SideNav => {
  const background: HTMLDivElement = elem.querySelector('.background');

  elem.addEventListener('click', (e) => {
    hide();
  });

  const show = () => {
    background.style.display = 'block';
    setTimeout(() => {
      elem.classList.add('open');
    });
  }

  const hide = () => {
    elem.classList.remove('open');
    setTimeout(() => {
      background.style.display = 'none';
    }, 200);
  }

  return {
    show,
    hide
  }
}
