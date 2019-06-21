/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');

/**
 * Parses and returns HTTPS options for Webpack Dev Server.
 * @param {boolean} logging
 */
const getHttpsOptions = (logging = true) => {
  const log = logging ? (...args) => console.log(...args) : () => {};

  const [cert, key] = ['HTTPS_CERT', 'HTTPS_KEY'].map(name => {
    const filePath = process.env[name];
    if (!filePath) {
      if (logging) {
        log('Environment variable %s was not set', name);
      }
      return null;
    }

    let resolvedFilePath;
    try {
      resolvedFilePath = path.resolve(filePath);
    } catch (e) {
      log('Error while parsing %s: %s', filePath, e);
      return null;
    }

    try {
      return fs.readFileSync(resolvedFilePath);
    } catch (e) {
      log('Error while reading %s: %s', resolvedFilePath, e);
      return null;
    }
  });

  if (!cert || !key) {
    log('Both HTTPS_CERT and HTTPS_KEY must be configured correctly to use a custom SSL certificate');
    return {};
  }

  return { cert, key };
};

module.exports = {
  getHttpsOptions,
};
