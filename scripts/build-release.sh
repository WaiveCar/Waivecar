#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

clean_build

set -e

export KEYSTORE_PASS="yEt7Mon3I9Swi5woY4Wu"
export KEYSTORE="certs/waivecar.keystore"
export KEYSTORE_ALIAS="waivecar"
export APK_NAME="waivecar"
export APK_LOCATION="platforms/android/build/outputs/apk/android-release-unsigned.apk"

cordova build android --release

jarsigner \
  -storepass $KEYSTORE_PASS \
  -sigalg SHA1withRSA \
  -digestalg SHA1 \
  -keystore $KEYSTORE \
  $APK_LOCATION \
  $KEYSTORE_ALIAS

echo "\n > verifying APK"
jarsigner -verify -certs $APK_LOCATION

echo "> creating release file in releases/$APK_NAME.apk"
mkdir -p releases
zipalign -f 4 \
  platforms/android/build/outputs/apk/android-release-unsigned.apk \
  releases/$APK_NAME.apk

# This is an OS-X ism
# open releases
