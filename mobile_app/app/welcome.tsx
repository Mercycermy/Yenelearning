import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { contentRepository } from '../src/data/contentRepository';
import type { AvatarItem } from '../src/data/models';
import { userPrefs } from '../src/data/userPrefs';

const FALLBACK_AVATARS: AvatarItem[] = [
  { id: 'fallback_1', name: 'Abebe', imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Abebe' },
  { id: 'fallback_2', name: 'Chala', imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Chala' },
  { id: 'fallback_3', name: 'Sara', imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Sara' },
];

const LANGUAGES = [
  { id: 'amharic', name: 'Amharic', native: 'አማርኛ' },
  { id: 'geez', name: "Ge'ez", native: 'ግዕዝ' },
  { id: 'english', name: 'English', native: 'English' },
];

function formatTeachingStyle(value?: string | null) {
  if (!value) return 'Friendly tutor';
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [language, avatarId, data] = await Promise.all([
        userPrefs.getLanguage(),
        userPrefs.getAvatarId(),
        contentRepository.fetchAvatars(),
      ]);
      setSelectedLanguage(language);
      setSelectedAvatar(avatarId);
      setAvatars(data.length ? data : FALLBACK_AVATARS);
      setError(null);
    } catch {
      setError('Failed to load tutors. Using offline buddies.');
      setAvatars(FALLBACK_AVATARS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveAndContinue() {
    if (!selectedAvatar || !selectedLanguage) return;
    const avatar = avatars.find((item) => item.id === selectedAvatar);
    if (!avatar) return;
    await userPrefs.saveLanguage(selectedLanguage);
    await userPrefs.saveAvatar({
      id: avatar.id,
      name: avatar.name,
      imageUrl: avatar.imageUrl,
      teachingStyle: avatar.teachingStyle,
      personalityDescription: avatar.personalityDescription,
      voiceId: avatar.voiceId,
      speechRate: avatar.speechRate,
      pitchLevel: avatar.pitchLevel,
    });
    router.replace('/dashboard');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={18} color={AppColors.navy} />
          </View>
          <Text style={styles.brand}>Yene Teacher</Text>
        </View>
        <Pressable style={styles.parentBtn} onPress={() => router.push('/parent')}>
          <Ionicons name="shield" size={16} color={AppColors.navy} />
          <Text style={styles.parentText}>Parent</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Welcome to{'\n'}Yene Teacher!</Text>
          <Text style={styles.heroSub}>
            Pick a buddy and a language to start learning and playing!
          </Text>
        </View>
        <View style={styles.heart}>
          <Ionicons name="heart" size={28} color={AppColors.accent} />
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>1. Pick a Buddy</Text>
        <Pressable onPress={loadData}>
          <Ionicons name="refresh" size={22} color={AppColors.blue} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={AppColors.purple} style={{ marginVertical: 24 }} />
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.wrap}>
            {avatars.map((avatar, index) => {
              const selected = selectedAvatar === avatar.id;
              const accent = index % 2 === 0 ? AppColors.blue : AppColors.yellow;
              const bg = index % 2 === 0 ? AppColors.softBlue : AppColors.softYellow;
              return (
                <Pressable
                  key={avatar.id}
                  onPress={() => setSelectedAvatar(avatar.id)}
                  style={[
                    styles.buddy,
                    { backgroundColor: bg, borderColor: selected ? accent : 'transparent' },
                  ]}
                >
                  <Image source={{ uri: avatar.imageUrl }} style={styles.buddyImage} />
                  <Text style={styles.buddyName}>{avatar.name}</Text>
                  <Text style={styles.buddySub}>{formatTeachingStyle(avatar.teachingStyle)}</Text>
                  {selected ? (
                    <View style={[styles.chosen, { backgroundColor: accent }]}>
                      <Text style={styles.chosenText}>Chosen</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Text style={[styles.section, { marginTop: 24 }]}>2. Pick a Language</Text>
      <View style={styles.wrap}>
        {LANGUAGES.map((lang) => {
          const selected = selectedLanguage === lang.id;
          return (
            <Pressable
              key={lang.id}
              onPress={() => setSelectedLanguage(lang.id)}
              style={[
                styles.langChip,
                {
                  backgroundColor: selected ? AppColors.softMint : AppColors.white,
                  borderColor: selected ? AppColors.mint : AppColors.gray200,
                },
              ]}
            >
              <Text style={styles.langName}>{lang.name}</Text>
              <Text style={styles.langNative}>{lang.native}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.note}>
        Parents can track learning progress anytime in Parent Mode.
      </Text>

      <Pressable
        style={[
          styles.cta,
          (!selectedAvatar || !selectedLanguage) && { opacity: 0.5 },
        ]}
        disabled={!selectedAvatar || !selectedLanguage}
        onPress={saveAndContinue}
      >
        <Text style={styles.ctaText}>Let&apos;s Play!</Text>
        <Ionicons name="play" size={20} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.softMint },
  content: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: {
    padding: 10,
    backgroundColor: AppColors.softMint,
    borderRadius: 16,
  },
  brand: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  parentBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  parentText: { fontFamily: 'Poppins_600SemiBold', color: AppColors.navy },
  heroCard: {
    marginTop: 24,
    backgroundColor: AppColors.white,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 28, color: AppColors.navy },
  heroSub: { fontFamily: 'Poppins_400Regular', color: AppColors.gray500, marginTop: 8 },
  heart: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppColors.softMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionRow: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  error: { color: AppColors.error, marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  buddy: {
    width: '47%',
    borderRadius: 24,
    padding: 14,
    borderWidth: 3,
    alignItems: 'center',
  },
  buddyImage: { width: 90, height: 90, borderRadius: 20 },
  buddyName: { fontFamily: 'Poppins_700Bold', marginTop: 10 },
  buddySub: { fontFamily: 'Poppins_400Regular', color: AppColors.gray500, textAlign: 'center' },
  chosen: { marginTop: 8, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chosenText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 12 },
  langChip: {
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 110,
  },
  langName: { fontFamily: 'Poppins_700Bold' },
  langNative: { fontFamily: 'Poppins_400Regular', color: AppColors.gray500, marginTop: 4 },
  note: { color: AppColors.gray500, marginTop: 24, marginBottom: 12 },
  cta: {
    backgroundColor: AppColors.accent,
    borderRadius: 22,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 16 },
});
