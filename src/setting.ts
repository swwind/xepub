import { $ } from "./utils";

import SystemFontStyle from './style/lazy/force-system-font.lazy.less';

const darkmode = $('#darkmode') as HTMLInputElement;
const systemFont = $('#system-font') as HTMLInputElement;

const applyDarkmode = (enable: boolean) => {
  if (enable) {
    console.log('darkmode!!!');
  } else {
    console.log('lightmode!!!');
  }
}

const applySystemFont = (enable: boolean) => {
  if (enable) {
    SystemFontStyle.use();
  } else {
    SystemFontStyle.unuse();
  }
}

export const init = () => {
  darkmode.addEventListener('change', (e) => {
    applyDarkmode(darkmode.checked);
  });

  systemFont.addEventListener('change', (e) => {
    applySystemFont(systemFont.checked);
  });
}