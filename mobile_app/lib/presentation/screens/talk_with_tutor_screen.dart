import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../data/user_prefs.dart';

class TalkWithTutorScreen extends StatefulWidget {
  const TalkWithTutorScreen({super.key});

  @override
  State<TalkWithTutorScreen> createState() => _TalkWithTutorScreenState();
}

class _TalkWithTutorScreenState extends State<TalkWithTutorScreen> {
  bool isTutorSpeaking = true;
  String currentQuestion = 'Hello! What is your name?';
  final UserPrefs _prefs = UserPrefs();
  String? avatarName;
  String? avatarImageUrl;
  String? personalityDescription;
  String? teachingStyle;

  String _formatTeachingStyle(String? value) {
    if (value == null || value.isEmpty) return '';
    return value
        .replaceAll('_', ' ')
        .split(' ')
        .map(
          (word) => word.isEmpty
              ? word
              : '${word[0].toUpperCase()}${word.substring(1)}',
        )
        .join(' ');
  }

  @override
  void initState() {
    super.initState();
    _loadTutorPrefs();
  }

  Future<void> _loadTutorPrefs() async {
    final name = await _prefs.getAvatarName();
    final image = await _prefs.getAvatarImage();
    final personality = await _prefs.getAvatarPersonality();
    final style = await _prefs.getAvatarTeachingStyle();
    if (!mounted) return;
    setState(() {
      avatarName = name;
      avatarImageUrl = image;
      personalityDescription = personality;
      teachingStyle = style;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.softBlue,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
          avatarName == null ? 'Talk with Tutor' : 'Talk with ${avatarName!}',
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline_rounded),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Tutor Info'),
                  content: Text(
                    [
                      if ((teachingStyle ?? '').isNotEmpty)
                        _formatTeachingStyle(teachingStyle),
                      if ((personalityDescription ?? '').isNotEmpty)
                        personalityDescription!,
                    ].join('\n'),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
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
                  child: avatarImageUrl == null
                      ? const Icon(
                          Icons.person,
                          size: 120,
                          color: AppColors.blue,
                        )
                      : Image.network(
                          avatarImageUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                                Icons.person,
                                size: 120,
                                color: AppColors.blue,
                              ),
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
                    Text(
                      'Tutor is speaking...',
                      style: TextStyle(
                        color: AppColors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 20),
                    _SoundWaveWidget(),
                  ],
                )
              else
                Column(
                  children: [
                    const Text(
                      'Your turn! Tap to speak',
                      style: TextStyle(color: AppColors.green),
                    ),
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
                        child: const Icon(
                          Icons.mic_rounded,
                          size: 48,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 40),

              // Temporary Toggle for Demo
              TextButton(
                onPressed: () =>
                    setState(() => isTutorSpeaking = !isTutorSpeaking),
                child: Text(
                  isTutorSpeaking ? 'Switch to Me' : 'Switch to Tutor',
                ),
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
      children: List.generate(7, (index) {
        final height = 18 + (index % 4 * 14).toDouble();
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: 10,
          height: height,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.blue, AppColors.purple, AppColors.pink],
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
            ),
            borderRadius: BorderRadius.circular(6),
            boxShadow: [
              BoxShadow(color: AppColors.blue.withOpacity(0.2), blurRadius: 8),
            ],
          ),
        );
      }),
    );
  }
}
