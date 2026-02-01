import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  final List<Map<String, dynamic>> activities = const [
    {
      'title': 'Learn Words',
      'subtitle': 'New words & sounds',
      'emoji': '🔤',
      'icon': Icons.abc_rounded,
      'color': AppColors.blue,
      'bgColor': AppColors.softBlue,
      'route': '/words',
    },
    {
      'title': 'Talk with Tutor',
      'subtitle': 'Practice speaking',
      'emoji': '🗣️',
      'icon': Icons.record_voice_over_rounded,
      'color': AppColors.purple,
      'bgColor': AppColors.softPurple,
      'route': '/tutor',
    },
    {
      'title': 'Stories',
      'subtitle': 'Read & listen',
      'emoji': '📚',
      'icon': Icons.auto_stories_rounded,
      'color': AppColors.green,
      'bgColor': AppColors.softGreen,
      'route': '/stories',
    },
    {
      'title': 'Games',
      'subtitle': 'Play & learn',
      'emoji': '🎮',
      'icon': Icons.videogame_asset_rounded,
      'color': AppColors.yellow,
      'bgColor': AppColors.softYellow,
      'route': '/games',
    },
    {
      'title': 'Knowledge',
      'subtitle': 'Fun facts',
      'emoji': '💡',
      'icon': Icons.lightbulb_rounded,
      'color': Colors.orange,
      'bgColor': Color(0xFFFFF3E0),
      'route': '/knowledge',
    },
  ];

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
                  colors: [AppColors.blue, AppColors.purple],
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
                  const CircleAvatar(
                    radius: 30,
                    backgroundImage: NetworkImage('https://api.dicebear.com/7.x/bottts/png?seed=Abebe'),
                    backgroundColor: AppColors.white,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hello, Learner!',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white),
                        ),
                        const SizedBox(height: 4),
                        const Text('Ready to learn today?', style: TextStyle(color: Colors.white70)),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Let’s explore!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(activity['emoji'], style: const TextStyle(fontSize: 22)),
                          ),
                          const SizedBox(height: 10),
                          Icon(
                            activity['icon'],
                            size: 36,
                            color: activity['color'],
                          ),
                          const SizedBox(height: 8),
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
                            style: const TextStyle(fontSize: 12, color: AppColors.gray500),
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(14),
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
