#!/bin/sh

ts=`date +%Y%m%d-%H%M`
path=/opt/waivecar-api

[ -e $path-last ] && unlink $path-last
set -x
cp -r $path $path-$ts
ln -s $path-$ts $path-last
cp -r * $path
/etc/init.d/node-waivecar restart
tail -f /opt/waivecar-prod.log

