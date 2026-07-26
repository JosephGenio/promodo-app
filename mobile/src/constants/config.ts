export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:4000',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  // Dev-only: skip login and go straight to the main tabs, for previewing
  // screens before the backend exists. Never set this in a real build.
  devSkipAuth: process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true',
};
