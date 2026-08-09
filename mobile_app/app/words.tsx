import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState } from '../src/components/ui';
import { AppColors } from '../src/constants/colors';
import { contentRepository } from '../src/data/contentRepository';
import type { ContentListItem } from '../src/data/models';
import { userPrefs } from '../src/data/userPrefs';
import { speechService } from '../src/services/speech';

export default function WordsScreen() {
  const router = useRouter();
  const [words, setWords] = useState<ContentListItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('amharic');
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadWords() {
    setLoading(true);
    setError(null);
    try {
      const lang = await userPrefs.getLanguage();
      const response = await contentRepository.fetchContentPaged({
        type: 'word',
        language: lang,
        page: 1,
        pageSize: 50,
      });
      setLanguage(lang);
      setWords(response.items);
      setCurrentIndex(0);
    } catch {
      setError('Failed to load words.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWords();
  }, []);

  async function sayWord() {
    const available = await speechService.speak(words[currentIndex].title, language);
    if (!available) {
      Alert.alert('Voice', 'This voice is not installed on the device.');
    }
  }

  function nextWord() {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
    } else {
      Alert.alert('Great job!', 'You finished the lesson!');
      router.back();
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadWords} />;
  if (!words.length) return <EmptyState message="No words available yet." onRefresh={loadWords} />;

  const word = words[currentIndex];
  const translation = word.description?.trim() || '...';

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / words.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.card}>
        {word.imageUrl ? (
          <Image source={{ uri: word.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="sparkles" size={80} color={AppColors.orange} />
          </View>
        )}
        <Text style={styles.word}>{word.title}</Text>
        <Text style={styles.translation}>{translation}</Text>
        <Pressable onPress={sayWord}>
          <Ionicons name="volume-high" size={64} color={AppColors.accent} />
        </Pressable>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <View style={styles.row}>
        <Pressable
          style={[styles.circleBtn, { backgroundColor: AppColors.blue }]}
          onPress={() =>
            setFeedback('Speak aloud using the volume button, then tap Next.')
          }
        >
          <Ionicons name="mic" size={36} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.circleBtn, { backgroundColor: AppColors.green }]}
          onPress={nextWord}
        >
          <Ionicons name="arrow-forward" size={36} color="#fff" />
        </Pressable>
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: AppColors.blue }]}>Speak</Text>
        <Text style={[styles.label, { color: AppColors.green }]}>Next</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: AppColors.white },
  progressTrack: {
    height: 12,
    borderRadius: 10,
    backgroundColor: AppColors.gray200,
    overflow: 'hidden',
    marginBottom: 28,
  },
  progressFill: { height: '100%', backgroundColor: AppColors.green },
  card: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  image: { width: 220, height: 220, borderRadius: 24, marginBottom: 24 },
  imagePlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 32,
    backgroundColor: AppColors.softYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  word: { fontFamily: 'Poppins_800ExtraBold', fontSize: 42, color: AppColors.gray900 },
  translation: { fontFamily: 'Poppins_400Regular', fontSize: 22, color: AppColors.gray500, marginBottom: 16 },
  feedback: {
    textAlign: 'center',
    color: AppColors.blue,
    fontFamily: 'Poppins_700Bold',
    marginVertical: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 },
  circleBtn: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 8 },
  label: { fontFamily: 'Poppins_700Bold', width: 86, textAlign: 'center' },
});
