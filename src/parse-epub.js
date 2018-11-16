'use strict';

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

module.exports = async (tmpdir) => {

  const parseXMLfile = (filename) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(tmpdir, filename), (err, xml) => {
        if (err) return reject(err);
        const fixed = xml.toString().replace(/&([^;]*)(?=[&<])/g, '&amp;$1');
        xml2js.parseString(fixed, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    });
  }
  const getText = (obj, path) => {
    for (let i = 0; i < path.length; ++ i) {
      if (!obj[path[i]]) return '';
      obj = obj[path[i]];
    }
    return obj._ || obj;
  }
  const metainf = await parseXMLfile('META-INF/container.xml');
  const rootfile = getText(metainf, ['container', 'rootfiles', 0, 'rootfile', 0, '$', 'full-path']);

  const content = await parseXMLfile(rootfile);

  const metadata = {
    // required
    title: getText(content, ['package', 'metadata', 0, 'dc:title', 0]),
    language: getText(content, ['package', 'metadata', 0, 'dc:language', 0]),
    indentifier: getText(content, ['package', 'metadata', 0, 'dc:indentifier', 0]),

    // optional
    creator: getText(content, ['package', 'metadata', 0, 'dc:creator', 0]),
    contributor: getText(content, ['package', 'metadata', 0, 'dc:contributor', 0]),
    subject: getText(content, ['package', 'metadata', 0, 'dc:subject', 0]),
    description: getText(content, ['package', 'metadata', 0, 'dc:description', 0]),
    date: getText(content, ['package', 'metadata', 0, 'dc:date', 0]),
    type: getText(content, ['package', 'metadata', 0, 'dc:type', 0]),
    format: getText(content, ['package', 'metadata', 0, 'dc:format', 0]),
    source: getText(content, ['package', 'metadata', 0, 'dc:source', 0]),
    relation: getText(content, ['package', 'metadata', 0, 'dc:relation', 0]),
    coverage: getText(content, ['package', 'metadata', 0, 'dc:coverage', 0]),
    rights: getText(content, ['package', 'metadata', 0, 'dc:rights', 0]),

  }

  const manifest = {};

  content.package.manifest[0].item.forEach(({ $ }) => {
    manifest[$.id] = path.join(path.dirname(rootfile), $.href).replace('\\', '/');
  });

  const spine = [];

  content.package.spine[0].itemref.forEach(({ $ }) => {
    spine.push('/' + manifest[$.idref]);
  });

  const tocfilename = manifest['ncx'];
  const toc = await parseXMLfile(tocfilename);

  const docTitle = getText(toc, ['ncx', 'docTitle', 0, 'text', 0]);
  const navMap = [];

  toc.ncx.navMap[0].navPoint.forEach((navPoint) => {
    const label = getText(navPoint, ['navLabel', 0, 'text', 0]);
    const src = '/' + path.join(path.dirname(tocfilename),
        getText(navPoint, ['content', 0, '$', 'src'])).replace('\\', '/');
    navMap.push({ label, src });
  });

  return {
    metadata,
    manifest,
    spine,
    docTitle,
    navMap,
  };

}
