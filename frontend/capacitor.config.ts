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
      // Google official test AdMob App IDs (sample, safe to use during dev).
      // Replace with your real AdMob App IDs before publishing.
      appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
      appIdIos: 'ca-app-pub-3940256099942544~1458002511',
      // Test ad unit IDs (also Google sample).
      // Used by /app/frontend/src/lib/ads.js — keep in sync.
      testInterstitial: 'ca-app-pub-3940256099942544/1033173712',
      testRewarded: 'ca-app-pub-3940256099942544/5224354917',
    },
  },
};

export default config;
