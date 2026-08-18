import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { userPrefs } from '../src/data/userPrefs';
import {
  DuolingoRoadmapPath,
  ChapterData,
  LessonNodeData,
} from '../src/components/DuolingoRoadmapPath';
import { AvatarCustomizerModal, AvatarItemData } from '../src/components/AvatarCustomizerModal';
import { AgeAdaptiveWrapper } from '../src/components/AgeAdaptiveWrapper';

const MOCK_CHAPTERS: ChapterData[] = [
  {
    id: 'ch-1',
    monthNumber: 1,
    titleAmharic: 'ምዕራፍ 1: የመጀመሪያ ሰላምታ',
    titleEnglish: 'Chapter 1: First Greetings',
    themeColor: '#10B981',
    status: 'UNLOCKED',
    completedNodeIds: ['node-1'],
    nodes: [
      { id: 'node-1', title: 'Welcome & Greetings', titleAmharic: 'ሰላምታ', type: 'WORD_GAME', icon: 'hand-left', starReward: 10, description: 'Learn Amharic greetings: Selam, Tenayistilign' },
      { id: 'node-2', title: 'Lili & The Little Bird', titleAmharic: 'ሊሊ እና ወፏ', type: 'STORY', icon: 'book', starReward: 15, description: 'Read a short story about kindness' },
      { id: 'node-3', title: 'Fidel Matching Game', titleAmharic: 'የፊደል ጨዋታ', type: 'MATH_SHAPES', icon: 'extension-puzzle', starReward: 20, description: 'Match Fidel letters to pictures' },
      { id: 'node-4', title: 'Talk with Tutor Abebe', titleAmharic: 'ከአበበ ጋር መነጋገር', type: 'AI_TALK', icon: 'chatbubbles', starReward: 25, description: 'Practice speaking out loud' },
    ],
  },
  {
    id: 'ch-2',
    monthNumber: 2,
    titleAmharic: 'ምዕራፍ 2: ቤተሰብ እና ቤት',
    titleEnglish: 'Chapter 2: Family & Home',
    themeColor: '#3B82F6',
    status: 'UNLOCKED',
    completedNodeIds: [],
    nodes: [
      { id: 'node-5', title: 'Family Words', titleAmharic: 'ቤተሰብ', type: 'WORD_GAME', icon: 'people', starReward: 10, description: 'Learn Enat, Abat, Wondim, Ehit' },
      { id: 'node-6', title: 'The Kind Lion Story', titleAmharic: 'ደግ አነበሳ', type: 'STORY', icon: 'book', starReward: 15, description: 'Story about helping others' },
      { id: 'node-7', title: 'Counting House Items', titleAmharic: 'የቤት ዕቃዎች', type: 'LOGIC_PUZZLE', icon: 'calculator', starReward: 20, description: 'Basic counting in Amharic' },
    ],
  },
  {
    id: 'ch-3',
    monthNumber: 3,
    titleAmharic: 'ምዕራፍ 3: ተፈጥሮ እና እንስሳት',
    titleEnglish: 'Chapter 3: Nature & Animals',
    themeColor: '#F59E0B',
    isLocked: true,
    status: 'LOCKED',
    completedNodeIds: [],
    nodes: [
      { id: 'node-8', title: 'Gelada Monkeys', titleAmharic: 'ጭላዳ ዝንጀሮ', type: 'WORD_GAME', icon: 'leaf', starReward: 10, description: 'Learn about Ethiopian animals' },
    ],
  },
];

const MOCK_AVATAR_ITEMS: AvatarItemData[] = [
  { id: 'item-1', name: 'Habesha Netela Cap', nameAmharic: 'የሀበሻ ኮፍያ', category: 'HAT', starCost: 15, iconName: 'headset', color: '#EF4444' },
  { id: 'item-2', name: 'Gold Crown', nameAmharic: 'የወርቅ ዘውድ', category: 'HAT', starCost: 30, iconName: 'ribbon', color: '#F59E0B' },
  { id: 'item-3', name: 'Traditional Vest', nameAmharic: 'ባህላዊ ቀሚስ / ጃኬት', category: 'OUTFIT', starCost: 20, iconName: 'shirt', color: '#10B981' },
  { id: 'item-4', name: 'Superhero Cape', nameAmharic: 'የጀግና ሸሚዝ', category: 'OUTFIT', starCost: 25, iconName: 'shield', color: '#8B5CF6' },
  { id: 'item-5', name: 'Cool Glasses', nameAmharic: 'ዘመናዊ መነፅር', category: 'ACCESSORY', starCost: 10, iconName: 'glasses', color: '#3B82F6' },
];

export default function DashboardScreen() {
  const router = useRouter();

  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState<'KG' | 'GRADE_1'>('GRADE_1');
  const [streakDays, setStreakDays] = useState(3);
  const [stars, setStars] = useState(120);
  const [hearts, setHearts] = useState(5);

  const [customizerVisible, setCustomizerVisible] = useState(false);
  const [equippedConfig, setEquippedConfig] = useState<{
    equippedHat?: string;
    equippedOutfit?: string;
  }>({ equippedHat: 'headset' });

  const loadProfile = useCallback(async () => {
    const [image, name] = await Promise.all([
      userPrefs.getAvatarImage(),
      userPrefs.getAvatarName(),
    ]);
    setAvatarImageUrl(image);
    setAvatarName(name);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  function handleSelectNode(node: LessonNodeData, chapter: ChapterData) {
    if (node.type === 'STORY') {
      router.push('/stories');
    } else if (node.type === 'WORD_GAME') {
      router.push('/words');
    } else if (node.type === 'AI_TALK') {
      router.push('/tutor');
    } else {
      router.push('/games');
    }
  }

  function handleEquipItem(item: AvatarItemData) {
    if (stars < item.starCost) {
      Alert.alert('Stars Needed', `You need ${item.starCost} stars to unlock this item! Keep learning!`);
      return;
    }
    const newConfig = { ...equippedConfig };
    if (item.category === 'HAT') newConfig.equippedHat = item.iconName;
    if (item.category === 'OUTFIT') newConfig.equippedOutfit = item.iconName;
    setEquippedConfig(newConfig);
    Alert.alert('Equipped! 🎉', `${item.nameAmharic} is now equipped on your avatar!`);
  }

  return (
    <View style={styles.container}>
      {/* Top Duolingo Status Bar */}
      <View style={styles.topStatusBar}>
        <View style={styles.statChip}>
          <Ionicons name="flame" size={20} color="#EF4444" />
          <Text style={styles.statValue}>{streakDays}</Text>
        </View>

        <View style={styles.statChip}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{stars}</Text>
        </View>

        <View style={styles.statChip}>
          <Ionicons name="heart" size={20} color="#EC4899" />
          <Text style={styles.statValue}>{hearts}</Text>
        </View>

        {/* Grade Mode Switcher Toggle */}
        <Pressable
          onPress={() => setGradeLevel((prev) => (prev === 'KG' ? 'GRADE_1' : 'KG'))}
          style={styles.gradeToggleBtn}
        >
          <Text style={styles.gradeToggleText}>
            {gradeLevel === 'KG' ? 'KG Mode 🎨' : 'Grades 1-4 🚀'}
          </Text>
        </Pressable>

        {/* Parents Screen Link */}
        <Pressable style={styles.parentsIconBtn} onPress={() => router.push('/parent')}>
          <Ionicons name="people" size={18} color="#4B5563" />
        </Pressable>
      </View>

      {/* Hero Welcome Card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          {avatarImageUrl ? (
            <Image source={{ uri: avatarImageUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="happy" size={44} color="#F59E0B" />
          )}
          {equippedConfig.equippedHat && (
            <View style={styles.hatBadge}>
              <Ionicons name={equippedConfig.equippedHat as any} size={16} color="#FFF" />
            </View>
          )}
        </View>

        <View style={styles.heroTextCol}>
          <Text style={styles.welcomeTitle}>Selam, {avatarName ?? 'Superstar'}! 👋</Text>
          <Text style={styles.welcomeSub}>Ready to explore today’s learning path?</Text>

          <View style={styles.heroActionsRow}>
            <Pressable
              style={styles.dressingRoomBtn}
              onPress={() => setCustomizerVisible(true)}
            >
              <Ionicons name="shirt" size={14} color="#FFFFFF" />
              <Text style={styles.dressingRoomText}>Dressing Room</Text>
            </Pressable>

            <Pressable style={styles.aiTalkBtn} onPress={() => router.push('/tutor')}>
              <Ionicons name="chatbubbles" size={14} color="#FFFFFF" />
              <Text style={styles.aiTalkText}>AI Tutor</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Content Area (Age Adaptive) */}
      <View style={styles.mainContent}>
        <AgeAdaptiveWrapper
          gradeLevel={gradeLevel}
          onSelectAction={(route) => router.push(route as never)}
        >
          <DuolingoRoadmapPath
            chapters={MOCK_CHAPTERS}
            activeNodeId="node-2"
            onSelectNode={handleSelectNode}
          />
        </AgeAdaptiveWrapper>
      </View>

      {/* Avatar Customization Modal */}
      <AvatarCustomizerModal
        visible={customizerVisible}
        onClose={() => setCustomizerVisible(false)}
        stars={stars}
        items={MOCK_AVATAR_ITEMS}
        equippedConfig={equippedConfig}
        onEquipItem={handleEquipItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    elevation: 3,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1F2937',
  },
  gradeToggleBtn: {
    backgroundColor: AppColors.softPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.purple,
  },
  gradeToggleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: AppColors.purple,
  },
  parentsIconBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  hatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 3,
  },
  heroTextCol: {
    flex: 1,
  },
  welcomeTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1F2937',
  },
  welcomeSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dressingRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dressingRoomText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  aiTalkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  aiTalkText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
  },
});
