#!/bin/sh
app=com.waivecar.app

if [ -z "$deviceList" ]; then
  deviceList=`adb devices | grep -v List | awk ' { printf "%s ", $1 } ' | sed s'/ *$//'`
  if [ -z "$deviceList" ]; then
    echo "Can't find any devices. Exiting";
    exit -1
  else
    echo "Using $deviceList"
  fi
fi

nvmcheck() {
  version=`node --version`
  if [ "$version" != "v4.2.6" ]; then
    nvmsh on
  fi
}

wrap() {
  fn=$1
  path=$2
  for device in $deviceList; do
    $fn $device $path
  done
  for job in `jobs -p`; do
    wait $job
  done
  for device in $deviceList; do
    start
  done
  echo "Done"
}

install_cb() {
  device=$1
  path=$2
  echo "[$device] $path"
  date
  ls -l $path
  stop
  adb -s $device install -rdg $path &
}

install() {
  wrap install_cb $1
}

stop() {
  adb -s $device shell am force-stop $app
}
start() {
  adb -s $device shell monkey -p $app -c android.intent.category.LAUNCHER 1
}

uninstall_cb() {
  device=$1
  echo "[$device] $app"
  stop
  adb -s $device uninstall $app
}

uninstall() {
  wrap uninstall_cb
}
