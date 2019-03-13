#!/bin/bash
APP=com.waivecardrive.app
#NODE_VERSION=`cat ../.nvm_version`
NODE_VERSION=v6.11.4
export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https://services.gradle.org/distributions/gradle-4.8-all.zip

# see https://forum.ionicframework.com/t/generating-and-apk-file-error/143354
if [ -z "$ANDROID_NDK_HOME" ]; then
  if [ -e $HOME/proggies/android-ndk-r19c/ ]; then
    export ANDROID_NDK_HOME=$HOME/proggies/android-ndk-r19c/
  fi
fi

if [ "`uname -s`" = 'Darwin' ]; then
  cp='cp -p'
  stat='stat -f %m'
else
  cp='cp -up'
  stat='stat -c %Y'
fi

cdv=`grep buildToolsVersion $DIR/../misc/build-extras.gradle | grep -v \/\/ | awk ' { print $2 }'`
if [ -n "$cdv" ]; then
  export ORG_GRADLE_PROJECT_cdvBuildToolsVersion=$cdv
  true
fi
sdk=`grep ext.cdvCompileSdkVersion $DIR/../misc/build-extras.gradle | grep -v \/\/ | awk ' { print $3 }'`
if [ -n "$sdk" ]; then
  export ORG_GRADLE_PROJECT_cdvCompileSdkVersion=$sdk
fi

#DBG="strace -f"

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
    echo "Using $NODE_VERSION"
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

  cp misc/strings.xml platforms/android/app/src/main/res/values/
  #cp misc/project.properties platforms/android/

  for i in platforms/android/app/src/main/ platforms/android platforms/android/app/src/; do
    [ -e $i ] && $cp misc/build-extras.gradle $i
  done
}

build() {
  before=
  exists=
  if [ -e www/dist/bundle.js ]; then
    before=`$stat www/dist/bundle.js`
  fi
  [ -e platforms/android/build/outputs/apk/android-debug.apk ] && exist=1

  nvmcheck
  prebuild
  baseBuild="$DBG cordova build android --debug -- --gradleArg=--warning-mode=none --gradleArg=--debug --gradleArg=--info --gradleArg=--stacktrace"
  if [ -n "$ORG_GRADLE_PROJECT_cdvCompileSdkVersion" ]; then
    echo "Injecting $ORG_GRADLE_PROJECT_cdvCompileSdkVersion"
    $baseBuild
  else
    $baseBuild
  fi
  #$DBG cordova build android --debug -- --gradleArg=-PcdvCompileSdkVersion=$ORG_GRADLE_PROJECT_cdvCompileSdkVersion --gradleArg=--debug --gradleArg=--info --gradleArg=--stacktrace

  distPath=www/dist/bundle.js
  after=
  if [ -e $distPath ]; then
    after=`$stat $distPath`
  else
    echo "Failed to build $distPath. Fuck this shit." "(($last))"
    exit 1
  fi

  if [ www/dist/bundle.js -nt platforms/android/assets/www/dist/bundle.js -a -n "$exists" ]; then
    echo 'failed to produce new file'
    unfuckup
    build
  elif [ "$after" != "$before" ]; then
    #echo 'Our dist file was rewritten under our feet, building again.'
    #build
    true
  fi
  echo -e "\nbundle is from" $(( `date +%s` - after )) "seconds ago\n"
}
 
nuke() {
  [ -e $DIR/../plugins ] && rm -fr $DIR/../plugins
  nvmcheck
  unfuckup
  wrap clear
  cordova platform remove android
  cordova platform list
  cordova plugin list
  rm -r $DIR/plugins/cordova*

  echo "Waiting for entry to rebuild"
  read
  cordova platform add android@7.1.0
  cordova platform list
  cordova plugin list
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

find_and_install() {
  path=''
  build=''
  pathList="$DIR/../platforms/android/build/outputs/apk/debug $DIR/../platforms/android/build/outputs/apk $DIR/../platforms/android/app/build/outputs/apk/debug"
  buildList="android-debug.apk app-debug.apk"

  for i in $pathList; do
    [ -z "$path" -a -d "$i" ] && path=$i
  done

  if [ -z "$path" ]; then 
    echo "Can't find the paths $pathList. Bailing"
    exit -1
  fi

  for i in $buildList; do
    [ -z "$build" -a -e "$path/$i" ] && build=$i
  done
  if [ -z "$build" ]; then 
    echo "Can't find this files $buildList in $path (path list: $pathList). Bailing"
    exit -1
  fi

  wrap install $path/$build
}

stop()       { adb -s $1 shell am force-stop $APP; }
install()    { adb -s $1 install -r -d $2; }
clear()      { adb -s $1 shell pm clear $APP; }
start()      { adb -s $1 shell monkey -p $APP -c android.intent.category.LAUNCHER 1; }
uninstall()  { adb -s $1 uninstall $APP; }
