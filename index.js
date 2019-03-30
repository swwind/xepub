'use strict';

const fs = require('fs');
const opn = require('opn');
const path = require('path');
const http = require('http');
const AdmZip = require('adm-zip');
const express = require('express');
const socketio = require('socket.io');
const alert = require('./backend/alert');
const packages = require('./package.json');
const options = require('./backend/options');
const serveZip = require('./backend/serve-zip');
const EpubParser = require('./backend/epub-parser');

const here = (name) => path.join(__dirname, name);

const option = options(process.argv.slice(2));

if (option.help) {
  console.log(fs.readFileSync(path.resolve(__dirname, 'backend/help.txt'), 'utf-8'));
  process.exit(0);
}

if (option.version) {
  alert.info('Xepub version v' + packages.version);
  process.exit(0);
}

const epubname = option.source[0];
if (!epubname || !fs.existsSync(epubname)) {
  alert.error('File not found, try `xepub --help`');
  process.exit(1);
}

const zip = new AdmZip(epubname);
if (zip.readAsText('mimetype').trim() !== 'application/epub+zip') {
  alert.error('Not epub file');
  process.exit(1);
}

alert.info('Parsing file...');

const epub = EpubParser(zip);

const app = express();
app.use(express.static(here('node_modules/materialize-css/dist')));
app.use(express.static(here('public')));
app.use(serveZip(zip));

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
