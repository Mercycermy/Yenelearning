import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/avatar_models.dart';
import '../../data/user_prefs.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  String? selectedAvatar;
  String? selectedLanguage;
  List<AvatarItem> avatars = [];
  bool isLoading = true;
  String? errorMessage;

  final ContentRepository _repository = ContentRepository();
  final UserPrefs _prefs = UserPrefs();

  final List<AvatarItem> fallbackAvatars = const [
    AvatarItem(
      id: 'fallback_1',
      name: 'Abebe',
      imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Abebe',
    ),
    AvatarItem(
      id: 'fallback_2',
      name: 'Chala',
      imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Chala',
    ),
    AvatarItem(
      id: 'fallback_3',
      name: 'Sara',
      imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Sara',
    ),
  ];

  final List<Map<String, String>> languages = [
    {'id': 'amharic', 'name': 'Amharic', 'native': 'አማርኛ'},
    {'id': 'geez', 'name': 'Ge\'ez', 'native': 'ግዕዝ'},
    {'id': 'english', 'name': 'English', 'native': 'English'},
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final language = await _prefs.getLanguage();
      final avatarId = await _prefs.getAvatarId();
      final data = await _repository.fetchAvatars();

      if (!mounted) return;
      setState(() {
        selectedLanguage = language;
        selectedAvatar = avatarId;
        avatars = data.isEmpty ? fallbackAvatars : data;
        isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load tutors. Using offline buddies.';
        avatars = fallbackAvatars;
      });
    }
  }

  Future<void> _saveSelections() async {
    final avatar = avatars.firstWhere((a) => a.id == selectedAvatar);
    await _prefs.saveLanguage(selectedLanguage!);
    await _prefs.saveAvatar(id: avatar.id, name: avatar.name, imageUrl: avatar.imageUrl);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.softSky, AppColors.white],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              Positioned(
                top: -40,
                right: -30,
                child: Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: AppColors.softPink,
                    borderRadius: BorderRadius.circular(80),
                  ),
                ),
              ),
              Positioned(
                bottom: 80,
                left: -20,
                child: Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    color: AppColors.softTeal,
                    borderRadius: BorderRadius.circular(70),
                  ),
                ),
              ),
              SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.softBlue,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(Icons.auto_awesome_rounded, color: AppColors.blue),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Yene Teacher',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        TextButton.icon(
                          onPressed: () => Navigator.pushNamed(context, '/parent'),
                          icon: const Icon(Icons.shield_rounded, size: 18),
                          label: const Text('Parent'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.blue.withOpacity(0.08),
                            blurRadius: 18,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Welcome to\nYene Teacher!',
                                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                    color: AppColors.blue,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'Pick a buddy and a language to start learning and playing!',
                                  style: TextStyle(fontSize: 16, color: AppColors.gray500),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          CircleAvatar(
                            radius: 34,
                            backgroundColor: AppColors.softYellow,
                            child: const Icon(Icons.emoji_emotions_rounded, color: AppColors.yellow, size: 30),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),

                    const Text(
                      '1. Pick a Buddy',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    if (isLoading)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else ...[
                      if (errorMessage != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Text(errorMessage!, style: const TextStyle(color: AppColors.error)),
                        ),
                      if (avatars.isNotEmpty)
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: avatars.map((avatar) {
                            final isSelected = selectedAvatar == avatar.id;
                            return GestureDetector(
                              onTap: () => setState(() => selectedAvatar = avatar.id),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                width: 120,
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.softBlue : AppColors.gray100,
                                  borderRadius: BorderRadius.circular(22),
                                  border: Border.all(
                                    color: isSelected ? AppColors.blue : Colors.transparent,
                                    width: 3,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.blue.withOpacity(0.08),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CachedNetworkImage(
                                      imageUrl: avatar.imageUrl,
                                      height: 64,
                                      placeholder: (context, url) => const SizedBox(
                                        height: 64,
                                        width: 64,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                      ),
                                      errorWidget: (context, url, error) => const Icon(Icons.person, size: 48),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      avatar.name,
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 6),
                                    if (isSelected)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppColors.blue,
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Text(
                                          'Chosen',
                                          style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                    ],

                    const SizedBox(height: 28),

                    const Text(
                      '2. Pick a Language',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: languages.map((lang) {
                        final isSelected = selectedLanguage == lang['id'];
                        return ChoiceChip(
                          selected: isSelected,
                          onSelected: (_) => setState(() => selectedLanguage = lang['id']),
                          label: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(lang['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 2),
                              Text(lang['native']!, style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
                            ],
                          ),
                          backgroundColor: AppColors.gray100,
                          selectedColor: AppColors.softGreen,
                          labelPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          side: BorderSide(
                            color: isSelected ? AppColors.green : Colors.transparent,
                            width: 2,
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 28),
                    const Text(
                      'Parents can track learning progress anytime in Parent Mode.',
                      style: TextStyle(color: AppColors.gray500),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.pink,
                        shadowColor: AppColors.pink.withOpacity(0.35),
                      ),
                      onPressed: (selectedAvatar != null && selectedLanguage != null)
                          ? () async {
                              await _saveSelections();
                              if (!mounted) return;
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
            ],
          ),
        ),
      ),
    );
  }
}
