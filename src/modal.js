export const init = (elem) => {
  const ok = elem.querySelector('.ok.button');
  ok.addEventListener('click', (e) => {
    hide();
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
