#!/bin/sh

ts=`date +%Y%m%d-%H%M`
path=/opt/waivecar-api
previous=`readlink -f $path-last`

set -x
git describe > git-sha-1
[ -e $previous ] && rm -r $previous
[ -e $path-last ] && unlink $path-last
cp -r $path $path-$ts
ln -s $path-$ts $path-last
cp -r * $path
/etc/init.d/node-waivecar restart
tail -f /opt/waivecar-prod.log

