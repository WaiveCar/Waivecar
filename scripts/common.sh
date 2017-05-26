#!/bin/bash
app=com.waivecar.app

get_device() {
  if [ -z "$deviceList" ]; then
    deviceList=`adb devices | grep -v List | awk ' { printf "%s ", $1 } ' | sed s'/ *$//'`
    if [ -z "$deviceList" ]; then
      watch -n 0.2 "adb devices -l"
      get_device
    fi
  fi
}

nvmcheck() {
  which node 
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
  for device in $deviceList; do
    $fn $device $path
  done
  for job in `jobs -p`; do
    wait $job
  done
}

install_cb() {
  device=$1
  path=$2
  echo '                              '`date`
  ls -l $path
  adb -s $device install -rdg $path &
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
  device=$1
  adb -s $device shell am force-stop $app
}

start() {
  device=$1
  adb -s $device shell monkey -p $app -c android.intent.category.LAUNCHER 1
}

uninstall_cb() {
  device=$1
  echo "[$device] $app"
  adb -s $device uninstall $app
}

uninstall() {
  wrap stop
  wrap uninstall_cb
}
