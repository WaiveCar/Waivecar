#!/bin/bash
cd /home/chris/code/Waivecar/api
if [ -z $1 ]; then
  find . -name routes.js
  find . -name routes.js | xargs cat 
else 
  find . -name routes.js | xargs grep $1 
fi
