#!/bin/bash
# Builds SignMeUp and launches it in an iPhone simulator. Usage: ./run-ios.sh ["iPhone 16 Pro"]
set -e
cd "$(dirname "$0")"
DEVICE="${1:-iPhone 16 Pro}"

echo "==> Installing JS dependencies"
[ -d node_modules ] || npm install --legacy-peer-deps

echo "==> Installing pods"
(cd ios && pod install)

echo "==> Finding simulator: $DEVICE"
UDID=$(xcrun simctl list devices available | grep -F "$DEVICE (" | grep -v "iOS 27" | head -1 | grep -oE '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}')
if [ -z "$UDID" ]; then
  echo "No simulator named '$DEVICE'. Available:"; xcrun simctl list devices available | grep -i iphone; exit 1
fi
echo "    $UDID"

xcrun simctl boot "$UDID" 2>/dev/null || true
SIMAPP="$(dirname "$(xcode-select -p)")/Developer/Applications/Simulator.app"
[ -d "$SIMAPP" ] || SIMAPP="$(mdfind "kMDItemFSName == 'Simulator.app'" | head -1)"
if [ -n "$SIMAPP" ]; then open "$SIMAPP" --args -CurrentDeviceUDID "$UDID"; else open -a Simulator || true; fi

echo "==> Starting Metro"
lsof -ti:8081 | xargs kill 2>/dev/null || true
(npx react-native start > /tmp/signmeup-metro.log 2>&1 &)

echo "==> Building (first build takes several minutes)"
xcodebuild -workspace ios/SignMeUp.xcworkspace -scheme SignMeUp -configuration Debug \
  -destination "id=$UDID" -derivedDataPath ios/build build | tail -25

APP=$(find ios/build/Build/Products -name "SignMeUp.app" -maxdepth 3 | head -1)
BUNDLE=$(/usr/libexec/PlistBuddy -c "Print CFBundleIdentifier" "$APP/Info.plist")
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BUNDLE"
echo "==> Launched $BUNDLE"
