import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { AppColors } from '../constants/colors';

export interface TaskStepData {
  step: number;
  type: 'VOCAB_CARD' | 'STORY_READ' | 'PICTURE_MATCH' | 'SPEECH_PRACTICE';
  title?: string;
  word?: string;
  meaning?: string;
  text?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  prompt?: string;
  audioUrl?: string;
  imageUrl?: string;
}

interface LessonSessionEngineProps {
  visible: boolean;
  lessonTitle: string;
  tasks: TaskStepData[];
  hearts: number;
  onClose: () => void;
  onFinishLesson: (starsEarned: number) => void;
}

const BIRD_PHOTO_URL = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80';
const STORY_PHOTO_URL = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80';

const DEFAULT_DEMO_TASKS: TaskStepData[] = [
  {
    step: 1,
    type: 'VOCAB_CARD',
    word: 'ወፍ',
    meaning: 'Bird',
    text: 'A small bird living in green trees.',
    imageUrl: BIRD_PHOTO_URL,
  },
  {
    step: 2,
    type: 'STORY_READ',
    title: 'Lili & The Little Bird',
    text: 'ሊሊ በዛፍ ሥር ትንሽ ወፍ አየች። ወፏ ቤቷን ፈልጋ ነበር።',
    imageUrl: STORY_PHOTO_URL,
  },
  {
    step: 3,
    type: 'PICTURE_MATCH',
    question: 'ይህንን በስዕሉ ያለውን ቃል ይምረጡ',
    options: ['ወፍ', 'ድመት', 'ቤት'],
    correctAnswer: 'ወፍ',
    imageUrl: BIRD_PHOTO_URL,
  },
  {
    step: 4,
    type: 'SPEECH_PRACTICE',
    prompt: 'Say "Selam" into your mic to Tutor Abebe!',
  },
];

export function LessonSessionEngine({
  visible,
  lessonTitle,
  tasks,
  hearts,
  onClose,
  onFinishLesson,
}: LessonSessionEngineProps) {
  const activeTasks = tasks && tasks.length > 0 ? tasks : DEFAULT_DEMO_TASKS;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentTask = activeTasks[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / activeTasks.length) * 100;

  function playNativeAudioClip(word?: string) {
    const cleanWord = (word || 'ወፍ').trim();
    let fileName = 'wef';
    if (cleanWord === 'ቤት') fileName = 'bet';
    if (cleanWord === 'ድመት') fileName = 'dimet';
    if (cleanWord === 'ሰላም') fileName = 'selam';
    if (cleanWord === 'ቤተሰብ') fileName = 'beteseb';
    if (cleanWord === 'አንበሳ') fileName = 'anbesa';

    const targetUrl = `http://localhost:3001/audio/amharic/${fileName}.mp3`;

    // 1. Try HTML5 Audio (Direct Web Audio Element)
    if (typeof window !== 'undefined' && (window as any).Audio) {
      try {
        const audio = new (window as any).Audio(targetUrl);
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(cleanWord);
              window.speechSynthesis.speak(utterance);
            } catch (e) {}
          });
        }
        return;
      } catch (e) {}
    }

    // 2. Native Mobile Expo AV
    try {
      Audio.Sound.createAsync({ uri: targetUrl })
        .then(({ sound }) => sound.playAsync())
        .catch(() => Speech.speak(cleanWord));
    } catch (e) {
      Speech.speak(cleanWord);
    }
  }

  function speakAmharicText(textToSpeak?: string) {
    playNativeAudioClip(textToSpeak);
  }

  function handleCheckOrNext() {
    if (currentTask.type === 'PICTURE_MATCH') {
      if (!isAnswerChecked) {
        if (!selectedOption) return;
        const correct = selectedOption === currentTask.correctAnswer;
        setIsCorrect(correct);
        setIsAnswerChecked(true);

        if (correct) {
          speakAmharicText('ትክክል');
        } else {
          speakAmharicText('ድጋሚ ይሞክሩ');
        }
        return;
      }
    }

    // Reset feedback for next step
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);

    if (currentStepIndex + 1 < activeTasks.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Lesson Finished!
      setCurrentStepIndex(0);
      onFinishLesson(15);
    }
  }

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Progress & Header Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#4B5563" />
          </Pressable>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          {/* Hearts Display */}
          <View style={styles.heartsBadge}>
            <Ionicons name="heart" size={18} color="#EC4899" />
            <Text style={styles.heartsText}>{hearts}</Text>
          </View>
        </View>

        {/* Dynamic Task Content Body */}
        <View style={styles.body}>
          {/* TASK 1: VOCAB_CARD */}
          {currentTask.type === 'VOCAB_CARD' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="book" size={16} color={AppColors.purple} />
                <Text style={styles.taskTypeText}>VOCABULARY POWER</Text>
              </View>

              <Pressable
                onPress={() => playNativeAudioClip(currentTask.word, currentTask.audioUrl)}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              >
                <Image
                  source={{ uri: currentTask.imageUrl || BIRD_PHOTO_URL }}
                  style={styles.cardImage}
                />
              </Pressable>
              <Text style={styles.vocabAmharic}>{currentTask.word}</Text>
              <Text style={styles.vocabMeaning}>{currentTask.meaning}</Text>
              <Text style={styles.vocabDesc}>{currentTask.text}</Text>

              {/* Real Human Audio Play Button */}
              <Pressable
                onPress={() => playNativeAudioClip(currentTask.word)}
                style={({ pressed }) => [
                  styles.audioPlayBtn,
                  { transform: [{ scale: pressed ? 0.96 : 1 }] },
                ]}
              >
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
                <Text style={styles.audioPlayText}>Listen Sound 🔊</Text>
              </Pressable>
            </View>
          )}

          {/* TASK 2: STORY_READ */}
          {currentTask.type === 'STORY_READ' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="journal" size={16} color={AppColors.green} />
                <Text style={styles.taskTypeText}>STORY TIME</Text>
              </View>

              <Image
                source={{ uri: currentTask.imageUrl || STORY_PHOTO_URL }}
                style={styles.cardImage}
              />
              <Text style={styles.storyTitle}>{currentTask.title}</Text>
              <View style={styles.storyTextCard}>
                <Text style={styles.storyText}>{currentTask.text}</Text>
              </View>

              <Pressable
                onPress={() => speakAmharicText(currentTask.text || '')}
                style={styles.listenStoryBtn}
              >
                <Ionicons name="volume-medium" size={20} color="#047857" />
                <Text style={styles.listenStoryText}>Read Aloud</Text>
              </Pressable>
            </View>
          )}

          {/* TASK 3: PICTURE_MATCH (Photo-First Quiz as requested in Image 2) */}
          {currentTask.type === 'PICTURE_MATCH' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="help-circle" size={16} color={AppColors.blue} />
                <Text style={styles.taskTypeText}>QUICK QUIZ</Text>
              </View>

              {/* Photo Display Prompt at Top */}
              <Image
                source={{ uri: currentTask.imageUrl || BIRD_PHOTO_URL }}
                style={styles.quizPhoto}
              />

              <Text style={styles.questionText}>{currentTask.question}</Text>

              {/* Amharic Word Options */}
              <View style={styles.optionsCol}>
                {currentTask.options?.map((opt) => {
                  const isSelected = selectedOption === opt;
                  let cardBorder = '#E5E7EB';
                  let cardBg = '#FFFFFF';

                  if (isSelected) {
                    cardBorder = AppColors.blue;
                    cardBg = AppColors.softBlue;
                  }
                  if (isAnswerChecked && isSelected) {
                    cardBorder = isCorrect ? '#10B981' : '#EF4444';
                    cardBg = isCorrect ? '#ECFDF5' : '#FEF2F2';
                  }

                  return (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        setSelectedOption(opt);
                        speakAmharicText(opt);
                      }}
                      style={[styles.optionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                      <Ionicons name="volume-medium" size={18} color="#9CA3AF" />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* TASK 4: SPEECH_PRACTICE */}
          {currentTask.type === 'SPEECH_PRACTICE' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="mic" size={16} color={AppColors.purple} />
                <Text style={styles.taskTypeText}>VOICE PRACTICE</Text>
              </View>
              <Text style={styles.promptText}>{currentTask.prompt}</Text>

              <Pressable
                onPress={() => speakAmharicText('ሰላም')}
                style={styles.micCircle}
              >
                <Ionicons name="mic" size={48} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.micHint}>Tap and speak out loud!</Text>
            </View>
          )}
        </View>

        {/* Bottom Action Footer */}
        <View style={styles.bottomBar}>
          <Pressable
            disabled={currentTask.type === 'PICTURE_MATCH' && !selectedOption}
            onPress={handleCheckOrNext}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor:
                  currentTask.type === 'PICTURE_MATCH' && !selectedOption
                    ? '#9CA3AF'
                    : isAnswerChecked
                    ? isCorrect
                      ? '#10B981'
                      : '#EF4444'
                    : '#10B981',
                borderBottomColor:
                  currentTask.type === 'PICTURE_MATCH' && !selectedOption
                    ? '#6B7280'
                    : '#047857',
                transform: [{ translateY: pressed ? 4 : 0 }],
              },
            ]}
          >
            <Text style={styles.actionBtnText}>
              {currentTask.type === 'PICTURE_MATCH'
                ? isAnswerChecked
                  ? isCorrect
                    ? 'EXCELLENT! CONTINUE 🚀'
                    : 'TRY AGAIN 🔄'
                  : 'CHECK ANSWER 🎯'
                : 'CONTINUE 🚀'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeBtn: {
    padding: 6,
  },
  progressTrack: {
    flex: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 7,
  },
  heartsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heartsText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#9D174D',
  },
  body: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  taskCenter: {
    alignItems: 'center',
    width: '100%',
  },
  taskTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  taskTypeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#374151',
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 24,
    marginBottom: 14,
  },
  quizPhoto: {
    width: 130,
    height: 130,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  vocabAmharic: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#1F2937',
  },
  vocabMeaning: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#4B5563',
    marginTop: 2,
  },
  vocabDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  audioPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    elevation: 4,
  },
  audioPlayText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  storyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 10,
  },
  storyTextCard: {
    backgroundColor: '#F0FDF4',
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    width: '100%',
    marginBottom: 14,
  },
  storyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 26,
  },
  listenStoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  listenStoryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#047857',
  },
  questionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsCol: {
    width: '100%',
    gap: 10,
  },
  optionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    elevation: 2,
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  promptText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  micCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppColors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    marginBottom: 14,
  },
  micHint: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#6B7280',
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderBottomWidth: 6,
  },
  actionBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
