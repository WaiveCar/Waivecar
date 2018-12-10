#!/bin/bash
date=$1
scope=$2
name=points-$date.js
[ -e $name ] && rm $name
echo -n 'var points = ' >> $name
base=https://api.waivecar.com/report/$date/points
if [ -n "$2" ]; then
  base="${base}?scope=$2"
  name=points-$scope-$date.js
fi
curl -s $base >> $name
web $name
