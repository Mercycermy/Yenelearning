import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart';

class SpeechService {
  final FlutterTts _tts = FlutterTts();
  final SpeechToText _speech = SpeechToText();

  static const _locales = <String, String>{
    'english': 'en-US',
    'amharic': 'am-ET',
    'oromo': 'om-ET',
    'geez': 'am-ET',
  };

  String localeFor(String language) => _locales[language] ?? 'en-US';

  Future<bool> speak(String text, String language) async {
    await _tts.stop();
    final locale = localeFor(language);
    final available = await _tts.isLanguageAvailable(locale) == true;
    if (!available && language != 'geez') return false;
    await _tts.setLanguage(locale);
    await _tts.setSpeechRate(0.42);
    await _tts.setPitch(1.0);
    await _tts.awaitSpeakCompletion(true);
    await _tts.speak(text);
    return true;
  }

  Future<bool> listen({
    required String language,
    required void Function(String words, bool isFinal) onResult,
  }) async {
    final ready = await _speech.initialize();
    if (!ready) return false;
    await _tts.stop();
    await _speech.listen(
      onResult: (SpeechRecognitionResult result) =>
          onResult(result.recognizedWords, result.finalResult),
      listenOptions: SpeechListenOptions(
        localeId: localeFor(language),
        listenFor: const Duration(seconds: 12),
        pauseFor: const Duration(seconds: 3),
      ),
    );
    return true;
  }

  Future<void> stopListening() => _speech.stop();
  Future<void> dispose() async { await _speech.cancel(); await _tts.stop(); }
}
