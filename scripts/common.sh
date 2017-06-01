#!/bin/bash
app=com.waivecar.app

get_device() {
  if [ "$DEVICE" ]; then
    deviceList=$DEVICE
  else
    if [ -z "$deviceList" ]; then
      deviceList=`adb devices | grep -v List | awk ' { printf "%s ", $1 } ' | sed s'/ *$//'`
      if [ -z "$deviceList" ]; then
        watch -n 0.2 "adb devices -l"
        get_device
      fi
    fi
  fi
}

nvmcheck() {
  which node > /dev/null
  if [ ! $? ]; then
    version=`node --version`
    [ "$version" == "v4.2.6" ] && return
  fi
  . "$HOME/.nvm/nvm.sh"
}

wrap() {
  get_device
  fn=$1
  path=$2
  for job in `jobs -p`; do
    wait $job
  done
  for device in $deviceList; do
    echo "[$device "$( date +"%H:%m:%S" )$"] $fn $path"
    $fn $device $path > /dev/null &
  done
}

build() {
  cd $DIR/..
  nvmcheck
  ionic build android
}
 
unfuckup() {
  cd $DIR/..
  set -x
  [ -e releases ] && rm -fr releases
  [ -e platforms/android/build ] && rm -fr platforms/android/build
  set +x
}

stop()       { adb -s $1 shell am force-stop $app; }
install()    { adb -s $1 install -rdg $2; }
clear()      { adb -s $1 shell pm clear $app; }
start()      { adb -s $1 shell monkey -p $app -c android.intent.category.LAUNCHER 1; }
uninstall()  { adb -s $1 uninstall $app; }
