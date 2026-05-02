import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.egoera.diario',
  appName: 'Egoera Diario',
  // webDir is required by Capacitor even when using server.url; 'public' acts as a dummy.
  webDir: 'public',
  server: {
    url: 'https://egoera-diario.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#f1ead8',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#f1ead8',
    },
  },
  ios: {
    contentInset: 'always',
    scheme: 'Egoera',
    backgroundColor: '#f1ead8',
  },
  android: {
    backgroundColor: '#f1ead8',
    webContentsDebuggingEnabled: false,
  },
};

export default config;
