# SignMeUp

React Native 0.76 app (TypeScript). iOS bundle id `com.signmeup`, workspace `ios/SignMeUp.xcworkspace`, scheme `SignMeUp`.
Screens live in `src/screens`, shared UI in `src/components`, colors in `src/theme.ts`. Design: gold top and bottom bars, navy icons and text, artwork in `assets/`. No Firebase or backend yet; events are held in memory (`src/context/EventsContext.tsx`).

## Build and run in the iPhone simulator
Run `./run-ios.sh` (default device "iPhone 16 Pro", or pass another name). It installs dependencies and pods, boots the simulator, starts Metro, builds with `xcodebuild`, installs and launches the app.

Do not use `npx react-native run-ios`. On this machine it fails looking for `Simulator.app` at an old path.

Manual steps if needed:
1. `npm install --legacy-peer-deps && (cd ios && pod install)`
2. `npx react-native start` (leave running)
3. `xcodebuild -workspace ios/SignMeUp.xcworkspace -scheme SignMeUp -configuration Debug -destination "id=<simulator UDID>" -derivedDataPath ios/build build`
4. `xcrun simctl install <UDID> <path to SignMeUp.app>` then `xcrun simctl launch <UDID> com.signmeup`

Simulator UDIDs: `xcrun simctl list devices available`. Never pick a watchOS destination; the app is iPhone only.

## Workflow
After JS changes, Metro reloads the running app (press `r` in the Metro terminal or Cmd+R in the simulator). Native changes (Podfile, new native packages) need `pod install` and a rebuild.
