#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

nvmcheck

#if [ -e platforms/android/build ]; then
#  echo 'removing build'
#  rm -rf platforms/android/build
#fi

ionic build android
$DIR/android-replace.sh
