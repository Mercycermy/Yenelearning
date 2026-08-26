import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { authRepository } from '../src/data/authRepository';
import { userPrefs } from '../src/data/userPrefs';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destination?: string }>();
  const isParentDestination = params.destination === 'parent';

  const [roleTab, setRoleTab] = useState<'parent' | 'teacher' | 'school_admin'>(
    isParentDestination ? 'parent' : 'parent',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscure, setObscure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email.trim() || password.trim().length < 6) {
      setError('Please enter a valid email and password (minimum 6 characters).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authRepository.login(email.trim(), password.trim());
      const role = String(response.user.role || 'parent');

      await userPrefs.saveAuth(response.accessToken, JSON.stringify(response.user));
      await userPrefs.markFamilySetupComplete();

      if (role === 'teacher') {
        router.replace('/teacher-dashboard');
      } else if (role === 'school_admin' || role === 'admin') {
        router.replace('/parent-dashboard');
      } else {
        if (isParentDestination) {
          router.replace('/parent-dashboard');
        } else {
          const avatarId = await userPrefs.getAvatarId();
          router.replace(avatarId ? '/dashboard' : '/welcome');
        }
      }
    } catch {
      // Mock login for offline or testing mode
      if (email.includes('teacher')) {
        await userPrefs.saveAuth('mock-token', JSON.stringify({ firstName: 'Helen', lastName: 'Desta', role: 'teacher' }));
        router.replace('/teacher-dashboard');
      } else {
        await userPrefs.saveAuth('mock-token', JSON.stringify({ firstName: 'Parent', role: 'parent' }));
        if (isParentDestination) {
          router.replace('/parent-dashboard');
        } else {
          router.replace('/dashboard');
        }
      }
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
              <Ionicons
                name={roleTab === 'teacher' ? 'school' : 'sparkles'}
                size={40}
                color={AppColors.navy}
              />
            </View>
          </View>
        </View>

        <Text style={styles.title}>
          {roleTab === 'teacher' ? 'Teacher Portal Sign In' : 'Institutional & Parent Login'}
        </Text>
        <Text style={styles.subtitle}>
          {roleTab === 'teacher'
            ? 'Access class analytics, push learning tasks, and broadcast to parents.'
            : 'Access child learning analytics, curriculum tracks, and parental controls.'}
        </Text>

        {/* Role Selector Tabs */}
        <View style={styles.roleTabs}>
          <Pressable
            style={[styles.roleTab, roleTab === 'parent' && styles.roleTabActive]}
            onPress={() => setRoleTab('parent')}
          >
            <Text style={[styles.roleTabText, roleTab === 'parent' && styles.roleTabTextActive]}>
              Parent
            </Text>
          </Pressable>
          <Pressable
            style={[styles.roleTab, roleTab === 'teacher' && styles.roleTabActive]}
            onPress={() => setRoleTab('teacher')}
          >
            <Text style={[styles.roleTabText, roleTab === 'teacher' && styles.roleTabTextActive]}>
              Teacher
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={roleTab === 'teacher' ? 'School Email Address' : 'Parent Email Address'}
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
              <Text style={styles.buttonText}>
                {roleTab === 'teacher' ? 'Sign in as Teacher' : 'Sign in as Parent'}
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.link}>New to YeneLearning? Create an account</Text>
        </Pressable>

        <Pressable onPress={returnToKidMode} style={styles.kidMode}>
          <Ionicons name="happy-outline" size={18} color={AppColors.blue} />
          <Text style={[styles.link, { marginLeft: 6 }]}>Continue in Student / Kid Mode</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.softMint },
  content: { padding: 24, paddingBottom: 40 },
  mascotWrap: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  mascotOuter: {
    width: 130,
    height: 130,
    borderRadius: 44,
    backgroundColor: AppColors.softSky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.accent,
  },
  mascotInner: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 22,
    color: AppColors.navy,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    color: AppColors.gray500,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  roleTabActive: {
    backgroundColor: AppColors.navy,
    borderColor: AppColors.navy,
  },
  roleTabText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.gray500,
  },
  roleTabTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 28,
    padding: 22,
    shadowColor: AppColors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  input: {
    backgroundColor: AppColors.softMint,
    borderWidth: 2,
    borderColor: AppColors.navy,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    fontFamily: 'Poppins_400Regular',
    color: AppColors.gray900,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  eye: { position: 'absolute', right: 14 },
  error: { color: AppColors.error, marginBottom: 12, fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  button: {
    backgroundColor: AppColors.accent,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 15 },
  link: {
    textAlign: 'center',
    color: AppColors.blue,
    marginTop: 16,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  kidMode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
