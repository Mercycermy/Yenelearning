import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../src/constants/colors';
import { userPrefs } from '../src/data/userPrefs';
import { messagingRepository, type MessageItem } from '../src/data/messagingRepository';

interface StudentMetric {
  id: string;
  name: string;
  grade: string;
  accuracy: number;
  streakDays: number;
  wordsLearned: number;
  lastActive: string;
  status: 'active' | 'needs_help' | 'excelling';
}

const CLASS_STUDENTS: StudentMetric[] = [
  { id: '1', name: 'Abebe Kebede', grade: 'Grade 1', accuracy: 92, streakDays: 5, wordsLearned: 48, lastActive: 'Today', status: 'excelling' },
  { id: '2', name: 'Chala Desta', grade: 'Grade 1', accuracy: 78, streakDays: 3, wordsLearned: 32, lastActive: 'Yesterday', status: 'active' },
  { id: '3', name: 'Sara Melaku', grade: 'Grade 1', accuracy: 64, streakDays: 1, wordsLearned: 18, lastActive: '3 days ago', status: 'needs_help' },
  { id: '4', name: 'Nahom Alemayehu', grade: 'Grade 1', accuracy: 85, streakDays: 4, wordsLearned: 41, lastActive: 'Today', status: 'active' },
  { id: '5', name: 'Selam Tesfaye', grade: 'Grade 1', accuracy: 95, streakDays: 7, wordsLearned: 56, lastActive: 'Today', status: 'excelling' },
];

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('Teacher Helen');
  const [schoolName, setSchoolName] = useState('St. Joseph Primary School');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'students' | 'messages' | 'push_content'>('overview');
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // Send announcement modal
  const [announceModal, setAnnounceModal] = useState(false);
  const [annSubject, setAnnSubject] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Push content modal
  const [pushModal, setPushModal] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentTrack, setContentTrack] = useState('Vocabulary Milestone 3');

  const loadData = useCallback(async () => {
    const rawUser = await userPrefs.getUserJson();
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser) as { firstName?: string; lastName?: string };
        if (u.firstName) setTeacherName(`Teacher ${u.firstName} ${u.lastName || ''}`);
      } catch {
        // ignore
      }
    }
    const sent = await messagingRepository.getSent();
    setMessages(sent);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function handleSendAnnouncement() {
    if (!annSubject.trim() || !annBody.trim()) {
      Alert.alert('Required', 'Please enter subject and message body.');
      return;
    }
    setIsSending(true);
    try {
      await messagingRepository.sendMessage('all-parents', annSubject.trim(), annBody.trim());
      Alert.alert('Announcement Broadcast 📢', 'Message successfully delivered to all 24 parent accounts in Grade 1.');
      setAnnounceModal(false);
      setAnnSubject('');
      setAnnBody('');
    } catch {
      Alert.alert('Sent', 'Announcement queued for delivery to parents.');
      setAnnounceModal(false);
    } finally {
      setIsSending(false);
    }
  }

  function handlePushAssignment() {
    if (!contentTitle.trim()) {
      Alert.alert('Required', 'Please specify a study unit or story chapter title.');
      return;
    }
    Alert.alert(
      'Resource Pushed 🚀',
      `"${contentTitle}" is now assigned to all Grade 1 students for this week's family focus!`,
    );
    setPushModal(false);
    setContentTitle('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appBrand}>Teacher Portal 🎓</Text>
          <Text style={styles.schoolName}>{schoolName}</Text>
        </View>
        <Pressable
          style={styles.logoutBtn}
          onPress={async () => {
            await userPrefs.clearAuth();
            router.replace('/login');
          }}
        >
          <Ionicons name="log-out-outline" size={22} color={AppColors.navy} />
        </Pressable>
      </View>

      {/* Hero Welcome */}
      <View style={styles.heroCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{teacherName}</Text>
          <Text style={styles.heroSub}>Grade 1 · 24 Enrolled Students</Text>
          <View style={styles.heroPillRow}>
            <View style={styles.heroPill}>
              <Ionicons name="checkmark-done" size={14} color="#10B981" />
              <Text style={styles.heroPillText}>84% Avg Mastery</Text>
            </View>
            <View style={styles.heroPill}>
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text style={styles.heroPillText}>18 Active Today</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroIconWrap}>
          <Ionicons name="school" size={40} color="#8B5CF6" />
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsRow}>
        <Pressable
          style={[styles.actionCard, { backgroundColor: AppColors.softPurple }]}
          onPress={() => setAnnounceModal(true)}
        >
          <Ionicons name="megaphone" size={24} color={AppColors.purple} />
          <Text style={[styles.actionTitle, { color: AppColors.purple }]}>
            Send Announcement
          </Text>
          <Text style={styles.actionSub}>Broadcast to parents</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: AppColors.softGreen }]}
          onPress={() => setPushModal(true)}
        >
          <Ionicons name="cloud-upload" size={24} color={AppColors.green} />
          <Text style={[styles.actionTitle, { color: AppColors.green }]}>
            Push Learning Task
          </Text>
          <Text style={styles.actionSub}>Assign story or words</Text>
        </Pressable>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabBtn, selectedTab === 'overview' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            Class Analytics
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, selectedTab === 'students' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('students')}
        >
          <Text style={[styles.tabText, selectedTab === 'students' && styles.tabTextActive]}>
            Student Roster ({CLASS_STUDENTS.length})
          </Text>
        </Pressable>
      </View>

      {/* Class Analytics Overview */}
      {selectedTab === 'overview' ? (
        <View style={styles.overviewSection}>
          <View style={styles.statCardsRow}>
            <View style={[styles.miniStat, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="book-outline" size={20} color="#2563EB" />
              <Text style={[styles.miniStatNum, { color: '#2563EB' }]}>1,240</Text>
              <Text style={styles.miniStatLabel}>Words Mastered</Text>
            </View>
            <View style={[styles.miniStat, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="mic-outline" size={20} color="#16A34A" />
              <Text style={[styles.miniStatNum, { color: '#16A34A' }]}>88%</Text>
              <Text style={styles.miniStatLabel}>Pronunciation Acc.</Text>
            </View>
            <View style={[styles.miniStat, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="game-controller-outline" size={20} color="#D97706" />
              <Text style={[styles.miniStatNum, { color: '#D97706' }]}>320</Text>
              <Text style={styles.miniStatLabel}>Games Completed</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Student Needs Attention</Text>
          {CLASS_STUDENTS.filter((s) => s.status === 'needs_help').map((student) => (
            <View key={student.id} style={styles.alertCard}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.alertStudentName}>{student.name}</Text>
                <Text style={styles.alertStudentSub}>
                  Accuracy {student.accuracy}% · Inactive for 3 days
                </Text>
              </View>
              <Pressable
                style={styles.nudgeBtn}
                onPress={() => {
                  setAnnSubject(`Weekly Learning Check-in for ${student.name}`);
                  setAnnBody(`Hello! Please make sure ${student.name} completes their daily 15-minute voice practice.`);
                  setAnnounceModal(true);
                }}
              >
                <Text style={styles.nudgeText}>Message Parent</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {/* Students Roster List */}
      {selectedTab === 'students' ? (
        <View style={styles.rosterSection}>
          {CLASS_STUDENTS.map((s) => (
            <View key={s.id} style={styles.studentRow}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={20} color={AppColors.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{s.name}</Text>
                <Text style={styles.studentSub}>
                  {s.wordsLearned} words · Streak: {s.streakDays}d · {s.lastActive}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  s.status === 'excelling' && { backgroundColor: AppColors.softGreen },
                  s.status === 'needs_help' && { backgroundColor: AppColors.softPink },
                  s.status === 'active' && { backgroundColor: AppColors.softBlue },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    s.status === 'excelling' && { color: AppColors.green },
                    s.status === 'needs_help' && { color: AppColors.error },
                    s.status === 'active' && { color: AppColors.blue },
                  ]}
                >
                  {s.accuracy}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* Broadcast Announcement Modal */}
      <Modal visible={announceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Broadcast to Parents</Text>
            <Text style={styles.modalSub}>Sends direct notification to all parent accounts</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Subject (e.g. Homework Reminder)"
              value={annSubject}
              onChangeText={setAnnSubject}
            />

            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Message details, homework tips, or study schedule..."
              multiline
              value={annBody}
              onChangeText={setAnnBody}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setAnnounceModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.sendBtn, isSending && { opacity: 0.7 }]}
                onPress={handleSendAnnouncement}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendText}>Send Notice</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Push Learning Task Modal */}
      <Modal visible={pushModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Push Study Resource</Text>
            <Text style={styles.modalSub}>Select a curriculum topic to spotlight on student dashboards</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Resource Name (e.g. Chapter 3: Golden Sun)"
              value={contentTitle}
              onChangeText={setContentTitle}
            />

            <Text style={styles.inputLabel}>Select Grade Topic:</Text>
            <View style={styles.trackChips}>
              {['Vocabulary Unit 2', 'Story Chapter 3', 'Math Addition Quest', 'Speaking Drill'].map((t) => (
                <Pressable
                  key={t}
                  style={[
                    styles.trackChip,
                    contentTrack === t && { backgroundColor: AppColors.green, borderColor: AppColors.green },
                  ]}
                  onPress={() => setContentTrack(t)}
                >
                  <Text style={[styles.trackChipText, contentTrack === t && { color: '#fff' }]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setPushModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.sendBtn, { backgroundColor: AppColors.green }]}
                onPress={handlePushAssignment}
              >
                <Text style={styles.sendText}>Push to Class</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appBrand: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: AppColors.navy,
  },
  schoolName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: AppColors.gray500,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  heroCard: {
    backgroundColor: '#312E81',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: '#fff',
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 2,
  },
  heroPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
  },
  actionTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    marginTop: 8,
  },
  actionSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: AppColors.navy,
    borderColor: AppColors.navy,
  },
  tabText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.gray500,
  },
  tabTextActive: {
    color: '#fff',
  },
  overviewSection: {
    gap: 14,
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniStat: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  miniStatNum: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    marginTop: 4,
  },
  miniStatLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: AppColors.gray500,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionHeading: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    color: AppColors.navy,
    marginTop: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 14,
  },
  alertStudentName: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    color: AppColors.navy,
  },
  alertStudentSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#991B1B',
  },
  nudgeBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  nudgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  rosterSection: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  studentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.navy,
  },
  studentSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
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
  },
  modalTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.navy,
    textAlign: 'center',
  },
  modalSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.navy,
    marginBottom: 8,
  },
  trackChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  trackChip: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trackChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: AppColors.navy,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.gray500,
  },
  sendBtn: {
    flex: 1,
    backgroundColor: AppColors.purple,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
