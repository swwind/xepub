import { Socket } from "./socket";

/**
 * Query selector
 */
export const $ = (name: string): HTMLElement => document.querySelector(name);

/**
 * Query selector all
 */
export const $$ = (name: string): HTMLElement[] => Array.from(document.querySelectorAll(name));

/**
 * Set title
 */
export const setTitle = (title: string) => {
  $('.logo').textContent = title;
  $('.logo').setAttribute('title', title);
  $('title').textContent = title;
}

/**
 * Set title for brand only
 */
export const setSubTitle = (title: string) => {
  $('.logo').textContent = title;
  $('.logo').setAttribute('title', title);
}

export const socket = new Socket(`ws://${location.host}`);

export interface LessStyle {
  use(): void;
  unuse(): void;
}

export const fuckStyleLoader = (style: LessStyle): LessStyle => {
  let used = false;
  return {
    use() {
      if (!used) {
        used = true;
        style.use();
      }
    },
    unuse() {
      if (used) {
        used = false;
        style.unuse();
      }
    }
  }
}
