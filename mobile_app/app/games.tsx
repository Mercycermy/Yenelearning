import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { userPrefs } from '../src/data/userPrefs';
import { progressRepository, type GameResultDto } from '../src/data/progressRepository';

interface GameItem {
  id: string;
  title: string;
  titleAmh: string;
  desc: string;
  descAmh: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  route: string;
  badge: string;
  category: string;
}

const BUILTIN_GAMES: GameItem[] = [
  {
    id: 'shape_match',
    title: 'Shape Match',
    titleAmh: 'የቅርጽ ማዛመጃ',
    desc: 'Identify geometric shapes, patterns and colors with bilingual voice prompts.',
    descAmh: 'ቅርጾችን፣ ቀለሞችን እና ቅጦችን በድምፅ ይለዩ።',
    icon: 'shapes',
    color: '#E11D48',
    bg: '#FFE4E6',
    route: '/game/shape-match',
    badge: 'Shapes & Patterns',
    category: 'Foundational',
  },
  {
    id: 'word_spell',
    title: 'Word Spell',
    titleAmh: 'ቃላት አቀናባሪ',
    desc: 'Acquire vocabulary and spell everyday words letter by letter.',
    descAmh: 'ፊደላትን በማስተካከል ቃላትን ይገንቡ።',
    icon: 'text',
    color: '#7C3AED',
    bg: '#EDE9FE',
    route: '/game/word-spell',
    badge: 'Spelling & Vocab',
    category: 'Language',
  },
  {
    id: 'counting',
    title: 'Count & Math',
    titleAmh: 'ቁጥሮች እና ሂሳብ',
    desc: 'Count animated objects and practice simple additions and subtractions.',
    descAmh: 'ዕቃዎችን በመቁጠር መሠረታዊ ሂሳብ ይለማመዱ።',
    icon: 'calculator',
    color: '#2563EB',
    bg: '#DBEAFE',
    route: '/game/counting',
    badge: 'Counting & Logic',
    category: 'Math Logic',
  },
  {
    id: 'logic_puzzle',
    title: 'Logic Quest',
    titleAmh: 'የአስተሳሰብ እንቆቅልሽ',
    desc: 'Solve odd-one-out and sequential pattern puzzles.',
    descAmh: 'ቅጦችን በማጠናቀቅ የአእምሮ እንቆቅልሾችን ይፍቱ።',
    icon: 'bulb',
    color: '#D97706',
    bg: '#FEF3C7',
    route: '/game/logic-puzzle',
    badge: 'Brain Boost',
    category: 'Logic',
  },
];

export default function GamesScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('amharic');
  const [recentResults, setRecentResults] = useState<GameResultDto[]>([]);

  const loadData = useCallback(async () => {
    const lang = await userPrefs.getLanguage();
    setLanguage(lang);
    const results = await progressRepository.getGameResults('active-child');
    setRecentResults(results);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>
            {language === 'amharic' ? 'የትምህርት ጨዋታዎች 🎮' : 'Mini-Game Arcade 🎮'}
          </Text>
          <Text style={styles.heroSub}>
            {language === 'amharic'
              ? 'በመጫወት እየተማሩ ኮከቦችን እና ሽልማቶችን ይሰብስቡ!'
              : 'Earn stars and level up your skills with foundational micro-games!'}
          </Text>
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name="game-controller" size={36} color={AppColors.yellow} />
        </View>
      </View>

      {/* Featured Games Section */}
      <Text style={styles.sectionHeading}>
        {language === 'amharic' ? 'ተወዳጅ ጨዋታዎች' : 'Core Foundational Games'}
      </Text>

      <View style={styles.gamesGrid}>
        {BUILTIN_GAMES.map((game) => (
          <Pressable
            key={game.id}
            style={[styles.gameCard, { backgroundColor: game.bg }]}
            onPress={() => router.push(game.route as never)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: '#fff' }]}>
                <Ionicons name={game.icon} size={28} color={game.color} />
              </View>
              <View style={[styles.badge, { backgroundColor: '#fff' }]}>
                <Text style={[styles.badgeText, { color: game.color }]}>
                  {game.badge}
                </Text>
              </View>
            </View>

            <Text style={styles.gameTitle}>
              {language === 'amharic' ? `${game.titleAmh} · ${game.title}` : game.title}
            </Text>
            <Text style={styles.gameDesc}>
              {language === 'amharic' ? game.descAmh : game.desc}
            </Text>

            <View style={styles.playRow}>
              <Text style={[styles.playText, { color: game.color }]}>
                {language === 'amharic' ? 'ተጫወቱ →' : 'Play Now →'}
              </Text>
              <View style={[styles.starPill, { backgroundColor: `${game.color}20` }]}>
                <Ionicons name="star" size={13} color={game.color} />
                <Text style={[styles.starPillText, { color: game.color }]}>+20★</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Recent Achievements */}
      {recentResults.length > 0 ? (
        <View style={styles.recentSection}>
          <Text style={styles.sectionHeading}>
            {language === 'amharic' ? 'የቅርብ ውጤቶች' : 'Recent Game Sessions'}
          </Text>
          {recentResults.slice(0, 3).map((res, i) => (
            <View key={res.id || i} style={styles.resultRow}>
              <Ionicons name="trophy" size={22} color={AppColors.yellow} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.resultTitle}>
                  {res.gameType.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.resultSub}>
                  Score: {res.score}/{res.maxScore} pts · {res.timeSpentSeconds}s
                </Text>
              </View>
              <View style={styles.starsRow}>
                {Array.from({ length: res.starsEarned || 1 }).map((_, si) => (
                  <Ionicons key={si} name="star" size={14} color={AppColors.yellow} />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 28,
    padding: 22,
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
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sectionHeading: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.navy,
    marginBottom: 14,
    marginTop: 6,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    borderRadius: 26,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  gameTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.navy,
  },
  gameDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: AppColors.gray500,
    marginTop: 4,
    lineHeight: 18,
  },
  playRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  playText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  starPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  recentSection: {
    marginTop: 24,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  resultTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.navy,
  },
  resultSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
});
