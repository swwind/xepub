export const init = () => {
  const elems = document.querySelectorAll('[data-tooltip]');
  Array.from(elems).forEach((elem) => {
    let tooltip;
    elem.addEventListener('mouseenter', () => {
      const rect = elem.getBoundingClientRect();
      const top = rect.top + elem.clientHeight / 2 - 15;
      const right = window.innerWidth - rect.right + elem.clientWidth + 15;

      const div = document.createElement('div');
      div.classList.add('tooltip');
      div.style.top = top + 'px';
      div.style.right = right + 'px';
      div.textContent = elem.getAttribute('data-tooltip');
      document.body.appendChild(div);

      tooltip = div;
    });
    elem.addEventListener('mouseleave', (e) => {
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
}