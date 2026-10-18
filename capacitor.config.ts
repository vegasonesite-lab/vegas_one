import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vegasone.app',
  appName: 'Vegas One',
  webDir: 'cap-dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    // In production mobile app, point directly to the live hosted domain:
    url: process.env.CAPACITOR_SERVER_URL || 'https://vegasone.games',
    cleartext: false,
    allowNavigation: ['vegasone.games', '*.vegasone.games'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      backgroundColor: '#070514',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#070514',
      overlaysWebView: false,
    },
  },
};

export default config;
