#!/bin/sh

ts=`date +%Y%m%d-%H%M`
path=/opt/waivecar-api
previous=`readlink -f $path-last`
npm install

echo -n "Last was: "; cat git-sha-1
git describe > git-sha-1
echo -n "This is: "; cat git-sha-1

set -x
[ -e $previous ] && rm -r $previous
unlink $path-last
cp -r $path $path-$ts
ln -s $path-$ts $path-last
cp -r * $path
/etc/init.d/node-waivecar restart
tail -f /opt/waivecar-prod.log

