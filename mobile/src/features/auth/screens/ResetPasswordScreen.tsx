import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { resetPassword } from '@/features/auth/api';
import { getErrorMessage } from '@/api/getErrorMessage';
import { authStyles } from '@/features/auth/authStyles';
import type { AuthStackScreenProps } from '@/navigation/types';

export function ResetPasswordScreen({ navigation, route }: AuthStackScreenProps<'ResetPassword'>) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email, code.trim(), newPassword);
      Alert.alert('Password reset', 'You can now log in with your new password.');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
        <Text style={authStyles.title}>Reset password</Text>
        <Text style={authStyles.subtitle}>
          Enter the code sent to {email} and choose a new password.
        </Text>

        <TextInput
          style={authStyles.input}
          placeholder="6-digit code"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />
        <TextInput
          style={authStyles.input}
          placeholder="New password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
            <Text style={authStyles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
