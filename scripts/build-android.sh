# exit on first error
set -e

export KEYSTORE_PASS="yEt7Mon3I9Swi5woY4Wu"
export KEYSTORE="certs/waivecar.keystore"
export KEYSTORE_ALIAS="waivecar"
export APK_NAME="waivecar"
export APK_LOCATION="platforms/android/build/outputs/apk/android-release-unsigned.apk"

echo "\n > cordova build android\n"
cordova build android --release

echo "\n > signing apk\n"
jarsigner \
  -storepass $KEYSTORE_PASS \
  -sigalg SHA1withRSA \
  -digestalg SHA1 \
  -keystore $KEYSTORE \
  $APK_LOCATION \
  $KEYSTORE_ALIAS

echo "\n > verifying APK"
jarsigner -verify -certs $APK_LOCATION

echo "\n > creating release file in releases/$APK_NAME.apk\n"
mkdir -p releases
zipalign -f 4 \
  platforms/android/build/outputs/apk/android-release-unsigned.apk \
  releases/$APK_NAME.apk
