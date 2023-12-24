'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      extConfig: PATHS.src + '/extConfig.js',
      sidepanel: PATHS.src + '/sidepanel.js',
      serviceWorker: PATHS.src + '/serviceWorker.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;