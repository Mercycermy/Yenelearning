import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class TalkWithTutorScreen extends StatefulWidget {
  const TalkWithTutorScreen({super.key});

  @override
  State<TalkWithTutorScreen> createState() => _TalkWithTutorScreenState();
}

class _TalkWithTutorScreenState extends State<TalkWithTutorScreen> {
  bool isTutorSpeaking = true;
  String currentQuestion = 'Hello! What is your name?';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.softBlue,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Talk with Tutor'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Tutor Avatar
              Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  color: AppColors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.blue, width: 8),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.blue.withOpacity(0.2),
                      blurRadius: 30,
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Image.network(
                    'https://api.dicebear.com/7.x/bottts/png?seed=Abebe',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 48),
              
              // Speech Bubble
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: Text(
                  currentQuestion,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.gray900,
                  ),
                ),
              ),
              
              const SizedBox(height: 60),
              
              // Voice Indicator
              if (isTutorSpeaking)
                const Column(
                  children: [
                    Text('Tutor is speaking...', style: TextStyle(color: AppColors.blue)),
                    SizedBox(height: 16),
                    _SoundWaveWidget(),
                  ],
                )
              else
                Column(
                  children: [
                    const Text('Your turn! Tap to speak', style: TextStyle(color: AppColors.green)),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: () {
                        // Start recording
                      },
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: const BoxDecoration(
                          color: AppColors.green,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.mic_rounded, size: 48, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              
              const SizedBox(height: 40),
              
              // Temporary Toggle for Demo
              TextButton(
                onPressed: () => setState(() => isTutorSpeaking = !isTutorSpeaking),
                child: Text(isTutorSpeaking ? 'Switch to Me' : 'Switch to Tutor'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SoundWaveWidget extends StatelessWidget {
  const _SoundWaveWidget();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        width: 8,
        height: 20 + (index % 3 * 10).toDouble(),
        decoration: BoxDecoration(
          color: AppColors.blue,
          borderRadius: BorderRadius.circular(4),
        ),
      )),
    );
  }
}
