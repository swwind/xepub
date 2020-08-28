import { $ } from "./utils";

const elem = $('.toast') as HTMLDivElement;

let lasttimeout: number;
export const toast = (text: string) => {
  if (!elem.classList.contains('show')) {
    elem.classList.remove('hide');
    elem.classList.add('show');
  }
  elem.innerText = text;
  if (lasttimeout) {
    clearTimeout(lasttimeout);
  }
  lasttimeout = window.setTimeout(() => {
    elem.classList.add('hide');
    elem.classList.remove('show');
  }, 5000);
}
