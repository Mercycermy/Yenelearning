import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { AppColors } from '../src/constants/colors';
import { contentRepository } from '../src/data/contentRepository';
import type { StoryListItem } from '../src/data/models';
import { userPrefs } from '../src/data/userPrefs';

interface RoadmapChapter {
  month: number;
  titleAmh: string;
  titleEn: string;
  descAmh: string;
  descEn: string;
  isUnlocked: boolean;
  pages: number;
  color: string;
  bg: string;
}

const MONTHLY_CHAPTERS: RoadmapChapter[] = [
  {
    month: 1,
    titleAmh: 'የአበበ እና የጫላ ጀብዱ',
    titleEn: 'Abebe & Chala’s Big Adventure',
    descAmh: 'ስለ ጓደኝነት እና ስለ ደግነት የሚያስተምር አስደሳች ታሪክ።',
    descEn: 'A heartwarming story celebrating kindness and friendship.',
    isUnlocked: true,
    pages: 4,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    month: 2,
    titleAmh: 'የፀሐይ ብርሃን ፍለጋ',
    titleEn: 'In Search of the Golden Sun',
    descAmh: 'ትንሿ ወፍ ስለ ተፈጥሮ እና ስለ ብርሃን ያደረገችው ጉዞ።',
    descEn: 'Follow the little songbird exploring wonders of nature.',
    isUnlocked: true,
    pages: 5,
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    month: 3,
    titleAmh: 'የደጉ አንበሳ ምስጢር',
    titleEn: 'The Gentle Lion of the Savanna',
    descAmh: 'ጀግንነት እና የዋህነት እንዴት አብረው እንደሚሄዱ።',
    descEn: 'Discover true courage through compassion.',
    isUnlocked: true,
    pages: 4,
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    month: 4,
    titleAmh: 'የሰማዩ ኮከብ ጉዞ',
    titleEn: 'Journey to the Starlight Cloud',
    descAmh: 'የሚያበሩ ከዋክብትን እና የጠፈር ምስጢራትን ይወቁ።',
    descEn: 'A cosmic bedtime story inspiring imagination.',
    isUnlocked: false,
    pages: 6,
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  {
    month: 5,
    titleAmh: 'የቀለማቱ ደሴት',
    titleEn: 'Island of Vibrant Colors',
    descAmh: 'ቀለማት እንዴት ተፈጥሮን እንደሚያደምቁ የሚያሳይ።',
    descEn: 'Unlocks next month with progressive learning.',
    isUnlocked: false,
    pages: 5,
    color: '#EC4899',
    bg: '#FCE7F3',
  },
];

export default function StoriesScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('amharic');

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const lang = await userPrefs.getLanguage();
      setLanguage(lang);
      const response = await contentRepository.fetchStoriesPaged({
        language: lang,
        page: 1,
        pageSize: 30,
      });
      setStories(response.items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [loadStories]),
  );

  function handleReadChapter(chapter: RoadmapChapter) {
    if (!chapter.isUnlocked) {
      Alert.alert(
        'Chapter Locked 🔒',
        `Month ${chapter.month} story unlocks automatically as your child progresses through monthly milestones.`,
      );
      return;
    }

    router.push({
      pathname: '/story-reader',
      params: {
        id: `chapter-${chapter.month}`,
        title: language === 'amharic' ? chapter.titleAmh : chapter.titleEn,
      },
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStories} />}
    >
      {/* Header Banner */}
      <View style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>
            {language === 'amharic' ? 'የታሪክ መጽሐፍት 📚' : 'Story Roadmap 📚'}
          </Text>
          <Text style={styles.heroSub}>
            {language === 'amharic'
              ? 'በየወሩ የሚከፈቱ አዳዲስ እና አስተማሪ ታሪኮች!'
              : 'Monthly sequential chapters unlocked as you read and grow!'}
          </Text>
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name="book" size={32} color="#10B981" />
        </View>
      </View>

      {/* Monthly Story Roadmap */}
      <Text style={styles.sectionHeading}>
        {language === 'amharic' ? 'የወርሃዊ ታሪኮች ቅደም ተከተል' : 'Monthly Chapter Releases'}
      </Text>

      <View style={styles.roadmap}>
        {MONTHLY_CHAPTERS.map((chapter, index) => {
          const isLast = index === MONTHLY_CHAPTERS.length - 1;
          return (
            <View key={chapter.month} style={styles.roadmapItem}>
              {/* Timeline Indicator */}
              <View style={styles.timelineCol}>
                <View
                  style={[
                    styles.timelineDot,
                    chapter.isUnlocked
                      ? { backgroundColor: chapter.color, borderColor: chapter.bg }
                      : styles.timelineDotLocked,
                  ]}
                >
                  <Ionicons
                    name={chapter.isUnlocked ? 'checkmark' : 'lock-closed'}
                    size={14}
                    color={chapter.isUnlocked ? '#fff' : AppColors.gray500}
                  />
                </View>
                {!isLast ? <View style={styles.timelineLine} /> : null}
              </View>

              {/* Story Card */}
              <Pressable
                style={[
                  styles.chapterCard,
                  { backgroundColor: chapter.bg },
                  !chapter.isUnlocked && styles.chapterCardLocked,
                ]}
                onPress={() => handleReadChapter(chapter)}
              >
                <View style={styles.chapterHeader}>
                  <View style={[styles.monthBadge, { backgroundColor: '#fff' }]}>
                    <Text style={[styles.monthText, { color: chapter.color }]}>
                      Month {chapter.month}
                    </Text>
                  </View>
                  {chapter.isUnlocked ? (
                    <View style={styles.unlockedPill}>
                      <Ionicons name="sparkles" size={12} color="#10B981" />
                      <Text style={styles.unlockedText}>Unlocked</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedPill}>
                      <Ionicons name="lock-closed" size={12} color={AppColors.gray500} />
                      <Text style={styles.lockedText}>Locked</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.chapterTitle}>
                  {language === 'amharic' ? chapter.titleAmh : chapter.titleEn}
                </Text>
                <Text style={styles.chapterDesc} numberOfLines={2}>
                  {language === 'amharic' ? chapter.descAmh : chapter.descEn}
                </Text>

                <View style={styles.chapterFooter}>
                  <View style={styles.pageCount}>
                    <Ionicons name="document-text-outline" size={14} color={chapter.color} />
                    <Text style={[styles.pageText, { color: chapter.color }]}>
                      {chapter.pages} Pages
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.readActionBtn,
                      { backgroundColor: chapter.isUnlocked ? chapter.color : AppColors.gray200 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readActionText,
                        !chapter.isUnlocked && { color: AppColors.gray500 },
                      ]}
                    >
                      {chapter.isUnlocked ? 'Read Story →' : 'Locked'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Extra Server Stories if available */}
      {stories.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionHeading}>
            {language === 'amharic' ? 'ተጨማሪ መጻሕፍት' : 'Supplementary Library'}
          </Text>
          {stories.map((story) => (
            <Pressable
              key={story.id}
              style={styles.extraCard}
              onPress={() =>
                router.push({
                  pathname: '/story-reader',
                  params: { id: story.id, title: story.title },
                })
              }
            >
              {story.coverImageUrl ? (
                <Image source={{ uri: story.coverImageUrl }} style={styles.extraCover} />
              ) : (
                <View style={styles.extraCoverFallback}>
                  <Ionicons name="book" size={28} color={AppColors.purple} />
                </View>
              )}
              <View style={{ flex: 1, padding: 14 }}>
                <Text style={styles.extraTitle}>{story.title}</Text>
                <Text style={styles.extraDesc} numberOfLines={2}>
                  {story.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: '#064E3B',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: '#fff',
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 4,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionHeading: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.navy,
    marginBottom: 16,
  },
  roadmap: {
    paddingLeft: 4,
  },
  roadmapItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    zIndex: 2,
  },
  timelineDotLocked: {
    backgroundColor: AppColors.gray100,
    borderColor: AppColors.gray200,
  },
  timelineLine: {
    flex: 1,
    width: 3,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  chapterCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chapterCardLocked: {
    opacity: 0.7,
    backgroundColor: '#F1F5F9',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  monthText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unlockedText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#10B981',
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.gray200,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockedText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: AppColors.gray500,
  },
  chapterTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    color: AppColors.navy,
  },
  chapterDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 4,
    lineHeight: 17,
  },
  chapterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  pageCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  readActionBtn: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  readActionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#fff',
  },
  extraCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  extraCover: {
    width: 90,
    height: 90,
  },
  extraCoverFallback: {
    width: 90,
    height: 90,
    backgroundColor: AppColors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: AppColors.navy,
  },
  extraDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 2,
  },
});
