import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class ParentDashboardScreen extends StatelessWidget {
  const ParentDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Dashboard'),
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.gray900,
        elevation: 0,
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
                  colors: [AppColors.teal, AppColors.blue],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.teal.withOpacity(0.25),
                    blurRadius: 14,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.family_restroom_rounded, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Parent Dashboard',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Track progress, set limits, and cheer them on!',
                          style: TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Child Profile Selector
            const Text(
              'Your Children',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _ChildProfileCard(name: 'Abebe', age: 6, isSelected: true),
                const SizedBox(width: 16),
                _ChildProfileAddButton(),
              ],
            ),
            
            const SizedBox(height: 32),
            
            // Progress Section
            const Text(
              'Learning Progress',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const _ProgressOverviewCard(),
            
            const SizedBox(height: 32),
            
            // Controls Section
            const Text(
              'Controls & Limits',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _SettingTile(
              icon: Icons.timer_rounded,
              title: 'Daily Time Limit',
              value: '30 Minutes',
              color: AppColors.blue,
            ),
            _SettingTile(
              icon: Icons.security_rounded,
              title: 'Content Filter',
              value: 'Strict',
              color: AppColors.green,
            ),
            _SettingTile(
              icon: Icons.trending_up_rounded,
              title: 'Difficulty Level',
              value: 'Beginner',
              color: AppColors.yellow,
            ),
          ],
        ),
      ),
    );
  }
}

class _ChildProfileCard extends StatelessWidget {
  final String name;
  final int age;
  final bool isSelected;

  const _ChildProfileCard({
    required this.name,
    required this.age,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.softSky : AppColors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isSelected ? AppColors.blue : AppColors.gray200,
          width: 2,
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
        children: [
          CircleAvatar(
            radius: 25,
            backgroundColor: AppColors.softBlue,
            child: Text(name[0], style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 8),
          Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('$age years old', style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
          const SizedBox(height: 8),
          if (isSelected)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.blue,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Active',
                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
    );
  }
}

class _ChildProfileAddButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.softYellow,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.yellow.withOpacity(0.3)),
      ),
      child: const Icon(Icons.add_rounded, color: AppColors.yellow),
    );
  }
}

class _ProgressOverviewCard extends StatelessWidget {
  const _ProgressOverviewCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.softGreen,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.green.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.insights_rounded, color: AppColors.green),
              ),
              const SizedBox(width: 10),
              const Text('This week', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(label: 'Words', value: '45', color: AppColors.blue),
              _StatItem(label: 'Accuracy', value: '82%', color: AppColors.green),
              _StatItem(label: 'Time', value: '1.5h', color: AppColors.yellow),
            ],
          ),
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Weekly Goal', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('75%', style: TextStyle(color: AppColors.green, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: 0.75,
            backgroundColor: AppColors.gray200,
            color: AppColors.green,
            minHeight: 10,
            borderRadius: BorderRadius.circular(5),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 14, color: AppColors.gray500)),
      ],
    );
  }
}

class _SettingTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _SettingTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.gray100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Text(value, style: const TextStyle(color: AppColors.gray500)),
          const Icon(Icons.chevron_right_rounded, color: AppColors.gray500),
        ],
      ),
    );
  }
}
