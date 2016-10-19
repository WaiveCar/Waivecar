#!/bin/bash
nvmsh on
NODE_ENV=production node_modules/webpack/bin/webpack.js -p --config ./webpack/config/deployment.js 

