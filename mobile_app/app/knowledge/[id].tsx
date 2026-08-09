import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorState, LoadingState } from '../../src/components/ui';
import { AppColors } from '../../src/constants/colors';
import { contentRepository } from '../../src/data/contentRepository';
import type { ContentDetail } from '../../src/data/models';

export default function KnowledgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detail, setDetail] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDetail() {
    setLoading(true);
    setError(null);
    try {
      const data = await contentRepository.fetchContentById(id);
      setDetail(data);
    } catch {
      setError('Failed to load knowledge details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !detail) {
    return <ErrorState message={error ?? 'No details found.'} onRetry={loadDetail} />;
  }

  const category = detail.metadata?.category?.toString();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {detail.imageUrl ? (
        <Image source={{ uri: detail.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.fallback]}>
          <Ionicons name="bulb" size={64} color={AppColors.orange} />
        </View>
      )}
      <Text style={styles.title}>{detail.title}</Text>
      {category ? <Text style={styles.category}>Category: {category}</Text> : null}
      <Text style={styles.desc}>
        {detail.description || 'No description provided.'}
      </Text>
      <View style={styles.chips}>
        <Chip label="Language" value={detail.language} />
        <Chip label="Difficulty" value={detail.difficulty} />
        <Chip label="Ages" value={`${detail.minAge}-${detail.maxAge}`} />
      </View>
    </ScrollView>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>
        {label}: {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  image: { width: '100%', height: 220, borderRadius: 20, marginBottom: 20 },
  fallback: {
    backgroundColor: AppColors.softOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: 'Poppins_800ExtraBold', fontSize: 24 },
  category: { color: AppColors.gray500, marginTop: 10, fontFamily: 'Poppins_400Regular' },
  desc: { marginTop: 12, fontSize: 16, lineHeight: 24, fontFamily: 'Poppins_400Regular' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 },
  chip: {
    backgroundColor: AppColors.gray100,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: AppColors.gray900 },
});
