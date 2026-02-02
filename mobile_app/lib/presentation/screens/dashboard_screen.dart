import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/user_prefs.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final UserPrefs _prefs = UserPrefs();
  String? avatarImageUrl;
  String? avatarName;
  String? language;

  final List<Map<String, String>> languages = const [
    {'id': 'amharic', 'name': 'Amharic', 'native': 'አማርኛ'},
    {'id': 'geez', 'name': 'Ge\'ez', 'native': 'ግዕዝ'},
    {'id': 'english', 'name': 'English', 'native': 'English'},
  ];

  final List<Map<String, dynamic>> activities = const [
    {
      'title': 'Learn Words',
      'subtitle': 'New words & sounds',
      'icon': Icons.abc_rounded,
      'color': AppColors.blue,
      'bgColor': AppColors.softBlue,
      'route': '/words',
    },
    {
      'title': 'Talk with Tutor',
      'subtitle': 'Practice speaking',
      'icon': Icons.record_voice_over_rounded,
      'color': AppColors.purple,
      'bgColor': AppColors.softPurple,
      'route': '/tutor',
    },
    {
      'title': 'Stories',
      'subtitle': 'Read & listen',
      'icon': Icons.auto_stories_rounded,
      'color': AppColors.green,
      'bgColor': AppColors.softGreen,
      'route': '/stories',
    },
    {
      'title': 'Games',
      'subtitle': 'Play & learn',
      'icon': Icons.videogame_asset_rounded,
      'color': AppColors.yellow,
      'bgColor': AppColors.softYellow,
      'route': '/games',
    },
    {
      'title': 'Knowledge',
      'subtitle': 'Fun facts',
      'icon': Icons.lightbulb_rounded,
      'color': Colors.orange,
      'bgColor': Color(0xFFFFF3E0),
      'route': '/knowledge',
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final image = await _prefs.getAvatarImage();
    final name = await _prefs.getAvatarName();
    final selectedLanguage = await _prefs.getLanguage();

    if (!mounted) return;
    setState(() {
      avatarImageUrl = image;
      avatarName = name;
      language = selectedLanguage;
    });
  }

  Future<void> _updateLanguage(String value) async {
    await _prefs.saveLanguage(value);
    if (!mounted) return;
    setState(() {
      language = value;
    });
    final label = languages.firstWhere((lang) => lang['id'] == value, orElse: () => {'name': value})['name'] ?? value;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Language set to $label')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yene Teacher', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_pin_rounded, size: 32),
            onPressed: () {
              Navigator.pushNamed(context, '/parent');
            },
          ),
          const SizedBox(width: 10),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6C63FF), Color(0xFF38BDF8), Color(0xFF7EEAD2)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.blue.withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.white,
                    child: avatarImageUrl == null
                        ? const Icon(Icons.person, color: AppColors.blue)
                        : ClipOval(
                            child: kIsWeb
                                ? Image.network(
                                    avatarImageUrl!,
                                    width: 60,
                                    height: 60,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => const Icon(
                                      Icons.person,
                                      color: AppColors.blue,
                                    ),
                                  )
                                : CachedNetworkImage(
                                    imageUrl: avatarImageUrl!,
                                    width: 60,
                                    height: 60,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => const SizedBox(
                                      width: 40,
                                      height: 40,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    ),
                                    errorWidget: (context, url, error) => const Icon(Icons.person, color: AppColors.blue),
                                  ),
                          ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hello${avatarName != null ? ', $avatarName!' : ', Learner!'}',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          language == null ? 'Ready to learn today?' : 'Learning in ${language!}',
                          style: const TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            _HeaderBadge(label: 'Streak 3', icon: Icons.local_fire_department_rounded),
                            const SizedBox(width: 8),
                            _HeaderBadge(label: 'Coins 120', icon: Icons.star_rounded),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Choose a language', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: languages.map((lang) {
                final isSelected = language == lang['id'];
                return _LanguageChip(
                  title: lang['name']!,
                  subtitle: lang['native']!,
                  isSelected: isSelected,
                  onTap: () => _updateLanguage(lang['id']!),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                const Text('Let’s explore!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(width: 12),
                TextButton.icon(
                  onPressed: () => Navigator.pushNamed(context, '/parent'),
                  icon: const Icon(Icons.shield_rounded, size: 18),
                  label: const Text('Parent Mode'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final activity = activities[index];
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () {
                    Navigator.pushNamed(context, activity['route'] as String);
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: activity['bgColor'],
                      borderRadius: BorderRadius.circular(32),
                      boxShadow: [
                        BoxShadow(
                          color: activity['color'].withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            activity['icon'],
                            size: 44,
                            color: activity['color'],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            activity['title'],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: activity['color'],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            activity['subtitle'],
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 13, color: AppColors.gray500),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _HeaderBadge extends StatelessWidget {
  final String label;
  final IconData icon;

  const _HeaderBadge({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.35)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
        ],
      ),
    );
  }
}

class _LanguageChip extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _LanguageChip({
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.softMint : AppColors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: isSelected ? AppColors.mint : AppColors.gray200, width: 2),
          boxShadow: [
            BoxShadow(
              color: AppColors.navy.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
          ],
        ),
      ),
    );
  }
}
