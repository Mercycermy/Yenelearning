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

const LANGUAGES = [
  { id: 'amharic', name: 'Amharic', native: 'አማርኛ' },
  { id: 'geez', name: "Ge'ez", native: 'ግዕዝ' },
  { id: 'english', name: 'English', native: 'English' },
];

const ACTIVITIES = [
  { title: 'Learn Words', subtitle: 'Build your word power', icon: 'text' as const, color: AppColors.blue, bg: AppColors.softBlue, route: '/words', badge: '5 min' },
  { title: 'Talk with Tutor', subtitle: 'Say it out loud', icon: 'mic' as const, color: AppColors.purple, bg: AppColors.softPurple, route: '/tutor', badge: 'Live' },
  { title: 'Story Time', subtitle: 'Read a little adventure', icon: 'book' as const, color: AppColors.green, bg: AppColors.softGreen, route: '/stories', badge: '3 new' },
  { title: 'Play Games', subtitle: 'Win stars while learning', icon: 'game-controller' as const, color: AppColors.yellow, bg: AppColors.softYellow, route: '/games', badge: '+20 ★' },
  { title: 'Wonder Lab', subtitle: 'Discover amazing facts', icon: 'bulb' as const, color: AppColors.orange, bg: AppColors.softOrange, route: '/knowledge', badge: 'Explore' },
];

const QUIZ = [
  {
    question: 'Which animal is the tallest in the world?',
    options: ['Elephant', 'Giraffe', 'Lion'],
    answer: 'Giraffe',
    explanation: 'A giraffe can grow taller than 5 meters.',
  },
  {
    question: 'What do plants need to make their food?',
    options: ['Sunlight', 'Moonlight', 'Sand'],
    answer: 'Sunlight',
    explanation: 'Plants use sunlight, water, and air in photosynthesis.',
  },
  {
    question: 'Which word means the opposite of “fast”?',
    options: ['Quick', 'Slow', 'Bright'],
    answer: 'Slow',
    explanation: 'Slow is an antonym, or opposite word, for fast.',
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columns = width >= 760 ? 3 : 2;
  const cardWidth = (Math.min(width, 880) - 36 - (columns - 1) * 14) / columns;

  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [language, setLanguage] = useState('amharic');
  const [learningFocus, setLearningFocus] = useState('Reading');
  const [completed, setCompleted] = useState<Set<number>>(new Set([0]));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const [image, name, lang, focus] = await Promise.all([
      userPrefs.getAvatarImage(),
      userPrefs.getAvatarName(),
      userPrefs.getLanguage(),
      userPrefs.getLearningFocus(),
    ]);
    setAvatarImageUrl(image);
    setAvatarName(name);
    setLanguage(lang);
    setLearningFocus(focus);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  async function updateLanguage(value: string) {
    await userPrefs.saveLanguage(value);
    setLanguage(value);
    const label = LANGUAGES.find((item) => item.id === value)?.name ?? value;
    Alert.alert('Language', `${label} selected. Let’s learn!`);
  }

  const focusRoute =
    learningFocus === 'Speaking' ? '/tutor' : learningFocus === 'Vocabulary' ? '/words' : '/stories';

  const missions = [
    { label: 'Learn 5 new words', route: '/words', icon: 'text' as const },
    { label: 'Read one short story', route: '/stories', icon: 'book' as const },
    { label: 'Discover a fun fact', route: '/knowledge', icon: 'bulb' as const },
  ];

  const finished = questionIndex === QUIZ.length;
  const question = finished ? null : QUIZ[questionIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <Text style={styles.brand}>Yene Teacher</Text>
        </View>
        <Pressable style={styles.parentsBtn} onPress={() => router.push('/parent')}>
          <Ionicons name="people" size={16} color={AppColors.navy} />
          <Text style={styles.parentsText}>Parents</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          {avatarImageUrl ? (
            <Image source={{ uri: avatarImageUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="happy" size={42} color={AppColors.orange} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Hi, {avatarName ?? 'Superstar'}! 👋</Text>
          <Text style={styles.heroSub}>Your tutor saved a fun lesson for you.</Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Ionicons name="flame" size={14} color={AppColors.softYellow} />
              <Text style={styles.pillText}>3 day streak</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="star" size={14} color={AppColors.softYellow} />
              <Text style={styles.pillText}>120 stars</Text>
            </View>
            <Pressable style={styles.continueBtn} onPress={() => router.push('/words')}>
              <Ionicons name="play" size={14} color={AppColors.navy} />
              <Text style={styles.continueText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        style={[
          styles.focusCard,
          {
            backgroundColor:
              learningFocus === 'Speaking'
                ? AppColors.softPurple
                : learningFocus === 'Vocabulary'
                  ? AppColors.softBlue
                  : AppColors.softGreen,
          },
        ]}
        onPress={() => router.push(focusRoute as never)}
      >
        <Text style={styles.focusTitle}>Family focus · {learningFocus}</Text>
        <Text style={styles.focusSub}>
          {learningFocus === 'Speaking'
            ? 'Practice speaking with your tutor'
            : learningFocus === 'Vocabulary'
              ? 'Grow your word power today'
              : 'Read a story and tell someone about it'}
        </Text>
      </Pressable>

      <View style={styles.missionCard}>
        <Text style={styles.sectionTitle}>Today’s learning path</Text>
        <Text style={styles.missionProgress}>
          {completed.size} of {missions.length}
        </Text>
        {missions.map((mission, index) => {
          const done = completed.has(index);
          return (
            <Pressable
              key={mission.label}
              style={styles.missionRow}
              onPress={() => {
                setCompleted((prev) => new Set(prev).add(index));
                router.push(mission.route as never);
              }}
            >
              <Ionicons
                name={done ? 'checkmark-circle' : mission.icon}
                size={22}
                color={done ? AppColors.green : AppColors.blue}
              />
              <Text style={[styles.missionLabel, done && styles.missionDone]}>
                {mission.label}
              </Text>
              <Ionicons name="play-circle" size={22} color={AppColors.purple} />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Pick your language</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        {LANGUAGES.map((item) => {
          const selected = language === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => updateLanguage(item.id)}
              style={[
                styles.langChip,
                {
                  backgroundColor: selected ? AppColors.mint : AppColors.white,
                  borderColor: selected ? AppColors.teal : AppColors.gray200,
                },
              ]}
            >
              <Text style={styles.langText}>
                {item.name} · {item.native}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <Text style={styles.sectionTitle}>Brain boost challenge</Text>
          <Text style={styles.score}>★ {score}</Text>
        </View>
        {finished ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.quizResult}>
              You scored {score} of {QUIZ.length}!
            </Text>
            <Pressable
              onPress={() => {
                setQuestionIndex(0);
                setScore(0);
                setAnswer(null);
              }}
            >
              <Text style={styles.link}>Play again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.quizQ}>{question!.question}</Text>
            <View style={styles.optionWrap}>
              {question!.options.map((option) => {
                const selected = answer === option;
                const correct = answer != null && option === question!.answer;
                return (
                  <Pressable
                    key={option}
                    disabled={answer != null}
                    onPress={() => {
                      setAnswer(option);
                      if (option === question!.answer) setScore((s) => s + 1);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: correct
                          ? AppColors.green
                          : selected
                            ? AppColors.error
                            : AppColors.white,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected || correct ? '#fff' : AppColors.navy,
                        fontFamily: 'Poppins_600SemiBold',
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {answer ? (
              <View style={styles.explainRow}>
                <Text style={styles.explain}>
                  {answer === question!.answer ? 'Correct! ' : 'Nice try! '}
                  {question!.explanation}
                </Text>
                <Pressable onPress={() => { setQuestionIndex((i) => i + 1); setAnswer(null); }}>
                  <Ionicons name="arrow-forward-circle" size={28} color={AppColors.orange} />
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Choose an adventure</Text>
      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => (
          <Pressable
            key={activity.title}
            onPress={() => router.push(activity.route as never)}
            style={[styles.activity, { backgroundColor: activity.bg, width: cardWidth }]}
          >
            <View style={styles.activityTop}>
              <View style={styles.activityIcon}>
                <Ionicons name={activity.icon} size={26} color={activity.color} />
              </View>
              <Text style={[styles.badge, { color: activity.color }]}>{activity.badge}</Text>
            </View>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activitySub}>{activity.subtitle}</Text>
            <Text style={[styles.letsGo, { color: activity.color }]}>Let’s go →</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.dashboardBg },
  content: { padding: 18, paddingBottom: 40 },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: AppColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  parentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.softPurple,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  parentsText: { fontFamily: 'Poppins_600SemiBold' },
  hero: {
    backgroundColor: '#6758E8',
    borderRadius: 30,
    padding: 22,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  heroTitle: { color: '#fff', fontFamily: 'Poppins_800ExtraBold', fontSize: 22 },
  heroSub: { color: '#fff', marginTop: 4, fontFamily: 'Poppins_400Regular' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 12 },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  continueText: { fontFamily: 'Poppins_700Bold', color: AppColors.navy, fontSize: 12 },
  focusCard: { borderRadius: 24, padding: 16, marginBottom: 16 },
  focusTitle: { fontFamily: 'Poppins_800ExtraBold', color: AppColors.navy },
  focusSub: { fontFamily: 'Poppins_600SemiBold', marginTop: 4 },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  sectionTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18 },
  missionProgress: { color: AppColors.purple, fontFamily: 'Poppins_800ExtraBold', marginBottom: 8 },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  missionLabel: { flex: 1, fontFamily: 'Poppins_700Bold' },
  missionDone: { textDecorationLine: 'line-through', color: AppColors.gray500 },
  langChip: {
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  langText: { fontFamily: 'Poppins_600SemiBold' },
  quizCard: {
    backgroundColor: AppColors.softOrange,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
  },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  score: { fontFamily: 'Poppins_800ExtraBold' },
  quizQ: { fontFamily: 'Poppins_700Bold', marginBottom: 12 },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  explainRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  explain: { flex: 1, fontFamily: 'Poppins_700Bold', color: AppColors.navy },
  quizResult: { fontFamily: 'Poppins_800ExtraBold', fontSize: 20, marginVertical: 8 },
  link: { color: AppColors.blue, fontFamily: 'Poppins_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  activity: { borderRadius: 26, padding: 16, minHeight: 160 },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  activityIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { fontFamily: 'Poppins_800ExtraBold', fontSize: 11 },
  activityTitle: { fontFamily: 'Poppins_800ExtraBold', fontSize: 16 },
  activitySub: { fontFamily: 'Poppins_400Regular', color: AppColors.gray500, fontSize: 12, marginTop: 4 },
  letsGo: { marginTop: 10, fontFamily: 'Poppins_800ExtraBold', fontSize: 12 },
});
