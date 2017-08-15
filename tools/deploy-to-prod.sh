#!/bin/bash
nvmsh on
echo -n "Last was: "; cat .last-deploy
git describe > .last-deploy
echo `date` `git describe` >> .deploy-history
echo -n "This is: "; cat .last-deploy

NODE_ENV=production node_modules/webpack/bin/webpack.js -p --config ./webpack/config/deployment.js 
set -x

for i in `seq 1 2`; do
  scp -C app/scripts/{vendors,bundle}.js waive-prod$i:web-js
  ssh waive-prod$i "sudo ./deploy-web.sh"
done

