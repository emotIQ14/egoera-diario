import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.egoera.diario',
  appName: 'Egoera Diario',
  webDir: 'out',
  ios: {
    contentInset: 'always',
    scheme: 'Egoera',
  },
  android: {
    backgroundColor: '#f1ead8',
  },
};

export default config;
