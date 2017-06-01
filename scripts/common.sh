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
  if [ $? ]; then
    . "$HOME/.nvm/nvm.sh"
  else
    version=`node --version`
    if [ "$version" != "v4.2.6" ]; then
      . "$HOME/.nvm/nvm.sh"
    fi
  fi
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
    $fn $device $path > /dev/null
  done
}

build() {
  cd $DIR/..
  nvmcheck
  ionic build android
}
 
install_cb() {
  adb -s $1 install -rdg $2 &
}

clear_cb() {
  adb -s $1 shell pm clear $app 
}

install() {
  wrap stop
  wrap install_cb $1
  wrap start
}

clean_build() {
  if [ -e platforms/android/build ]; then
    echo 'removing build'
    rm -rf platforms/android/build
  fi
}

stop() {
  adb -s $1 shell am force-stop $app &
}

start() {
  adb -s $1 shell monkey -p $app -c android.intent.category.LAUNCHER 1 &
}

uninstall_cb() {
  adb -s $1 uninstall $app &
}
