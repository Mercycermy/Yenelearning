import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { AppColors } from '../src/constants/colors';
import { aiRepository } from '../src/data/aiRepository';
import { userPrefs } from '../src/data/userPrefs';
import { speechService } from '../src/services/speech';
import { configureAppAudio, getTutorAudioUrl } from '../src/utils/audioUrl';

export interface VoiceTutorProfile {
  id: string;
  nameAmharic: string;
  titleAmharic: string;
  avatarIcon: keyof typeof Ionicons.glyphMap;
  avatarColor: string;
  previewAudioUrl: string;
  greetingText: string;
}

export const VOICE_TUTORS: VoiceTutorProfile[] = [
  {
    id: 'tutor-abebe',
    nameAmharic: 'መምህር አበበ',
    titleAmharic: 'አስደሳች መምህር',
    avatarIcon: 'school',
    avatarColor: '#10B981',
    previewAudioUrl: 'http://localhost:3001/audio/tutors/tutor-abebe/selam.wav',
    greetingText: 'ሰላም ልጆች! እኔ መምህር አበበ ነኝ። ዛሬ አዳዲስ ቃላትን አብረን እንማራለን!',
  },
  {
    id: 'tutor-sara',
    nameAmharic: 'ሳራ',
    titleAmharic: 'ፈጣን አንባቢ',
    avatarIcon: 'book',
    avatarColor: '#8B5CF6',
    previewAudioUrl: 'http://localhost:3001/audio/tutors/tutor-sara/selam.wav',
    greetingText: 'ሰላም! እኔ ሳራ ነኝ። ድንቅ ታሪኮችን አብረን እናነባለን!',
  },
  {
    id: 'tutor-dawit',
    nameAmharic: 'ዳዊት',
    titleAmharic: 'ደስተኛ ጓደኛ',
    avatarIcon: 'happy',
    avatarColor: '#3B82F6',
    previewAudioUrl: 'http://localhost:3001/audio/tutors/tutor-dawit/selam.wav',
    greetingText: 'ሰላም! እኔ ዳዊት ነኝ። ዛሬ አስደሳች ጨዋታዎችን እንጫወታለን!',
  },
  {
    id: 'tutor-helen',
    nameAmharic: 'ሄለን',
    titleAmharic: 'ጎበዝ አጋዥ',
    avatarIcon: 'sparkles',
    avatarColor: '#EC4899',
    previewAudioUrl: 'http://localhost:3001/audio/tutors/tutor-helen/selam.wav',
    greetingText: 'ሰላም! እኔ ሄለን ነኝ። በእውቀት የታነጸ ትውልድ እንገነባለን!',
  },
];

export default function TutorScreen() {
  const router = useRouter();
  const [selectedTutor, setSelectedTutor] = useState<VoiceTutorProfile>(VOICE_TUTORS[0]);
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('Hello! What is your name?');
  const [heardText, setHeardText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const activeHtml5AudioRef = useRef<any>(null);
  const activeExpoSoundRef = useRef<Audio.Sound | null>(null);

  // Stop any currently playing audio immediately
  function stopCurrentAudio() {
    if (activeHtml5AudioRef.current) {
      try {
        activeHtml5AudioRef.current.pause();
        activeHtml5AudioRef.current.currentTime = 0;
        activeHtml5AudioRef.current = null;
      } catch (e) {}
    }

    if (activeExpoSoundRef.current) {
      try {
        activeExpoSoundRef.current.stopAsync();
        activeExpoSoundRef.current.unloadAsync();
        activeExpoSoundRef.current = null;
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    try {
      Speech.stop();
      speechService.stop();
    } catch (e) {}

    setIsTutorSpeaking(false);
  }

  // Play a tutor's authentic voice clip
  async function playTutorVoiceClip(tutor: VoiceTutorProfile) {
    stopCurrentAudio();
    configureAppAudio();
    setIsTutorSpeaking(true);

    const audioUrl = getTutorAudioUrl(tutor.id, 'selam');

    // 1. Web HTML5 Audio
    if (typeof window !== 'undefined' && (window as any).Audio) {
      try {
        const audio = new (window as any).Audio(audioUrl);
        activeHtml5AudioRef.current = audio;
        audio.onended = () => {
          setIsTutorSpeaking(false);
          activeHtml5AudioRef.current = null;
        };
        audio.onerror = () => {
          setIsTutorSpeaking(false);
          activeHtml5AudioRef.current = null;
        };
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            setIsTutorSpeaking(false);
          });
        }
        return;
      } catch (e) {
        setIsTutorSpeaking(false);
      }
    }

    // 2. Native Mobile Expo AV
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      activeExpoSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsTutorSpeaking(false);
          sound.unloadAsync();
          activeExpoSoundRef.current = null;
        }
      });
    } catch (e) {
      setIsTutorSpeaking(false);
    }
  }

  // Handle selecting or swapping a tutor
  function handleSelectTutor(tutor: VoiceTutorProfile) {
    setSelectedTutor(tutor);
    setCurrentQuestion(tutor.greetingText);
    playTutorVoiceClip(tutor);
    userPrefs.saveAvatar({
      id: tutor.id,
      name: tutor.nameAmharic,
      imageUrl: '',
      teachingStyle: tutor.titleAmharic,
      voiceId: tutor.previewAudioUrl,
    });
  }

  // Handle randomizing tutor
  function handleRandomize() {
    const remaining = VOICE_TUTORS.filter((t) => t.id !== selectedTutor.id);
    const randomTutor = remaining[Math.floor(Math.random() * remaining.length)];
    handleSelectTutor(randomTutor);
  }

  useEffect(() => {
    // Initial greeting
    setCurrentQuestion(VOICE_TUTORS[0].greetingText);
    playTutorVoiceClip(VOICE_TUTORS[0]);

    return () => {
      stopCurrentAudio();
    };
  }, []);

  async function askTutor(message: string) {
    if (!message.trim() || isThinking || isTutorSpeaking) return;
    stopCurrentAudio();
    setIsThinking(true);
    try {
      const reply = await aiRepository.chat(message.trim(), 'amharic');
      setCurrentQuestion(reply);
      setIsThinking(false);
      playTutorVoiceClip(selectedTutor);
    } catch {
      setIsThinking(false);
      setCurrentQuestion('አስተማሪው ዝግጁ ነው። አብረን እንማር!');
    }
  }

  async function toggleListening() {
    if (isThinking || isTutorSpeaking) return;
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setHeardText('እያዳመጥኩ ነው...');
    const started = await speechService.listen('amharic', (words, isFinal) => {
      setHeardText(words || 'እያዳመጥኩ ነው...');
      if (isFinal) {
        setIsListening(false);
        if (words.trim()) {
          askTutor(words.trim());
        }
      }
    });
    if (!started) {
      setIsListening(false);
      setHeardText('የድምፅ መቀበያ አልተገኘም።');
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => {
            stopCurrentAudio();
            router.back();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.navy} />
        </Pressable>
        <Text style={styles.headerTitle}>የአስተማሪ ምርጫ</Text>
        <Pressable
          style={styles.infoBtn}
          onPress={() => {
            Alert.alert(
              'የአስተማሪ መረጃ',
              `${selectedTutor.nameAmharic}\n${selectedTutor.titleAmharic}`
            );
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color={AppColors.navy} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tutor Name Title */}
        <Text style={styles.title}>Talk with {selectedTutor.nameAmharic}</Text>

        {/* Big Avatar Display */}
        <View
          style={[
            styles.avatarWrap,
            { borderColor: selectedTutor.avatarColor },
          ]}
        >
          <View
            style={[
              styles.avatarInnerCircle,
              { backgroundColor: selectedTutor.avatarColor },
            ]}
          >
            <Ionicons name={selectedTutor.avatarIcon} size={84} color="#FFFFFF" />
          </View>
        </View>

        {/* Speech Bubble */}
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{currentQuestion}</Text>
        </View>

        {/* Speaking Wave Animation */}
        {isTutorSpeaking ? (
          <View style={styles.speakingStatusRow}>
            <Text style={styles.statusText}>Tutor is speaking...</Text>
            <View style={styles.waveRow}>
              {[16, 32, 48, 24, 40, 20, 36, 16].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    { height: h, backgroundColor: selectedTutor.avatarColor },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.turnRow}>
            <Text style={styles.turnText}>Swipe and tap a tutor below to audition their voice!</Text>
          </View>
        )}

        {/* Section Label: Horizontal Swipeable Tutor Carousel */}
        <View style={styles.carouselHeaderRow}>
          <Text style={styles.carouselTitle}>አስተማሪዎን ይምረጡ</Text>
          <Pressable onPress={handleRandomize} style={styles.shuffleChip}>
            <Ionicons name="shuffle" size={14} color="#FFFFFF" />
            <Text style={styles.shuffleText}>🎲 አስገራሚ</Text>
          </Pressable>
        </View>

        {/* Horizontal Swipeable Tutors List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalTutorsList}
        >
          {VOICE_TUTORS.map((tutor) => {
            const isSelected = selectedTutor.id === tutor.id;
            return (
              <Pressable
                key={tutor.id}
                onPress={() => handleSelectTutor(tutor)}
                style={({ pressed }) => [
                  styles.tutorCard,
                  isSelected && {
                    borderColor: tutor.avatarColor,
                    backgroundColor: '#FFFFFF',
                    elevation: 6,
                  },
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                {/* Tutor Avatar Icon */}
                <View
                  style={[
                    styles.tutorCardIconCircle,
                    { backgroundColor: tutor.avatarColor },
                  ]}
                >
                  <Ionicons name={tutor.avatarIcon} size={28} color="#FFFFFF" />
                </View>

                <Text style={styles.tutorCardName}>{tutor.nameAmharic}</Text>
                <Text style={styles.tutorCardRole}>{tutor.titleAmharic}</Text>

                {/* Audition Button */}
                <View
                  style={[
                    styles.auditionPill,
                    isSelected && { backgroundColor: tutor.avatarColor },
                  ]}
                >
                  <Ionicons
                    name="volume-high"
                    size={14}
                    color={isSelected ? '#FFFFFF' : tutor.avatarColor}
                  />
                  <Text
                    style={[
                      styles.auditionPillText,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    ድምፅ ስማ 🔊
                  </Text>
                </View>

                {/* Active Checkmark Ring */}
                {isSelected && (
                  <View
                    style={[
                      styles.selectedBadge,
                      { backgroundColor: tutor.avatarColor },
                    ]}
                  >
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Action Button: Start Learning With Chosen Tutor */}
        <Pressable
          onPress={() => {
            stopCurrentAudio();
            router.push('/dashboard');
          }}
          style={({ pressed }) => [
            styles.startLessonBtn,
            {
              backgroundColor: selectedTutor.avatarColor,
              transform: [{ translateY: pressed ? 4 : 0 }],
            },
          ]}
        >
          <Ionicons name="rocket" size={20} color="#FFFFFF" />
          <Text style={styles.startLessonBtnText}>
            ከ{selectedTutor.nameAmharic} ጋር ትምህርት ጀምር 🚀
          </Text>
        </Pressable>

        {/* Voice Recognition / Chat Mic Row */}
        <View style={styles.chatSection}>
          <Pressable
            style={[
              styles.micBtn,
              { backgroundColor: isListening ? AppColors.error : selectedTutor.avatarColor },
            ]}
            onPress={toggleListening}
          >
            <Ionicons name={isListening ? 'mic' : 'mic-outline'} size={32} color="#FFFFFF" />
          </Pressable>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="መልዕክት ይጻፉ..."
              placeholderTextColor={AppColors.gray500}
              value={heardText === 'እያዳመጥኩ ነው...' ? '' : heardText}
              onChangeText={setHeardText}
              onSubmitEditing={() => {
                const msg = heardText;
                setHeardText('');
                askTutor(msg);
              }}
            />
            <Pressable
              style={[styles.send, { backgroundColor: selectedTutor.avatarColor }]}
              onPress={() => {
                const msg = heardText;
                setHeardText('');
                askTutor(msg);
              }}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: AppColors.navy,
  },
  infoBtn: {
    padding: 6,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1F2937',
    marginVertical: 12,
    textAlign: 'center',
  },
  avatarWrap: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  avatarInnerCircle: {
    width: 146,
    height: 146,
    borderRadius: 73,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    width: '100%',
    marginBottom: 16,
    elevation: 3,
  },
  bubbleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    textAlign: 'center',
    color: '#1F2937',
    lineHeight: 26,
  },
  speakingStatusRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.blue,
    marginBottom: 8,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 52,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  turnRow: {
    marginBottom: 16,
  },
  turnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  carouselHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  carouselTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1F2937',
  },
  shuffleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    elevation: 2,
  },
  shuffleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  horizontalTutorsList: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  tutorCard: {
    width: 125,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  tutorCardIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  tutorCardName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
  },
  tutorCardRole: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  auditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  auditionPillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: AppColors.purple,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#059669',
    marginBottom: 24,
    elevation: 4,
  },
  startLessonBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  chatSection: {
    width: '100%',
    alignItems: 'center',
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    elevation: 2,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
});
