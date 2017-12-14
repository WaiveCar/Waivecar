#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

#clean_build

set -e

export KEYSTORE_PASS="yEt7Mon3I9Swi5woY4Wu"
export KEYSTORE="certs/waivecardrive.keystore"
export KEYSTORE_ALIAS="waivecardrive"
export APK_NAME="waivecardrive"
export APK_LOCATION="platforms/android/build/outputs/apk/android-release-unsigned.apk"

nvmcheck

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

mkdir -p releases
zipalign -f 4 \
  platforms/android/build/outputs/apk/android-release-unsigned.apk \
  $release_path

echo 
echo $release_path
