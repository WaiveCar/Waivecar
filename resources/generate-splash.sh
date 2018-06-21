#!/bin/bash
for i in ios/splash/* android/splash/*; do
  width=`identify -format %w $i`
  size=`identify -format %wx%h $i`
  dpi=$(( width / 3 ))
  fname=`basename $i`
  convert \
    -background none -density $dpi circle-logo.svg \
    -background black -gravity center -extent $size -colors 18 /tmp/$fname
  pngcrush -l 9 /tmp/$fname $i
done


