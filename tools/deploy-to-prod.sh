#!/bin/bash

# If the script is run with any argument, at all, we assume it's a dry run.
# this code, with any argument, makes dry not the empty string which is what
# test(1) uses as the qualifier in [ ] bare testing.
server=$1

echo -n "Last was: "; cat .last-deploy
version=`git describe`
echo $version > .last-deploy$drypostfix

# we make a log of the deploy history
echo `date` $version >> .deploy-history$drypostfix
echo -n "This is: "; cat .last-deploy$drypostfix

set -x

# we put the new stuff to be in the "new" directory.
scp -C tools/deploy-api.sh waive-prod$server: 
ssh waive-prod$server "sudo ./deploy-api.sh"
