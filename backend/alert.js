require('colors');

const flags = {
  unstable: false,
}

const error = (message) => {
  console.error('[ERRO]'.red, message);
}
const warn = (message) => {
  console.warn('[WARN]'.yellow, message);
}
const info = (message) => {
  console.log('[INFO]'.white, message);
}
const unstable = () => {
  if (!flags.unstable) {
    warn('This book has some problems while parsing...');
    warn('I can not ensure whether xepub can deal it proper or not.');
    flags.unstable = true;
  }
}
const broken = () => {
  if (!flags.broken) {
    error('This book is almost broken!!!');
    error('Xepub may crash.');
    flags.broken = true;
  }
}
const newline = () => {
  console.log();
}

module.exports = {
  error, warn, info, unstable, broken, newline
}