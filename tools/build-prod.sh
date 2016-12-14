#!/bin/bash
nvmsh on
NODE_ENV=production node_modules/webpack/bin/webpack.js -p --config ./webpack/config/deployment.js 
set -x

for i in `seq 1 2`; do
  scp -C app/scripts/{vendors,bundle}.js waive-prod$i:
done

