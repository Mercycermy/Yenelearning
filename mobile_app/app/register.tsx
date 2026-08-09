import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppColors } from '../src/constants/colors';
import { authRepository } from '../src/data/authRepository';
import { userPrefs } from '../src/data/userPrefs';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.trim().length < 8) {
      setError('Please fill all fields. Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRepository.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      await userPrefs.saveAuth(response.accessToken, JSON.stringify(response.user));
      await userPrefs.markFamilySetupComplete();
      const avatarId = await userPrefs.getAvatarId();
      router.replace(avatarId ? '/dashboard' : '/welcome');
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Let’s set up your parent account.</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={AppColors.gray500}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor={AppColors.gray500}
            value={lastName}
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={AppColors.gray500}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={AppColors.gray500}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.softSky },
  content: { padding: 24 },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: AppColors.blue,
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    color: AppColors.gray500,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    padding: 20,
    elevation: 3,
  },
  input: {
    backgroundColor: AppColors.gray100,
    borderWidth: 2,
    borderColor: AppColors.gray200,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
    color: AppColors.gray900,
  },
  error: { color: AppColors.error, marginBottom: 12 },
  button: {
    backgroundColor: AppColors.blue,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontFamily: 'Poppins_700Bold' },
  link: {
    textAlign: 'center',
    color: AppColors.blue,
    marginTop: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
