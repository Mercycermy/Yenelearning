import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RewardChestModalProps {
  visible: boolean;
  bonusStars: number;
  onClaim: () => void;
}

export function RewardChestModal({
  visible,
  bonusStars,
  onClaim,
}: RewardChestModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.chestCircle}>
            <Ionicons name="gift" size={54} color="#F59E0B" />
          </View>

          <Text style={styles.title}>Milestone Chest Unlocked! 🎁</Text>
          <Text style={styles.subtitle}>You reached a major learning checkpoint!</Text>

          <View style={styles.rewardBox}>
            <Ionicons name="star" size={36} color="#F59E0B" />
            <Text style={styles.bonusText}>+{bonusStars} Bonus Stars!</Text>
          </View>

          <Pressable
            onPress={onClaim}
            style={({ pressed }) => [
              styles.claimBtn,
              { transform: [{ translateY: pressed ? 3 : 0 }] },
            ]}
          >
            <Text style={styles.claimText}>Claim Reward ⭐️</Text>
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
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  chestCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FCD34D',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  bonusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#B45309',
  },
  claimBtn: {
    width: '100%',
    backgroundColor: '#F59E0B',
    borderBottomWidth: 6,
    borderBottomColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  claimText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
