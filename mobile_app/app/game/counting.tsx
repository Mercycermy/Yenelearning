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

interface MathQuestion {
  questionAmh: string;
  questionEn: string;
  count: number;
  itemIcon: keyof typeof Ionicons.glyphMap;
  itemColor: string;
  options: number[];
}

const QUESTIONS: MathQuestion[] = [
  { questionAmh: 'ስንት ኮከቦች አሉ?', questionEn: 'How many stars are there?', count: 3, itemIcon: 'star', itemColor: '#F59E0B', options: [2, 3, 4] },
  { questionAmh: 'ስንት ፖሞች አሉ?', questionEn: 'How many apples are there?', count: 5, itemIcon: 'nutrition', itemColor: '#EF4444', options: [4, 5, 6] },
  { questionAmh: 'ስንት አበባዎች አሉ?', questionEn: 'How many flowers are there?', count: 4, itemIcon: 'flower', itemColor: '#EC4899', options: [3, 4, 5] },
  { questionAmh: '2 ኳሶች + 2 ኳሶች ስንት ይሆናሉ?', questionEn: '2 balls + 2 balls = ?', count: 4, itemIcon: 'football', itemColor: '#3B82F6', options: [3, 4, 5] },
  { questionAmh: '3 መጻሕፍት + 3 መጻሕፍት ስንት ይሆናሉ?', questionEn: '3 books + 3 books = ?', count: 6, itemIcon: 'book', itemColor: '#10B981', options: [5, 6, 7] },
];

export default function CountingGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [tappedItems, setTappedItems] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [language, setLanguage] = useState('amharic');

  const currentQ = QUESTIONS[levelIndex];
  const isComplete = levelIndex >= QUESTIONS.length;

  useEffect(() => {
    (async () => {
      const lang = await userPrefs.getLanguage();
      setLanguage(lang);
    })();
  }, []);

  useEffect(() => {
    if (currentQ) {
      setSelectedNum(null);
      setTappedItems([]);
      const prompt = language === 'amharic' ? currentQ.questionAmh : currentQ.questionEn;
      speechService.speak(prompt, language);
    }
  }, [levelIndex, currentQ, language]);

  function handleTapItem(index: number) {
    if (!tappedItems.includes(index)) {
      const next = [...tappedItems, index];
      setTappedItems(next);
      speechService.speak(String(next.length), language);
    }
  }

  function handleSelectOption(num: number) {
    if (selectedNum !== null) return;
    setSelectedNum(num);

    const isCorrect = num === currentQ.count;
    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 20);
      speechService.speak(
        language === 'amharic' ? `ትክክል! ${num} ናቸው!` : `Correct! There are ${num}!`,
        language,
      );
    } else {
      setFeedback('wrong');
      speechService.speak(language === 'amharic' ? 'ድጋሚ ቆጥሩ' : 'Try counting again!', language);
    }

    setTimeout(() => {
      setSelectedNum(null);
      setFeedback(null);
      if (isCorrect) {
        setLevelIndex((i) => i + 1);
      }
    }, 1300);
  }

  function handleRestart() {
    setLevelIndex(0);
    setScore(0);
    setSelectedNum(null);
    setFeedback(null);
    setTappedItems([]);
  }

  return (
    <GameShell
      title="Count & Math"
      gameType="counting"
      score={score}
      maxScore={QUESTIONS.length * 20}
      currentLevel={Math.min(levelIndex + 1, QUESTIONS.length)}
      totalLevels={QUESTIONS.length}
      isComplete={isComplete}
      onRestart={handleRestart}
      language={language}
      instructions={currentQ ? (language === 'amharic' ? currentQ.questionAmh : currentQ.questionEn) : ''}
    >
      <View style={styles.content}>
        {/* Question Banner */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            {language === 'amharic' ? currentQ?.questionAmh : currentQ?.questionEn}
          </Text>
          <Text style={styles.tapHint}>
            {language === 'amharic' ? 'እቃዎቹን በመጫን መቁጠር ትችላላችሁ' : 'Tap items to count them!'}
          </Text>
        </View>

        {/* Interactive Counting Stage */}
        <View style={styles.stage}>
          {Array.from({ length: currentQ?.count ?? 0 }).map((_, i) => {
            const isTapped = tappedItems.includes(i);
            return (
              <Pressable
                key={i}
                style={[
                  styles.itemCircle,
                  isTapped && styles.itemCircleTapped,
                ]}
                onPress={() => handleTapItem(i)}
              >
                <Ionicons name={currentQ.itemIcon} size={42} color={currentQ.itemColor} />
                {isTapped ? (
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{tappedItems.indexOf(i) + 1}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Number Options */}
        <Text style={styles.answerPrompt}>
          {language === 'amharic' ? 'ትክክለኛውን ቁጥር ይምረጡ' : 'Select the correct number'}
        </Text>

        <View style={styles.optionsRow}>
          {currentQ?.options.map((num) => {
            const isChosen = selectedNum === num;
            const isTarget = num === currentQ.count;

            let btnBg: string = '#fff';
            let btnBorder: string = AppColors.blue;

            if (isChosen) {
              btnBg = isTarget ? AppColors.green : AppColors.error;
              btnBorder = isTarget ? AppColors.green : AppColors.error;
            }

            return (
              <Pressable
                key={num}
                style={[
                  styles.numBtn,
                  { backgroundColor: btnBg, borderColor: btnBorder },
                ]}
                onPress={() => handleSelectOption(num)}
              >
                <Text
                  style={[
                    styles.numText,
                    isChosen && { color: '#fff' },
                  ]}
                >
                  {num}
                </Text>
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
              name={feedback === 'correct' ? 'happy' : 'refresh-circle'}
              size={22}
              color="#fff"
            />
            <Text style={styles.feedbackText}>
              {feedback === 'correct'
                ? `ትክክል ነው! (+20 ነጥብ)`
                : 'ተሳስተዋል! እንደገና ይቁጠሩ'}
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
  questionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  questionTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    color: AppColors.navy,
    textAlign: 'center',
  },
  tapHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
    marginTop: 4,
  },
  stage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    minHeight: 140,
    width: '100%',
  },
  itemCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemCircleTapped: {
    borderColor: AppColors.yellow,
    backgroundColor: AppColors.softYellow,
  },
  itemBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadgeText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
  answerPrompt: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.navy,
    marginTop: 12,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    width: '100%',
  },
  numBtn: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  numText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 28,
    color: AppColors.navy,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  feedbackText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
