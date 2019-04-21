
export const socket = io();
export const $ = name => document.querySelector(name);
export const $$ = name => document.querySelectorAll(name);
export const setTitle = (title) => {
  $('.brand-logo').textContent = title;
  $('.brand-logo').setAttribute('title', title);
  $('title').textContent = title;
}
export const setSubTitle = (title) => {
  $('.brand-logo').textContent = title;
  $('.brand-logo').setAttribute('title', title);
}
