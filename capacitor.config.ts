import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vegasone.app',
  appName: 'Vegas One',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    // In production mobile app, point directly to the live hosted domain:
    url: process.env.CAPACITOR_SERVER_URL || 'https://vegasone.games',
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#07080D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#07080D',
    },
  },
};

export default config;
