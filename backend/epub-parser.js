'use strict';

const url = require('url');
const sizeOf = require('image-size');
const parser = require('fast-xml-parser');
const alert = require('./alert');

const resolvePath = (absolute, filename) => {
  return url.resolve(absolute, filename.replace(/\\/g, '/'));
}

/**
 * Request for a value in an XML object safely
 */
const safeQuery = (xml) => {
  // if defaults provided, means it is not a required value in an XML file
  // otherwise it will invoke `alert.unstable`
  return (arr, defaults) => {
    const fixString = (res) => {
      if (res === undefined) return res;
      if (res.hasOwnProperty('#text')) {
        return res['#text'];
      }
      return res;
    }
    const res = fixString(arr.reduce((obj, key) => {
      if (!obj) return obj;
      return obj[key];
    }, xml));

    if (res === undefined) {
      if (defaults === undefined) {
        alert.unstable();
      }
      return defaults;
    }

    return res;
  }
}

module.exports = (zip) => {

  /**
   * return a safeQuery Object
   */
  const parseXMLfile = (filename) => {
    const source = zip.readAsText(filename);
    const valid = parser.validate(source);
    if (valid !== true) {
      alert.warn('XML file `' + filename + '` is invalid, it may causes problems.');
      alert.warn('Reasons blow:');
      alert.warn(valid);
    } else {
      alert.debug('Safely read XML file ' + filename);
    }

    const xml = parser.parse(source, {
      attributeNamePrefix : '',
      attrNodeName: '$attr',
      ignoreAttributes: false,
      trimValues: true,
    });

    return safeQuery(xml);
  }

  const metainf = parseXMLfile('META-INF/container.xml');
  const rootfile = metainf(['container', 'rootfiles', 'rootfile', '$attr', 'full-path']);
  if (!rootfile) alert.broken();
  const content = parseXMLfile(rootfile);

  const metadata = {
    // required
    title: content(['package', 'metadata', 'dc:title']),
    language: content(['package', 'metadata', 'dc:language']),
    identifier: content(['package', 'metadata', 'dc:identifier']),

    // optional
    creator: content(['package', 'metadata', 'dc:creator'], null),
    contributor: content(['package', 'metadata', 'dc:contributor'], null),
    subject: content(['package', 'metadata', 'dc:subject'], null),
    description: content(['package', 'metadata', 'dc:description'], null),
    date: content(['package', 'metadata', 'dc:date'], null),
    type: content(['package', 'metadata', 'dc:type'], null),
    format: content(['package', 'metadata', 'dc:format'], null),
    source: content(['package', 'metadata', 'dc:source'], null),
    relation: content(['package', 'metadata', 'dc:relation'], null),
    coverage: content(['package', 'metadata', 'dc:coverage'], null),
    rights: content(['package', 'metadata', 'dc:rights'], null),

  }

  alert.debug('Metadata is ok');

  const manifest = Object.create(null);
  const sizes = Object.create(null);
  content(['package', 'manifest', 'item'], 'Array').map(safeQuery).forEach((item) => {
    const url = resolvePath(rootfile, item(['$attr', 'href']));
    manifest[item(['$attr', 'id'])] = url;
    if (/\.(png|jpg|jpeg)$/gi.test(url)) {
      alert.debug('Reading image size: ' + rootfile + ' -> ' + item(['$attr', 'href']));
      sizes[url] = sizeOf(zip.readFile(url));
    }
  });

  alert.debug('Manifest is ok');

  const spine = content(['package', 'spine', 'itemref']).map(safeQuery).map((itemref) => {
    const idref = itemref(['$attr', 'idref']);
    if (!manifest[idref]) alert.unstable();
    return manifest[idref];
  });

  alert.debug('Spine is ok');

  const tocfilename = manifest['ncx'];
  if (!tocfilename) alert.broken();
  const toc = parseXMLfile(tocfilename);

  const docTitle = toc(['ncx', 'docTitle', 'text'], null);
  const docAuthor = toc(['ncx', 'docAuthor', 'text'], null);

  alert.debug('docTitle = ' + docTitle);
  alert.debug('docAuthor = ' + docAuthor);

  const resolveNavPoint = (navPoint) => {
    const $ = safeQuery(navPoint);
    const label = $(['navLabel', 'text']);
    const src = resolvePath(tocfilename, $(['content', '$attr', 'src']));
    const child = $(['navPoint'], []).map(resolveNavPoint);
    return { label, src, child };
  }
  const navMap = toc(['ncx', 'navMap', 'navPoint']).map(resolveNavPoint);

  alert.debug('Navigate Map is ok');

  return {
    metadata,
    manifest,
    spine,
    docTitle,
    docAuthor,
    navMap,
    sizes,
  }
}
