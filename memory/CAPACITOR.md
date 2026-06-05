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

## AdMob credentials (current state)

The repo now ships with **your production AdMob App ID and interstitial unit**.
Only the **Rewarded** ad unit still uses Google's test ID — create a Rewarded unit
in your AdMob console and update both files below to fully go live.

Configured (all production, `isTesting: false`):

- App ID (Android + iOS): `ca-app-pub-8757468659976693~4637205420`
- Interstitial unit: `ca-app-pub-8757468659976693/2724827724`
- Rewarded unit:     `ca-app-pub-8757468659976693/2929372083`

### Android native manifest setup (run once)

After `npx cap add android`:

1. `android/app/src/main/res/values/strings.xml` — add:
   ```xml
   <string name="admob_app_id">ca-app-pub-8757468659976693~4637205420</string>
   ```
2. `android/app/src/main/AndroidManifest.xml` — inside `<application>`:
   ```xml
   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
              android:value="@string/admob_app_id" />
   ```

### iOS Info.plist setup (when you register an iOS app in AdMob)

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-8757468659976693~YOUR_IOS_APP_ID</string>
<key>NSUserTrackingUsageDescription</key>
<string>This identifier will be used to deliver personalised ads to you.</string>
```

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
