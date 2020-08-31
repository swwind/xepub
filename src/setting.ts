import { $, socket, fuckStyleLoader, LessStyle } from "./utils";

import SystemFontStyle from './style/lazy/force-system-font.lazy.less';
import DarkmodeStyle from './style/lazy/darkmode.lazy.less';
import { KeyMap } from "../app/types";

export interface SettingItem<T> {
  elem: HTMLInputElement;
  set(value: T): void;
  get(): T;
  type: 'checkbox' | 'text';
  deft: T;
}

const createCheckboxStyleSetting = (name: string, elem: HTMLInputElement, style: LessStyle): SettingItem<boolean> => {
  const fucked = fuckStyleLoader(style);
  return {
    elem,
    type: 'checkbox',
    set(value: boolean) {
      if (value) {
        console.log('Enabled ' + name);
        fucked.use();
      } else {
        console.log('Disabled ' + name);
        fucked.unuse();
      }
    },
    get() {
      return elem.checked;
    },
    deft: false,
  }
}

const settingList: KeyMap<SettingItem<boolean>> = {
  darkmode: createCheckboxStyleSetting('darkmode', $('#darkmode') as HTMLInputElement, DarkmodeStyle),
  systemfont: createCheckboxStyleSetting('systemfont', $('#system-font') as HTMLInputElement, SystemFontStyle)
}

const cacheSettings = () => {
  const config: KeyMap<boolean> = { };
  for (const name in settingList) {
    config[name] = settingList[name].get();
  }
  localStorage.setItem('config', JSON.stringify(config));
}

export const init = () => {

  const cache = localStorage.getItem('config');
  if (cache) {
    const config = JSON.parse(cache);
    for (const name in config) {
      settingList[name].set(config[name]);
    }
  }

  socket.on('initialize', (_, settings: KeyMap<string | boolean>) => {
    for (const name in settingList) {
      const { elem, set, deft, type } = settingList[name];
      if (type === 'checkbox') {
        elem.checked = typeof settings[name] === 'undefined' ? deft : settings[name] as boolean;
        set(elem.checked);

        elem.addEventListener('change', () => {
          set(elem.checked);
          socket.remote('config-change', name, elem.checked);
          
          cacheSettings();
        });
      }
    }
    cacheSettings();
  });
}
