#!/bin/bash
set -x
ionic build android
adb install -rdg platforms/android/build/outputs/apk/android-debug.apk

