import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
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
  String? pressedLanguage;

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

  String _formatTeachingStyle(String? value) {
    if (value == null || value.isEmpty) return 'Friendly tutor';
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
    _init();
  }

  Future<void> _init() async {
    await _loadData();
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
        errorMessage = null;
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
    await _prefs.saveAvatar(
      id: avatar.id,
      name: avatar.name,
      imageUrl: avatar.imageUrl,
      teachingStyle: avatar.teachingStyle,
      personalityDescription: avatar.personalityDescription,
      voiceId: avatar.voiceId,
      speechRate: avatar.speechRate,
      pitchLevel: avatar.pitchLevel,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.softMint, AppColors.white],
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
                                color: AppColors.softMint,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(
                                Icons.auto_awesome_rounded,
                                color: AppColors.navy,
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Yene Teacher',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        TextButton.icon(
                          onPressed: () =>
                              Navigator.pushNamed(context, '/parent'),
                          icon: const Icon(Icons.shield_rounded, size: 18),
                          label: const Text('Parent'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.navy.withValues(alpha: 0.08),
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
                                  style: Theme.of(context)
                                      .textTheme
                                      .displayLarge
                                      ?.copyWith(color: AppColors.navy),
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'Pick a buddy and a language to start learning and playing!',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: AppColors.gray500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          CircleAvatar(
                            radius: 34,
                            backgroundColor: AppColors.softMint,
                            child: const Icon(
                              Icons.favorite_rounded,
                              color: AppColors.accent,
                              size: 30,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '1. Pick a Buddy',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.refresh,
                            color: AppColors.blue,
                          ),
                          onPressed: () {
                            setState(() {
                              isLoading = true;
                              errorMessage = null;
                            });
                            _loadData();
                          },
                        ),
                      ],
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
                          child: Text(
                            errorMessage!,
                            style: const TextStyle(color: AppColors.error),
                          ),
                        ),
                      if (avatars.isNotEmpty)
                        Wrap(
                          spacing: 16,
                          runSpacing: 16,
                          children: avatars.asMap().entries.map((entry) {
                            final index = entry.key;
                            final avatar = entry.value;
                            final isSelected = selectedAvatar == avatar.id;
                            final accentColor = index % 2 == 0
                                ? AppColors.blue
                                : AppColors.yellow;
                            final cardColor = index % 2 == 0
                                ? AppColors.softBlue
                                : AppColors.softYellow;

                            return _BuddyCard(
                              avatar: avatar,
                              accentColor: accentColor,
                              cardColor: cardColor,
                              isSelected: isSelected,
                              onTap: () =>
                                  setState(() => selectedAvatar = avatar.id),
                              subtitle: _formatTeachingStyle(
                                avatar.teachingStyle,
                              ),
                            );
                          }).toList(),
                        ),
                    ],

                    const SizedBox(height: 24),

                    const Text(
                      '2. Pick a Language',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: languages.map((lang) {
                        final isSelected = selectedLanguage == lang['id'];
                        final isPressed = pressedLanguage == lang['id'];
                        return GestureDetector(
                          onTapDown: (_) =>
                              setState(() => pressedLanguage = lang['id']),
                          onTapUp: (_) =>
                              setState(() => pressedLanguage = null),
                          onTapCancel: () =>
                              setState(() => pressedLanguage = null),
                          onTap: () =>
                              setState(() => selectedLanguage = lang['id']),
                          child: AnimatedScale(
                            duration: const Duration(milliseconds: 120),
                            scale: isPressed ? 0.97 : 1,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 18,
                                vertical: 14,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.softMint
                                    : AppColors.white,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: isSelected
                                      ? AppColors.mint
                                      : AppColors.gray200,
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.navy.withValues(
                                      alpha: 0.08,
                                    ),
                                    blurRadius: 12,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    lang['name']!,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    lang['native']!,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.gray500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),
                    const Text(
                      'Parents can track learning progress anytime in Parent Mode.',
                      style: TextStyle(color: AppColors.gray500),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.accent, AppColors.orange],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accent.withValues(alpha: 0.4),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(22),
                          ),
                        ),
                        onPressed:
                            (selectedAvatar != null && selectedLanguage != null)
                            ? () async {
                                await _saveSelections();
                                if (!context.mounted) return;
                                Navigator.pushReplacementNamed(
                                  context,
                                  '/dashboard',
                                );
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

class _BuddyCard extends StatelessWidget {
  final AvatarItem avatar;
  final Color accentColor;
  final Color cardColor;
  final bool isSelected;
  final VoidCallback onTap;
  final String subtitle;

  const _BuddyCard({
    required this.avatar,
    required this.accentColor,
    required this.cardColor,
    required this.isSelected,
    required this.onTap,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 160,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? accentColor : Colors.transparent,
            width: 3,
          ),
          boxShadow: [
            BoxShadow(
              color: accentColor.withValues(alpha: 0.12),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: kIsWeb
                  ? Image.network(
                      avatar.imageUrl,
                      height: 90,
                      width: 90,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          Icon(Icons.person, size: 64, color: accentColor),
                    )
                  : CachedNetworkImage(
                      imageUrl: avatar.imageUrl,
                      height: 90,
                      width: 90,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const SizedBox(
                        height: 90,
                        width: 90,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      errorWidget: (context, url, error) =>
                          Icon(Icons.person, size: 64, color: accentColor),
                    ),
            ),
            const SizedBox(height: 10),
            Text(
              avatar.name,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: AppColors.gray500),
            ),
            const SizedBox(height: 8),
            if (isSelected)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: accentColor,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Text(
                  'Chosen',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
