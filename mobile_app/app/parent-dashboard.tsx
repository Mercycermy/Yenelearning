import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { userPrefs } from '../src/data/userPrefs';

const FOCUS_OPTIONS = ['Reading', 'Vocabulary', 'Speaking'] as const;
const TIME_OPTIONS = [15, 20, 30, 45, 60];

export default function ParentDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  const [parentName, setParentName] = useState('Parent');
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [contentFilter, setContentFilter] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [learningFocus, setLearningFocus] = useState('Reading');
  const [timeModal, setTimeModal] = useState(false);

  useEffect(() => {
    (async () => {
      const [rawUser, focus] = await Promise.all([
        userPrefs.getUserJson(),
        userPrefs.getLearningFocus(),
      ]);
      setLearningFocus(focus);
      if (!rawUser) return;
      try {
        const user = JSON.parse(rawUser) as { firstName?: string };
        if (user.firstName?.trim()) setParentName(user.firstName.trim());
      } catch {
        // ignore
      }
    })();
  }, []);

  function message(text: string) {
    Alert.alert('Parent space', text);
  }

  async function logout() {
    Alert.alert(
      'Sign out of Parent Space?',
      'You’ll return to kid mode. Learning progress and preferences stay on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await userPrefs.clearAuth();
            router.replace('/dashboard');
          },
        },
      ],
    );
  }

  async function changeFocus(focus: string) {
    setLearningFocus(focus);
    await userPrefs.saveLearningFocus(focus);
    message(`${focus} is now this week’s learning focus.`);
  }

  function startActivity() {
    const route =
      learningFocus === 'Reading'
        ? '/stories'
        : learningFocus === 'Speaking'
          ? '/tutor'
          : '/words';
    router.replace(route as never);
  }

  const controls = (
    <View>
      <Text style={styles.section}>Healthy learning</Text>
      <Text style={styles.sectionSub}>Simple controls for a balanced routine</Text>

      <SettingTile
        icon="timer"
        color={AppColors.blue}
        title="Daily time goal"
        subtitle={`${dailyMinutes} minutes`}
        onPress={() => setTimeModal(true)}
      />
      <SettingTile
        icon="shield"
        color={AppColors.green}
        title="Kid-safe content"
        subtitle={contentFilter ? 'Extra filtering is on' : 'Standard filtering'}
        trailing={
          <Switch
            value={contentFilter}
            onValueChange={(value) => {
              setContentFilter(value);
              message(
                value
                  ? 'Extra content filtering enabled.'
                  : 'Standard content filtering enabled.',
              );
            }}
          />
        }
      />
      <SettingTile
        icon="notifications"
        color={AppColors.orange}
        title="Learning reminders"
        subtitle={learningReminders ? 'Weekdays at 4:00 PM' : 'Reminders are off'}
        trailing={
          <Switch value={learningReminders} onValueChange={setLearningReminders} />
        }
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.appBar}>
        <Text style={styles.appTitle}>Parent space</Text>
        <View style={styles.appActions}>
          <Pressable onPress={() => message('You’re all caught up!')}>
            <Ionicons name="notifications-outline" size={24} color={AppColors.navy} />
          </Pressable>
          <Pressable onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={AppColors.navy} />
          </Pressable>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="people" size={28} color={AppColors.mint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Good afternoon, {parentName}</Text>
          <Text style={styles.heroSub}>Abebe completed 2 activities today.</Text>
        </View>
        <View style={styles.onTrack}>
          <Ionicons name="checkmark-circle" size={16} color={AppColors.mint} />
          <Text style={styles.onTrackText}>On track</Text>
        </View>
      </View>

      <View style={styles.insight}>
        <Ionicons name="bulb" size={22} color={AppColors.yellow} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.insightTitle}>A little win worth celebrating</Text>
          <Text style={styles.insightSub}>
            Pronunciation accuracy improved by 8% this week.
          </Text>
        </View>
      </View>

      <View style={styles.planCard}>
        <Text style={styles.section}>This week’s learning plan</Text>
        <Text style={styles.sectionSub}>
          Choose one focus and launch a recommended activity to learn together.
        </Text>
        <View style={styles.focusRow}>
          {FOCUS_OPTIONS.map((focus) => (
            <Pressable
              key={focus}
              onPress={() => changeFocus(focus)}
              style={[
                styles.focusChip,
                learningFocus === focus && { backgroundColor: AppColors.softPurple },
              ]}
            >
              <Text style={styles.focusText}>{focus}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.learnBtn} onPress={startActivity}>
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={styles.learnText}>Learn together</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Children</Text>
      <Text style={styles.sectionSub}>Select a profile to see their learning journey</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        <View style={styles.childCard}>
          <Ionicons name="happy" size={34} color={AppColors.blue} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.childName}>Abebe</Text>
            <Text style={styles.childAge}>6 years old</Text>
            <Text style={styles.streak}>🔥 3 day streak</Text>
          </View>
        </View>
        <Pressable
          style={styles.addChild}
          onPress={() => message('Child profile setup is coming next.')}
        >
          <Ionicons name="add-circle" size={28} color={AppColors.purple} />
          <Text style={styles.addText}>Add child</Text>
        </Pressable>
      </ScrollView>

      {wide ? (
        <View style={styles.wideRow}>
          <View style={{ flex: 6 }}>
            <ProgressCard />
          </View>
          <View style={{ flex: 5 }}>{controls}</View>
        </View>
      ) : (
        <>
          <Text style={styles.section}>Weekly progress</Text>
          <Text style={styles.sectionSub}>A quick look at Abebe’s learning</Text>
          <ProgressCard />
          {controls}
        </>
      )}

      <Modal visible={timeModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.section}>Daily learning time</Text>
            <Text style={styles.sectionSub}>
              Choose a comfortable daily goal. You can change it any time.
            </Text>
            <View style={styles.focusRow}>
              {TIME_OPTIONS.map((minutes) => (
                <Pressable
                  key={minutes}
                  style={[
                    styles.focusChip,
                    dailyMinutes === minutes && { backgroundColor: AppColors.softBlue },
                  ]}
                  onPress={() => {
                    setDailyMinutes(minutes);
                    setTimeModal(false);
                    message(`Daily goal updated to ${minutes} minutes.`);
                  }}
                >
                  <Text style={styles.focusText}>{minutes} min</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setTimeModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function ProgressCard() {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.section}>This week</Text>
        <Text style={styles.trend}>↗ +12%</Text>
      </View>
      <View style={styles.metrics}>
        <Metric value="45" label="Words" color={AppColors.blue} />
        <Metric value="82%" label="Accuracy" color={AppColors.green} />
        <Metric value="1.5h" label="Time" color={AppColors.orange} />
      </View>
      <Text style={styles.goalLabel}>Weekly goal · 75%</Text>
      <View style={styles.goalTrack}>
        <View style={[styles.goalFill, { width: '75%' }]} />
      </View>
    </View>
  );
}

function Metric({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SettingTile({
  icon,
  color,
  title,
  subtitle,
  onPress,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <Pressable style={styles.setting} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSub}>{subtitle}</Text>
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={20} color={AppColors.gray500} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.parentBg },
  content: { padding: 18, paddingBottom: 40 },
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  appActions: { flexDirection: 'row', gap: 16 },
  hero: {
    marginTop: 12,
    backgroundColor: '#17233D',
    borderRadius: 28,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: '#fff', fontFamily: 'Poppins_800ExtraBold', fontSize: 20 },
  heroSub: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  onTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(126,234,210,0.16)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  onTrackText: { color: AppColors.mint, fontFamily: 'Poppins_800ExtraBold', fontSize: 12 },
  insight: {
    marginTop: 16,
    backgroundColor: AppColors.softYellow,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightTitle: { fontFamily: 'Poppins_800ExtraBold' },
  insightSub: { color: AppColors.gray500, fontSize: 13, marginTop: 3 },
  planCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.gray200,
  },
  section: { fontFamily: 'Poppins_800ExtraBold', fontSize: 18, marginTop: 18 },
  sectionSub: { color: AppColors.gray500, fontSize: 12, marginTop: 2, marginBottom: 8 },
  focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  focusChip: {
    backgroundColor: AppColors.gray100,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  focusText: { fontFamily: 'Poppins_600SemiBold' },
  learnBtn: {
    marginTop: 16,
    backgroundColor: AppColors.purple,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  learnText: { color: '#fff', fontFamily: 'Poppins_700Bold' },
  childCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: AppColors.blue,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  childName: { fontFamily: 'Poppins_800ExtraBold', fontSize: 16 },
  childAge: { color: AppColors.gray500, fontSize: 12 },
  streak: { fontFamily: 'Poppins_700Bold', fontSize: 11, marginTop: 4 },
  addChild: {
    width: 130,
    backgroundColor: AppColors.softPurple,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: AppColors.purple, fontFamily: 'Poppins_800ExtraBold', marginTop: 6 },
  wideRow: { flexDirection: 'row', gap: 18, marginTop: 8 },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  trend: { color: AppColors.green, fontFamily: 'Poppins_800ExtraBold' },
  metrics: { flexDirection: 'row', marginTop: 18 },
  metricValue: { fontFamily: 'Poppins_800ExtraBold', fontSize: 22 },
  metricLabel: { color: AppColors.gray500, fontSize: 12 },
  goalLabel: { marginTop: 18, fontFamily: 'Poppins_700Bold' },
  goalTrack: {
    marginTop: 8,
    height: 10,
    borderRadius: 8,
    backgroundColor: AppColors.softGreen,
    overflow: 'hidden',
  },
  goalFill: { height: '100%', backgroundColor: AppColors.green },
  setting: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: { fontFamily: 'Poppins_800ExtraBold' },
  settingSub: { color: AppColors.gray500, fontSize: 12, marginTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 32,
  },
  cancel: {
    textAlign: 'center',
    marginTop: 18,
    color: AppColors.gray500,
    fontFamily: 'Poppins_600SemiBold',
  },
});
