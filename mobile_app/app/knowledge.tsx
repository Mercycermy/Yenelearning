import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState } from '../src/components/ui';
import { AppColors } from '../src/constants/colors';
import { contentRepository } from '../src/data/contentRepository';
import type { ContentListItem } from '../src/data/models';
import { userPrefs } from '../src/data/userPrefs';

export default function KnowledgeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48 - 16) / 2;
  const [lessons, setLessons] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const language = await userPrefs.getLanguage();
      const response = await contentRepository.fetchContentPaged({
        type: 'knowledge',
        language,
        page: 1,
        pageSize: 30,
      });
      setLessons(response.items);
    } catch {
      setError('Failed to load knowledge lessons.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLessons();
    }, [loadLessons]),
  );

  if (loading && !lessons.length) return <LoadingState />;
  if (error && !lessons.length) return <ErrorState message={error} onRetry={loadLessons} />;
  if (!lessons.length) {
    return (
      <EmptyState message="No knowledge yet. Lessons will appear here as they are added." onRefresh={loadLessons} />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLessons} />}
    >
      {lessons.map((lesson, index) => {
        const bg = index % 2 === 0 ? AppColors.softOrange : AppColors.softYellow;
        return (
          <Pressable
            key={lesson.id}
            style={[styles.card, { width: cardWidth, backgroundColor: bg }]}
            onPress={() => router.push(`/knowledge/${lesson.id}`)}
          >
            {lesson.imageUrl ? (
              <Image source={{ uri: lesson.imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.imageFallback}>
                <Ionicons name="bulb" size={40} color={AppColors.orange} />
              </View>
            )}
            <Text style={styles.title} numberOfLines={2}>
              {lesson.title}
            </Text>
            <Text style={styles.meta}>{lesson.difficulty}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    borderRadius: 22,
    padding: 12,
    minHeight: 180,
  },
  image: { width: '100%', height: 100, borderRadius: 16, marginBottom: 10 },
  imageFallback: {
    height: 100,
    borderRadius: 16,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 15 },
  meta: { marginTop: 6, color: AppColors.gray500, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
});
