import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';
import { speechService } from '../services/speech';
import { progressRepository } from '../data/progressRepository';
import { userPrefs } from '../data/userPrefs';

interface GameShellProps {
  title: string;
  gameType: 'shape_match' | 'word_spell' | 'counting' | 'logic_puzzle';
  score: number;
  maxScore: number;
  currentLevel: number;
  totalLevels: number;
  isComplete: boolean;
  onRestart: () => void;
  instructions?: string;
  language?: string;
  children: ReactNode;
}

export function GameShell({
  title,
  gameType,
  score,
  maxScore,
  currentLevel,
  totalLevels,
  isComplete,
  onRestart,
  instructions,
  language = 'amharic',
  children,
}: GameShellProps) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  useEffect(() => {
    if (isComplete) {
      (async () => {
        const starsEarned = score >= maxScore * 0.8 ? 3 : score >= maxScore * 0.5 ? 2 : 1;
        await progressRepository.recordGameResult('active-child', {
          gameType,
          score,
          maxScore,
          timeSpentSeconds: seconds,
          starsEarned,
        });
        if (!isMuted) {
          speechService.speak(
            language === 'amharic'
              ? `ጎበዝ! ጨዋታውን ጨርሰሃል! ${starsEarned} ኮከቦችን አግኝተሃል!`
              : `Great job! You completed the game and earned ${starsEarned} stars!`,
            language,
          );
        }
      })();
    }
  }, [isComplete, gameType, score, maxScore, seconds, language, isMuted]);

  function speakInstruction() {
    if (instructions) {
      speechService.speak(instructions, language);
    }
  }

  const starsEarned = score >= maxScore * 0.8 ? 3 : score >= maxScore * 0.5 ? 2 : 1;
  const progressPct = Math.min(100, Math.round((currentLevel / totalLevels) * 100));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.navy} />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.levelText}>
            Level {currentLevel}/{totalLevels}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} onPress={speakInstruction}>
            <Ionicons name="volume-high" size={22} color={AppColors.purple} />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, isMuted && { opacity: 0.5 }]}
            onPress={() => setIsMuted((m) => !m)}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'notifications'}
              size={20}
              color={AppColors.navy}
            />
          </Pressable>
        </View>
      </View>

      {/* Progress & Stat Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statChip}>
          <Ionicons name="timer-outline" size={16} color={AppColors.navy} />
          <Text style={styles.statText}>
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        <View style={[styles.statChip, { backgroundColor: AppColors.softYellow }]}>
          <Ionicons name="star" size={16} color={AppColors.yellow} />
          <Text style={[styles.statText, { color: AppColors.orange }]}>
            {score} pts
          </Text>
        </View>
      </View>

      {/* Instructions pill */}
      {instructions ? (
        <Pressable style={styles.instructionBanner} onPress={speakInstruction}>
          <Ionicons name="sparkles" size={18} color={AppColors.purple} />
          <Text style={styles.instructionText}>{instructions}</Text>
        </Pressable>
      ) : null}

      {/* Game Content View */}
      <View style={styles.gameArea}>{children}</View>

      {/* Completion Modal */}
      <Modal visible={isComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.starCrown}>
              {[1, 2, 3].map((starIndex) => (
                <Ionicons
                  key={starIndex}
                  name="star"
                  size={starIndex <= starsEarned ? 44 : 32}
                  color={starIndex <= starsEarned ? AppColors.yellow : AppColors.gray200}
                />
              ))}
            </View>

            <Text style={styles.winTitle}>🎉 Wonderful Job!</Text>
            <Text style={styles.winSub}>
              You scored {score} of {maxScore} points in {seconds} seconds!
            </Text>

            <View style={styles.rewardBox}>
              <Text style={styles.rewardText}>+{starsEarned * 10} Bonus XP</Text>
              <Text style={styles.rewardSub}>Added to your weekly trophy</Text>
            </View>

            <View style={styles.btnRow}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: AppColors.softPurple }]}
                onPress={() => {
                  setSeconds(0);
                  onRestart();
                }}
              >
                <Ionicons name="refresh" size={20} color={AppColors.purple} />
                <Text style={[styles.actionBtnText, { color: AppColors.purple }]}>
                  Play Again
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionBtn, { backgroundColor: AppColors.green }]}
                onPress={() => router.replace('/games')}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: AppColors.navy,
  },
  levelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: AppColors.gray500,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.navy,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.gray200,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.green,
    borderRadius: 5,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AppColors.softPurple,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  instructionText: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.purple,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  starCrown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  winTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 24,
    color: AppColors.navy,
    textAlign: 'center',
  },
  winSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: AppColors.gray500,
    textAlign: 'center',
    marginTop: 6,
  },
  rewardBox: {
    backgroundColor: AppColors.softGreen,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 18,
    width: '100%',
  },
  rewardText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.green,
  },
  rewardSub: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
  },
  actionBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
});
