'use strict';

const fs = require('fs');
const os = require('os');
const opn = require('opn');
const http = require('http');
const path = require('path');
const { ncp } = require('ncp');
const WebSocket = require('ws');
const express = require('express');
const unzipper = require('unzipper');
const sockets = require('./sockets.js');
const parseEpub = require('./parse-epub.js');
const DataStore = require('./data-store.js');

const store = DataStore('xepub', 'history');
const config = DataStore('xepub', 'config', {
  theme: 'white',
  title: '',
  fonts: '',
  'use-custom-text-color': true,
  'use-custom-font-family': false,
});

const getRandomString = () => {
  let res = '';
  for (let i = 1; i <= 10; ++ i) {
    res += Math.floor(Math.random() * 16).toString(16);
  }
  return res;
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
}

const unzipFile = (file, path) =>
  new Promise((resolve, reject) => {
    fs.createReadStream(file)
    .pipe(unzipper.Extract({ path }))
    .on('close', resolve)
    .on('error', reject);
  });

const copydir = (fromdir, todir) =>
  new Promise((resolve, reject) => {
    ncp(fromdir, todir, err => {
      if (err) reject(err);
      else resolve();
    });
  });

class Timer {
  constructor(func) {
    this.func = func;
  }
  emit(timeout) {
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.func();
        process.exit(0);
      }, timeout);
    }
  }
  cancel() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}


module.exports = async (file, { keep, port, maxUser }) => {

  const filepath = path.resolve(process.cwd(), file);
  const tmpdir = path.resolve(os.tmpdir(), 'xepub', getRandomString());

  if (!fs.existsSync(filepath)) {
    console.error('File not found');
    process.exit(1);
  }

  if (fs.existsSync(tmpdir)) {
    deleteFolderRecursive(tmpdir);
  }

  const timer = new Timer(() => {
    deleteFolderRecursive(tmpdir);
  });
  process.on('SIGINT', () => timer.emit(0));

  console.log('Unzipping file...');
  // unzip file
  try {
    await unzipFile(filepath, tmpdir);
  } catch (e) {
    console.error(e);
    timer.func();
    process.exit(2);
  }


  console.log('Copying assets...');
  // copy assets
  try {
    await copydir(path.resolve(__dirname, 'assets'), tmpdir);
  } catch (e) {
    console.error(e);
    timer.func();
    process.exit(3);
  }

  console.log('Parsing epub files...');

  let epub;
  try {
    epub = await parseEpub(tmpdir);
  } catch (e) {
    console.error(e);
    timer.func();
    process.exit(4);
  }

  console.log('Setting up http and websocket server...');
  // set up http and websocket server
  try {

    const app = express();
    app.use(express.static(tmpdir));
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });
    let connections = 0;

    wss.on('connection', (ws, req) => {

      const ip = req.connection.remoteAddress;

      if (connections === maxUser) {
        ws.close();
        console.log(`Aborted a connection     (ip: ${ip})`);
        return;
      }

      ++ connections;
      !keep && timer.cancel();

      console.log(`Connected to a new user  (ip: ${ip}) - (${connections} users online)`);

      ws.on('close', () => {
        -- connections;
        !connections && !keep && timer.emit(2000);
        console.log(`Disconnected from a user (ip: ${ip}) - (${connections} users online)`);
      });

      const client = sockets(ws);

      // request to save progress
      client.on('save', (name, page, top) => {
        store.set(name, { page, top });
      });

      // request to load progress
      client.on('progress', () => {
        client.remote('progress', store.get());
      });

      // request to save modified configurations
      client.on('config', (type, value) => {
        config.set(type, value);
        client.remote('config-change', config.get());
      });

      // config.html page request for current configurations
      client.on('query-config', () => {
        client.remote('query-config', config.get());
      });

      // main page request for initalize the configurations
      client.on('load-config', () => {
        client.remote('config-change', config.get());
      });

      // emit client to start load the file
      client.remote('init', epub);

    });

    server.listen(port);

    opn('http://localhost:' + port);

  } catch (e) {
    // delete tmpdir
    console.error(e);
    timer.func();
    process.exit(5);
  }

}
