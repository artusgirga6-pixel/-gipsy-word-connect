/// <reference types="@capacitor/cli" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dusan.tajnicka',
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
      // Rewarded ad unit: production.
      productionRewarded: 'ca-app-pub-8757468659976693/2929372083',
    },
  },
};

export default config;
