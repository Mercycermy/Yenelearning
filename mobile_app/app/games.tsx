import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Alert,
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
import type { ContentListItem } from '../src/data/models';
import { userPrefs } from '../src/data/userPrefs';

export default function GamesScreen() {
  const [games, setGames] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const language = await userPrefs.getLanguage();
      const response = await contentRepository.fetchContentPaged({
        type: 'game',
        language,
        page: 1,
        pageSize: 30,
      });
      setGames(response.items);
    } catch {
      setError('Failed to load games.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames]),
  );

  if (loading && !games.length) return <LoadingState />;
  if (error && !games.length) return <ErrorState message={error} onRetry={loadGames} />;
  if (!games.length) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="game-controller" size={100} color={AppColors.yellow} />
        <Text style={styles.emptyTitle}>No games yet</Text>
        <Text style={styles.emptySub}>Games will appear here as they are added.</Text>
        <Pressable style={styles.refresh} onPress={loadGames}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadGames} />}
    >
      {games.map((game) => (
        <Pressable
          key={game.id}
          style={styles.card}
          onPress={() =>
            Alert.alert(game.title, game.description || 'Get ready to play and earn stars!')
          }
        >
          {game.imageUrl ? (
            <Image source={{ uri: game.imageUrl }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="game-controller" size={36} color={AppColors.yellow} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{game.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {game.description || 'Fun learning game'}
            </Text>
            <Text style={styles.diff}>{game.difficulty}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 28, color: AppColors.yellow, marginTop: 16 },
  emptySub: { color: AppColors.gray500, textAlign: 'center', marginTop: 8 },
  refresh: {
    marginTop: 24,
    backgroundColor: AppColors.yellow,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  refreshText: { fontFamily: 'Poppins_700Bold', color: '#fff' },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: AppColors.softYellow,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  thumb: { width: 84, height: 84, borderRadius: 16 },
  thumbFallback: {
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 17 },
  desc: { color: AppColors.gray500, marginTop: 4, fontFamily: 'Poppins_400Regular' },
  diff: { marginTop: 8, color: AppColors.orange, fontFamily: 'Poppins_700Bold', fontSize: 12 },
});
