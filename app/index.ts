import { promises as fsp, existsSync } from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import * as alert from './alert';
import { spawn } from 'child_process';
import options, { XepubArguments } from './options';
import parseEpub from './parse-epub';
import parseFolder from './parse-folder';
import Zip from './zip';
import { EpubInfo } from './types';
import { bindSocket } from './socket';
import { AddressInfo } from 'net';
import Store from './store';
import { openExternalLink } from './open';
import helpText from './help';
import { getVersion } from './utils';

const here = (...file: string[]) => path.resolve(__dirname, ...file);

const main = async (option: XepubArguments) => {
  if (option.debug) {
    alert.debugMode();
  }

  if (option.version) {
    alert.info('Xepub v' + await getVersion());
    alert.info('Node  ' + process.version);
    process.exit(0);
  }

  if (option.help) {
    console.log(helpText);
    process.exit(0);
  }

  const epubname = option._[0];
  if (!epubname) {
    alert.error('File name missing');
    process.exit(1);
  }

  if (!existsSync(epubname)) {
    alert.error('File or folder not found');
    process.exit(1);
  }

  const app = express();

  const lstat = await fsp.lstat(epubname);
  let epub: EpubInfo = null;
  const zip = new Zip();

  if (lstat.isDirectory()) {

    // open folder
    // since v1.0.0-alpha.9

    alert.info('Scanning folder...');
    const dirname = path.resolve(process.cwd(), epubname);
    const parseResult = await parseFolder(dirname);
    epub = parseResult.epub;
    alert.debug('Successfully scanned folder');

    app.use(parseResult.middleware);
    app.use('/folder', express.static(dirname));

  } else if (lstat.isFile()) {

    // open epub file
    alert.info('Parsing EPUB file...');
    await zip.initialize(epubname);
    const mimetype = (await zip.readAsText('mimetype')).unwrapOr('').trim();
    if (mimetype !== 'application/epub+zip') {
      alert.error('Not epub file');
      alert.debug('Mimetype: ' + mimetype);
      process.exit(1);
    }
    epub = await parseEpub(zip);
    alert.debug('Successfully parsed file');
    app.use(zip.middleware());
  } else {

    alert.error('?');
    alert.error('??');
    alert.error('???');
    alert.error(`What is ${epubname}?`);
    process.exit(1);
  }

  // serve public folder
  app.use(express.static(here('..', 'public')));

  // settings
  const settings = new Store('config');

  const server = http.createServer(app);
  bindSocket(server, epub, settings);

  if (option.port === -1) {
    option.port = option.electron ? 0 : 23333;
  }
  server.listen(option.port);
  const address = server.address() as AddressInfo;
  const url = `http://localhost:${address.port}/`;
  alert.info(`Finished, listening on ${url}`);

  const terminate = async (code: number) => {
    await zip.clear();
    process.exit(code);
  }

  if (option.electron) {
    const which = spawn('which', ['electron']);
    which.on('close', (code) => {
      if (code) {
        // not found
        alert.error('Electron not found in $PATH');
        alert.error('Please remove -e/--electron flag');
      } else {
        alert.info('Opening in electron...');
        const electron = spawn('electron', [ url ]);
        electron.on('close', async () => {
          alert.info('Electron closed.');
          await terminate(0);
        });
      }
    })
  } else if (option.open) {
    openExternalLink(url);
  }

  process.on('SIGINT', async () => {
    await terminate(0);
  });
  
}

main(options(process.argv.slice(2)));
