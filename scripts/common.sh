#!/bin/bash
APP=com.waivecardrive.app
NODE_VERSION=v6.11.4
#DBG=

get_device() {
  if [ "$DEVICE" ]; then
    deviceList=$DEVICE
  else
    if [ -z "$deviceList" ]; then
      deviceList=`adb devices | grep -v List | awk ' { printf "%s ", $1 } ' | sed s'/ *$//'`
      if [ -z "$deviceList" ]; then
        if [ "$1" = "1" ]; then
          echo "Bailing..."
          exit -1
        fi
        echo "Waiting for Devices"
        while [ -z "$deviceList" ]; do
          deviceList=`adb devices | grep -v List | awk ' { printf "%s ", $1 } ' | sed s'/ *$//'`
          sleep 0.5
        done
        get_device 1
      fi
    fi
  fi
}

nvmcheck() {
  version=`node --version`
  if [ "$version" != $NODE_VERSION ]; then
    . "$HOME/.nvm/nvm.sh"
    nvm use $NODE_VERSION
    if [ ! $? ]; then
      echo "Can't find nvm node version $NODE_VERSION"
      exit 1
    fi
  fi
}

log() {
  echo "[$device "$( date +"%H:%m:%S" )$"] $*"
}

wrap() {
  get_device
  fn=$1
  path=$2
  for job in `jobs -p`; do
    wait $job
  done
  for device in $deviceList; do
    log $fn $path
    {
      result=$($fn $device $path 2>&1)
      isFailed=$(echo $result | grep -iE '(failure|error)')
      if [ -n "$isFailed" ]; then
        log "Failed Install, uninstalling"
        uninstall $device
        $fn $device $path
      fi
    } &
  done
}

prebuild() {
  cd $DIR/..
  for i in res/mipmap*/icon.png; do
    cp $i platforms/android/$i >& /dev/null
  done

  for i in platforms/android/app/src/main/ platforms/android platforms/android/app/src/; do
    [ -e $i ] && cp -up misc/build-extras.gradle $i
  done
}

build() {
  before=`stat -c %Y www/dist/bundle.js`
  nvmcheck
  prebuild
  #$DBG cordova build android --debug -- --gradleArg=-PcdvCompileSdkVersion=$ORG_GRADLE_PROJECT_cdvCompileSdkVersion
  #$DBG cordova build android --debug -- --gradleArg=-PcdvCompileSdkVersion=$ORG_GRADLE_PROJECT_cdvCompileSdkVersion --gradleArg=--debug --gradleArg=--info --gradleArg=--stacktrace
  $DBG cordova build android 
  after=`stat -c %Y www/dist/bundle.js`
  if [ www/dist/bundle.js -nt platforms/android/assets/www/dist/bundle.js ]; then
    echo 'failed to produce new file'
    unfuckup
    build
  elif [ "$after" != "$before" ]; then
    echo 'Our dist file was rewritten under our feet, building again.'
    build
  else
    echo -e "\nbundle is from" $(( `date +%s` - after )) "seconds ago\n"
  fi
}
 
unfuckup() {
  path=www/js/controllers/car-controller.js
  cd $DIR/..
  set -x
  [ -e releases/waivecardrive.apk ] && rm releases/waivecardrive.apk
  [ -e platforms/android/build ] && rm -fr platforms/android/build
  [ -e platforms/android/assets/www ] && rm -fr platforms/android/assets/www
  [ -e www/dist ] && rm -fr www/dist/*
  [ -e $path ] && touch $path
  set +x
}

stop()       { adb -s $1 shell am force-stop $APP; }
install()    { adb -s $1 install -r -d $2; }
clear()      { adb -s $1 shell pm clear $APP; }
start()      { adb -s $1 shell monkey -p $APP -c android.intent.category.LAUNCHER 1; }
uninstall()  { adb -s $1 uninstall $APP; }
