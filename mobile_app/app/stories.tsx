import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingState } from '../src/components/ui';
import { AppColors } from '../src/constants/colors';
import { contentRepository } from '../src/data/contentRepository';
import type { StoryListItem } from '../src/data/models';
import { userPrefs } from '../src/data/userPrefs';

export default function StoriesScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const language = await userPrefs.getLanguage();
      const response = await contentRepository.fetchStoriesPaged({
        language,
        page: 1,
        pageSize: 30,
      });
      setStories(response.items);
    } catch {
      setError('Failed to load stories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [loadStories]),
  );

  if (loading && !stories.length) return <LoadingState />;
  if (error && !stories.length) return <ErrorState message={error} onRetry={loadStories} />;
  if (!stories.length) return <EmptyState message="No stories available yet." onRefresh={loadStories} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStories} />}
    >
      {stories.map((story) => (
        <Pressable
          key={story.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/story-reader',
              params: { id: story.id, title: story.title },
            })
          }
        >
          {story.coverImageUrl ? (
            <Image source={{ uri: story.coverImageUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons name="book" size={36} color={AppColors.green} />
            </View>
          )}
          <View style={styles.body}>
            <Text style={styles.title}>{story.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {story.description}
            </Text>
            <View style={styles.meta}>
              <Ionicons name="book-outline" size={14} color={AppColors.green} />
              <Text style={styles.pages}>{story.pagesCount} pages</Text>
              <View style={styles.readBtn}>
                <Text style={styles.readText}>Read</Text>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.white },
  card: {
    flexDirection: 'row',
    backgroundColor: AppColors.softSky,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cover: { width: 110, height: 140 },
  coverFallback: {
    backgroundColor: AppColors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, padding: 16 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 17 },
  desc: { fontFamily: 'Poppins_400Regular', color: AppColors.gray500, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 },
  pages: { flex: 1, color: AppColors.green, fontFamily: 'Poppins_700Bold', fontSize: 12 },
  readBtn: {
    backgroundColor: AppColors.accent,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  readText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 12 },
});
