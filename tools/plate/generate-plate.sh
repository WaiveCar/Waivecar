#!/bin/bash

DEST=/tmp/plate-images

if [ $# -gt 1 ]; then
  text1="Waive$1 is Available"
  text2="Charge: $2 miles"
  OUT=$DEST/$1_$2.png
else
  text1="This WaiveCar is Booked"
  text2="Others may be available."
  OUT=$DEST/booked.png
fi

if [ ! -e $OUT ]; then
  mkdir -p $DEST
  temp=`mktemp --suffix=.png`
  convert template-dark.png \
    -font Liberation-Sans-Bold -fill white \
    -pointsize 150 -annotate +60+870 "$text1" \
    -pointsize 95 -annotate +80+980 "$text2" \
    -depth 1 $temp

  pngcrush -q -l 9 -c 0 $temp $OUT

  rm -f $temp
fi

echo $OUT
