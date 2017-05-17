#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

nvmcheck
[ -e platforms/android/build/outputs/apk/android-debug.apk ] && rm platforms/android/build/outputs/apk/android-debug.apk
ionic build android
$DIR/android-replace.sh
