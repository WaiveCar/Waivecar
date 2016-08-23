#!/bin/sh
set -x
adb uninstall com.waivecar.app
adb install platforms/android/build/outputs/apk/android-debug.apk

