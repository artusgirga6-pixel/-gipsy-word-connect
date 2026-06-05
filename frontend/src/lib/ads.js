// Centralized ads service. Uses real Google AdMob via @capacitor-community/admob
// when running inside a Capacitor native app; falls back to a no-op (so the
// AdModal-simulator UI inside the React app handles ad display on web).
//
// IMPORTANT: replace the test ad unit IDs with your production unit IDs
// before publishing to App Store / Google Play.

import { Capacitor } from "@capacitor/core";

// Google's official test ad unit IDs (Android & iOS share these for testing).
export const TEST_AD_UNITS = {
  interstitial: "ca-app-pub-3940256099942544/1033173712",
  rewarded: "ca-app-pub-3940256099942544/5224354917",
};

let initialized = false;
let admobImport = null;

function isNative() {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("AdMob");
  } catch {
    return false;
  }
}

async function getAdmob() {
  if (admobImport) return admobImport;
  // Dynamic import keeps the module out of the web bundle's critical path.
  admobImport = await import("@capacitor-community/admob");
  return admobImport;
}

export async function initAds() {
  if (initialized || !isNative()) return;
  initialized = true;
  try {
    const { AdMob } = await getAdmob();
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: true,
    });
  } catch (e) {
    console.warn("AdMob init failed", e);
  }
}

export async function showInterstitial() {
  if (!isNative()) return { native: false, completed: true };
  try {
    const { AdMob } = await getAdmob();
    await AdMob.prepareInterstitial({
      adId: TEST_AD_UNITS.interstitial,
      isTesting: true,
    });
    await AdMob.showInterstitial();
    return { native: true, completed: true };
  } catch (e) {
    console.warn("interstitial failed", e);
    return { native: true, completed: false };
  }
}

export async function showRewarded(reason = "hint") {
  if (!isNative()) return { native: false, rewarded: true, reason };
  try {
    const { AdMob } = await getAdmob();
    await AdMob.prepareRewardVideoAd({
      adId: TEST_AD_UNITS.rewarded,
      isTesting: true,
    });
    const reward = await AdMob.showRewardVideoAd();
    return { native: true, rewarded: !!reward, reason, reward };
  } catch (e) {
    console.warn("rewarded failed", e);
    return { native: true, rewarded: false, reason };
  }
}

export const ads = { initAds, showInterstitial, showRewarded, isNative };
