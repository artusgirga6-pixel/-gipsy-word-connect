# Capacitor + AdMob — Native Build Guide

This document explains how to build **Gipsy Word Connect** as Android / iOS native
apps with real Google AdMob ads.

## What's already in the repo

| File | Purpose |
|------|---------|
| `frontend/capacitor.config.ts` | App ID, name, AdMob test app IDs |
| `frontend/src/lib/ads.js` | Native-aware ads wrapper (web no-op fallback) |
| `frontend/src/components/AdModal.jsx` | Calls `ads.showInterstitial` / `ads.showRewarded` when native; falls back to 5-second simulator on web |
| `frontend/src/App.js` | Calls `initAds()` on app startup |

Dependencies installed (with `--ignore-engines` since the dev container is on Node 20 and Capacitor 8 wants Node 22; we pinned **Capacitor 7.x**):

```
@capacitor/core@^7
@capacitor/cli@^7         (dev)
@capacitor/android@^7     (dev)
@capacitor/ios@^7         (dev)
@capacitor-community/admob@^7
```

## Build steps (run on YOUR local machine — not the preview container)

```bash
# 1. Clone / pull the repo locally
cd frontend

# 2. Install deps (Node 22 recommended for Capacitor 8; or stay on Node 20 with Capacitor 7)
yarn install

# 3. Build the React app
yarn build       # outputs to ./build (referenced by capacitor.config.ts webDir)

# 4. Add native platforms (one-time)
npx cap add android
npx cap add ios     # macOS only

# 5. Copy web assets + native dependencies
npx cap sync

# 6. Open native projects
npx cap open android    # opens Android Studio
npx cap open ios        # opens Xcode (macOS only)
```

From Android Studio / Xcode, press **Run** on a connected device or emulator.

## AdMob credentials (production)

The repo ships with **Google's official test AdMob units** — safe to use during
development, **never serve real ad inventory**. Replace before publishing:

1. **App IDs** — update in `frontend/capacitor.config.ts`:
   - `appIdAndroid`: `ca-app-pub-XXXX~YYYY`
   - `appIdIos`: `ca-app-pub-XXXX~YYYY`

2. **Native manifest** — Android:
   - `android/app/src/main/res/values/strings.xml` add:
     ```xml
     <string name="admob_app_id">ca-app-pub-YOUR~ID</string>
     ```
   - `android/app/src/main/AndroidManifest.xml` add inside `<application>`:
     ```xml
     <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
                android:value="@string/admob_app_id" />
     ```

3. **Native plist** — iOS, `ios/App/App/Info.plist`:
   ```xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-YOUR~ID</string>
   <key>NSUserTrackingUsageDescription</key>
   <string>This identifier will be used to deliver personalised ads to you.</string>
   ```

4. **Ad unit IDs** — replace in `frontend/src/lib/ads.js`:
   ```js
   export const TEST_AD_UNITS = {
     interstitial: "ca-app-pub-YOURPUB/UNIT1",
     rewarded:     "ca-app-pub-YOURPUB/UNIT2",
   };
   ```

5. **Set `isTesting: false`** in `frontend/src/lib/ads.js` (currently `true`).

## How the runtime switching works

- **Web preview**: `Capacitor.isNativePlatform()` is `false` → ads.js no-ops →
  AdModal renders the 5-second simulator. Game is fully playable.
- **Native build**: `isNativePlatform()` is `true` → `AdMob.prepareInterstitial()`
  → `AdMob.showInterstitial()` → real Google ad. AdModal never renders.

## Notes / caveats

- The dev preview here runs Node 20. Capacitor 8 needs Node 22. If you upgrade
  to Node 22+ on your machine, you may want to bump to Capacitor 8 (`yarn add
  @capacitor/core@latest …`).
- The `android/` and `ios/` directories are **NOT** generated yet (this requires
  Java + Android SDK / Xcode). Run `npx cap add android` once on your dev machine.
- Server-side reward verification: when you go to production, wire AdMob SSV
  callbacks to a new `/api/admob/verify` endpoint and award coins server-side
  using the player_id stored in the `ssv.userId` field. This prevents client
  tampering.
