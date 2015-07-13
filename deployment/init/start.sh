#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PM2=/usr/bin/pm2
case $NODE_ENV in
  production)
    DECL=prod.pm2.json
  ;;
  staging)
    DECL=stag.pm2.json
  ;;
  *)
    DECL=dev.pm2.json
  ;;
esac
CUSER=travis

set -e
$PM2 startOrRestart $DIR/$DECL
