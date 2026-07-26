import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { config } from '@/constants/config';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: config.googleAndroidClientId,
    iosClientId: config.googleIosClientId,
    webClientId: config.googleWebClientId,
  });

  return { request, response, promptAsync };
}
