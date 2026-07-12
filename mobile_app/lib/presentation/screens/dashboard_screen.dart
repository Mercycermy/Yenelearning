import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
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

  static const languages = [
    {'id': 'amharic', 'name': 'Amharic', 'native': 'አማርኛ'},
    {'id': 'geez', 'name': "Ge'ez", 'native': 'ግዕዝ'},
    {'id': 'english', 'name': 'English', 'native': 'English'},
  ];

  static const activities = [
    _Activity(
      'Learn Words',
      'Build your word power',
      Icons.abc_rounded,
      AppColors.blue,
      AppColors.softBlue,
      '/words',
      '5 min',
    ),
    _Activity(
      'Talk with Tutor',
      'Say it out loud',
      Icons.mic_rounded,
      AppColors.purple,
      AppColors.softPurple,
      '/tutor',
      'Live',
    ),
    _Activity(
      'Story Time',
      'Read a little adventure',
      Icons.auto_stories_rounded,
      AppColors.green,
      AppColors.softGreen,
      '/stories',
      '3 new',
    ),
    _Activity(
      'Play Games',
      'Win stars while learning',
      Icons.sports_esports_rounded,
      AppColors.yellow,
      AppColors.softYellow,
      '/games',
      '+20 ★',
    ),
    _Activity(
      'Wonder Lab',
      'Discover amazing facts',
      Icons.lightbulb_rounded,
      AppColors.orange,
      AppColors.softOrange,
      '/knowledge',
      'Explore',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final values = await Future.wait([
      _prefs.getAvatarImage(),
      _prefs.getAvatarName(),
      _prefs.getLanguage(),
    ]);
    if (!mounted) return;
    setState(() {
      avatarImageUrl = values[0];
      avatarName = values[1];
      language = values[2];
    });
  }

  Future<void> _updateLanguage(String value) async {
    await _prefs.saveLanguage(value);
    if (!mounted) return;
    setState(() => language = value);
    final label = languages.firstWhere((item) => item['id'] == value)['name'];
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          content: Row(
            children: [
              const Icon(Icons.celebration_rounded, color: Colors.white),
              const SizedBox(width: 10),
              Text('$label selected. Let’s learn!'),
            ],
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FBFF),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF8FBFF),
        centerTitle: false,
        title: const Row(
          children: [_BrandMark(), SizedBox(width: 10), Text('Yene Teacher')],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: FilledButton.tonalIcon(
              onPressed: () => Navigator.pushNamed(context, '/parent'),
              icon: const Icon(Icons.family_restroom_rounded, size: 19),
              label: const Text('Parents'),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final maxWidth = constraints.maxWidth > 880
              ? 880.0
              : constraints.maxWidth;
          final columns = constraints.maxWidth >= 760 ? 3 : 2;
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 32),
            child: Align(
              alignment: Alignment.topCenter,
              child: SizedBox(
                width: maxWidth,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _WelcomeHero(
                      avatarImageUrl: avatarImageUrl,
                      avatarName: avatarName,
                      onContinue: () => Navigator.pushNamed(context, '/words'),
                    ),
                    const SizedBox(height: 18),
                    const _DailyMission(),
                    const SizedBox(height: 26),
                    _SectionHeader(
                      title: 'Pick your language',
                      subtitle: 'You can switch any time',
                      icon: Icons.translate_rounded,
                    ),
                    const SizedBox(height: 12),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: languages
                            .map(
                              (item) => Padding(
                                padding: const EdgeInsets.only(right: 10),
                                child: _LanguageChip(
                                  title: item['name']!,
                                  subtitle: item['native']!,
                                  selected: language == item['id'],
                                  onTap: () => _updateLanguage(item['id']!),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 28),
                    _SectionHeader(
                      title: 'Choose an adventure',
                      subtitle: 'Every activity earns stars',
                      icon: Icons.explore_rounded,
                    ),
                    const SizedBox(height: 14),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: activities.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: columns,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        childAspectRatio: columns == 3 ? 1.04 : .86,
                      ),
                      itemBuilder: (context, index) => _ActivityCard(
                        activity: activities[index],
                        onTap: () => Navigator.pushNamed(
                          context,
                          activities[index].route,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _BrandMark extends StatelessWidget {
  const _BrandMark();
  @override
  Widget build(BuildContext context) => Container(
    width: 38,
    height: 38,
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        colors: [AppColors.purple, AppColors.blue],
      ),
      borderRadius: BorderRadius.circular(13),
    ),
    child: const Icon(
      Icons.auto_awesome_rounded,
      color: Colors.white,
      size: 21,
    ),
  );
}

class _WelcomeHero extends StatelessWidget {
  final String? avatarImageUrl;
  final String? avatarName;
  final VoidCallback onContinue;
  const _WelcomeHero({
    this.avatarImageUrl,
    this.avatarName,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        colors: [Color(0xFF6758E8), Color(0xFF4A90E2), Color(0xFF3DDC97)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(30),
      boxShadow: [
        BoxShadow(
          color: AppColors.blue.withValues(alpha: .22),
          blurRadius: 24,
          offset: const Offset(0, 12),
        ),
      ],
    ),
    child: Stack(
      children: [
        const Positioned(right: -18, top: -28, child: _Bubble(size: 96)),
        const Positioned(left: 130, bottom: -34, child: _Bubble(size: 68)),
        Row(
          children: [
            Hero(
              tag: 'tutor-avatar',
              child: _Avatar(imageUrl: avatarImageUrl),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hi, ${avatarName ?? 'Superstar'}! 👋',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Your tutor saved a fun lesson for you.',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      const _RewardPill(
                        icon: Icons.local_fire_department_rounded,
                        label: '3 day streak',
                      ),
                      const _RewardPill(
                        icon: Icons.star_rounded,
                        label: '120 stars',
                      ),
                      FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.navy,
                          visualDensity: VisualDensity.compact,
                        ),
                        onPressed: onContinue,
                        icon: const Icon(Icons.play_arrow_rounded),
                        label: const Text('Continue'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

class _Avatar extends StatelessWidget {
  final String? imageUrl;
  const _Avatar({this.imageUrl});
  @override
  Widget build(BuildContext context) => Container(
    width: 82,
    height: 82,
    padding: const EdgeInsets.all(5),
    decoration: const BoxDecoration(
      color: Colors.white,
      shape: BoxShape.circle,
    ),
    child: ClipOval(
      child: imageUrl == null
          ? const ColoredBox(
              color: AppColors.softYellow,
              child: Icon(
                Icons.face_rounded,
                color: AppColors.orange,
                size: 48,
              ),
            )
          : kIsWeb
          ? Image.network(
              imageUrl!,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const Icon(
                Icons.face_rounded,
                color: AppColors.blue,
                size: 48,
              ),
            )
          : CachedNetworkImage(
              imageUrl: imageUrl!,
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => const Icon(
                Icons.face_rounded,
                color: AppColors.blue,
                size: 48,
              ),
            ),
    ),
  );
}

class _Bubble extends StatelessWidget {
  final double size;
  const _Bubble({required this.size});
  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: .11),
      shape: BoxShape.circle,
    ),
  );
}

class _RewardPill extends StatelessWidget {
  final IconData icon;
  final String label;
  const _RewardPill({required this.icon, required this.label});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: .18),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: Colors.white24),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppColors.softYellow, size: 16),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
      ],
    ),
  );
}

class _DailyMission extends StatelessWidget {
  const _DailyMission();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: const Color(0xFFE8EDF5)),
    ),
    child: Row(
      children: [
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: AppColors.softYellow,
            borderRadius: BorderRadius.circular(18),
          ),
          child: const Icon(
            Icons.emoji_events_rounded,
            color: AppColors.yellow,
            size: 31,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Today’s mission',
                    style: TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    '2 of 3',
                    style: TextStyle(
                      color: AppColors.purple,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 7),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: const LinearProgressIndicator(
                  value: .67,
                  minHeight: 9,
                  color: AppColors.purple,
                  backgroundColor: AppColors.softPurple,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'One more activity unlocks a surprise badge!',
                style: TextStyle(fontSize: 12, color: AppColors.gray500),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  const _SectionHeader({
    required this.title,
    required this.subtitle,
    required this.icon,
  });
  @override
  Widget build(BuildContext context) => Row(
    children: [
      Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.softPurple,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: AppColors.purple, size: 20),
      ),
      const SizedBox(width: 10),
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
            ),
            Text(
              subtitle,
              style: const TextStyle(color: AppColors.gray500, fontSize: 12),
            ),
          ],
        ),
      ),
    ],
  );
}

class _LanguageChip extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;
  const _LanguageChip({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) => ChoiceChip(
    selected: selected,
    onSelected: (_) => onTap(),
    avatar: CircleAvatar(
      backgroundColor: selected ? Colors.white : AppColors.softBlue,
      child: Text(
        title.characters.first,
        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
      ),
    ),
    label: Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Text('$title  ·  $subtitle'),
    ),
    selectedColor: AppColors.mint,
    side: BorderSide(color: selected ? AppColors.teal : AppColors.gray200),
  );
}

class _ActivityCard extends StatefulWidget {
  final _Activity activity;
  final VoidCallback onTap;
  const _ActivityCard({required this.activity, required this.onTap});
  @override
  State<_ActivityCard> createState() => _ActivityCardState();
}

class _ActivityCardState extends State<_ActivityCard> {
  bool pressed = false;
  @override
  Widget build(BuildContext context) {
    final item = widget.activity;
    return AnimatedScale(
      scale: pressed ? .96 : 1,
      duration: const Duration(milliseconds: 120),
      child: Material(
        color: item.background,
        borderRadius: BorderRadius.circular(26),
        child: InkWell(
          borderRadius: BorderRadius.circular(26),
          onHighlightChanged: (value) => setState(() => pressed = value),
          onTap: widget.onTap,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(26),
              border: Border.all(
                color: item.color.withValues(alpha: .18),
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: item.color.withValues(alpha: .15),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: Icon(item.icon, color: item.color, size: 30),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 9,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: .8),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        item.badge,
                        style: TextStyle(
                          color: item.color,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.subtitle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.gray500,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Text(
                      'Let’s go',
                      style: TextStyle(
                        color: item.color,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.arrow_forward_rounded,
                      color: item.color,
                      size: 16,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Activity {
  final String title, subtitle, route, badge;
  final IconData icon;
  final Color color, background;
  const _Activity(
    this.title,
    this.subtitle,
    this.icon,
    this.color,
    this.background,
    this.route,
    this.badge,
  );
}
