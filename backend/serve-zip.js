'use strict';

const path = require('path');
const mime = require('mime-types');

module.exports = (zip) => (req, res, next) => {

  // chinese url...
  const filename = decodeURIComponent(req.url).slice(1);
  const file = zip.readFile(filename);

  // skip if file doesn't exist
  if (!file) {
    next();
    return;
  }

  const contentType = mime.contentType(path.extname(filename));
  res.header('Content-Type', contentType);

  res.status(200).end(file);
}
