import { useState, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameShell } from '../../src/components/GameShell';
import { AppColors } from '../../src/constants/colors';
import { speechService } from '../../src/services/speech';
import { userPrefs } from '../../src/data/userPrefs';

interface Puzzle {
  type: 'sequence' | 'odd_one_out';
  titleAmh: string;
  titleEn: string;
  sequenceItems?: { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }[];
  options: { id: string; icon: keyof typeof Ionicons.glyphMap; color: string; label: string }[];
  correctId: string;
}

const PUZZLES: Puzzle[] = [
  {
    type: 'sequence',
    titleAmh: 'የቀጣዩን ቅርጽ ይገምቱ: 🔴 🔵 🔴 ?',
    titleEn: 'What comes next in the pattern?',
    sequenceItems: [
      { icon: 'ellipse', color: '#EF4444', label: 'Red' },
      { icon: 'ellipse', color: '#3B82F6', label: 'Blue' },
      { icon: 'ellipse', color: '#EF4444', label: 'Red' },
    ],
    options: [
      { id: 'blue', icon: 'ellipse', color: '#3B82F6', label: 'Blue' },
      { id: 'red', icon: 'ellipse', color: '#EF4444', label: 'Red' },
      { id: 'green', icon: 'ellipse', color: '#10B981', label: 'Green' },
    ],
    correctId: 'blue',
  },
  {
    type: 'odd_one_out',
    titleAmh: 'ከእንስሳት መካከል የማይመደበውን ይምረጡ',
    titleEn: 'Find the odd one out (not an animal)',
    options: [
      { id: 'cat', icon: 'paw', color: '#F59E0B', label: 'Cat' },
      { id: 'dog', icon: 'happy', color: '#8B5CF6', label: 'Dog' },
      { id: 'car', icon: 'car', color: '#EF4444', label: 'Car' },
      { id: 'fish', icon: 'fish', color: '#06B6D4', label: 'Fish' },
    ],
    correctId: 'car',
  },
  {
    type: 'sequence',
    titleAmh: 'ቀጣዩን ይምረጡ: ⭐ 🌙 ⭐ ?',
    titleEn: 'What comes next? Star, Moon, Star, ?',
    sequenceItems: [
      { icon: 'star', color: '#F59E0B', label: 'Star' },
      { icon: 'moon', color: '#6366F1', label: 'Moon' },
      { icon: 'star', color: '#F59E0B', label: 'Star' },
    ],
    options: [
      { id: 'moon', icon: 'moon', color: '#6366F1', label: 'Moon' },
      { id: 'star', icon: 'star', color: '#F59E0B', label: 'Star' },
      { id: 'sun', icon: 'sunny', color: '#EAB308', label: 'Sun' },
    ],
    correctId: 'moon',
  },
  {
    type: 'odd_one_out',
    titleAmh: 'ከምግቦች መካከል የማይመደበውን ይምረጡ',
    titleEn: 'Find the odd one out (not food)',
    options: [
      { id: 'apple', icon: 'nutrition', color: '#EF4444', label: 'Apple' },
      { id: 'pizza', icon: 'pizza', color: '#F97316', label: 'Pizza' },
      { id: 'pencil', icon: 'pencil', color: '#64748B', label: 'Pencil' },
      { id: 'icecream', icon: 'ice-cream', color: '#EC4899', label: 'Ice Cream' },
    ],
    correctId: 'pencil',
  },
];

export default function LogicPuzzleGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [language, setLanguage] = useState('amharic');

  const currentPuzzle = PUZZLES[levelIndex];
  const isComplete = levelIndex >= PUZZLES.length;

  useEffect(() => {
    (async () => {
      const lang = await userPrefs.getLanguage();
      setLanguage(lang);
    })();
  }, []);

  useEffect(() => {
    if (currentPuzzle) {
      setSelectedId(null);
      const prompt = language === 'amharic' ? currentPuzzle.titleAmh : currentPuzzle.titleEn;
      speechService.speak(prompt, language);
    }
  }, [levelIndex, currentPuzzle, language]);

  function handleSelect(optionId: string) {
    if (selectedId !== null) return;
    setSelectedId(optionId);

    const isCorrect = optionId === currentPuzzle.correctId;
    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 25);
      speechService.speak(language === 'amharic' ? 'ጎበዝ! ትክክለኛ ምርጫ!' : 'Brilliant! Correct choice!', language);
    } else {
      setFeedback('wrong');
      speechService.speak(language === 'amharic' ? 'ድጋሚ ያስቡበት' : 'Think again!', language);
    }

    setTimeout(() => {
      setSelectedId(null);
      setFeedback(null);
      if (isCorrect) {
        setLevelIndex((i) => i + 1);
      }
    }, 1300);
  }

  function handleRestart() {
    setLevelIndex(0);
    setScore(0);
    setSelectedId(null);
    setFeedback(null);
  }

  return (
    <GameShell
      title="Logic Quest"
      gameType="logic_puzzle"
      score={score}
      maxScore={PUZZLES.length * 25}
      currentLevel={Math.min(levelIndex + 1, PUZZLES.length)}
      totalLevels={PUZZLES.length}
      isComplete={isComplete}
      onRestart={handleRestart}
      language={language}
      instructions={currentPuzzle ? (language === 'amharic' ? currentPuzzle.titleAmh : currentPuzzle.titleEn) : ''}
    >
      <View style={styles.content}>
        {/* Puzzle Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {language === 'amharic' ? currentPuzzle?.titleAmh : currentPuzzle?.titleEn}
          </Text>

          {/* If Sequence pattern, display the sequence cards */}
          {currentPuzzle?.sequenceItems ? (
            <View style={styles.sequenceRow}>
              {currentPuzzle.sequenceItems.map((item, i) => (
                <View key={i} style={styles.sequenceItem}>
                  <Ionicons name={item.icon} size={36} color={item.color} />
                </View>
              ))}
              <View style={[styles.sequenceItem, styles.questionSlot]}>
                <Text style={styles.questionMark}>?</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Options */}
        <Text style={styles.optionsPrompt}>
          {language === 'amharic' ? 'ትክክለኛውን መልስ ይምረጡ' : 'Tap your answer'}
        </Text>

        <View style={styles.optionsGrid}>
          {currentPuzzle?.options.map((opt) => {
            const isChosen = selectedId === opt.id;
            const isTarget = opt.id === currentPuzzle.correctId;

            let border = 'transparent';
            let bg = '#fff';

            if (isChosen) {
              border = isTarget ? AppColors.green : AppColors.error;
              bg = isTarget ? AppColors.softGreen : AppColors.softPink;
            }

            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.optionBtn,
                  { borderColor: border, backgroundColor: bg },
                ]}
                onPress={() => handleSelect(opt.id)}
              >
                <Ionicons name={opt.icon} size={42} color={opt.color} />
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {feedback ? (
          <View
            style={[
              styles.feedbackBanner,
              { backgroundColor: feedback === 'correct' ? AppColors.green : AppColors.error },
            ]}
          >
            <Ionicons
              name={feedback === 'correct' ? 'bulb' : 'alert-circle'}
              size={22}
              color="#fff"
            />
            <Text style={styles.feedbackText}>
              {feedback === 'correct'
                ? `አስደናቂ ነው! (+25 ነጥብ)`
                : 'ተሳስተዋል! እንደገና ይሞክሩ'}
            </Text>
          </View>
        ) : null}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 17,
    color: AppColors.navy,
    textAlign: 'center',
  },
  sequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  sequenceItem: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: AppColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.gray200,
  },
  questionSlot: {
    borderColor: AppColors.purple,
    backgroundColor: AppColors.softPurple,
    borderStyle: 'dashed',
  },
  questionMark: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 24,
    color: AppColors.purple,
  },
  optionsPrompt: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.navy,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionBtn: {
    width: '45%',
    maxWidth: 140,
    aspectRatio: 1.1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  optionLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.navy,
    marginTop: 6,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 18,
  },
  feedbackText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
