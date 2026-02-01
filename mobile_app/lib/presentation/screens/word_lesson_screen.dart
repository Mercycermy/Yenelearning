import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class WordLessonScreen extends StatefulWidget {
  const WordLessonScreen({super.key});

  @override
  State<WordLessonScreen> createState() => _WordLessonScreenState();
}

class _WordLessonScreenState extends State<WordLessonScreen> {
  int currentIndex = 0;
  bool isListening = false;

  final List<Map<String, String>> words = [
    {'word': 'አንበሳ', 'translation': 'Lion', 'image': 'https://api.dicebear.com/7.x/identicon/png?seed=Lion'},
    {'word': 'ዝሆን', 'translation': 'Elephant', 'image': 'https://api.dicebear.com/7.x/identicon/png?seed=Elephant'},
    {'word': 'ፈረስ', 'translation': 'Horse', 'image': 'https://api.dicebear.com/7.x/identicon/png?seed=Horse'},
  ];

  void _nextWord() {
    if (currentIndex < words.length - 1) {
      setState(() => currentIndex++);
    } else {
      // Finished lesson
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Great job! You finished the lesson!')),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final word = words[currentIndex];
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Learn Words'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.pop(context),
        ),
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
                    Image.network(word['image']!, height: 180),
                    const SizedBox(height: 40),
                    Text(
                      word['word']!,
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gray900,
                      ),
                    ),
                    Text(
                      word['translation']!,
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
