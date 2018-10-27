'use strict';

const { Command, flags } = require('@oclif/command');

const fs = require('fs');
const os = require('os');
const opn = require('opn');
const http = require('http');
const path = require('path');
const unzip = require('unzip');
const { ncp } = require('ncp');
const WebSocket = require('ws');
const express = require('express');
const sockets = require('./sockets.js');
const DataStore = require('./data-store.js');
const tcpPortUsed = require('tcp-port-used');

const nope = () => {};

const store = DataStore('xepub', 'history');
const config = DataStore('xepub', 'config', {
  theme: 'white',
  title: 'Google'
});

const getRandomString = () => {
  return Math.floor(Math.random() * 4294967296).toString(16);
}

const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

let outputpath;
let connections = 0;

const _saveExit = () => {
  console.log();
  console.log('Exiting...');
  console.log('Removing tmp files...');
  deleteFolderRecursive(outputpath);
  console.log('GL & HF');
  process.exit(0);
}
let exitTimeout;
const saveExit = () => {
  exitTimeout = setTimeout(_saveExit, 2000);
}
const cancelExit = () => {
  if (exitTimeout) {
    clearTimeout(exitTimeout);
    exitTimeout = 0;
  }
}


const getFreePort = async (port) => {
  for (let i = port; i < 65535; ++ i) {
    const isUse = await tcpPortUsed.check(i, '127.0.0.1');
    if (!isUse) return i;
  }
  throw new Error('No free port avalible.');
}

class XepubCommand extends Command {
  async run() {

    const __thisdir = process.cwd();

    const { flags, argv } = this.parse(XepubCommand);
    const port = flags.port || await getFreePort(15635);
    const file = argv[0];
    const filepath = path.resolve(__thisdir, file);
    outputpath = path.resolve(os.tmpdir(), 'xepub', `.tmp-${getRandomString()}`);

    if (fs.existsSync(outputpath)) {
      deleteFolderRecursive(outputpath);
    }

    console.log('Unzipping file...');
    // unzip file
    fs.createReadStream(filepath)
    .pipe(unzip.Extract({ path: outputpath }))
    .on('close', () => {

      console.log('Starting http and websocket server...');

      const metainf = fs.readFileSync(path.resolve(outputpath, 'META-INF/container.xml'));
      const roots = /full-path="([^"]+)"/i.exec(metainf)[1];
      const rootdir = path.dirname(roots);
      const rootfile = path.basename(roots);

      const app = express();
      app.use(express.static(path.resolve(outputpath, rootdir)));

      const server = http.createServer(app);

      const wss = new WebSocket.Server({ server });

      wss.on('connection', (ws) => {

        ++ connections;
        cancelExit();

        console.log('Connected to a new user. (' + connections + ' users online)');

        ws.on('close', () => {
          -- connections;
          if (!connections) {
            saveExit();
          }
          console.log('A user leaved.           (' + connections + ' users online)');
        });

        const client = sockets(ws);
        client.on('save', (name, page, top) => {
          store.set(name, { page, top });
        });
        client.on('progress', () => {
          client.remote('progress', store.get());
        });
        client.on('load-config', () => {
          client.remote('theme', config.get('theme'));
          client.remote('title', config.get('title'));
        });
        client.on('config', (type, value) => {
          config.set(type, value);
          client.remote(type, value);
        });
        client.on('query-config', () => {
          client.remote('query-config', config.get());
        })
        client.remote('rootfile', rootfile);

      });

      server.listen(port);

      console.log('Copying asserts...');

      ncp(path.resolve(__dirname, 'asserts'), path.resolve(outputpath, rootdir), (err) => {

        const url = 'http://localhost:' + port;
        console.log('All finished, opening ' + url);
        console.log();
        opn(url);

      });

    });

  }
}

XepubCommand.description = `Describe the command here`;
XepubCommand.usage = `novel.epub`;
XepubCommand.args = [ { name: 'file', required: true } ];
XepubCommand.flags = {
  version: flags.version({char: 'v', description: 'show xepub version'}),
  help: flags.help({char: 'h', description: 'show this help'}),
  port: flags.integer({char: 'p', description: 'port you want to open'}),
}

process.on('SIGINT', _saveExit);

module.exports = XepubCommand;
