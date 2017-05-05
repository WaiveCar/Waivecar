#!/bin/sh

deviceList=`adb devices | grep -v List | awk ' { printf "%s ", $1 } ' | sed s'/ *$//'`
if [ -z "$deviceList" ]; then
  echo "Can't find any devices. Exiting";
  exit -1
else
  echo "Using $deviceList"
fi

install() {
  for device in $deviceList; do
    echo "[$device] $1"
    adb -s $device install -rdg $1&
  done
  for job in `jobs -p`; do
    wait $job
  done
  echo "Done"
}

