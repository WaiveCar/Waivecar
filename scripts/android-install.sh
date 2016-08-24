#!/bin/sh
set -x
adb uninstall -k com.waivecar.app
adb install -dg platforms/android/build/outputs/apk/android-debug.apk

