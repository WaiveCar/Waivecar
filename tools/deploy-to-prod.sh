#!/bin/bash

# If the script is run with any argument, at all, we assume it's a dry run.
# this code, with any argument, makes dry not the empty string which is what
# test(1) uses as the qualifier in [ ] bare testing.
[ $# -ne 1 ] && exit
server=$1

# example form:
# last=(0 201708281708-api-427-g57a2401c 201708281708-api-427-g57a2401c 201708281708-api-427-g57a2401c)
. .last-deploy

echo "${last[$server]} prod$server current"
version=`git describe`

# we make a log of the deploy history
echo `date` $server $version >> .deploy-history
echo "$version prod$server new"

last[$server]=$version

echo "last=(${last[@]})" > .last-deploy
set -x

# we put the new stuff to be in the "new" directory.
scp -C tools/deploy-api.sh waive-prod$server: 
ssh waive-prod$server "./deploy-api.sh"
