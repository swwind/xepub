import { Option, Some, None } from "./utils";
import { parseXML } from './xml';
import { promises as fsp, createReadStream } from 'fs';
import * as path from "path";
import * as os from 'os';
import * as unzip from "unzipper";
import * as express from 'express';

export default class Zip {
  dir: string = null;
  filepath: string;

  async initialize(zippath: string) {
    this.filepath = zippath;
    return new Promise(async (resolve) => {
      this.dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'xepub-'));
      createReadStream(zippath).pipe(unzip.Extract({ path: this.dir })
        .on('close', resolve));
    });
  }

  async readAsBuffer(filepath: string): Promise<Option<Buffer>> {
    if (!this.dir) {
      throw new Error("read uninitialized zip");
    }
    try {
      const result = await fsp.readFile(path.resolve(this.dir, filepath));
      return new Some(result);
    } catch (e) {
      return new None();
    }
  }

  async readAsText(filepath: string) {
    return (await this.readAsBuffer(filepath)).append((buf) => {
      return buf.toString('utf8')
    });
  }

  async readAsXML(filepath: string) {
    return (await this.readAsText(filepath)).append(parseXML);
  }

  async clear() {
    if (this.dir) {
      await fsp.rmdir(this.dir, { recursive: true });
    }
  }

  middleware() {
    return express.static(this.dir);
  }
}