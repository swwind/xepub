
export const init = (elem) => {
  const background = elem.querySelector('.background');
  const nav = elem.querySelector('.nav');

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
