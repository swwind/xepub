'use strict';

const { Command, flags } = require('@oclif/command');

const fs = require('fs');
const os = require('os');
const opn = require('opn');
const http = require('http');
const path = require('path');
const unzip = require('unzip');
const express = require('express');
const WebSocket = require('ws');
const tcpPortUsed = require('tcp-port-used');

const nope = () => {};

const store = require('./data-store.js')('xepub');

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
let wss;

const _saveExit = () => {
  deleteFolderRecursive(outputpath);
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
    outputpath = path.resolve(__thisdir, `.tmp-${getRandomString()}/`);

    if (fs.existsSync(outputpath)) {
      deleteFolderRecursive(outputpath);
    }

    // unzip file
    fs.createReadStream(filepath)
    .pipe(unzip.Extract({ path: outputpath }))
    .on('close', () => {

      const metainf = fs.readFileSync(path.resolve(outputpath, 'META-INF/container.xml'));
      const roots = /full-path="([^"]+)"/i.exec(metainf)[1];
      const [ rootdir, rootfile ] = roots.split('/');

      const copyAssert = (name) => {
        const index_path = path.resolve(__dirname, 'asserts/' + name);
        const index_path_to = path.resolve(outputpath, rootdir + '/' + name);

        if (!fs.existsSync(path.dirname(index_path_to))) {
          fs.mkdirSync(path.dirname(index_path_to));
        }
        fs.createReadStream(index_path).pipe(fs.createWriteStream(index_path_to));
      }
      copyAssert('index.html');
      copyAssert('favicon.ico');
      copyAssert('xepub/xepub.js');
      copyAssert('xepub/xepub.css');
      copyAssert('nprogress/nprogress.js');
      copyAssert('nprogress/nprogress.css');

      const app = express();
      app.get('/rootfile', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(rootfile);
      });
      app.use(express.static(path.resolve(outputpath, rootdir)));

      const server = http.createServer(app);

      wss = new WebSocket.Server({ server });
      wss.on('connection', (ws) => {
        ++ connections;
        cancelExit();
        ws.on('close', () => {
          -- connections;
          if (!connections) {
            saveExit();
          }
        });
        ws.on('message', (data) => {
          if (data === 'reading-progress') {
            ws.send(store.json());
            return;
          }
          const [name, page, top] = JSON.parse(data);
          store.set(name, { page, top });
        });
      });

      server.listen(port);

      opn(`http://localhost:${port}`);

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

process.on('SIGINT', saveExit);

module.exports = XepubCommand;
