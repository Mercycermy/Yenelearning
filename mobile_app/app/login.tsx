import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { authRepository } from '../src/data/authRepository';
import { userPrefs } from '../src/data/userPrefs';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destination?: string }>();
  const isParentDestination = params.destination === 'parent';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscure, setObscure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (isParentDestination ? 'Parent sign in' : 'Parent sign in to get started'),
    [isParentDestination],
  );

  async function handleSignIn() {
    if (!email.trim() || password.trim().length < 6) {
      setError('Please enter a valid email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRepository.login(email.trim(), password.trim());
      if (response.user.role !== 'parent') {
        throw new Error('This account is not a parent account.');
      }
      await userPrefs.saveAuth(response.accessToken, JSON.stringify(response.user));
      await userPrefs.markFamilySetupComplete();
      if (isParentDestination) {
        router.replace('/parent-dashboard');
        return;
      }
      const avatarId = await userPrefs.getAvatarId();
      router.replace(avatarId ? '/dashboard' : '/welcome');
    } catch {
      setError('Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function returnToKidMode() {
    const avatarId = await userPrefs.getAvatarId();
    router.replace(avatarId ? '/dashboard' : '/welcome');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mascotWrap}>
          <View style={styles.mascotOuter}>
            <View style={styles.mascotDot} />
            <View style={styles.mascotInner}>
              <Ionicons name="sparkles" size={42} color={AppColors.navy} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {isParentDestination
            ? 'A private space for progress, goals, and family settings.'
            : 'Set up your family account, then your child can start learning.'}
        </Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={AppColors.gray500}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              placeholderTextColor={AppColors.gray500}
              secureTextEntry={obscure}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleSignIn}
            />
            <Pressable onPress={() => setObscure((v) => !v)} style={styles.eye}>
              <Ionicons
                name={obscure ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={AppColors.navy}
              />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in as parent</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.link}>New parent? Create an account</Text>
        </Pressable>
        <Pressable onPress={returnToKidMode} style={styles.kidMode}>
          <Ionicons name="happy-outline" size={18} color={AppColors.blue} />
          <Text style={[styles.link, { marginLeft: 6 }]}>Continue in kid mode</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.softMint },
  content: { padding: 24, paddingBottom: 40 },
  mascotWrap: { alignItems: 'center', marginTop: 8, marginBottom: 20 },
  mascotOuter: {
    width: 150,
    height: 150,
    borderRadius: 48,
    backgroundColor: AppColors.softSky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotDot: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.accent,
  },
  mascotInner: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: AppColors.navy,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    color: AppColors.gray500,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 28,
    padding: 24,
    shadowColor: AppColors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  input: {
    backgroundColor: AppColors.softMint,
    borderWidth: 2,
    borderColor: AppColors.navy,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontFamily: 'Poppins_400Regular',
    color: AppColors.gray900,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eye: { position: 'absolute', right: 14 },
  error: { color: AppColors.error, marginBottom: 12, fontFamily: 'Poppins_600SemiBold' },
  button: {
    backgroundColor: AppColors.accent,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 16 },
  link: {
    textAlign: 'center',
    color: AppColors.blue,
    marginTop: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  kidMode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
