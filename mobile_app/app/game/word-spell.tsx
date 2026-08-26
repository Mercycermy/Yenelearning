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

interface WordChallenge {
  word: string;
  amharic: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  letters: string[];
}

const CHALLENGES: WordChallenge[] = [
  { word: 'CAT', amharic: 'ድመት', icon: 'paw', color: '#F97316', bg: '#FFEDD5', letters: ['T', 'C', 'A'] },
  { word: 'SUN', amharic: 'ፀሐይ', icon: 'sunny', color: '#EAB308', bg: '#FEF9C3', letters: ['N', 'S', 'U'] },
  { word: 'DOG', amharic: 'ውሻ', icon: 'happy', color: '#3B82F6', bg: '#DBEAFE', letters: ['O', 'D', 'G'] },
  { word: 'BOOK', amharic: 'መጽሐፍ', icon: 'book', color: '#10B981', bg: '#D1FAE5', letters: ['O', 'B', 'K', 'O'] },
  { word: 'STAR', amharic: 'ኮከብ', icon: 'star', color: '#8B5CF6', bg: '#EDE9FE', letters: ['T', 'S', 'R', 'A'] },
];

export default function WordSpellGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<{ letter: string; originalIndex: number }[]>([]);
  const [availableIndices, setAvailableIndices] = useState<number[]>([]);
  const [language, setLanguage] = useState('amharic');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentChallenge = CHALLENGES[levelIndex];
  const isComplete = levelIndex >= CHALLENGES.length;

  useEffect(() => {
    (async () => {
      const lang = await userPrefs.getLanguage();
      setLanguage(lang);
    })();
  }, []);

  useEffect(() => {
    if (currentChallenge) {
      setSelectedLetters([]);
      setAvailableIndices(currentChallenge.letters.map((_, i) => i));
      const prompt =
        language === 'amharic'
          ? `የ ${currentChallenge.amharic} ቃል ፊደላትን አቀናብሩ: ${currentChallenge.word}`
          : `Spell the word: ${currentChallenge.word} (${currentChallenge.amharic})`;
      speechService.speak(prompt, language);
    }
  }, [levelIndex, currentChallenge, language]);

  function handleSelectTile(letter: string, index: number) {
    if (!availableIndices.includes(index) || feedback !== null) return;

    const nextSelected = [...selectedLetters, { letter, originalIndex: index }];
    const nextAvailable = availableIndices.filter((i) => i !== index);
    setSelectedLetters(nextSelected);
    setAvailableIndices(nextAvailable);

    // Check if word completed
    if (nextSelected.length === currentChallenge.word.length) {
      const builtWord = nextSelected.map((s) => s.letter).join('');
      if (builtWord === currentChallenge.word) {
        setFeedback('correct');
        setScore((s) => s + 25);
        speechService.speak(
          language === 'amharic'
            ? `ትክክል! ${currentChallenge.amharic} ${currentChallenge.word}!`
            : `Great job! ${currentChallenge.word}!`,
          language,
        );
        setTimeout(() => {
          setFeedback(null);
          setLevelIndex((i) => i + 1);
        }, 1300);
      } else {
        setFeedback('wrong');
        speechService.speak(language === 'amharic' ? 'ድጋሚ ይሞክሩ' : 'Try again!', language);
        setTimeout(() => {
          setSelectedLetters([]);
          setAvailableIndices(currentChallenge.letters.map((_, i) => i));
          setFeedback(null);
        }, 1100);
      }
    }
  }

  function handleRemoveSlot(slotIndex: number) {
    if (feedback !== null) return;
    const item = selectedLetters[slotIndex];
    if (!item) return;

    setSelectedLetters((prev) => prev.filter((_, i) => i !== slotIndex));
    setAvailableIndices((prev) => [...prev, item.originalIndex]);
  }

  function handleRestart() {
    setLevelIndex(0);
    setScore(0);
    setSelectedLetters([]);
    setFeedback(null);
  }

  return (
    <GameShell
      title="Word Spell"
      gameType="word_spell"
      score={score}
      maxScore={CHALLENGES.length * 25}
      currentLevel={Math.min(levelIndex + 1, CHALLENGES.length)}
      totalLevels={CHALLENGES.length}
      isComplete={isComplete}
      onRestart={handleRestart}
      language={language}
      instructions={
        currentChallenge
          ? `${currentChallenge.amharic} (${currentChallenge.word})`
          : ''
      }
    >
      <View style={styles.content}>
        {/* Word Picture / Meaning Card */}
        {currentChallenge ? (
          <View style={[styles.wordCard, { backgroundColor: currentChallenge.bg }]}>
            <Ionicons name={currentChallenge.icon} size={76} color={currentChallenge.color} />
            <Text style={styles.amharicTitle}>{currentChallenge.amharic}</Text>
            <Text style={styles.englishSub}>Pronounce: &quot;{currentChallenge.word}&quot;</Text>
          </View>
        ) : null}

        {/* Spelling Slots */}
        <View style={styles.slotsRow}>
          {currentChallenge?.word.split('').map((_, index) => {
            const filled = selectedLetters[index];
            return (
              <Pressable
                key={index}
                style={[
                  styles.slot,
                  filled && styles.slotFilled,
                  feedback === 'correct' && { borderColor: AppColors.green, backgroundColor: AppColors.softGreen },
                  feedback === 'wrong' && { borderColor: AppColors.error, backgroundColor: AppColors.softPink },
                ]}
                onPress={() => handleRemoveSlot(index)}
              >
                <Text style={styles.slotLetter}>{filled?.letter ?? ''}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Scrambled Letter Tiles */}
        <Text style={styles.tilesPrompt}>
          {language === 'amharic' ? 'ፊደላቱን በትክክለኛው ቅደም ተከተል ይምረጡ' : 'Tap letters to spell the word'}
        </Text>

        <View style={styles.tilesRow}>
          {currentChallenge?.letters.map((letter, index) => {
            const isUsed = !availableIndices.includes(index);
            return (
              <Pressable
                key={index}
                disabled={isUsed}
                style={[
                  styles.tile,
                  isUsed && styles.tileUsed,
                ]}
                onPress={() => handleSelectTile(letter, index)}
              >
                <Text style={[styles.tileLetter, isUsed && styles.tileLetterUsed]}>
                  {letter}
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
              name={feedback === 'correct' ? 'sparkles' : 'alert-circle'}
              size={20}
              color="#fff"
            />
            <Text style={styles.feedbackText}>
              {feedback === 'correct'
                ? `ትክክል ነው! ${currentChallenge?.word}`
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
  wordCard: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  amharicTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 26,
    color: AppColors.navy,
    marginTop: 6,
  },
  englishSub: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.gray500,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  slot: {
    width: 54,
    height: 60,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: AppColors.blue,
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: AppColors.blue,
    backgroundColor: AppColors.softBlue,
  },
  slotLetter: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 26,
    color: AppColors.navy,
  },
  tilesPrompt: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.gray500,
    marginBottom: 12,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  tile: {
    width: 58,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: AppColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.purple,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tileUsed: {
    opacity: 0.25,
    backgroundColor: AppColors.gray100,
    borderColor: AppColors.gray200,
  },
  tileLetter: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 26,
    color: AppColors.purple,
  },
  tileLetterUsed: {
    color: AppColors.gray500,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 20,
  },
  feedbackText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
});
