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

interface ShapeItem {
  id: string;
  nameEn: string;
  nameAmh: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const SHAPES: ShapeItem[] = [
  { id: 'circle', nameEn: 'Circle', nameAmh: 'ክብ', icon: 'ellipse', color: '#E11D48', bg: '#FFE4E6' },
  { id: 'square', nameEn: 'Square', nameAmh: 'ካሬ', icon: 'square', color: '#2563EB', bg: '#DBEAFE' },
  { id: 'triangle', nameEn: 'Triangle', nameAmh: 'ሦስት ማዕዘን', icon: 'triangle', color: '#16A34A', bg: '#DCFCE7' },
  { id: 'star', nameEn: 'Star', nameAmh: 'ኮከብ', icon: 'star', color: '#D97706', bg: '#FEF3C7' },
  { id: 'diamond', nameEn: 'Diamond', nameAmh: 'አልማዝ', icon: 'diamond', color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'heart', nameEn: 'Heart', nameAmh: 'ልብ', icon: 'heart', color: '#DB2777', bg: '#FCE7F3' },
];

const ROUNDS = [
  { targetId: 'circle', options: ['square', 'circle', 'triangle'] },
  { targetId: 'star', options: ['star', 'diamond', 'heart'] },
  { targetId: 'triangle', options: ['square', 'heart', 'triangle'] },
  { targetId: 'diamond', options: ['circle', 'diamond', 'star'] },
  { targetId: 'heart', options: ['heart', 'triangle', 'square'] },
];

export default function ShapeMatchGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [language, setLanguage] = useState('amharic');

  useEffect(() => {
    (async () => {
      const lang = await userPrefs.getLanguage();
      setLanguage(lang);
    })();
  }, []);

  const currentRound = ROUNDS[levelIndex];
  const targetShape = SHAPES.find((s) => s.id === currentRound.targetId)!;
  const isComplete = levelIndex >= ROUNDS.length;

  useEffect(() => {
    if (!isComplete && targetShape) {
      const prompt =
        language === 'amharic'
          ? `የ ${targetShape.nameAmh} ቅርጽ የትኛው ነው?`
          : `Which shape is the ${targetShape.nameEn}?`;
      speechService.speak(prompt, language);
    }
  }, [levelIndex, isComplete, language, targetShape]);

  function handleSelect(shapeId: string) {
    if (selectedId !== null) return;
    setSelectedId(shapeId);

    const isCorrect = shapeId === targetShape.id;
    if (isCorrect) {
      setFeedback('correct');
      setScore((s) => s + 20);
      speechService.speak(language === 'amharic' ? 'ትክክል! ጎበዝ!' : 'Correct! Great job!', language);
    } else {
      setFeedback('wrong');
      speechService.speak(language === 'amharic' ? 'ድጋሚ ሞክር' : 'Try again!', language);
    }

    setTimeout(() => {
      setSelectedId(null);
      setFeedback(null);
      if (isCorrect) {
        setLevelIndex((i) => i + 1);
      }
    }, 1200);
  }

  function handleRestart() {
    setLevelIndex(0);
    setScore(0);
    setSelectedId(null);
    setFeedback(null);
  }

  return (
    <GameShell
      title="Shape Match"
      gameType="shape_match"
      score={score}
      maxScore={ROUNDS.length * 20}
      currentLevel={Math.min(levelIndex + 1, ROUNDS.length)}
      totalLevels={ROUNDS.length}
      isComplete={isComplete}
      onRestart={handleRestart}
      language={language}
      instructions={
        targetShape
          ? language === 'amharic'
            ? `የትኛው ነው: ${targetShape.nameAmh} (${targetShape.nameEn})`
            : `Find the shape: ${targetShape.nameEn} (${targetShape.nameAmh})`
          : ''
      }
    >
      <View style={styles.content}>
        {/* Target Card */}
        {targetShape ? (
          <View style={[styles.targetCard, { backgroundColor: targetShape.bg }]}>
            <Ionicons name={targetShape.icon} size={80} color={targetShape.color} />
            <Text style={styles.targetNameAmh}>{targetShape.nameAmh}</Text>
            <Text style={styles.targetNameEn}>{targetShape.nameEn}</Text>
          </View>
        ) : null}

        {/* Options Grid */}
        <Text style={styles.promptLabel}>
          {language === 'amharic' ? 'ትክክለኛውን ቅርጽ ይጫኑ' : 'Tap the matching shape'}
        </Text>

        <View style={styles.optionsRow}>
          {currentRound?.options.map((shapeId) => {
            const shape = SHAPES.find((s) => s.id === shapeId)!;
            const isChosen = selectedId === shapeId;
            const isCorrectTarget = shapeId === targetShape?.id;

            let cardBorder = 'transparent';
            let cardBg = '#fff';

            if (isChosen) {
              cardBorder = isCorrectTarget ? AppColors.green : AppColors.error;
              cardBg = isCorrectTarget ? AppColors.softGreen : AppColors.softPink;
            }

            return (
              <Pressable
                key={shape.id}
                style={[
                  styles.optionCard,
                  { borderColor: cardBorder, backgroundColor: cardBg },
                ]}
                onPress={() => handleSelect(shape.id)}
              >
                <Ionicons name={shape.icon} size={48} color={shape.color} />
                <Text style={styles.optionLabel}>{shape.nameEn}</Text>
                <Text style={styles.optionLabelAmh}>{shape.nameAmh}</Text>
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
              name={feedback === 'correct' ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color="#fff"
            />
            <Text style={styles.feedbackText}>
              {feedback === 'correct'
                ? language === 'amharic'
                  ? 'ትክክል ነው! (+20 ነጥብ)'
                  : 'Awesome! (+20 pts)'
                : language === 'amharic'
                  ? 'እንደገና ይሞክሩ!'
                  : 'Not quite! Try again!'}
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
  targetCard: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 28,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  targetNameAmh: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 22,
    color: AppColors.navy,
    marginTop: 8,
  },
  targetNameEn: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: AppColors.gray500,
  },
  promptLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: AppColors.navy,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionCard: {
    flex: 1,
    maxWidth: 110,
    aspectRatio: 0.9,
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
    fontSize: 12,
    color: AppColors.navy,
    marginTop: 6,
  },
  optionLabelAmh: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: AppColors.gray500,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
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
