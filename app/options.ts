'use strict';

import { error } from './alert';

const flags = {
  'p': 'port',
  'o': 'open',
  'e': 'electron',
  'h': 'help',
  'v': 'version',
}

export interface XepubArguments {
  port: number;
  open: boolean;
  electron: boolean;
  help: boolean;
  version: boolean;
  debug: boolean;
  _: string[],
}

export default (args: string[]): XepubArguments => {

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
          error(`Unknown option: ${arg}`);
          error('Try `xepub --help` for more information.');
          process.exit(1);
      }
    } else {
      res._.push(arg);
    }
  }

  return res;
}
