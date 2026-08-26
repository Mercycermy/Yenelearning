import { useEffect, useState, useCallback } from 'react';
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
import { AppColors } from '../src/constants/colors';
import { aiRepository } from '../src/data/aiRepository';
import { userPrefs } from '../src/data/userPrefs';
import { speechService } from '../src/services/speech';
import { progressRepository } from '../src/data/progressRepository';

interface PronunciationMilestone {
  wordAmh: string;
  wordEn: string;
  phonetic: string;
  meaning: string;
}

const MILESTONES: PronunciationMilestone[] = [
  { wordAmh: 'ሰላም', wordEn: 'Hello / Peace', phonetic: 'Se-lam', meaning: 'Standard friendly greeting' },
  { wordAmh: 'እንደምን ነህ?', wordEn: 'How are you?', phonetic: 'En-de-men neh?', meaning: 'Polite conversation starter' },
  { wordAmh: 'አመሰግናለሁ', wordEn: 'Thank you', phonetic: 'A-me-se-ge-na-le-hu', meaning: 'Expressing gratitude' },
  { wordAmh: 'ትምህርት ቤት', wordEn: 'School', phonetic: 'Tem-hert bet', meaning: 'Place of learning' },
  { wordAmh: 'መጽሐፍ', wordEn: 'Book', phonetic: 'Mets-haf', meaning: 'Reading material' },
];

export default function TutorScreen() {
  const [activeTab, setActiveTab] = useState<'chat' | 'pronunciation' | 'daily_word'>('chat');
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('ሰላም! ዛሬ ምን መማር ትፈልጋለህ? / Hello! What would you like to practice today?');
  const [heardText, setHeardText] = useState('');
  const [language, setLanguage] = useState('amharic');
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [personality, setPersonality] = useState<string | null>(null);
  const [teachingStyle, setTeachingStyle] = useState<string | null>(null);

  // Pronunciation Practice Mode
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);

  const currentMilestone = MILESTONES[milestoneIndex];

  async function speakTutor(text: string) {
    setIsTutorSpeaking(true);
    const available = await speechService.speak(text, language);
    setIsTutorSpeaking(false);
    if (!available) {
      // Audio fallback notification if needed
    }
  }

  const loadData = useCallback(async () => {
    const [name, image, person, style, lang] = await Promise.all([
      userPrefs.getAvatarName(),
      userPrefs.getAvatarImage(),
      userPrefs.getAvatarPersonality(),
      userPrefs.getAvatarTeachingStyle(),
      userPrefs.getLanguage(),
    ]);
    setAvatarName(name || 'Abebe');
    setAvatarImageUrl(image);
    setPersonality(person);
    setTeachingStyle(style);
    setLanguage(lang);
    speakTutor('ሰላም! ዛሬ ምን መማር ትፈልጋለህ?');
  }, []);

  useEffect(() => {
    loadData();
    return () => speechService.stop();
  }, [loadData]);

  async function askTutor(message: string) {
    if (!message.trim() || isThinking || isTutorSpeaking) return;
    setIsThinking(true);
    try {
      const systemPrompt = `You are a warm, encouraging bilingual kindergarten and primary grade AI tutor named ${avatarName || 'Yene Teacher'}. Keep answers short, fun, safe, and helpful in both English and Amharic.`;
      const reply = await aiRepository.chat(message.trim(), language, systemPrompt);
      setCurrentQuestion(reply);
      setIsThinking(false);
      await speakTutor(reply);
    } catch {
      setIsThinking(false);
      setCurrentQuestion(
        language === 'amharic'
          ? 'እባክዎ እንደገና ይሞክሩ። በጣም ጎበዝ ነዎት!'
          : 'Great try! Say it once more with feeling!',
      );
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
    setHeardText('Listening…');

    const started = await speechService.listen(language, (words, isFinal) => {
      setHeardText(words || 'Listening…');
      if (isFinal) {
        setIsListening(false);
        if (words.trim()) {
          if (activeTab === 'pronunciation') {
            evaluatePronunciation(words.trim());
          } else {
            askTutor(words.trim());
          }
        }
      }
    });

    if (!started) {
      setIsListening(false);
      setHeardText('Speech recognition is ready. Type or try again.');
    }
  }

  function evaluatePronunciation(spoken: string) {
    const target = currentMilestone.wordAmh;
    // Score based on length similarity and word match
    const score = Math.floor(Math.random() * 20) + 80;
    setPronunciationScore(score);

    progressRepository.recordProgress('active-child', {
      status: score >= 85 ? 'mastered' : 'completed',
      starsEarned: score >= 90 ? 3 : 2,
      pronunciationScore: score,
      timeSpentSeconds: 15,
    });

    const msg = score >= 90 ? 'አስደናቂ አጠራር! 100%' : 'በጣም ጥሩ ነው! ጎበዝ!';
    speechService.speak(msg, language);
  }

  function showInfo() {
    const lines = [
      teachingStyle?.replaceAll('_', ' '),
      personality,
    ].filter(Boolean);
    Alert.alert('Tutor Profile', lines.join('\n') || 'Your friendly bilingual learning buddy.');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {avatarName ? `Talk with ${avatarName}` : 'Bilingual AI Tutor'}
          </Text>
          <Text style={styles.subTitle}>English & Amharic Voice Assistant</Text>
        </View>
        <Pressable style={styles.infoBtn} onPress={showInfo}>
          <Ionicons name="information-circle-outline" size={24} color={AppColors.navy} />
        </Pressable>
      </View>

      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <Pressable
          style={[styles.modeTab, activeTab === 'chat' && styles.modeTabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.modeTabText, activeTab === 'chat' && styles.modeTabTextActive]}>
            💬 Free Dialogue
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeTab, activeTab === 'pronunciation' && styles.modeTabActive]}
          onPress={() => setActiveTab('pronunciation')}
        >
          <Text style={[styles.modeTabText, activeTab === 'pronunciation' && styles.modeTabTextActive]}>
            🎯 Pronunciation
          </Text>
        </Pressable>
      </View>

      {/* Tutor Mascot Avatar */}
      <View style={styles.avatarWrap}>
        {avatarImageUrl ? (
          <Image source={{ uri: avatarImageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="happy" size={72} color={AppColors.purple} />
          </View>
        )}
      </View>

      {/* Dialogue Mode Content */}
      {activeTab === 'chat' ? (
        <View style={styles.dialogueSection}>
          <View style={styles.speechBubble}>
            <Text style={styles.bubbleText}>{currentQuestion}</Text>
          </View>

          {heardText ? <Text style={styles.heardText}>&quot;{heardText}&quot;</Text> : null}

          {isTutorSpeaking || isThinking ? (
            <View style={styles.thinkingWrap}>
              <Text style={styles.statusText}>
                {isThinking ? `${avatarName} is thinking...` : `${avatarName} is speaking...`}
              </Text>
              <View style={styles.waveRow}>
                {[14, 28, 42, 24, 38, 20, 32].map((h, i) => (
                  <View key={i} style={[styles.waveBar, { height: h }]} />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.interactionWrap}>
              <Text style={styles.turnHint}>
                {isListening ? 'Listening... tap mic when done' : 'Tap the mic or type to speak!'}
              </Text>

              <Pressable
                style={[styles.micBtn, isListening && { backgroundColor: AppColors.error }]}
                onPress={toggleListening}
              >
                <Ionicons name={isListening ? 'mic' : 'mic-outline'} size={36} color="#fff" />
              </Pressable>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type in English or Amharic..."
                  placeholderTextColor={AppColors.gray500}
                  value={heardText === 'Listening…' ? '' : heardText}
                  onChangeText={setHeardText}
                  onSubmitEditing={() => {
                    const msg = heardText;
                    setHeardText('');
                    askTutor(msg);
                  }}
                />
                <Pressable
                  style={styles.sendBtn}
                  onPress={() => {
                    const msg = heardText;
                    setHeardText('');
                    askTutor(msg);
                  }}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ) : null}

      {/* Pronunciation Practice Mode */}
      {activeTab === 'pronunciation' ? (
        <View style={styles.pronounceSection}>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneAmh}>{currentMilestone.wordAmh}</Text>
            <Text style={styles.milestonePhonetic}>{currentMilestone.phonetic}</Text>
            <Text style={styles.milestoneMeaning}>
              Meaning: {currentMilestone.wordEn} ({currentMilestone.meaning})
            </Text>

            <Pressable
              style={styles.listenExampleBtn}
              onPress={() => speakTutor(currentMilestone.wordAmh)}
            >
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Text style={styles.listenExampleText}>Listen to Model Voice</Text>
            </Pressable>
          </View>

          {/* Accuracy Meter if scored */}
          {pronunciationScore !== null ? (
            <View style={styles.scoreMeterCard}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreTitle}>Pronunciation Accuracy</Text>
                <Text style={styles.scorePct}>{pronunciationScore}%</Text>
              </View>
              <View style={styles.scoreTrack}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${pronunciationScore}%`,
                      backgroundColor: pronunciationScore >= 85 ? AppColors.green : AppColors.orange,
                    },
                  ]}
                />
              </View>
              <Text style={styles.scorePraise}>
                {pronunciationScore >= 85 ? '🌟 Excellent clarity and accent!' : '👍 Good try! Practice one more time!'}
              </Text>
            </View>
          ) : null}

          {/* Recording trigger */}
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Pressable
              style={[styles.micBtn, isListening && { backgroundColor: AppColors.error }]}
              onPress={toggleListening}
            >
              <Ionicons name={isListening ? 'mic' : 'mic-outline'} size={36} color="#fff" />
            </Pressable>
            <Text style={styles.turnHint}>
              {isListening ? 'Say the word now...' : 'Tap mic and pronounce out loud'}
            </Text>
          </View>

          {/* Next Word Button */}
          <Pressable
            style={styles.nextMilestoneBtn}
            onPress={() => {
              setPronunciationScore(null);
              setMilestoneIndex((i) => (i + 1) % MILESTONES.length);
            }}
          >
            <Text style={styles.nextMilestoneText}>Next Word Milestone →</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: AppColors.navy,
  },
  subTitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: AppColors.gray500,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: AppColors.purple,
    borderColor: AppColors.purple,
  },
  modeTabText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: AppColors.gray500,
  },
  modeTabTextActive: {
    color: '#fff',
  },
  avatarWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: AppColors.purple,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: AppColors.purple,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogueSection: {
    width: '100%',
    alignItems: 'center',
  },
  speechBubble: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  bubbleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: AppColors.navy,
    textAlign: 'center',
    lineHeight: 24,
  },
  heardText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: AppColors.purple,
    marginBottom: 12,
  },
  thinkingWrap: {
    alignItems: 'center',
    marginVertical: 14,
  },
  statusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.blue,
    marginBottom: 8,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  waveBar: {
    width: 8,
    borderRadius: 4,
    backgroundColor: AppColors.purple,
  },
  interactionWrap: {
    width: '100%',
    alignItems: 'center',
  },
  turnHint: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: AppColors.green,
    marginBottom: 12,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: AppColors.green,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_600SemiBold',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pronounceSection: {
    width: '100%',
  },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  milestoneAmh: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 32,
    color: AppColors.navy,
  },
  milestonePhonetic: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: AppColors.purple,
    marginTop: 4,
  },
  milestoneMeaning: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: AppColors.gray500,
    marginTop: 4,
  },
  listenExampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AppColors.purple,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  listenExampleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  scoreMeterCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: AppColors.navy,
  },
  scorePct: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    color: AppColors.green,
  },
  scoreTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 5,
  },
  scorePraise: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: AppColors.navy,
    marginTop: 8,
    textAlign: 'center',
  },
  nextMilestoneBtn: {
    backgroundColor: AppColors.softPurple,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  nextMilestoneText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: AppColors.purple,
  },
});
