'use strict';

const { error } = require("./alert");

const flags = {
  'p': 'port',
  'o': 'open',
  'e': 'electron',
  'h': 'help',
  'v': 'version',
}

/**
 * parse command line arguments
 */
const options = (args) => {
  const res = {
    port: -1, // -1: default
    open: false,
    electron: false,
    help: false,
    version: false,
    debug: false,
    _: [],
  };

  for (let i = 0; i < args.length; ++ i) {
    const arg = args[i];
    if (arg.charAt(0) === '-') {
      const flag = flags[arg.charAt(1)] || arg.slice(2);
      switch (typeof res[flag]) {
        case 'boolean':
          res[flag] = true;
          break;
        case 'number':
          res[flag] = Number(args[++ i]);
          break;
        default:
          error(`Unkown option: ${arg}`);
          error('Try `xepub --help` for more information.');
          process.exit(1);
      }
    } else {
      res._.push(arg);
    }
  }

  return res;
}

module.exports = options;
