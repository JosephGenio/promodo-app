import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setClientToken } from '@/api/client';
import { onUnauthorized } from '@/api/authEvents';
import { clearToken, getToken, setToken } from '@/storage/secureStore';
import { config } from '@/constants/config';
import * as authApi from '@/features/auth/api';
import type { User } from '@/features/auth/api';

const DEV_USER: User = { id: 'dev', email: 'dev@promodo.local', name: 'Dev User' };

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function applySession(token: string, sessionUser: User) {
    await setToken(token);
    setClientToken(token);
    setUser(sessionUser);
  }

  async function signOut() {
    await clearToken();
    setClientToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (config.devSkipAuth) {
      setUser(DEV_USER);
      setIsLoading(false);
      return;
    }
    (async () => {
      const storedToken = await getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      setClientToken(storedToken);
      try {
        const me = await authApi.fetchMe();
        setUser(me);
      } catch {
        await signOut();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => onUnauthorized(() => void signOut()), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      async signIn(email, password) {
        const { token, user: sessionUser } = await authApi.login(email, password);
        await applySession(token, sessionUser);
      },
      async signUp(email, password, name) {
        const { token, user: sessionUser } = await authApi.register(email, password, name);
        await applySession(token, sessionUser);
      },
      async signInWithGoogle(idToken) {
        const { token, user: sessionUser } = await authApi.googleSignIn(idToken);
        await applySession(token, sessionUser);
      },
      signOut,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
