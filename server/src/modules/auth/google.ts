import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { unauthorized } from '../../lib/errors';

// All three platform client IDs are valid audiences for the same backend —
// the mobile app requests a token against whichever one matches its
// platform (android/ios/web-via-Expo-Go), and any of them proves the token
// came from this app's Google Sign-In flow.
const AUDIENCE = [env.GOOGLE_ANDROID_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID, env.GOOGLE_WEB_CLIENT_ID].filter(
  (id): id is string => Boolean(id),
);

const client = new OAuth2Client();

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string | null;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (AUDIENCE.length === 0) {
    throw unauthorized('Google Sign-In is not configured on this server');
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: AUDIENCE });
    payload = ticket.getPayload();
  } catch {
    throw unauthorized('Invalid Google token');
  }

  if (!payload?.sub || !payload.email) {
    throw unauthorized('Invalid Google token');
  }

  return { googleId: payload.sub, email: payload.email, name: payload.name ?? null };
}
