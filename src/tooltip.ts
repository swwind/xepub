import { walk } from "./animate";

export const init = () => {
  const elems = document.querySelectorAll('[data-tooltip]');
  elems.forEach((elem) => {
    const tooltip: HTMLDivElement[] = [];
    elem.addEventListener('mouseenter', () => {
      const rect = elem.getBoundingClientRect();
      const top = rect.top + elem.clientHeight / 2 - 15;
      const right = window.innerWidth - rect.right + elem.clientWidth + 15;

      const div = document.createElement('div');
      div.classList.add('tooltip');
      div.style.top = top + 'px';
      div.style.right = (right - 15) + 'px';
      div.style.opacity = String(0);
      div.textContent = elem.getAttribute('data-tooltip');
      document.body.appendChild(div);

      tooltip.push(div);

      walk((x) => {
        div.style.right = (right - 15 + 15 * x) + 'px';
        div.style.opacity = String(x);
      });
    });

    const closeEvent = () => {
      while (tooltip.length) {
        const div = tooltip.shift();
        const right = parseFloat(div.style.right);
        walk((x) => {
          div.style.right = (right + 15 * x) + 'px';
          div.style.opacity = String(1 - x);
        }).then(() => div.remove());
      }
    }

    elem.addEventListener('mouseleave', closeEvent);
    elem.addEventListener('click', closeEvent);
  });
}
