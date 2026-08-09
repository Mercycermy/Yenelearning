import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorState, LoadingState } from '../src/components/ui';
import { AppColors } from '../src/constants/colors';
import { contentRepository } from '../src/data/contentRepository';
import type { StoryPageResponse } from '../src/data/models';

export default function StoryReaderScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string; title: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageResponse, setPageResponse] = useState<StoryPageResponse | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: params.title || 'Story' });
  }, [navigation, params.title]);

  async function loadPage(pageNumber: number) {
    setLoading(true);
    setError(null);
    try {
      const response = await contentRepository.fetchStoryPage(params.id, pageNumber);
      setPageResponse(response);
    } catch {
      setError('Failed to load story page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) loadPage(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, currentPage]);

  async function nextPage() {
    if (!pageResponse) return;
    if (currentPage >= pageResponse.totalPages) {
      Alert.alert('The End!', 'You finished the story!');
      router.back();
      return;
    }
    setCurrentPage((p) => p + 1);
  }

  if (loading) return <LoadingState />;
  if (error || !pageResponse) {
    return <ErrorState message={error ?? 'Failed to load story page.'} onRetry={() => loadPage(currentPage)} />;
  }

  const page = pageResponse.page;

  return (
    <View style={styles.container}>
      <View style={styles.imageBox}>
        {page.imageUrl ? (
          <Image source={{ uri: page.imageUrl }} style={styles.image} />
        ) : (
          <Ionicons name="image" size={64} color={AppColors.gray500} />
        )}
      </View>

      <View style={styles.textBox}>
        <Text style={styles.text}>{page.text}</Text>
      </View>

      <View style={styles.nav}>
        {currentPage > 1 ? (
          <Pressable
            style={[styles.btn, { backgroundColor: AppColors.gray200 }]}
            onPress={() => setCurrentPage((p) => p - 1)}
          >
            <Text style={[styles.btnText, { color: AppColors.gray900 }]}>Back</Text>
          </Pressable>
        ) : (
          <View style={{ width: 120 }} />
        )}
        <Text style={styles.counter}>
          {pageResponse.pageNumber} / {pageResponse.totalPages}
        </Text>
        <Pressable style={[styles.btn, { backgroundColor: AppColors.mint }]} onPress={nextPage}>
          <Text style={styles.btnText}>
            {currentPage < pageResponse.totalPages ? 'Next Page' : 'Done!'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: AppColors.white },
  imageBox: {
    height: 240,
    borderRadius: 28,
    backgroundColor: AppColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: { width: '100%', height: '100%' },
  textBox: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    elevation: 2,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 40,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  btn: {
    minWidth: 120,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  btnText: { fontFamily: 'Poppins_700Bold', color: AppColors.navy },
  counter: { fontFamily: 'Poppins_700Bold' },
});
