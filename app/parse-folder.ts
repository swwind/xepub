// parse a comic folder

import * as os from 'os';
import { promises as fsp, lstatSync, readdirSync } from 'fs';
import * as path from 'path';
import * as alert from './alert';
import { imageSize } from 'image-size';
import { orderBy } from 'natural-orderby';
import { EpubInfo, NavPoint, Metadata } from './types';
import { RequestHandler } from 'express';

import * as crypto from 'crypto';

export interface ParseResult {
  epub: EpubInfo;
  middleware: RequestHandler;
}

const isImage = (filename: string) => {
  return /\.(?:png|jpe?g|gif)$/i.test(filename);
}
const imageFrame = (image: string) => {
  return `<div>
    <img src="${image}" alt="${image}" />
    <div class="xepub-desc">${image}</div>
  </div>`;
}
const createPage = (title: string, images: string[]) => {
  return Buffer.from(`<title>${title}</title>${images.map(imageFrame).join('')}`);
}
const createIndex = (title: string, author: string, subdirs: string[], images: string[]) => {
  return Buffer.from(`<h2>${title}</h2><div class="xepub-author">${author}</div>${
    subdirs.map((subdir) => {
      return `<div><a href="${subdir}/index.xhtml">${subdir}</a></div>`;
    }).join('')
  }${
    images.map(imageFrame).join('')
  }`);
}

export default async (dirname: string): Promise<ParseResult> => {
  const hash = crypto.createHash('md5').update(dirname).digest('hex');

  const metadata: Metadata = {
    title: path.basename(dirname) + '/',
    language: 'en',
    identifier: 'xepub:urn:' + hash,
    description: 'This is a folder served by xepub',
  }

  const metafiles = orderBy(await fsp.readdir(dirname));
  const metaimages = metafiles.filter(isImage);
  const images = [... metaimages];
  const subdirs = metafiles.filter((subdir: string) => {
    alert.debug(`Scanning subdir ${subdir}`);
    return lstatSync(path.join(dirname, subdir)).isDirectory();
  }).map((subdir) => {
    return {
      name: subdir,
      images: orderBy(readdirSync(path.join(dirname, subdir))).filter(isImage),
    }
  });
  for (const subdir of subdirs) {
    images.push(... subdir.images.map((filename) => {
      return path.join(subdir.name, filename);
    }));
  }

  if (!images.length) {
    alert.error('No image file found in this folder');
    process.exit(1);
  }

  const manifest = Object.create(null);
  const sizes = Object.create(null);
  images.forEach((filename) => {
    alert.debug(`Calculating image size: ${filename}`);
    manifest[filename] = 'folder/' + filename;
    sizes[manifest[filename]] = imageSize(path.join(dirname, filename));
  });
  manifest['index'] = 'folder/index.xhtml';
  const spine = [
    'folder/index.xhtml',
    ... subdirs.map((subdir) => {
      return manifest[subdir.name] = `folder/${subdir.name}/index.xhtml`;
    }),
  ];
  const docTitle = metadata.title;
  const docAuthor = os.userInfo().username;
  const navMap: NavPoint[] = [{
    label: docTitle,
    src: spine[0],
    child: subdirs.map((subdir) => {
      return {
        label: subdir.name,
        src: manifest[subdir.name],
        child: [],
      }
    })
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
    middleware: (req, res, next) => {
      if (req.originalUrl === '/folder/index.xhtml') {
        const result = createIndex(docTitle, docAuthor, subdirs.map((subdir) => subdir.name), metaimages);

        res.header('Content-Type', 'application/xhtml+xml');
        res.header('Content-Length', String(result.length));
        res.end(result);
        return;
      }
      if (req.originalUrl.endsWith('index.xhtml')) {
        const subdirname = decodeURIComponent(req.originalUrl.slice(8, -12));

        const searchRes = subdirs.filter((subdir) => subdir.name === subdirname);
        if (!searchRes.length) {
          res.status(404)
          res.end();
          return;
        }
        const result = createPage(searchRes[0].name, searchRes[0].images);

        res.header('Content-Type', 'application/xhtml+xml');
        res.header('Content-Length', String(result.length));
        res.end(result);
        return;
      }

      next();
    }
  }
}
