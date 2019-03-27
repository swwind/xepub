'use strict';

const os = require('os');
const fs = require('fs');
const opn = require('opn');
const path = require('path');
const http = require('http');
const rimraf = require('rimraf');
const AdmZip = require('adm-zip');
const express = require('express');
const socketio = require('socket.io');
const alert = require('./backend/alert');
const options = require('./backend/options');
const EpubParser = require('./backend/epub-parser');

const here = (name) => path.join(__dirname, name);

const option = options(process.argv.slice(2));
const epubname = option.source[0];
if (!epubname || !fs.existsSync(epubname)) {
  alert.error('File not found');
  process.exit(1);
}

const zip = new AdmZip(epubname);
if (zip.readAsText('mimetype').trim() !== 'application/epub+zip') {
  alert.error('Not epub file');
  process.exit(1);
}

alert.info('Parsing file...');

const epub = EpubParser(zip);
const tmpdir = path.resolve(os.tmpdir(), 'xepub', Math.random().toString(36).slice(2));

alert.info('Extracting files...');

zip.extractAllTo(tmpdir);

const exit = (code) => {
  if (!code) {
    alert.newline();
    alert.info('Gracefully shutting down... Please wait...');
  }
  rimraf(tmpdir, () => {
    process.exit(code);
  });
}

try {

  const app = express();
  app.use(express.static(here('node_modules/materialize-css/dist')));
  app.use(express.static(here('public')));
  app.use(express.static(tmpdir));

  const server = http.createServer(app);
  const io = socketio(server);
  io.on('connect', (socket) => {
    socket.emit('initialize', epub);
  });
  server.listen(option.port);
  const url = `http://${option.ipv6 ? '[::1]' : '127.0.0.1'}:${option.port}`;
  alert.info(`All finished, listening on ${url}`);

  if (option.open) {
    opn(url);
  }

  process.on('SIGINT', () => exit(0));
} catch (e) {
  exit(1);
}
