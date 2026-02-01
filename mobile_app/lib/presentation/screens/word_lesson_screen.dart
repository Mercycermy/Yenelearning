import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/content_models.dart';
import '../../data/user_prefs.dart';

class WordLessonScreen extends StatefulWidget {
  const WordLessonScreen({super.key});

  @override
  State<WordLessonScreen> createState() => _WordLessonScreenState();
}

class _WordLessonScreenState extends State<WordLessonScreen> {
  int currentIndex = 0;
  bool isListening = false;
  final ContentRepository _repository = ContentRepository();
  final UserPrefs _prefs = UserPrefs();
  List<ContentListItem> words = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadWords();
  }

  Future<void> _loadWords() async {
    try {
      final language = await _prefs.getLanguage();
      final response = await _repository.fetchContentPaged(
        type: 'word',
        language: language,
        page: 1,
        pageSize: 50,
      );

      if (!mounted) return;
      setState(() {
        words = response.items;
        isLoading = false;
        currentIndex = 0;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load words.';
      });
    }
  }

  void _nextWord() {
    if (currentIndex < words.length - 1) {
      setState(() => currentIndex++);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Great job! You finished the lesson!')),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Learn Words'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (errorMessage != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Learn Words'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(errorMessage!, style: const TextStyle(color: AppColors.error)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadWords,
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (words.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Learn Words'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('No words available yet.'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadWords,
                  child: const Text('Refresh'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final word = words[currentIndex];
    final translation = (word.description ?? '').isNotEmpty ? word.description! : '...';
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learn Words'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadWords,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            // Progress Bar
            LinearProgressIndicator(
              value: (currentIndex + 1) / words.length,
              backgroundColor: AppColors.gray200,
              color: AppColors.green,
              minHeight: 12,
              borderRadius: BorderRadius.circular(10),
            ),
            const SizedBox(height: 40),
            
            // Flashcard
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(40),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (word.imageUrl != null && word.imageUrl!.isNotEmpty)
                      CachedNetworkImage(
                        imageUrl: word.imageUrl!,
                        height: 180,
                        placeholder: (context, url) => const SizedBox(
                          height: 100,
                          width: 100,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        errorWidget: (context, url, error) => const Icon(Icons.image, size: 80),
                      )
                    else
                      const Icon(Icons.image, size: 80, color: AppColors.gray500),
                    const SizedBox(height: 40),
                    Text(
                      word.title,
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gray900,
                      ),
                    ),
                    Text(
                      translation,
                      style: const TextStyle(
                        fontSize: 24,
                        color: AppColors.gray500,
                      ),
                    ),
                    const SizedBox(height: 30),
                    IconButton(
                      icon: const Icon(Icons.volume_up_rounded, size: 64, color: AppColors.blue),
                      onPressed: () {
                        // Play audio pronunciation
                      },
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Interaction Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _InteractionButton(
                  icon: isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                  label: 'Speak',
                  color: isListening ? AppColors.error : AppColors.blue,
                  onTap: () {
                    setState(() => isListening = !isListening);
                    // Start STT
                  },
                ),
                _InteractionButton(
                  icon: Icons.arrow_forward_rounded,
                  label: 'Next',
                  color: AppColors.green,
                  onTap: _nextWord,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InteractionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _InteractionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 40, color: color),
          ),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
