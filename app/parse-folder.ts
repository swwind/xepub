// parse a comic folder

import * as os from 'os';
import { promises as fsp } from 'fs';
import * as path from 'path';
import * as alert from './alert';
import { imageSize } from 'image-size';
import { orderBy } from 'natural-orderby';
import { EpubInfo, NavPoint, Metadata } from './types';

import * as crypto from 'crypto';

export interface ParseResult {
  epub: EpubInfo;
  files: string[];
}

export default async (dirname: string): Promise<ParseResult> => {
  const hash = crypto.createHash('md5').update(dirname).digest('hex');

  const metadata: Metadata = {
    title: path.basename(dirname) + '/',
    language: 'en',
    identifier: 'xepub:urn:' + hash,
    description: 'This is a folder served by xepub',
  }

  const files = orderBy(await fsp.readdir(dirname))
    .filter((filename) => /\.(?:png|jpe?g|gif)$/i.test(filename));

  if (!files.length) {
    alert.error('No image file found in this folder');
    process.exit(1);
  }

  const manifest = Object.create(null);
  const sizes = Object.create(null);
  files.forEach((filename) => {
    manifest[filename] = 'folder/' + filename;
    sizes[manifest[filename]] = imageSize(path.join(dirname, filename));
  });
  const spine = [ 'folder' ];
  const docTitle = metadata.title;
  const docAuthor = os.userInfo().username;
  const navMap: NavPoint[] = [{
    label: docTitle,
    src: spine[0],
    child: [],
  }];

  return {
    epub: {
      metadata,
      manifest,
      spine,
      docTitle,
      docAuthor,
      navMap,
      sizes,
    },
    files
  }
}
