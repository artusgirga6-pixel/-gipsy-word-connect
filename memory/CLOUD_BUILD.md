# Build APK in the cloud — Free options

The web preview here is on **ARM64 Docker** which can't run Android's x86_64 AAPT2.
Use one of these free cloud build services instead. The repo already contains the
config files — just push and click.

## Option 1: GitHub Actions (recommended · 100% free, unlimited builds)

1. Create a free account on https://github.com (if you don't have one)
2. Create a new **private** repo (e.g., `gipsy-word-connect`)
3. Push this code:
   ```bash
   cd /app
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/gipsy-word-connect.git
   git push -u origin main
   ```
   In the Emergent UI you can also use the **"Push to GitHub"** button.
4. Open your repo → **Actions** tab → you'll see "Build Android APK" workflow run automatically
5. Wait ~6 minutes for the green check
6. Click on the completed run → scroll to **Artifacts** at the bottom
7. Download:
   - `gipsy-word-connect-debug.apk` — install directly on Android phone for testing
   - `gipsy-word-connect-release-unsigned.apk` — needs signing before Play Store upload

The workflow file is at `.github/workflows/build-android.yml`.

## Option 2: Codemagic (5 builds/month free, fastest setup)

1. Sign up at https://codemagic.io (free tier)
2. **Add application** → connect your GitHub repo
3. Codemagic auto-detects the `codemagic.yaml` at repo root
4. Click **Start your first build**
5. APK appears in the build artifacts

## Sign the release APK (one-time, for Play Store)

Both above produce an **unsigned** release APK. Before Play Store:

```bash
# Generate a keystore (do this ONCE, keep the file safe!)
keytool -genkey -v -keystore gipsy-release-key.jks -keyalg RSA -keysize 2048 \
        -validity 10000 -alias gipsy-key

# Sign the APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
          -keystore gipsy-release-key.jks app-release-unsigned.apk gipsy-key

# Align it
zipalign -v 4 app-release-unsigned.apk gipsy-word-connect.apk
```

For Play Store, prefer building **App Bundle (.aab)** instead. Change the Gradle
command in `.github/workflows/build-android.yml` to `bundleRelease` and download
`app-release.aab` from artifacts. Then upload `.aab` to Play Console — Google
signs and distributes the per-device APKs for you.

## What's already configured (you don't need to do this)

- ✅ AdMob App ID injected into `AndroidManifest.xml` + `strings.xml`
- ✅ Bundle ID: `com.gipsywordconnect.app`
- ✅ Interstitial unit `ca-app-pub-8757468659976693/2724827724`
- ✅ Rewarded unit `ca-app-pub-8757468659976693/2929372083`
- ✅ Capacitor 7 + @capacitor-community/admob 7
- ✅ All 50 levels, Romani phrases, music, coins
