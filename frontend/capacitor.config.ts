/// <reference types="@capacitor/cli" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gipsywordconnect.app',
  appName: 'Gipsy Word Connect',
  webDir: 'build',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    AdMob: {
      // Production AdMob App ID (provided by app owner).
      appIdAndroid: 'ca-app-pub-8757468659976693~4637205420',
      // iOS app needs its own app ID once registered in AdMob console.
      // Until then this falls back to the same Android ID (will not show ads on iOS).
      appIdIos: 'ca-app-pub-8757468659976693~4637205420',
      // Production ad units (kept in sync with frontend/src/lib/ads.js).
      // Interstitial: production unit (provided).
      productionInterstitial: 'ca-app-pub-8757468659976693/2724827724',
      // Rewarded: NOT yet provided — using Google test ID until you create a
      // Rewarded ad unit in AdMob console and update this value + ads.js.
      productionRewarded: 'ca-app-pub-3940256099942544/5224354917',
    },
  },
};

export default config;
