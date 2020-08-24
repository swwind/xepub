
export const socket = io();

/**
 * Query selector
 * @param {string} name 
 * @returns {HTMLElement}
 */
export const $ = name => document.querySelector(name);

/**
 * Query selector all
 * @param {string} name 
 * @returns {HTMLElement[]}
 */
export const $$ = name => Array.from(document.querySelectorAll(name));

/**
 * Set title
 * @param {string} title 
 */
export const setTitle = (title) => {
  $('.brand-logo').textContent = title;
  $('.brand-logo').setAttribute('title', title);
  $('title').textContent = title;
}

/**
 * Set title for brand only
 * @param {string} title 
 */
export const setSubTitle = (title) => {
  $('.brand-logo').textContent = title;
  $('.brand-logo').setAttribute('title', title);
}
