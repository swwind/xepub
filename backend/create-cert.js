// docs:
//   https://github.com/wuchangming/https-mitm-proxy-handbook/blob/master/doc/Chapter3.md

const fs = require('fs');
const path = require('path');
const alert = require('./alert');
const { pki, md } = require('node-forge');

const createRootCA = () => {

  const folder = path.resolve(path.dirname(__dirname), 'cert');
  const crtpath = path.resolve(folder, 'ca.crt');
  const keypath = path.resolve(folder, 'ca.key.pem');

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  } else {
    alert.warn('An old root CA already exists');
    alert.warn('Skipping...');
    return;
  }

  alert.info('Creating root CA...');

  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = String(Date.now());

  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 5);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 20);

  const attrs = [{
    name: 'commonName',
    value: 'Xepub Certification'
  }, {
    name: 'countryName',
    value: 'CN'
  }, {
    shortName: 'ST',
    value: 'Zhejiang'
  }, {
    name: 'localityName',
    value: 'Shaoxing'
  }, {
    name: 'organizationName',
    value: 'Xepub Dev Team'
  }, {
    shortName: 'OU',
    value: 'https://github.com/swwind/xepub'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    critical: true,
    cA: true
  }, {
    name: 'keyUsage',
    critical: true,
    keyCertSign: true
  }, {
    name: 'subjectKeyIdentifier'
  }]);

  // 用自己的私钥给 CA 根证书签名
  cert.sign(keys.privateKey, md.sha256.create());

  alert.debug('CA crtpath = ' + crtpath);
  alert.debug('CA keypath = ' + keypath);
  fs.writeFileSync(crtpath, pki.certificateToPem(cert));
  fs.writeFileSync(keypath, pki.privateKeyToPem(keys.privateKey));

  // help document
  alert.info('Root CA .crt file generated as following path:');
  alert.info();
  alert.info(crtpath);
  alert.info();
  alert.info('Please install the root certificate so as to admit local certificates');
  alert.info();
  if (process.platform === 'win32') {
    alert.info('On Windows:');
    alert.info('  $ certutil -addstore -f "ROOT" ' + crtpath);
    alert.info();
    alert.info('If that doesn\'t work, please try to import it to your browser directly');
  } else if (process.platform === 'darwin') {
    alert.info('On MacOS:');
    alert.info('  $ sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ' + crtpath);
    alert.info();
    alert.info('If that doesn\'t work, please try to import it to your browser directly');
  } else {
    alert.info('On Linux, the best way to trust root certificate is importing it to your browser directly');
  }
  alert.info();
  alert.info('- For Chrome, open Settings > Advanced > Manage Certificates >');
  alert.info('  Authorities > Import > choose that .crt file > Check Three Trusts > OK');
  alert.info();
  alert.info('- For Firefox, open Preferences > Privacy & Security > Certificates >');
  alert.info('  View Certificates... > Authorities > Import > choose that .crt file >');
  alert.info('  Check Two Trusts > OK')
  alert.info();

}

const createCert = (domain) => {

  alert.info('Creating certificate');

  const caCrtPath = path.resolve(path.dirname(__dirname), 'cert', 'ca.crt');
  const caKeyPath = path.resolve(path.dirname(__dirname), 'cert', 'ca.key.pem');
  const caCertPem = fs.readFileSync(caCrtPath, 'utf8');
  const caKeyPem = fs.readFileSync(caKeyPath, 'utf8');
  const caCert = pki.certificateFromPem(caCertPem);
  const caKey = pki.privateKeyFromPem(caKeyPem);

  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = String(Date.now());

  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 10);

  const attrs = [{
    name: 'commonName',
    value: domain
  }, {
    name: 'countryName',
    value: 'CN'
  }, {
    shortName: 'ST',
    value: 'Zhejiang'
  }, {
    name: 'localityName',
    value: 'Shaoxing'
  }, {
    name: 'organizationName',
    value: 'Xepub Dev Team'
  }, {
    shortName: 'OU',
    value: 'https://github.com/swwind/xepub'
  }];

  cert.setIssuer(caCert.subject.attributes);
  cert.setSubject(attrs);

  cert.setExtensions([{
    name: 'basicConstraints',
    critical: true,
    cA: false
  }, {
    name: 'keyUsage',
    critical: true,
    digitalSignature: true,
    contentCommitment: true,
    keyEncipherment: true,
    dataEncipherment: true,
    keyAgreement: true,
    keyCertSign: true,
    cRLSign: true,
    encipherOnly: true,
    decipherOnly: true
  }, {
    name: 'subjectKeyIdentifier'
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'authorityKeyIdentifier'
  }]);
  cert.sign(caKey, md.sha256.create());

  const crtpath = path.resolve(path.dirname(__dirname), 'cert', 'xepub.crt');
  const keypath = path.resolve(path.dirname(__dirname), 'cert', 'xepub.key.pem');
  alert.debug('new crtpath = ' + crtpath);
  alert.debug('new keypath = ' + keypath);
  fs.writeFileSync(crtpath, pki.certificateToPem(cert));
  fs.writeFileSync(keypath, pki.privateKeyToPem(keys.privateKey));

  alert.info('Certificate successfully issued to '.green + domain.yellow);
  alert.info('Xepub will defaultly use https from now on');
}

module.exports = {
  createRootCA,
  createCert,
}
