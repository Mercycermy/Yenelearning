import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { AppColors } from '../constants/colors';

export interface AnimalItem {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  imageUrl: string;
  audioKey: string;
}

export const ANIMALS_LIST: AnimalItem[] = [
  {
    id: 'wef',
    nameAmharic: 'ወፍ',
    nameEnglish: 'Bird',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
    audioKey: 'wef',
  },
  {
    id: 'dimet',
    nameAmharic: 'ድመት',
    nameEnglish: 'Cat',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    audioKey: 'dimet',
  },
  {
    id: 'anbesa',
    nameAmharic: 'አንበሳ',
    nameEnglish: 'Lion',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80',
    audioKey: 'anbesa',
  },
  {
    id: 'wusha',
    nameAmharic: 'ውሻ',
    nameEnglish: 'Dog',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    audioKey: 'wusha',
  },
];

export interface TaskStepData {
  step: number;
  type: 'ANIMALS_INTRO' | 'VOCAB_CARD' | 'STORY_READ' | 'PICTURE_MATCH' | 'SENTENCE_BUILDER' | 'SPEECH_PRACTICE';
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
  animals?: AnimalItem[];
  sentenceTarget?: string;
  sentenceMeaning?: string;
  sentenceWords?: string[];
}

interface LessonSessionEngineProps {
  visible: boolean;
  lessonTitle: string;
  tasks?: TaskStepData[];
  hearts: number;
  onClose: () => void;
  onFinishLesson: (starsEarned: number) => void;
}

const AUDIO_WORD_MAP: Record<string, string> = {
  'ወፍ': 'wef',
  'ቤት': 'bet',
  'ድመት': 'dimet',
  'ሰላም': 'selam',
  'ቤተሰብ': 'beteseb',
  'አንበሳ': 'anbesa',
  'ውሻ': 'wusha',
  'እና': 'ena',
  'ጓደኛሞች': 'gwadegnmoch',
  'ናቸው': 'nachew',
  'እንስሳት': 'enssat',
  'ትልቅ': 'tilik',
  'ትንሽ': 'tinish',
  'ነው': 'new',
  'አሉ': 'alu',
  'ይወዳሉ': 'yiwedalu',
  'ይጫወታሉ': 'yichawetalu',
  'ዛፍ': 'zaf',
  'ውሃ': 'wuha',
  'ጫካ': 'chaka',
};

const DEFAULT_ANIMAL_TASKS: TaskStepData[] = [
  {
    step: 1,
    type: 'ANIMALS_INTRO',
    title: 'የእንስሳት ስሞች',
    text: 'እነዚህን 4 እንስሳት ይንኩ እና ስማቸውን ያዳምጡ',
    animals: ANIMALS_LIST,
  },
  {
    step: 2,
    type: 'PICTURE_MATCH',
    question: 'ይህንን በስዕሉ ያለውን እንስሳ ይምረጡ',
    options: ['ወፍ', 'ድመት', 'አንበሳ', 'ውሻ'],
    correctAnswer: 'ድመት',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  },
  {
    step: 3,
    type: 'SENTENCE_BUILDER',
    title: 'ዓረፍተ ነገር ይገንቡ',
    sentenceMeaning: 'Bird and cat are friends',
    sentenceTarget: 'ወፍ እና ድመት ጓደኛሞች ናቸው',
    sentenceWords: ['ድመት', 'ናቸው', 'ወፍ', 'ጓደኛሞች', 'እና'],
  },
  {
    step: 4,
    type: 'SENTENCE_BUILDER',
    title: 'ሁለተኛ ዓረፍተ ነገር ይገንቡ',
    sentenceMeaning: 'Lion and dog are animals',
    sentenceTarget: 'አንበሳ እና ውሻ እንስሳት ናቸው',
    sentenceWords: ['እንስሳት', 'አንበሳ', 'ናቸው', 'ውሻ', 'እና'],
  },
  {
    step: 5,
    type: 'STORY_READ',
    title: 'ሊሊ እና እንስሳቱ',
    text: 'ሊሊ በዛፍ ሥር ወፍ እና ድመት አየች። ውሻው እና አንበሳውም አብረዋቸው ይጫወታሉ!',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
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
  const activeTasks = tasks && tasks.length > 0 ? tasks : DEFAULT_ANIMAL_TASKS;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeAnimalId, setActiveAnimalId] = useState<string | null>(null);

  // Sentence Builder State
  const [selectedSentenceWords, setSelectedSentenceWords] = useState<string[]>([]);
  const [availableBankWords, setAvailableBankWords] = useState<string[]>([]);

  const currentTask = activeTasks[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / activeTasks.length) * 100;

  // Initialize sentence builder words when step changes
  React.useEffect(() => {
    if (currentTask.type === 'SENTENCE_BUILDER') {
      setSelectedSentenceWords([]);
      setAvailableBankWords(currentTask.sentenceWords || ['ድመት', 'ናቸው', 'ወፍ', 'ጓደኛሞች', 'እና']);
      setIsAnswerChecked(false);
      setIsCorrect(false);
    }
  }, [currentStepIndex, currentTask.type]);

  function playNativeAudioClip(word?: string) {
    const cleanWord = (word || 'ወፍ').trim();
    const fileName = AUDIO_WORD_MAP[cleanWord] || 'wef';
    const targetUrl = `http://localhost:3001/audio/amharic/${fileName}.mp3`;

    // 1. Web HTML5 Audio Element
    if (typeof window !== 'undefined' && (window as any).Audio) {
      try {
        const audio = new (window as any).Audio(targetUrl);
        audio.playbackRate = 1.15;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(cleanWord);
              utterance.rate = 1.15;
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
        .then(({ sound }) => {
          sound.setRateAsync(1.15, true);
          sound.playAsync();
        })
        .catch(() => Speech.speak(cleanWord, { rate: 1.15 }));
    } catch (e) {
      Speech.speak(cleanWord, { rate: 1.15 });
    }
  }

  function speakAmharicText(textToSpeak?: string) {
    if (!textToSpeak) return;
    const clean = textToSpeak.trim();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {}
    }

    try {
      Speech.speak(clean, { rate: 1.1 });
    } catch (e) {}
  }

  function handleWordTileSelect(word: string, index: number) {
    playNativeAudioClip(word);
    const newBank = [...availableBankWords];
    newBank.splice(index, 1);
    setAvailableBankWords(newBank);
    setSelectedSentenceWords([...selectedSentenceWords, word]);
    setIsAnswerChecked(false);
  }

  function handleWordTileRemove(word: string, index: number) {
    const newSelected = [...selectedSentenceWords];
    newSelected.splice(index, 1);
    setSelectedSentenceWords(newSelected);
    setAvailableBankWords([...availableBankWords, word]);
    setIsAnswerChecked(false);
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

    if (currentTask.type === 'SENTENCE_BUILDER') {
      if (!isAnswerChecked) {
        const constructedSentence = selectedSentenceWords.join(' ');
        const target = currentTask.sentenceTarget || 'ወፍ እና ድመት ጓደኛሞች ናቸው';
        const correct = constructedSentence === target;
        setIsCorrect(correct);
        setIsAnswerChecked(true);

        if (correct) {
          speakAmharicText(target);
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
    setActiveAnimalId(null);
    setSelectedSentenceWords([]);

    if (currentStepIndex + 1 < activeTasks.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Lesson Finished!
      setCurrentStepIndex(0);
      onFinishLesson(20);
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
          {/* TASK 1: ANIMALS_INTRO (4 Animals Grid) */}
          {currentTask.type === 'ANIMALS_INTRO' && (
            <ScrollView contentContainerStyle={styles.scrollTaskCenter} showsVerticalScrollIndicator={false}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="paw" size={16} color={AppColors.purple} />
                <Text style={styles.taskTypeText}>ANIMAL FRIENDS</Text>
              </View>

              <Text style={styles.sectionHeaderTitle}>{currentTask.title}</Text>
              <Text style={styles.sectionHeaderSubtitle}>{currentTask.text}</Text>

              {/* 4 Animals Grid */}
              <View style={styles.animalsGrid}>
                {(currentTask.animals || ANIMALS_LIST).map((animal) => {
                  const isActive = activeAnimalId === animal.id;
                  return (
                    <Pressable
                      key={animal.id}
                      onPress={() => {
                        setActiveAnimalId(animal.id);
                        playNativeAudioClip(animal.nameAmharic);
                      }}
                      style={({ pressed }) => [
                        styles.animalCard,
                        isActive && styles.animalCardActive,
                        { transform: [{ scale: pressed ? 0.97 : 1 }] },
                      ]}
                    >
                      <Image source={{ uri: animal.imageUrl }} style={styles.animalCardImage} />
                      <View style={styles.animalCardContent}>
                        <Text style={styles.animalAmharicName}>{animal.nameAmharic}</Text>
                        <Text style={styles.animalEnglishName}>{animal.nameEnglish}</Text>
                      </View>
                      <View style={[styles.miniSpeakerBtn, isActive && styles.miniSpeakerBtnActive]}>
                        <Ionicons
                          name="volume-high"
                          size={18}
                          color={isActive ? '#FFFFFF' : AppColors.purple}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* TASK 2: PICTURE_MATCH (Photo Match Quiz) */}
          {currentTask.type === 'PICTURE_MATCH' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="help-circle" size={16} color={AppColors.blue} />
                <Text style={styles.taskTypeText}>QUICK QUIZ</Text>
              </View>

              <Image
                source={{ uri: currentTask.imageUrl || ANIMALS_LIST[1].imageUrl }}
                style={styles.quizPhoto}
              />

              <Text style={styles.questionText}>{currentTask.question}</Text>

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
                        playNativeAudioClip(opt);
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

          {/* TASK 3: SENTENCE_BUILDER (Construct sentence with animals) */}
          {currentTask.type === 'SENTENCE_BUILDER' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="construct" size={16} color={AppColors.orange} />
                <Text style={styles.taskTypeText}>BUILD THE SENTENCE</Text>
              </View>

              <Text style={styles.sentenceMeaningPrompt}>
                {currentTask.sentenceMeaning || 'Bird and cat are friends'}
              </Text>

              {/* Assembled Sentence Area */}
              <View
                style={[
                  styles.assembledArea,
                  isAnswerChecked && {
                    borderColor: isCorrect ? '#10B981' : '#EF4444',
                    backgroundColor: isCorrect ? '#ECFDF5' : '#FEF2F2',
                  },
                ]}
              >
                {selectedSentenceWords.length === 0 ? (
                  <Text style={styles.assembledPlaceholder}>ይንኩ እና ዓረፍተ ነገሩን ይገንቡ...</Text>
                ) : (
                  <View style={styles.selectedTilesRow}>
                    {selectedSentenceWords.map((word, idx) => (
                      <Pressable
                        key={`${word}-${idx}`}
                        onPress={() => handleWordTileRemove(word, idx)}
                        style={styles.selectedTileChip}
                      >
                        <Text style={styles.selectedTileText}>{word}</Text>
                        <Ionicons name="close-circle" size={14} color="#6B7280" />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Listen Assembled Button */}
              {selectedSentenceWords.length > 0 && (
                <Pressable
                  onPress={() => speakAmharicText(selectedSentenceWords.join(' '))}
                  style={styles.listenSentenceBtn}
                >
                  <Ionicons name="volume-medium" size={18} color={AppColors.purple} />
                  <Text style={styles.listenSentenceText}>ድምፁን ያዳምጡ 🔊</Text>
                </Pressable>
              )}

              {/* Word Bank Area */}
              <Text style={styles.wordBankLabel}>የቃላት ሳጥን</Text>
              <View style={styles.wordBankRow}>
                {availableBankWords.map((word, idx) => (
                  <Pressable
                    key={`${word}-${idx}`}
                    onPress={() => handleWordTileSelect(word, idx)}
                    style={({ pressed }) => [
                      styles.bankTileChip,
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                  >
                    <Text style={styles.bankTileText}>{word}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* TASK 4: STORY_READ */}
          {currentTask.type === 'STORY_READ' && (
            <View style={styles.taskCenter}>
              <View style={styles.taskTypeBadge}>
                <Ionicons name="journal" size={16} color={AppColors.green} />
                <Text style={styles.taskTypeText}>STORY TIME</Text>
              </View>

              <Image
                source={{ uri: currentTask.imageUrl || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' }}
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
        </View>

        {/* Bottom Action Footer */}
        <View style={styles.bottomBar}>
          <Pressable
            disabled={
              (currentTask.type === 'PICTURE_MATCH' && !selectedOption) ||
              (currentTask.type === 'SENTENCE_BUILDER' && selectedSentenceWords.length === 0)
            }
            onPress={handleCheckOrNext}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor:
                  (currentTask.type === 'PICTURE_MATCH' && !selectedOption) ||
                  (currentTask.type === 'SENTENCE_BUILDER' && selectedSentenceWords.length === 0)
                    ? '#9CA3AF'
                    : isAnswerChecked
                    ? isCorrect
                      ? '#10B981'
                      : '#EF4444'
                    : '#10B981',
                borderBottomColor:
                  (currentTask.type === 'PICTURE_MATCH' && !selectedOption) ||
                  (currentTask.type === 'SENTENCE_BUILDER' && selectedSentenceWords.length === 0)
                    ? '#6B7280'
                    : '#047857',
                transform: [{ translateY: pressed ? 4 : 0 }],
              },
            ]}
          >
            <Text style={styles.actionBtnText}>
              {currentTask.type === 'PICTURE_MATCH' || currentTask.type === 'SENTENCE_BUILDER'
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
    padding: 20,
    justifyContent: 'center',
  },
  taskCenter: {
    alignItems: 'center',
    width: '100%',
  },
  scrollTaskCenter: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  taskTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  taskTypeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#374151',
  },
  sectionHeaderTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1F2937',
    textAlign: 'center',
  },
  sectionHeaderSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  animalCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 2,
    position: 'relative',
  },
  animalCardActive: {
    borderColor: AppColors.purple,
    backgroundColor: '#F5F3FF',
  },
  animalCardImage: {
    width: '100%',
    height: 95,
    borderRadius: 14,
    marginBottom: 8,
  },
  animalCardContent: {
    alignItems: 'center',
  },
  animalAmharicName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#1F2937',
  },
  animalEnglishName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  miniSpeakerBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  miniSpeakerBtnActive: {
    backgroundColor: AppColors.purple,
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 24,
    marginBottom: 14,
  },
  quizPhoto: {
    width: 140,
    height: 140,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#E5E7EB',
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
  sentenceMeaningPrompt: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  assembledArea: {
    width: '100%',
    minHeight: 68,
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  assembledPlaceholder: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
  selectedTilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  selectedTileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: AppColors.purple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  selectedTileText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: AppColors.purple,
  },
  listenSentenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
    marginBottom: 16,
  },
  listenSentenceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.purple,
  },
  wordBankLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  wordBankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  bankTileChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderBottomWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    elevation: 2,
  },
  bankTileText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1F2937',
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
