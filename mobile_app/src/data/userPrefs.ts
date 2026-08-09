import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  language: 'selected_language',
  avatarId: 'selected_avatar_id',
  avatarName: 'selected_avatar_name',
  avatarImage: 'selected_avatar_image',
  avatarTeachingStyle: 'selected_avatar_teaching_style',
  avatarPersonality: 'selected_avatar_personality',
  avatarVoiceId: 'selected_avatar_voice_id',
  avatarSpeechRate: 'selected_avatar_speech_rate',
  avatarPitchLevel: 'selected_avatar_pitch_level',
  accessToken: 'auth_access_token',
  userJson: 'auth_user_json',
  familySetup: 'family_setup_complete',
  learningFocus: 'parent_learning_focus',
};

export const userPrefs = {
  async saveLanguage(language: string) {
    await AsyncStorage.setItem(KEYS.language, language);
  },

  async getLanguage() {
    return (await AsyncStorage.getItem(KEYS.language)) ?? 'amharic';
  },

  async saveAvatar(input: {
    id: string;
    name: string;
    imageUrl: string;
    teachingStyle?: string | null;
    personalityDescription?: string | null;
    voiceId?: string | null;
    speechRate?: number | null;
    pitchLevel?: number | null;
  }) {
    await AsyncStorage.multiSet([
      [KEYS.avatarId, input.id],
      [KEYS.avatarName, input.name],
      [KEYS.avatarImage, input.imageUrl],
    ]);
    if (input.teachingStyle != null) {
      await AsyncStorage.setItem(KEYS.avatarTeachingStyle, input.teachingStyle);
    }
    if (input.personalityDescription != null) {
      await AsyncStorage.setItem(KEYS.avatarPersonality, input.personalityDescription);
    }
    if (input.voiceId != null) {
      await AsyncStorage.setItem(KEYS.avatarVoiceId, input.voiceId);
    }
    if (input.speechRate != null) {
      await AsyncStorage.setItem(KEYS.avatarSpeechRate, String(input.speechRate));
    }
    if (input.pitchLevel != null) {
      await AsyncStorage.setItem(KEYS.avatarPitchLevel, String(input.pitchLevel));
    }
  },

  getAvatarId: () => AsyncStorage.getItem(KEYS.avatarId),
  getAvatarName: () => AsyncStorage.getItem(KEYS.avatarName),
  getAvatarImage: () => AsyncStorage.getItem(KEYS.avatarImage),
  getAvatarTeachingStyle: () => AsyncStorage.getItem(KEYS.avatarTeachingStyle),
  getAvatarPersonality: () => AsyncStorage.getItem(KEYS.avatarPersonality),
  getAvatarVoiceId: () => AsyncStorage.getItem(KEYS.avatarVoiceId),

  async getAvatarSpeechRate() {
    const value = await AsyncStorage.getItem(KEYS.avatarSpeechRate);
    return value == null ? null : Number(value);
  },

  async getAvatarPitchLevel() {
    const value = await AsyncStorage.getItem(KEYS.avatarPitchLevel);
    return value == null ? null : Number(value);
  },

  async saveAuth(accessToken: string, userJson: string) {
    await AsyncStorage.multiSet([
      [KEYS.accessToken, accessToken],
      [KEYS.userJson, userJson],
    ]);
  },

  async markFamilySetupComplete() {
    await AsyncStorage.setItem(KEYS.familySetup, 'true');
  },

  async isFamilySetupComplete() {
    return (await AsyncStorage.getItem(KEYS.familySetup)) === 'true';
  },

  async saveLearningFocus(focus: string) {
    await AsyncStorage.setItem(KEYS.learningFocus, focus);
  },

  async getLearningFocus() {
    return (await AsyncStorage.getItem(KEYS.learningFocus)) ?? 'Reading';
  },

  getAccessToken: () => AsyncStorage.getItem(KEYS.accessToken),
  getUserJson: () => AsyncStorage.getItem(KEYS.userJson),

  async clearAuth() {
    await AsyncStorage.multiRemove([KEYS.accessToken, KEYS.userJson]);
  },
};
