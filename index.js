'use strict';

const fs = require('fs');
const opn = require('opn');
const pug = require('pug');
const URL = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const AdmZip = require('adm-zip');
const express = require('express');
const csstree = require('css-tree');
const socketio = require('socket.io');
const alert = require('./backend/alert');
const packages = require('./package.json');
const options = require('./backend/options');
const serveZip = require('./backend/serve-zip');
const EpubParser = require('./backend/epub-parser');
const FolderParser = require('./backend/folder-parser');
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
  alert.error('File or folder not found, try `xepub --help`');
  process.exit(1);
}

const app = express();

const lstat = fs.lstatSync(epubname);
let epub = null;

if (lstat.isDirectory()) {

  // open folder
  // since v1.0.0-alpha.9

  alert.info('Scanning folder...');
  const dirname = path.resolve(process.cwd(), epubname);
  epub = FolderParser(dirname);
  alert.debug('Successfully scanned folder');

  const index = pug.compile(fs.readFileSync(path.resolve(__dirname, 'backend', 'folder-index.pug'), 'utf8'));

  app.use('/folder/', (req, res, next) => {
    if (req.originalUrl === '/folder/') {
      res.header('Content-Type', 'text/html');
      res.end(index({ files: epub.files }));
    } else {
      next();
    }
  })
  app.use('/folder', express.static(dirname));

} else if (lstat.isFile()) {

  // open epub file
  alert.info('Parsing EPUB file...');
  const zip = new AdmZip(epubname);
  const mimetype = zip.readAsText('mimetype').trim();
  if (mimetype !== 'application/epub+zip') {
    alert.error('Not epub file');
    alert.debug('Mimetype: ' + mimetype);
    process.exit(1);
  }
  epub = EpubParser(zip);
  alert.debug('Successfully parsed file');
  app.use(serveZip(zip));
}

// development env
const dist1 = here('node_modules', 'materialize-css', 'dist');
// production  env
const dist2 = here('..', 'materialize-css', 'dist');
if (fs.existsSync(dist1)) {
  app.use(express.static(dist1));
} else if (fs.existsSync(dist2)) {
  app.use(express.static(dist2));
} else {
  alert.error('Materialize CSS not found');
  alert.debug('__dirname   = ' + __dirname);
  alert.debug('development = ' + dist1);
  alert.debug('production  = ' + dist2);
  process.exit(1);
}
// serve public folder
app.use(express.static(here('public')));

const server = !option.https ? http.createServer(app) : https.createServer({
  cert: fs.readFileSync(path.resolve(certFolder, 'xepub.crt')),
  key: fs.readFileSync(path.resolve(certFolder, 'xepub.key.pem')),
}, app);

const io = socketio(server);
io.on('connect', (socket) => {
  alert.debug('New client connected, ip: ' + socket.handshake.address);
  socket.emit('initialize', epub);
  // add '.fake-body' to every selector
  socket.on('css', (url, css) => {
    const ast = csstree.parse(css);
    csstree.walk(ast, (node) => {
      if (node.type === 'Selector') {
        node.children.prependData({
          type: 'WhiteSpace',
          loc: null,
          value: ' '
        });
        node.children.prependData({
          type: 'ClassSelector',
          name: 'fake-body'
        });
      }
      if (node.type === 'Url') {
        // from another place
        if (!/^[a-zA-Z]+:\/\//gi.test(node.value.value)) {
          node.value.value = URL.resolve(url, node.value.value);
        }
      }
    });
    const res = csstree.generate(ast);
    socket.emit('css', res);
  });
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
