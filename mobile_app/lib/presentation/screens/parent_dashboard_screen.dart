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
        color: isSelected ? AppColors.softBlue : AppColors.gray100,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isSelected ? AppColors.blue : Colors.transparent,
          width: 2,
        ),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 25,
            backgroundColor: AppColors.blue.withOpacity(0.2),
            child: Text(name[0], style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 8),
          Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('$age years old', style: const TextStyle(fontSize: 12, color: AppColors.gray500)),
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
        color: AppColors.gray100,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.gray200, style: BorderStyle.none),
      ),
      child: const Icon(Icons.add_rounded, color: AppColors.gray500),
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
        color: AppColors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
        ],
      ),
      child: Column(
        children: [
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
