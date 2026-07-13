import 'api_client.dart';

class AiRepository {
  final ApiClient _client;
  AiRepository({ApiClient? client}) : _client = client ?? ApiClient();

  Future<String> chat({required String prompt, required String language}) async {
    final data = await _client.postJson('/ai/chat', {
      'prompt': prompt,
      'systemPrompt': 'You are a warm, safe language tutor for a child. Reply in $language using at most two short sentences, gently correct mistakes, then ask one easy follow-up question. Avoid adult, dangerous, personal-data, and frightening topics.',
    });
    final response = data['response'] ?? data['message'];
    if (response is! String || response.trim().isEmpty || response.startsWith('Mock Response')) {
      throw const AiUnavailableException();
    }
    return response.trim();
  }
}

class AiUnavailableException implements Exception {
  const AiUnavailableException();
}
