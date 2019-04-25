#!/bin/sh
/etc/init.d/nginx stop
/etc/init.d/node-waivecar restart
/etc/init.d/nginx start
tail -f /opt/waivecar-prod.log

