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
const EpubParser = require('./backend/epub-parser');
const { createCert, createRootCA, certFolder } = require('./backend/create-cert');

const here = path.resolve.bind(null, __dirname);

const option = options(process.argv.slice(2));

if (option.debug) {
  alert.debugMode();
}

if (option.version) {
  alert.info('Xepub version v' + packages.version);
  process.exit(0);
}

if (option.gencert) {
  createRootCA();
  createCert();
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

const hasCert = fs.existsSync(certFolder);

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
const mimetype = zip.readAsText('mimetype').trim();
if (mimetype !== 'application/epub+zip') {
  alert.error('Not epub file');
  alert.debug('Mimetype: ' + mimetype);
  process.exit(1);
}

alert.info('Parsing file...');

const epub = EpubParser(zip);

alert.debug('Successfully parsed file');

const app = express();
const dist1 = here('node_modules', 'materialize-css', 'dist');
const dist2 = here('..', 'node_modules', 'materialize-css', 'dist');
if (fs.existsSync(dist1)) {
  app.use(express.static(dist1));
} else if (fs.existsSync(dist2)) {
  app.use(express.static(dist2));
} else {
  alert.error('Materialize CSS not found');
  alert.debug('I am here: ' + __dirname);
  process.exit(1);
}
app.use(express.static());
app.use(express.static(here('public')));
app.use(serveZip(zip));

const server = !option.https ? http.createServer(app) : https.createServer({
  cert: fs.readFileSync(path.resolve(certFolder, 'xepub.crt')),
  key: fs.readFileSync(path.resolve(certFolder, 'xepub.key.pem')),
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
