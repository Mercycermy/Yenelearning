import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';

interface LessonCompletionModalProps {
  visible: boolean;
  starsEarned: number;
  lessonTitle: string;
  onContinue: () => void;
}

export function LessonCompletionModal({
  visible,
  starsEarned,
  lessonTitle,
  onContinue,
}: LessonCompletionModalProps) {
  return (
    <Modal visible={visible} animationType="bounce" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Celebratory Icon */}
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={54} color="#F59E0B" />
          </View>

          <Text style={styles.title}>Lesson Completed! 🎉</Text>
          <Text style={styles.lessonName}>{lessonTitle}</Text>

          {/* Rewards Summary Box */}
          <View style={styles.rewardBox}>
            <View style={styles.rewardRow}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text style={styles.rewardText}>+{starsEarned} Stars Earned!</Text>
            </View>

            <View style={styles.rewardRow}>
              <Ionicons name="flame" size={24} color="#EF4444" />
              <Text style={styles.rewardText}>+1 Day Streak Maintained!</Text>
            </View>

            <View style={styles.starsRatingRow}>
              <Ionicons name="star" size={28} color="#F59E0B" />
              <Ionicons name="star" size={28} color="#F59E0B" />
              <Ionicons name="star" size={28} color="#F59E0B" />
            </View>
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={onContinue}
            style={({ pressed }) => [
              styles.continueBtn,
              { transform: [{ translateY: pressed ? 3 : 0 }] },
            ]}
          >
            <Text style={styles.continueText}>Continue Journey 🚀</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  trophyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FCD34D',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#1F2937',
    textAlign: 'center',
  },
  lessonName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  rewardBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1F2937',
  },
  starsRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    borderBottomWidth: 6,
    borderBottomColor: '#047857',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  continueText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
