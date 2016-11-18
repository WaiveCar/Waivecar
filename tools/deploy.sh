#!/bin/sh

ts=`date +%Y%m%d-%H%M`
path=/opt/waivecar-api

[ -e $path-last ] && unlink $path-last
set -x
cp -r $path $path-$ts
ln -s $path-$ts $path-last
cp -r * $path
/etc/init.d/waivecar-node restart
/etc/init.d/waivecar-node-socket restart
tail -f /opt/waivecar-prod.log

