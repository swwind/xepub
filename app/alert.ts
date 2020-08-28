'use strict';

import 'colors';

const flags = {
  unstable: false,
  broken: false,
  debug: false,
}

export const error = (message = '') => {
  console.error('[ERRO]'.red, message);
}
export const warn = (message = '') => {
  console.warn('[WARN]'.yellow, message);
}
export const info = (message = '') => {
  console.log('[INFO]'.white, message);
}
export const debug = (message = '') => {
  if (flags.debug) {
    console.log('[DBUG]'.green, message);
  }
}
export const unstable = () => {
  if (!flags.unstable) {
    warn('This book has some problems while parsing...');
    warn('I can not ensure whether xepub can deal it properly or not.');
    flags.unstable = true;
  }
}
export const broken = () => {
  if (!flags.broken) {
    error('This book is almost broken!!!');
    error('Xepub may crash.');
    flags.broken = true;
  }
}
export const debugMode = () => {
  flags.debug = true;
}
