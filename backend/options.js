'use strict';

/**
 * parse command line arguments
 */
const options = (args) => {
  const res = {
    port: 23333,
    ipv6: false,
    open: false,
    help: false,
    version: false,
    debug: false,
    https: null, // null -> default
    gencert: false,
    source: [],
  };
  for (let i = 0; i < args.length; ++ i) {
    if (args[i] === '-p' || args[i] === '--port') {
      res.port = Number(args[++ i]);
      continue;
    }
    if (args[i] === '-6' || args[i] === '--ipv6') {
      res.ipv6 = true;
      continue;
    }
    if (args[i] === '-o' || args[i] === '--open') {
      res.open = true;
      continue;
    }
    if (args[i] === '-h' || args[i] === '--help') {
      res.help = 0;
      continue;
    }
    if (args[i] === '-v' || args[i] === '--version') {
      res.version = true;
      continue;
    }
    if (args[i] === '--https') {
      res.https = true;
      continue;
    }
    if (args[i] === '--http') {
      res.https = false;
      continue;
    }
    if (args[i] === '--gencert') {
      res.gencert = true;
      continue;
    }
    if (args[i] === '--debug') {
      res.debug = true;
      continue;
    }
    res.source.push(args[i]);
  }
  return res;
}

module.exports = options;
