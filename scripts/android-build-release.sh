#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

version=`cat $DIR/../config.xml | grep -Po "((?<=android-versionCode..)\d*)"`
#clean_build

set -e

export KEYSTORE_PASS="yEt7Mon3I9Swi5woY4Wu"
export KEYSTORE="certs/waivecar.keystore"
export KEYSTORE_ALIAS="waivecar"
export APK_NAME="waivecar"
export APK_LOCATION="platforms/android/build/outputs/apk/android-release-unsigned.apk"

nvmcheck
node --version

which cordova 

cordova build android --release

jarsigner \
  -storepass $KEYSTORE_PASS \
  -sigalg SHA1withRSA \
  -digestalg SHA1 \
  -keystore $KEYSTORE \
  $APK_LOCATION \
  $KEYSTORE_ALIAS

echo "> verifying APK"
jarsigner -verify -certs $APK_LOCATION

release_path=releases/$APK_NAME.apk
release_path_archive=releases/$APK_NAME-$version.apk

mkdir -p releases
zipalign -f 4 \
  platforms/android/build/outputs/apk/android-release-unsigned.apk \
  $release_path_archive

[ -e $release_path ] && unlink $release_path

ln -s $release_path_archive $release_path

echo 
echo $release_path  $release_path_archive 
