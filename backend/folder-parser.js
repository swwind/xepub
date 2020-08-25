// parse a comic folder

const os = require('os');
const fs = require('fs');
const path = require('path');
const alert = require('./alert');
const sizeof = require('image-size');
const { orderBy } = require('natural-orderby');

module.exports = (dirname) => {
  const metadata = {
    title: path.basename(dirname) + '/',
    language: 'en',
    description: 'This is a folder served by xepub'
  }

  const files = orderBy(fs.readdirSync(dirname))
    .filter((filename) => /\.(?:png|jpe?g|gif)$/i.test(filename));

  if (!files.length) {
    alert.error('No image file found in this folder');
    process.exit(1);
  }

  const manifest = Object.create(null);
  const sizes = Object.create(null);
  files.forEach((filename) => {
    manifest[filename] = 'folder/' + filename;
    sizes[manifest[filename]] = sizeof(path.join(dirname, filename));
  });
  const spine = [ 'folder' ];
  const docTitle = metadata.title;
  const docAuthor = os.userInfo().username;
  const navMap = [{
    label: docTitle,
    src: spine[0],
    child: [],
  }];

  return {
    metadata,
    manifest,
    spine,
    docTitle,
    docAuthor,
    navMap,
    sizes,
    files,
  }
}
