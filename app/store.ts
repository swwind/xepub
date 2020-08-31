import * as os from 'os';
import * as path from 'path';
import { writeFile, readFileSync, existsSync, writeFileSync, lstatSync, mkdirSync } from 'fs';
import { KeyMap } from './types';
import { error } from './alert';

const dirname = path.join(os.homedir(), '.config', 'xepub');

export default class Store {
  filename: string;
  store: KeyMap<string | boolean>;
  constructor(name: string) {
    this.filename = path.join(dirname, `${name}.json`);
    if (!existsSync(dirname)) {
      mkdirSync(dirname, { recursive: true });
    }
    if (!existsSync(this.filename)) {
      writeFileSync(this.filename, Buffer.from("{}"));
    }
    if (lstatSync(this.filename).isDirectory()) {
      error(`File ${this.filename} was occupied by a directory, please remove it by yourself.`);
      process.exit(1);
    }
    this.store = JSON.parse(readFileSync(this.filename, 'utf8'));
  }

  get() {
    return this.store;
  }

  set(name: string, value: string | boolean) {
    this.store[name] = value;
    writeFile(this.filename, JSON.stringify(this.store), (err) => {
      if (err) {
        error('Unable to save the config');
        error(`Filename: ${this.filename}`);
        error(err.message);
      }
    });
  }
}
