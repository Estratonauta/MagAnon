# Android APK (debug) – build & install

This project uses **Capacitor**.

## Prereqs
- Node 22+
- Android Studio (recommended) OR Android SDK + Java 17

## Local build (debug APK)
From the repo root:

```bash
cd app
npm install
npm run build
npx cap sync android
```

Open in Android Studio:

```bash
npx cap open android
```

Then in Android Studio:
- Build → Build Bundle(s) / APK(s) → Build APK(s)

The debug APK will be at something like:
- `app/android/app/build/outputs/apk/debug/app-debug.apk`

## Install on a device
Enable Developer Options + USB Debugging, then:

```bash
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Notes
- Debug APK is for testing. For Play Store / sharing broadly, we’ll add a signed **release** build later.
- GitHub Actions is configured to build and attach a debug APK artifact on every push to `main`.
