#!/bin/bash
echo "127.0.0.1 datastore" >> /etc/hosts
redis-server --daemonize yes
service nginx restart
./run.sh
