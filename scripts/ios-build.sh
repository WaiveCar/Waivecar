#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

#cordova prepare ios
ionic build ios --verbose --release --buildFlag="-UseModernBuildSystem=0"

for word in microphone contact reminders calendar; do
  grep -viE "${word}s?(Usage| access)" $DIR/../platforms/ios/WaiveCar/WaiveCar-Info.plist > /tmp/removed
  mv /tmp/removed $DIR/../platforms/ios/WaiveCar/WaiveCar-Info.plist
done

for word in AlwaysUsage "even when the screen is off"; do
  grep -vE "$word" $DIR/../platforms/ios/WaiveCar/WaiveCar-Info.plist > /tmp/removed
  mv /tmp/removed $DIR/../platforms/ios/WaiveCar/WaiveCar-Info.plist
done

#$DIR/ios-replace.sh
