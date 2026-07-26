import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'StudyMate',
  // slug/android.package/extra.eas.projectId intentionally left as "promodo" —
  // they're tied to the EAS project + Android app identity already provisioned
  // under that name. Only the user-facing display name changes here.
  slug: 'promodo',
  scheme: 'studymate',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/site-logo-transaprent.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.thesis.promodoapp',
    adaptiveIcon: {
      backgroundColor: '#6366F1',
      foregroundImage: './assets/site-logo-transaprent.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/site-logo-transaprent.png',
  },
  plugins: ['expo-secure-store', 'expo-web-browser', 'expo-font'],
  extra: {
    eas: {
      projectId: '88fe0eaf-ffe7-4dff-b0b6-7cd47d40fdeb',
    },
  },
};

export default config;
