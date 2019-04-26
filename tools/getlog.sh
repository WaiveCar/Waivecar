#!/bin/bash
which=$1
servers=2
dir=${2:-/var/log/outgoing}
base=/tmp/$which

echo "Putting things in $base"

for i in `seq 1 $servers`; do
  newdir=$base/$i
  mkdir -p $newdir
  cd $newdir
  scp -C waive-prod$i:$dir/$which\* .
  gunzip *.gz
  bunzip2 *.bz2
done

echo "Things put in $base"
