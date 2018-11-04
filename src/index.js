'use strict';

const tcpPortUsed = require('tcp-port-used');
const { Command, flags } = require('@oclif/command');

const main = require('./main.js');

const getFreePort = async (port) => {
  for (let i = port; i < 65535; ++ i) {
    const isUse = await tcpPortUsed.check(i, '127.0.0.1');
    if (!isUse) return i;
  }
  throw new Error('No free port avalible.');
}

class XepubCommand extends Command {
  async run() {

    const { flags, argv } = this.parse(XepubCommand);
    const port = flags.port || await getFreePort(15635);
    const keep = flags.keep;
    const maxUser = flags['max-user'];
    const file = argv[0];

    main(file, { keep, port, maxUser });

  }
}

XepubCommand.description = `A lightweight epub reader`;
XepubCommand.usage = `[OPTIONS] FILE`;
XepubCommand.args = [ { name: 'file', required: true } ];
XepubCommand.flags = {
  version: flags.version({char: 'v', description: 'show xepub version'}),
  help: flags.help({char: 'h', description: 'show this help'}),
  port: flags.integer({char: 'p', description: 'port you want to open'}),
  keep: flags.boolean({char: 'k', description: 'disable auto close when no people was online'}),
  'max-user': flags.integer({description: 'max online user', default: 1}),
}

module.exports = XepubCommand;
