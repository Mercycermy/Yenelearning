import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
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

export default function TutorScreen() {
  const [isTutorSpeaking, setIsTutorSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('Hello! What is your name?');
  const [heardText, setHeardText] = useState('');
  const [language, setLanguage] = useState('amharic');
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [personality, setPersonality] = useState<string | null>(null);
  const [teachingStyle, setTeachingStyle] = useState<string | null>(null);

  async function speakTutor(text: string) {
    setIsTutorSpeaking(true);
    const available = await speechService.speak(text, language);
    setIsTutorSpeaking(false);
    if (!available) {
      Alert.alert(
        'Voice',
        'This language voice is not installed. The tutor response is shown as text.',
      );
    }
  }

  useEffect(() => {
    (async () => {
      const [name, image, person, style, lang] = await Promise.all([
        userPrefs.getAvatarName(),
        userPrefs.getAvatarImage(),
        userPrefs.getAvatarPersonality(),
        userPrefs.getAvatarTeachingStyle(),
        userPrefs.getLanguage(),
      ]);
      setAvatarName(name);
      setAvatarImageUrl(image);
      setPersonality(person);
      setTeachingStyle(style);
      setLanguage(lang);
      await speakTutor('Hello! What is your name?');
    })();
    return () => speechService.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function askTutor(message: string) {
    if (!message.trim() || isThinking || isTutorSpeaking) return;
    setIsThinking(true);
    try {
      const reply = await aiRepository.chat(message.trim(), language);
      setCurrentQuestion(reply);
      setIsThinking(false);
      await speakTutor(reply);
    } catch {
      setIsThinking(false);
      setCurrentQuestion(
        'I could not reach the AI tutor. Please check the backend and HF_ACCESS_TOKEN.',
      );
    }
  }

  function showInfo() {
    const lines = [
      teachingStyle?.replaceAll('_', ' '),
      personality,
    ].filter(Boolean);
    Alert.alert('Tutor Info', lines.join('\n') || 'Your friendly learning buddy.');
  }

  const [isListening, setIsListening] = useState(false);

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
          askTutor(words.trim());
        }
      }
    });
    if (!started) {
      setIsListening(false);
      setHeardText('Speech recognition is unavailable.');
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.info} onPress={showInfo}>
        <Ionicons name="information-circle-outline" size={24} color={AppColors.navy} />
      </Pressable>

      <Text style={styles.title}>
        {avatarName ? `Talk with ${avatarName}` : 'Talk with Tutor'}
      </Text>

      <View style={styles.avatarWrap}>
        {avatarImageUrl ? (
          <Image source={{ uri: avatarImageUrl }} style={styles.avatar} />
        ) : (
          <Ionicons name="person" size={100} color={AppColors.blue} />
        )}
      </View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{currentQuestion}</Text>
      </View>

      {heardText ? <Text style={styles.heard}>{heardText}</Text> : null}

      {isTutorSpeaking || isThinking ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.status}>
            {isThinking ? 'Tutor is thinking...' : 'Tutor is speaking...'}
          </Text>
          <View style={styles.waveRow}>
            {[18, 32, 46, 28, 40, 24, 36].map((h, i) => (
              <View key={i} style={[styles.bar, { height: h }]} />
            ))}
          </View>
        </View>
      ) : (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={styles.turn}>
            {isListening ? 'Listening... tap mic to stop' : 'Your turn! Tap mic or type to speak'}
          </Text>

          <Pressable
            style={[styles.micBtn, { backgroundColor: isListening ? AppColors.error : AppColors.green }]}
            onPress={toggleListening}
          >
            <Ionicons name={isListening ? 'mic' : 'mic-outline'} size={36} color="#fff" />
          </Pressable>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Or type a message..."
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
              style={styles.send}
              onPress={() => {
                const msg = heardText;
                setHeardText('');
                askTutor(msg);
              }}
            >
              <Ionicons name="send" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  info: { position: 'absolute', top: 16, right: 16 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 18, marginBottom: 20 },
  avatarWrap: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: AppColors.blue,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 32,
  },
  avatar: { width: '100%', height: '100%' },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 28,
    width: '100%',
  },
  bubbleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    textAlign: 'center',
    color: AppColors.gray900,
  },
  heard: { fontFamily: 'Poppins_400Regular', fontSize: 16, marginBottom: 12 },
  status: { color: AppColors.blue, fontFamily: 'Poppins_700Bold', marginBottom: 12 },
  waveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bar: {
    width: 10,
    borderRadius: 6,
    backgroundColor: AppColors.purple,
  },
  turn: { color: AppColors.green, fontFamily: 'Poppins_600SemiBold', marginBottom: 12 },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  inputRow: { flexDirection: 'row', width: '100%', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

