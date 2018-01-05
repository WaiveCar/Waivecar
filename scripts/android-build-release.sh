#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( dirname $DIR )"
. $DIR/common.sh

apk_version=`cat $ROOT/config.xml | grep -Po "((?<=android-versionCode..)\d*)"`
git_version=`git describe`
now=`date +%s`
echo $now $apk_version $git_version >> .release-history
#clean_build

set -e

export KEYSTORE_PASS="yEt7Mon3I9Swi5woY4Wu"
export KEYSTORE="certs/waivecardrive.keystore"
export KEYSTORE_ALIAS="waivecardrive"
export APK_NAME="waivecardrive"
export APK_LOCATION="platforms/android/build/outputs/apk/android-release-unsigned.apk"

nvmcheck

#which cordova 

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

release_path=$ROOT/releases/$APK_NAME.apk
release_path_archive=$ROOT/releases/$APK_NAME-$apk_version.apk

mkdir -p releases
zipalign -f 4 \
  platforms/android/build/outputs/apk/android-release-unsigned.apk \
  $release_path_archive

[ -e $release_path ] && unlink $release_path

ln -s $release_path_archive $release_path

echo ----------------
echo $release_path 
echo $release_path_archive 
