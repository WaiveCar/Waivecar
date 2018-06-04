#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( dirname $DIR )"
. $DIR/common.sh

apk_version=`cat $ROOT/config.xml | grep -Po "((?<=android-versionCode..)\d*)"`
git_version=`git describe`
now=`date +%s`
#clean_build

set -e

export KEYSTORE_PASS="yEt7Mon3I9Swi5woY4Wu"
export KEYSTORE="certs/waivecardrive.keystore"
export KEYSTORE_ALIAS="waivecardrive"
export APK_NAME="waivecardrive"

base=platforms/android/build/outputs/apk
nvmcheck
[ -e $base ] || base=platforms/android/app/build/outputs/apk

cordova build android --release

export APK_LOCATION="$base/release/android-release-unsigned.apk"
[ -e $base/android-release-unsigned.apk ] && export APK_LOCATION="$base/android-release-unsigned.apk"
[ -e $APK_LOCATION ] || APK_LOCATION="$base/release/app-release-unsigned.apk"

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
  $APK_LOCATION \
  $release_path_archive

[ -e $release_path ] && unlink $release_path

ln -s $release_path_archive $release_path

echo ----------------
echo $release_path 
echo $release_path_archive 

echo $now $apk_version $git_version >> .release-history
