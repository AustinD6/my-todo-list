import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.austind6.todo',
  appName: 'My Todo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
