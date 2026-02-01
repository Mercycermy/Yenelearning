import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  final List<Map<String, dynamic>> activities = const [
    {
      'title': 'Learn Words',
      'icon': Icons.abc_rounded,
      'color': AppColors.blue,
      'bgColor': AppColors.softBlue,
    },
    {
      'title': 'Talk with Tutor',
      'icon': Icons.record_voice_over_rounded,
      'color': AppColors.purple,
      'bgColor': AppColors.softPurple,
    },
    {
      'title': 'Stories',
      'icon': Icons.auto_stories_rounded,
      'color': AppColors.green,
      'bgColor': AppColors.softGreen,
    },
    {
      'title': 'Games',
      'icon': Icons.videogame_asset_rounded,
      'color': AppColors.yellow,
      'bgColor': AppColors.softYellow,
    },
    {
      'title': 'Knowledge',
      'icon': Icons.lightbulb_rounded,
      'color': Colors.orange,
      'bgColor': Color(0xFFFFF3E0),
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
            Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundImage: NetworkImage('https://api.dicebear.com/7.x/bottts/png?seed=Abebe'),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hello, Learner!',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const Text('Ready to learn today?'),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 32),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.9,
              ),
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final activity = activities[index];
                return GestureDetector(
                  onTap: () {
                    if (activity['title'] == 'Learn Words') {
                      Navigator.pushNamed(context, '/words');
                    } else if (activity['title'] == 'Talk with Tutor') {
                      Navigator.pushNamed(context, '/tutor');
                    } else if (activity['title'] == 'Stories') {
                      Navigator.pushNamed(context, '/stories');
                    }
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
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          activity['icon'],
                          size: 48,
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
                      ],
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
