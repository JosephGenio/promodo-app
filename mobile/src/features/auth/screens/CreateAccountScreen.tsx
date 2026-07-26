import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/features/auth/AuthContext';
import { getErrorMessage } from '@/api/getErrorMessage';
import { authStyles } from '@/features/auth/authStyles';
import type { AuthStackScreenProps } from '@/navigation/types';

export function CreateAccountScreen({ navigation }: AuthStackScreenProps<'CreateAccount'>) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateAccount() {
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create account'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.safeArea}>
      <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
        <Text style={authStyles.title}>Create account</Text>
        <Text style={authStyles.subtitle}>Get started with StudyMate</Text>

        <TextInput
          style={authStyles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={authStyles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {error ? <Text style={authStyles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[authStyles.button, isSubmitting && authStyles.buttonDisabled]}
          onPress={handleCreateAccount}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={authStyles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={authStyles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
