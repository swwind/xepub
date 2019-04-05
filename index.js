'use strict';

const fs = require('fs');
const opn = require('opn');
const path = require('path');
const http = require('http');
const https = require('https');
const AdmZip = require('adm-zip');
const express = require('express');
const socketio = require('socket.io');
const alert = require('./backend/alert');
const packages = require('./package.json');
const options = require('./backend/options');
const serveZip = require('./backend/serve-zip');
const createCert = require('./backend/create-cert');
const EpubParser = require('./backend/epub-parser');

const here = path.join.bind(null, __dirname);

const option = options(process.argv.slice(2));

if (option.debug) {
  alert.debugMode();
}

if (option.version) {
  alert.info('Xepub version v' + packages.version);
  process.exit(0);
}

if (option.gencert) {
  createCert.createRootCA();
  createCert.createCert('localhost');
  process.exit(0);
}

const epubname = option.source[0];
if (!epubname) {
  option.help = 1;
}

if (option.help !== false) {
  console.log(fs.readFileSync(path.resolve(__dirname, 'backend', 'help.txt'), 'utf-8'));
  process.exit(option.help);
}

const hasCert = fs.existsSync(path.resolve(__dirname, 'cert'));

if (option.https === null) {
  option.https = hasCert;
}
if (option.https && !hasCert) {
  alert.error('To enable https, you must generate a certificate first.');
  alert.error('Use following command:');
  alert.error('$ xepub --gencert');
  process.exit(1);
}

if (!fs.existsSync(epubname)) {
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

alert.debug('Successfully parsed file');

const app = express();
app.use(express.static(here('node_modules', 'materialize-css', 'dist')));
app.use(express.static(here('public')));
app.use(serveZip(zip));

const server = !option.https ? http.createServer(app) : https.createServer({
  cert: fs.readFileSync(path.resolve(__dirname, 'cert', 'xepub.crt')),
  key: fs.readFileSync(path.resolve(__dirname, 'cert', 'xepub.key.pem')),
}, app);

const io = socketio(server);
io.on('connect', (socket) => {
  alert.debug('New client connected, ip: ' + socket.handshake.address);
  socket.emit('initialize', epub);
});
server.listen(option.port);
const url = `${option.https ? 'https' : 'http'}://${option.ipv6 ? '[::1]' : 'localhost'}:${option.port}`;
alert.info(`Finished, listening on ${url}`);

if (option.open) {
  opn(url);
}

process.on('SIGINT', () => {
  process.exit(0);
});
