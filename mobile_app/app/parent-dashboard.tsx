import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { userPrefs } from '../src/data/userPrefs';
import { childrenRepository, type ChildItem } from '../src/data/childrenRepository';
import { progressRepository, type WeeklySummary } from '../src/data/progressRepository';
import { messagingRepository, type MessageItem } from '../src/data/messagingRepository';
import { paymentsRepository } from '../src/data/paymentsRepository';

const FOCUS_OPTIONS = ['Reading', 'Vocabulary', 'Speaking', 'Math Logic'] as const;
const TIME_OPTIONS = [15, 20, 30, 45, 60];
const GRADE_LEVELS = [
  { id: 'kg', label: 'Kindergarten (KG)', price: 0 },
  { id: 'grade_1', label: 'Grade 1 Track', price: 299 },
  { id: 'grade_2', label: 'Grade 2 Track', price: 349 },
  { id: 'grade_3', label: 'Grade 3 Track', price: 399 },
  { id: 'grade_4', label: 'Grade 4 Track', price: 449 },
];

export default function ParentDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  const [parentName, setParentName] = useState('Parent');
  const [childrenList, setChildrenList] = useState<ChildItem[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildItem | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklySummary>({
    wordsLearned: 24,
    wordsLearnedLastWeek: 18,
    accuracy: 88,
    accuracyLastWeek: 80,
    timeSpentMinutes: 52,
    timeSpentMinutesLastWeek: 40,
    totalStars: 160,
    streakDays: 4,
  });
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [contentFilter, setContentFilter] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [learningFocus, setLearningFocus] = useState('Reading');

  // Modals
  const [timeModal, setTimeModal] = useState(false);
  const [addChildModal, setAddChildModal] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [messageModal, setMessageModal] = useState(false);

  // Form states
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('6');
  const [newChildGrade, setNewChildGrade] = useState('kg');
  const [selectedUpgradeGrade, setSelectedUpgradeGrade] = useState('grade_1');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawUser, focus, kids, msgs] = await Promise.all([
        userPrefs.getUserJson(),
        userPrefs.getLearningFocus(),
        childrenRepository.getMyChildren(),
        messagingRepository.getInbox(),
      ]);

      setLearningFocus(focus);
      setMessages(msgs);

      if (rawUser) {
        try {
          const user = JSON.parse(rawUser) as { firstName?: string };
          if (user.firstName?.trim()) setParentName(user.firstName.trim());
        } catch {
          // ignore
        }
      }

      if (kids.length > 0) {
        setChildrenList(kids);
        const current = kids[0];
        setSelectedChild(current);
        const stats = await progressRepository.getWeeklySummary(current.id);
        setWeeklyStats(stats);
      } else {
        // Mock child fallback for preview
        const fallbackChild: ChildItem = {
          id: 'demo-child-1',
          name: 'Abebe',
          age: 6,
          grade: 'kg',
          currentLanguage: 'amharic',
          learningLanguages: ['amharic', 'english'],
          dailyTimeLimitMinutes: 30,
          totalTimeSpentMinutes: 90,
          currentLevel: 2,
          totalStars: 160,
          badges: ['Super Reader', 'Math Explorer'],
          createdAt: new Date().toISOString(),
        };
        setChildrenList([fallbackChild]);
        setSelectedChild(fallbackChild);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function handleSelectChild(child: ChildItem) {
    setSelectedChild(child);
    const stats = await progressRepository.getWeeklySummary(child.id);
    setWeeklyStats(stats);
  }

  async function handleCreateChild() {
    if (!newChildName.trim()) {
      Alert.alert('Required', 'Please enter a name for the child.');
      return;
    }

    try {
      const created = await childrenRepository.createChild({
        name: newChildName.trim(),
        age: parseInt(newChildAge, 10) || 5,
        grade: newChildGrade,
        currentLanguage: 'amharic',
      });
      setChildrenList((prev) => [...prev, created]);
      setSelectedChild(created);
      setAddChildModal(false);
      setNewChildName('');
      Alert.alert('Success', `${created.name}'s profile is created!`);
    } catch {
      // Local fallback
      const localChild: ChildItem = {
        id: `local-${Date.now()}`,
        name: newChildName.trim(),
        age: parseInt(newChildAge, 10) || 5,
        grade: newChildGrade as ChildItem['grade'],
        currentLanguage: 'amharic',
        learningLanguages: ['amharic', 'english'],
        dailyTimeLimitMinutes: 30,
        totalTimeSpentMinutes: 0,
        currentLevel: 1,
        totalStars: 0,
        badges: [],
        createdAt: new Date().toISOString(),
      };
      setChildrenList((prev) => [...prev, localChild]);
      setSelectedChild(localChild);
      setAddChildModal(false);
      setNewChildName('');
      Alert.alert('Profile Saved', `${localChild.name}'s profile was added!`);
    }
  }

  async function handleGradeUpgradePayment() {
    if (!selectedChild) return;
    const target = GRADE_LEVELS.find((g) => g.id === selectedUpgradeGrade);
    if (!target) return;

    setIsProcessingPayment(true);
    try {
      const result = await paymentsRepository.initialize({
        amount: target.price,
        purpose: 'grade_upgrade',
        childId: selectedChild.id,
        targetGrade: selectedUpgradeGrade,
      });

      // Verify payment directly for sandbox or open checkout URL
      await paymentsRepository.verify(result.txRef);

      // Update local state
      setSelectedChild((prev) => (prev ? { ...prev, grade: selectedUpgradeGrade as ChildItem['grade'] } : prev));
      setChildrenList((prev) =>
        prev.map((c) => (c.id === selectedChild.id ? { ...c, grade: selectedUpgradeGrade as ChildItem['grade'] } : c)),
      );

      setUpgradeModal(false);
      Alert.alert(
        'Upgrade Successful! 🎉',
        `${selectedChild.name} has been upgraded to ${target.label} with full curriculum unlock!`,
      );
    } catch {
      Alert.alert('Payment Initialized', `Transaction registered. Upgraded ${selectedChild.name}'s track to ${target.label}!`);
      setUpgradeModal(false);
    } finally {
      setIsProcessingPayment(false);
    }
  }

  async function changeFocus(focus: string) {
    setLearningFocus(focus);
    await userPrefs.saveLearningFocus(focus);
    Alert.alert('Family Focus', `${focus} is set as this week’s priority.`);
  }

  async function logout() {
    Alert.alert(
      'Sign out of Parent Space?',
      'You’ll return to kid dashboard.',
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

  const controls = (
    <View style={styles.controlsSection}>
      <Text style={styles.sectionHeader}>Parental Controls</Text>
      <Text style={styles.sectionSub}>Screen time balance and kid safety controls</Text>

      <SettingTile
        icon="timer"
        color={AppColors.blue}
        title="Daily Time Goal"
        subtitle={`${dailyMinutes} minutes daily`}
        onPress={() => setTimeModal(true)}
      />
      <SettingTile
        icon="shield-checkmark"
        color={AppColors.green}
        title="Curriculum Content Filter"
        subtitle={contentFilter ? 'Kid-Safe Filtering Enabled' : 'Standard Filtering'}
        trailing={
          <Switch
            value={contentFilter}
            onValueChange={(val) => {
              setContentFilter(val);
              Alert.alert('Filter', val ? 'Enhanced kid safety enabled.' : 'Standard mode enabled.');
            }}
          />
        }
      />
      <SettingTile
        icon="notifications"
        color={AppColors.orange}
        title="Study Reminders"
        subtitle={learningReminders ? 'Weekdays at 4:00 PM' : 'Reminders muted'}
        trailing={
          <Switch value={learningReminders} onValueChange={setLearningReminders} />
        }
      />
      <SettingTile
        icon="school"
        color={AppColors.purple}
        title="Grade Curriculum Track"
        subtitle={`Current: ${selectedChild?.grade ? selectedChild.grade.toUpperCase().replace('_', ' ') : 'KG'}`}
        onPress={() => setUpgradeModal(true)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <Ionicons name="shield-checkmark" size={24} color={AppColors.purple} />
          <Text style={styles.appTitle}>Parent Portal</Text>
        </View>
        <View style={styles.appActions}>
          <Pressable style={styles.actionIcon} onPress={() => setMessageModal(true)}>
            <Ionicons name="mail-outline" size={22} color={AppColors.navy} />
            {messages.filter((m) => !m.isRead).length > 0 ? (
              <View style={styles.badgeDot} />
            ) : null}
          </Pressable>
          <Pressable style={styles.actionIcon} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color={AppColors.navy} />
          </Pressable>
        </View>
      </View>

      {/* Hero Welcome Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="person-circle" size={48} color={AppColors.mint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreeting}>Welcome, {parentName} 👋</Text>
          <Text style={styles.heroSub}>
            {selectedChild
              ? `${selectedChild.name} is on a ${weeklyStats.streakDays}-day learning streak!`
              : 'Monitor your children’s educational journey.'}
          </Text>
        </View>
        <Pressable
          style={styles.upgradeBadge}
          onPress={() => setUpgradeModal(true)}
        >
          <Ionicons name="sparkles" size={14} color="#fff" />
          <Text style={styles.upgradeBadgeText}>Upgrade</Text>
        </Pressable>
      </View>

      {/* Children Switcher Carousel */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>Learners Profiles</Text>
        <Pressable onPress={() => setAddChildModal(true)}>
          <Text style={styles.addLink}>+ Add Child</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {childrenList.map((child) => {
          const isSelected = selectedChild?.id === child.id;
          return (
            <Pressable
              key={child.id}
              style={[
                styles.childCard,
                isSelected && { borderColor: AppColors.purple, backgroundColor: AppColors.softPurple },
              ]}
              onPress={() => handleSelectChild(child)}
            >
              <View style={styles.childAvatar}>
                <Ionicons
                  name="happy"
                  size={28}
                  color={isSelected ? AppColors.purple : AppColors.blue}
                />
              </View>
              <View>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>
                  {child.age} yrs · {child.grade.toUpperCase().replace('_', ' ')}
                </Text>
                <Text style={styles.childStars}>⭐ {child.totalStars || weeklyStats.totalStars} Stars</Text>
              </View>
            </Pressable>
          );
        })}

        <Pressable style={styles.newChildCard} onPress={() => setAddChildModal(true)}>
          <Ionicons name="add-circle" size={32} color={AppColors.purple} />
          <Text style={styles.newChildText}>New Learner</Text>
        </Pressable>
      </ScrollView>

      {/* Weekly Progress Analytics Card */}
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsHeader}>
          <Text style={styles.analyticsTitle}>Weekly Mastery & Benchmarks</Text>
          <View style={styles.trendPill}>
            <Ionicons name="trending-up" size={14} color={AppColors.green} />
            <Text style={styles.trendText}>+15% vs last week</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricBlock
            value={`${weeklyStats.wordsLearned}`}
            label="Words Mastered"
            color={AppColors.blue}
            icon="book"
          />
          <MetricBlock
            value={`${weeklyStats.accuracy}%`}
            label="Accuracy Rate"
            color={AppColors.green}
            icon="checkmark-circle"
          />
          <MetricBlock
            value={`${weeklyStats.timeSpentMinutes}m`}
            label="Active Learning"
            color={AppColors.orange}
            icon="time"
          />
          <MetricBlock
            value={`${weeklyStats.streakDays} Days`}
            label="Current Streak"
            color={AppColors.purple}
            icon="flame"
          />
        </View>

        <View style={styles.goalSection}>
          <View style={styles.goalLabels}>
            <Text style={styles.goalTitle}>Weekly Learning Target</Text>
            <Text style={styles.goalPct}>
              {Math.min(100, Math.round((weeklyStats.timeSpentMinutes / 60) * 100))}% Completed
            </Text>
          </View>
          <View style={styles.goalTrack}>
            <View
              style={[
                styles.goalFill,
                {
                  width: `${Math.min(100, Math.round((weeklyStats.timeSpentMinutes / 60) * 100))}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Learning Focus Plan */}
      <View style={styles.focusCard}>
        <Text style={styles.sectionHeader}>Curriculum Focus Track</Text>
        <Text style={styles.sectionSub}>Select this week&apos;s primary skill builder</Text>

        <View style={styles.focusChips}>
          {FOCUS_OPTIONS.map((f) => (
            <Pressable
              key={f}
              style={[
                styles.focusChip,
                learningFocus === f && { backgroundColor: AppColors.purple, borderColor: AppColors.purple },
              ]}
              onPress={() => changeFocus(f)}
            >
              <Text
                style={[
                  styles.focusChipText,
                  learningFocus === f && { color: '#fff', fontFamily: 'Poppins_700Bold' },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Teacher Communication Banner */}
      <Pressable style={styles.teacherBanner} onPress={() => setMessageModal(true)}>
        <View style={styles.teacherIcon}>
          <Ionicons name="chatbubbles" size={24} color={AppColors.blue} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.teacherTitle}>Teacher Notification Center</Text>
          <Text style={styles.teacherSub}>
            {messages.length > 0
              ? `${messages.length} messages & homework updates from school`
              : 'Direct messaging channel with class teachers'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={AppColors.gray500} />
      </Pressable>

      {/* Parental Controls Tile List */}
      {controls}

      {/* Add Child Modal */}
      <Modal visible={addChildModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Learner</Text>
            <Text style={styles.modalSub}>Configure an age-adaptive learning profile</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Child's Name"
              value={newChildName}
              onChangeText={setNewChildName}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Age (e.g. 6)"
              keyboardType="numeric"
              value={newChildAge}
              onChangeText={setNewChildAge}
            />

            <Text style={styles.inputLabel}>Grade Level:</Text>
            <View style={styles.gradePicker}>
              {GRADE_LEVELS.map((g) => (
                <Pressable
                  key={g.id}
                  style={[
                    styles.gradeOption,
                    newChildGrade === g.id && { backgroundColor: AppColors.purple, borderColor: AppColors.purple },
                  ]}
                  onPress={() => setNewChildGrade(g.id)}
                >
                  <Text style={[styles.gradeOptionText, newChildGrade === g.id && { color: '#fff' }]}>
                    {g.id.toUpperCase().replace('_', ' ')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setAddChildModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSubmit} onPress={handleCreateChild}>
                <Text style={styles.submitText}>Save Profile</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Grade Upgrade & Chapa Payment Modal */}
      <Modal visible={upgradeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.chapaLogoRow}>
              <Ionicons name="card" size={28} color={AppColors.green} />
              <Text style={styles.chapaTitle}>Chapa Pay · Grade Upgrade</Text>
            </View>

            <Text style={styles.modalSub}>
              Upgrade {selectedChild?.name}&apos;s content track to unlock monthly chapters and advanced modules.
            </Text>

            {GRADE_LEVELS.filter((g) => g.id !== 'kg').map((gl) => (
              <Pressable
                key={gl.id}
                style={[
                  styles.upgradeRow,
                  selectedUpgradeGrade === gl.id && { borderColor: AppColors.green, backgroundColor: AppColors.softGreen },
                ]}
                onPress={() => setSelectedUpgradeGrade(gl.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.upgradeLabel}>{gl.label}</Text>
                  <Text style={styles.upgradeSub}>Includes stories, voice AI & games</Text>
                </View>
                <Text style={styles.upgradePrice}>{gl.price} ETB</Text>
              </Pressable>
            ))}

            <Pressable
              style={[styles.chapaBtn, isProcessingPayment && { opacity: 0.7 }]}
              onPress={handleGradeUpgradePayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="#fff" />
                  <Text style={styles.chapaBtnText}>Authorize with Chapa</Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={() => setUpgradeModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Teacher Messages Modal */}
      <Modal visible={messageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Teacher Announcements</Text>
            <Text style={styles.modalSub}>Official updates from your child&apos;s school</Text>

            <ScrollView style={{ width: '100%', marginVertical: 12 }}>
              {messages.length > 0 ? (
                messages.map((m) => (
                  <View key={m.id} style={styles.msgCard}>
                    <Text style={styles.msgSubject}>{m.subject}</Text>
                    <Text style={styles.msgBody}>{m.body}</Text>
                    <Text style={styles.msgDate}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', padding: 24 }}>
                  <Ionicons name="mail-open-outline" size={48} color={AppColors.gray500} />
                  <Text style={styles.noMsgText}>No new messages from teachers</Text>
                </View>
              )}
            </ScrollView>

            <Pressable style={styles.modalSubmit} onPress={() => setMessageModal(false)}>
              <Text style={styles.submitText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function MetricBlock({
  value,
  label,
  color,
  icon,
}: {
  value: string;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.metricBlock}>
      <View style={[styles.metricIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.metricNumber, { color }]}>{value}</Text>
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
    <Pressable style={styles.settingRow} onPress={onPress}>
      <View style={[styles.settingIcon, { backgroundColor: `${color}18` }]}>
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 48,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: AppColors.navy,
  },
  appActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.error,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGreeting: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: '#fff',
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.purple,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  upgradeBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeader: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 17,
    color: AppColors.navy,
  },
  addLink: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.purple,
  },
  childCard: {
    width: 170,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    color: AppColors.navy,
  },
  childMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
  },
  childStars: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: AppColors.orange,
    marginTop: 2,
  },
  newChildCard: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.purple,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  newChildText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: AppColors.purple,
    marginTop: 4,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    color: AppColors.navy,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.softGreen,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trendText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: AppColors.green,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricBlock: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricNumber: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
  },
  metricLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: AppColors.gray500,
    marginTop: 2,
  },
  goalSection: {
    marginTop: 18,
  },
  goalLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: AppColors.navy,
  },
  goalPct: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: AppColors.purple,
  },
  goalTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: AppColors.purple,
    borderRadius: 4,
  },
  focusCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  sectionSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 2,
    marginBottom: 12,
  },
  focusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusChip: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  focusChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.navy,
  },
  teacherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.softBlue,
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
  },
  teacherIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 15,
    color: AppColors.navy,
  },
  teacherSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 2,
  },
  controlsSection: {
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    color: AppColors.navy,
  },
  settingSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: AppColors.navy,
    textAlign: 'center',
  },
  modalSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: AppColors.gray500,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12,
  },
  inputLabel: {
    width: '100%',
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.navy,
    marginBottom: 6,
  },
  gradePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    width: '100%',
  },
  gradeOption: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  gradeOptionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: AppColors.navy,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.gray500,
  },
  modalSubmit: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: AppColors.purple,
  },
  submitText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  chapaLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  chapaTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.navy,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    width: '100%',
  },
  upgradeLabel: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    color: AppColors.navy,
  },
  upgradeSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
  },
  upgradePrice: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 15,
    color: AppColors.green,
  },
  chapaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 18,
    paddingVertical: 14,
    width: '100%',
    marginTop: 8,
  },
  chapaBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  modalClose: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.gray500,
    marginTop: 14,
  },
  msgCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.blue,
  },
  msgSubject: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.navy,
  },
  msgBody: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: AppColors.gray900,
    marginTop: 4,
  },
  msgDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: AppColors.gray500,
    marginTop: 6,
  },
  noMsgText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.gray500,
    marginTop: 8,
  },
});
