import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/features/auth/AuthContext';
import { useGoogleAuth } from '@/features/auth/useGoogleAuth';
import { getErrorMessage } from '@/api/getErrorMessage';
import { authStyles } from '@/features/auth/authStyles';
import { theme } from '@/theme/theme';
import type { AuthStackScreenProps } from '@/navigation/types';

const appLogo = require('../../../../assets/site-logo-transaprent.png');

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { signIn, signInWithGoogle } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      setError(null);
      signInWithGoogle(response.params.id_token).catch((err) => setError(getErrorMessage(err)));
    }
  }, [response]);

  async function handleLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
        <View style={authStyles.logoWrapper}>
          <Image source={appLogo} style={authStyles.logo} resizeMode="contain" />
        </View>
        <Text style={authStyles.title}>Welcome back</Text>
        <Text style={authStyles.subtitle}>Log in to continue</Text>

        <TextInput
          style={authStyles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={authStyles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[authStyles.button, isSubmitting && authStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={authStyles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={authStyles.secondaryButton}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Text style={authStyles.secondaryButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={authStyles.link}>Forgot password?</Text>
        </TouchableOpacity>

        <View style={authStyles.row}>
          <Text style={authStyles.subtitle}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
            <Text style={authStyles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
