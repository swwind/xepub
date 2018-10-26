'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const homePath = process.env.XDG_CONFIG_HOME || path.resolve(os.homedir(), '.config');

const mkdirs = (dirname) => {
  if (!fs.existsSync(dirname)) {
    mkdirs(path.dirname(dirname));
    fs.mkdirSync(dirname);
  }
};


module.exports = (name, fname = name, defaultData = {}) => {

  let data = defaultData;

  const filename = path.resolve(homePath, name + '/' + fname + '.json');

  const json = () => {
    return JSON.stringify(data);
  }

  const writeFile = () => {
    fs.writeFileSync(filename, json());
  }

  const set = (key, value) => {
    data[key] = value;
    writeFile();
  }

  const get = (key) => {
    if (key) return data[key];
    else return data;
  }

  if (!fs.existsSync(filename)) {
    mkdirs(path.dirname(filename));
    writeFile();
  } else {
    data = JSON.parse(fs.readFileSync(filename));
  }

  return { json, set, get };

}