import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  String? selectedAvatar;
  String? selectedLanguage;

  final List<Map<String, String>> avatars = [
    {'id': 'tutor_1', 'name': 'Abebe', 'image': 'https://api.dicebear.com/7.x/bottts/png?seed=Abebe'},
    {'id': 'tutor_2', 'name': 'Chala', 'image': 'https://api.dicebear.com/7.x/bottts/png?seed=Chala'},
    {'id': 'tutor_3', 'name': 'Sara', 'image': 'https://api.dicebear.com/7.x/bottts/png?seed=Sara'},
  ];

  final List<Map<String, String>> languages = [
    {'id': 'amharic', 'name': 'Amharic', 'native': 'አማርኛ'},
    {'id': 'geez', 'name': 'Ge\'ez', 'native': 'ግዕዝ'},
    {'id': 'english', 'name': 'English', 'native': 'English'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Text(
                'Welcome to\nYene Teacher!',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: AppColors.blue,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Choose your tutor and language to start learning!',
                style: TextStyle(fontSize: 18, color: AppColors.gray500),
              ),
              const SizedBox(height: 40),
              
              // Avatar Selection
              const Text(
                '1. Pick a Friend',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 120,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: avatars.length,
                  itemBuilder: (context, index) {
                    final avatar = avatars[index];
                    final isSelected = selectedAvatar == avatar['id'];
                    return GestureDetector(
                      onTap: () => setState(() => selectedAvatar = avatar['id']),
                      child: Container(
                        width: 100,
                        margin: const EdgeInsets.only(right: 16),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.softBlue : AppColors.gray100,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.blue : Colors.transparent,
                            width: 3,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.network(avatar['image']!, height: 60),
                            const SizedBox(height: 8),
                            Text(avatar['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Language Selection
              const Text(
                '2. Pick a Language',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  itemCount: languages.length,
                  itemBuilder: (context, index) {
                    final lang = languages[index];
                    final isSelected = selectedLanguage == lang['id'];
                    return GestureDetector(
                      onTap: () => setState(() => selectedLanguage = lang['id']),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.softGreen : AppColors.gray100,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.green : Colors.transparent,
                            width: 3,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              lang['name']!,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              lang['native']!,
                              style: const TextStyle(fontSize: 18, color: AppColors.gray500),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              // Start Button
              ElevatedButton(
                onPressed: (selectedAvatar != null && selectedLanguage != null)
                    ? () {
                        // Navigate to Dashboard
                        Navigator.pushReplacementNamed(context, '/dashboard');
                      }
                    : null,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Let\'s Play!'),
                    SizedBox(width: 8),
                    Icon(Icons.play_arrow_rounded),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
