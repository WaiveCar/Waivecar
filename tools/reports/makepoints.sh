#!/bin/bash
date=$1
name=points-new.js
echo -n 'var points = ' >> $name
curl -s https://api.waivecar.com/report/$date/points >> $name
