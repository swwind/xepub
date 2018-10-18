'use strict';

const { Command, flags } = require('@oclif/command');

const fs = require('fs');
const opn = require('opn');
const path = require('path');
const unzip = require('unzip');
const express = require('express');

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

const saveExit = () => {
  deleteFolderRecursive(outputpath);
  process.exit(0);
}

class XepubCommand extends Command {
  async run() {

    const __thisdir = process.cwd();

    const { flags, argv } = this.parse(XepubCommand);
    const port = flags.port || 4000;
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
        fs.copyFileSync(index_path, index_path_to);
      }
      copyAssert('index.html');
      copyAssert('favicon.ico');
      copyAssert('js-xepub.js');
      copyAssert('style-xepub.css');

      const app = express();
      app.get('/leave-page', saveExit);
      app.get('/rootfile', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(rootfile);
      });
      app.use(express.static(path.resolve(outputpath, rootdir)));
      app.listen(port);

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
