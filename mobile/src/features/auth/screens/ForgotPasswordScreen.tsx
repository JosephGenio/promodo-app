import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { forgotPassword } from '@/features/auth/api';
import { getErrorMessage } from '@/api/getErrorMessage';
import { authStyles } from '@/features/auth/authStyles';
import { theme } from '@/theme/theme';
import type { AuthStackScreenProps } from '@/navigation/types';

export function ForgotPasswordScreen({ navigation }: AuthStackScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
        <Text style={authStyles.title}>Forgot password</Text>
        <Text style={authStyles.subtitle}>
          Enter your email and we'll send you a reset code.
        </Text>

        <TextInput
          style={authStyles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {error ? <Text style={authStyles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[authStyles.button, isSubmitting && authStyles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={authStyles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={authStyles.link}>Back to log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
