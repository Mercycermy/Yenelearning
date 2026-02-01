import 'package:shared_preferences/shared_preferences.dart';

class UserPrefs {
  static const _languageKey = 'selected_language';
  static const _avatarIdKey = 'selected_avatar_id';
  static const _avatarNameKey = 'selected_avatar_name';
  static const _avatarImageKey = 'selected_avatar_image';

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
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_avatarIdKey, id);
    await prefs.setString(_avatarNameKey, name);
    await prefs.setString(_avatarImageKey, imageUrl);
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
}
