#!/bin/bash
date=$1
name=points-$date.js
rm $name
echo -n 'var points = ' >> $name
curl -s https://api.waivecar.com/report/$date/points >> $name
web $name
