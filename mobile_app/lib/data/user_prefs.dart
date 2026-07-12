import 'package:shared_preferences/shared_preferences.dart';

class UserPrefs {
  static const _languageKey = 'selected_language';
  static const _avatarIdKey = 'selected_avatar_id';
  static const _avatarNameKey = 'selected_avatar_name';
  static const _avatarImageKey = 'selected_avatar_image';
  static const _avatarTeachingStyleKey = 'selected_avatar_teaching_style';
  static const _avatarPersonalityKey = 'selected_avatar_personality';
  static const _avatarVoiceIdKey = 'selected_avatar_voice_id';
  static const _avatarSpeechRateKey = 'selected_avatar_speech_rate';
  static const _avatarPitchLevelKey = 'selected_avatar_pitch_level';
  static const _accessTokenKey = 'auth_access_token';
  static const _userJsonKey = 'auth_user_json';
  static const _familySetupKey = 'family_setup_complete';
  static const _learningFocusKey = 'parent_learning_focus';

  Future<void> saveLanguage(String language) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, language);
  }

  Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_languageKey) ?? 'amharic';
  }

  Future<void> saveAvatar({
    required String id,
    required String name,
    required String imageUrl,
    String? teachingStyle,
    String? personalityDescription,
    String? voiceId,
    double? speechRate,
    double? pitchLevel,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_avatarIdKey, id);
    await prefs.setString(_avatarNameKey, name);
    await prefs.setString(_avatarImageKey, imageUrl);
    if (teachingStyle != null) {
      await prefs.setString(_avatarTeachingStyleKey, teachingStyle);
    }
    if (personalityDescription != null) {
      await prefs.setString(_avatarPersonalityKey, personalityDescription);
    }
    if (voiceId != null) {
      await prefs.setString(_avatarVoiceIdKey, voiceId);
    }
    if (speechRate != null) {
      await prefs.setDouble(_avatarSpeechRateKey, speechRate);
    }
    if (pitchLevel != null) {
      await prefs.setDouble(_avatarPitchLevelKey, pitchLevel);
    }
  }

  Future<String?> getAvatarId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_avatarIdKey);
  }

  Future<String?> getAvatarName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_avatarNameKey);
  }

  Future<String?> getAvatarImage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_avatarImageKey);
  }

  Future<String?> getAvatarTeachingStyle() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_avatarTeachingStyleKey);
  }

  Future<String?> getAvatarPersonality() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_avatarPersonalityKey);
  }

  Future<String?> getAvatarVoiceId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_avatarVoiceIdKey);
  }

  Future<double?> getAvatarSpeechRate() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_avatarSpeechRateKey);
  }

  Future<double?> getAvatarPitchLevel() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_avatarPitchLevelKey);
  }

  Future<void> saveAuth({
    required String accessToken,
    required String userJson,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, accessToken);
    await prefs.setString(_userJsonKey, userJson);
  }

  Future<void> markFamilySetupComplete() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_familySetupKey, true);
  }

  Future<bool> isFamilySetupComplete() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_familySetupKey) ?? false;
  }

  Future<void> saveLearningFocus(String focus) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_learningFocusKey, focus);
  }

  Future<String> getLearningFocus() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_learningFocusKey) ?? 'Reading';
  }

  Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey);
  }

  Future<String?> getUserJson() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userJsonKey);
  }

  Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_userJsonKey);
  }
}
