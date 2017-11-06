#!/bin/bash

NODE_VERSION=v4.2.6
# This is copied from the app/tools/common.sh
nvmcheck() {
  version=`node --version`
  if [ "$version" != $NODE_VERSION ]; then
    . "$HOME/.nvm/nvm.sh"
    nvm use $NODE_VERSION
    if [ ! $? ]; then
      echo "Can't find nvm node version $NODE_VERSION"
      exit 1
    fi
  fi
}
nvmcheck

# If the script is run with any argument, at all, we assume it's a dry run.
# this code, with any argument, makes dry not the empty string which is what
# test(1) uses as the qualifier in [ ] bare testing.
dry=$1
if [ $dry ]; then
  drypostfix="-dry"
  echo 'DRY RUN'
else
  echo '********'
  echo 'REAL RUN'
  echo '********'
fi

echo -n "Last was: "; cat .last-deploy
version=`git describe`
echo $version > .last-deploy$drypostfix

# we make a log of the deploy history
echo `date` $version >> .deploy-history$drypostfix
echo -n "This is: "; cat .last-deploy$drypostfix

NODE_ENV=production node_modules/webpack/bin/webpack.js -p --config ./webpack/config/deployment.js 
set -x

# This allows us to probe for the version from the debug console
cat >> app/scripts/bundle.js << ENDL
window.__version__="$version";
ENDL

if [ $dry ]; then
  echo '[ dry run ] not deploying'
  exit 0
fi

for i in `seq 1 2`; do
  # we put the new stuff to be in the "new" directory.
  scp -C app/scripts/{vendors,bundle}.js waive-prod$i:web-js/new/
  scp -C tools/copy-js-over.sh waive-prod$i: 
  ssh waive-prod$i "sudo ./copy-js-over.sh"
done
