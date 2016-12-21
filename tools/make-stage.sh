#!/bin/bash
[ -e /tmp/.make-stage-pid ] && kill `cat /tmp/.make-stage-pid`
ssh -NC -R 45.79.111.50:4300:0.0.0.0:3080 45.79.111.50 &
echo $! > /tmp/.make-stage-pid
