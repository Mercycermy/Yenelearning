import 'dart:convert';
import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../data/user_prefs.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> {
  final UserPrefs _prefs = UserPrefs();
  String parentName = 'Parent';
  int dailyMinutes = 30;
  bool contentFilter = true;
  bool learningReminders = true;

  @override
  void initState() {
    super.initState();
    _loadParent();
  }

  Future<void> _loadParent() async {
    final rawUser = await _prefs.getUserJson();
    if (rawUser == null || !mounted) return;
    try {
      final user = jsonDecode(rawUser) as Map<String, dynamic>;
      final firstName = (user['firstName'] as String?)?.trim();
      if (firstName != null && firstName.isNotEmpty) {
        setState(() => parentName = firstName);
      }
    } catch (_) {}
  }

  void _message(String text) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(behavior: SnackBarBehavior.floating, content: Text(text)),
      );
  }

  Future<void> _chooseTimeLimit() async {
    final selected = await showModalBottomSheet<int>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 4, 22, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Daily learning time',
                style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              const Text(
                'Choose a comfortable daily goal. You can change it any time.',
                style: TextStyle(color: AppColors.gray500),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [15, 20, 30, 45, 60]
                    .map(
                      (minutes) => ChoiceChip(
                        label: Text('$minutes min'),
                        selected: minutes == dailyMinutes,
                        onSelected: (_) => Navigator.pop(context, minutes),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
      ),
    );
    if (selected == null || !mounted) return;
    setState(() => dailyMinutes = selected);
    _message('Daily goal updated to $selected minutes.');
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        icon: const Icon(Icons.logout_rounded, color: AppColors.navy),
        title: const Text('Sign out of Parent Space?'),
        content: const Text(
          'You’ll return to kid mode. Learning progress and preferences stay on this device.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await _prefs.clearAuth();
    if (!mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, '/dashboard', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FC),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7F8FC),
        centerTitle: false,
        title: const Text('Parent space'),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => _message('You’re all caught up!'),
            icon: const Badge(child: Icon(Icons.notifications_none_rounded)),
          ),
          PopupMenuButton<String>(
            tooltip: 'Account menu',
            onSelected: (value) {
              if (value == 'logout') _logout();
            },
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout_rounded),
                    SizedBox(width: 10),
                    Text('Sign out'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 820;
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 32),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 980),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ParentHero(name: parentName),
                    const SizedBox(height: 18),
                    const _InsightBanner(),
                    const SizedBox(height: 26),
                    const _SectionTitle(
                      'Children',
                      'Select a profile to see their learning journey',
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 118,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          const _ChildCard(name: 'Abebe', age: 6, active: true),
                          const SizedBox(width: 12),
                          _AddChildCard(
                            onTap: () =>
                                _message('Child profile setup is coming next.'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 26),
                    if (wide)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Expanded(flex: 6, child: _ProgressCard()),
                          const SizedBox(width: 18),
                          Expanded(flex: 5, child: _controls()),
                        ],
                      )
                    else ...[
                      const _SectionTitle(
                        'Weekly progress',
                        'A quick look at Abebe’s learning',
                      ),
                      const SizedBox(height: 12),
                      const _ProgressCard(),
                      const SizedBox(height: 26),
                      _controls(),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _controls() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const _SectionTitle(
        'Healthy learning',
        'Simple controls for a balanced routine',
      ),
      const SizedBox(height: 12),
      _SettingTile(
        icon: Icons.timer_rounded,
        color: AppColors.blue,
        title: 'Daily time goal',
        subtitle: '$dailyMinutes minutes',
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: _chooseTimeLimit,
      ),
      _SettingTile(
        icon: Icons.shield_rounded,
        color: AppColors.green,
        title: 'Kid-safe content',
        subtitle: contentFilter
            ? 'Extra filtering is on'
            : 'Standard filtering',
        trailing: Switch(
          value: contentFilter,
          onChanged: (value) {
            setState(() => contentFilter = value);
            _message(
              value
                  ? 'Extra content filtering enabled.'
                  : 'Standard content filtering enabled.',
            );
          },
        ),
        onTap: () => setState(() => contentFilter = !contentFilter),
      ),
      _SettingTile(
        icon: Icons.notifications_active_rounded,
        color: AppColors.orange,
        title: 'Learning reminders',
        subtitle: learningReminders
            ? 'Weekdays at 4:00 PM'
            : 'Reminders are off',
        trailing: Switch(
          value: learningReminders,
          onChanged: (value) => setState(() => learningReminders = value),
        ),
        onTap: () => setState(() => learningReminders = !learningReminders),
      ),
    ],
  );
}

class _ParentHero extends StatelessWidget {
  final String name;
  const _ParentHero({required this.name});
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        colors: [Color(0xFF17233D), Color(0xFF34496E)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(28),
      boxShadow: [
        BoxShadow(
          color: AppColors.navy.withValues(alpha: .18),
          blurRadius: 22,
          offset: const Offset(0, 10),
        ),
      ],
    ),
    child: Row(
      children: [
        Container(
          width: 58,
          height: 58,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: .13),
            borderRadius: BorderRadius.circular(19),
          ),
          child: const Icon(
            Icons.family_restroom_rounded,
            color: AppColors.mint,
            size: 30,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Good afternoon, $name',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 21,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                'Abebe completed 2 activities today.',
                style: TextStyle(color: Colors.white70),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.mint.withValues(alpha: .16),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppColors.mint, size: 17),
              SizedBox(width: 6),
              Text(
                'On track',
                style: TextStyle(
                  color: AppColors.mint,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _InsightBanner extends StatelessWidget {
  const _InsightBanner();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(
      color: AppColors.softYellow,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: AppColors.yellow.withValues(alpha: .22)),
    ),
    child: const Row(
      children: [
        CircleAvatar(
          backgroundColor: Colors.white,
          child: Icon(Icons.lightbulb_rounded, color: AppColors.yellow),
        ),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'A little win worth celebrating',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              SizedBox(height: 3),
              Text(
                'Pronunciation accuracy improved by 8% this week.',
                style: TextStyle(color: AppColors.gray500, fontSize: 13),
              ),
            ],
          ),
        ),
        Icon(Icons.celebration_rounded, color: AppColors.orange),
      ],
    ),
  );
}

class _SectionTitle extends StatelessWidget {
  final String title, subtitle;
  const _SectionTitle(this.title, this.subtitle);
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        title,
        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
      ),
      const SizedBox(height: 2),
      Text(
        subtitle,
        style: const TextStyle(fontSize: 12, color: AppColors.gray500),
      ),
    ],
  );
}

class _ChildCard extends StatelessWidget {
  final String name;
  final int age;
  final bool active;
  const _ChildCard({
    required this.name,
    required this.age,
    this.active = false,
  });
  @override
  Widget build(BuildContext context) => Container(
    width: 220,
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      border: Border.all(
        color: active ? AppColors.blue : AppColors.gray200,
        width: active ? 2 : 1,
      ),
    ),
    child: Row(
      children: [
        const CircleAvatar(
          radius: 31,
          backgroundColor: AppColors.softBlue,
          child: Icon(Icons.face_rounded, color: AppColors.blue, size: 35),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
              Text(
                '$age years old',
                style: const TextStyle(color: AppColors.gray500, fontSize: 12),
              ),
              const SizedBox(height: 6),
              const FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.local_fire_department_rounded,
                      color: AppColors.orange,
                      size: 15,
                    ),
                    SizedBox(width: 3),
                    Text(
                      '3 day streak',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (active)
          const Icon(Icons.check_circle_rounded, color: AppColors.blue),
      ],
    ),
  );
}

class _AddChildCard extends StatelessWidget {
  final VoidCallback onTap;
  const _AddChildCard({required this.onTap});
  @override
  Widget build(BuildContext context) => Material(
    color: AppColors.softPurple,
    borderRadius: BorderRadius.circular(22),
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: const SizedBox(
        width: 130,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_circle_rounded, color: AppColors.purple, size: 30),
            SizedBox(height: 7),
            Text(
              'Add child',
              style: TextStyle(
                color: AppColors.purple,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      boxShadow: [
        BoxShadow(
          color: AppColors.navy.withValues(alpha: .05),
          blurRadius: 18,
          offset: const Offset(0, 8),
        ),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'This week',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
            ),
            _TrendPill(),
          ],
        ),
        const SizedBox(height: 18),
        const Row(
          children: [
            Expanded(
              child: _Metric(
                value: '45',
                label: 'Words',
                color: AppColors.blue,
              ),
            ),
            Expanded(
              child: _Metric(
                value: '82%',
                label: 'Accuracy',
                color: AppColors.green,
              ),
            ),
            Expanded(
              child: _Metric(
                value: '1.5h',
                label: 'Time',
                color: AppColors.orange,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        const SizedBox(height: 110, child: _ProgressChart()),
        const SizedBox(height: 16),
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Weekly goal', style: TextStyle(fontWeight: FontWeight.w700)),
            Text(
              '75%',
              style: TextStyle(
                color: AppColors.green,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: const LinearProgressIndicator(
            value: .75,
            minHeight: 10,
            backgroundColor: AppColors.softGreen,
            color: AppColors.green,
          ),
        ),
      ],
    ),
  );
}

class _TrendPill extends StatelessWidget {
  const _TrendPill();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
    decoration: BoxDecoration(
      color: AppColors.softGreen,
      borderRadius: BorderRadius.circular(12),
    ),
    child: const Row(
      children: [
        Icon(Icons.trending_up_rounded, size: 15, color: AppColors.green),
        SizedBox(width: 4),
        Text(
          '+12%',
          style: TextStyle(
            color: AppColors.green,
            fontWeight: FontWeight.w800,
            fontSize: 11,
          ),
        ),
      ],
    ),
  );
}

class _Metric extends StatelessWidget {
  final String value, label;
  final Color color;
  const _Metric({
    required this.value,
    required this.label,
    required this.color,
  });
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(
        value,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w800,
          fontSize: 22,
        ),
      ),
      Text(
        label,
        style: const TextStyle(color: AppColors.gray500, fontSize: 12),
      ),
    ],
  );
}

class _SettingTile extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title, subtitle;
  final Widget trailing;
  final VoidCallback onTap;
  const _SettingTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.trailing,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) => Card(
    color: Colors.white,
    margin: const EdgeInsets.only(bottom: 10),
    child: InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: .12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.gray500,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            trailing,
          ],
        ),
      ),
    ),
  );
}

class _ProgressChart extends StatelessWidget {
  const _ProgressChart();
  @override
  Widget build(BuildContext context) =>
      CustomPaint(painter: _ChartPainter(), child: const SizedBox.expand());
}

class _ChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final grid = Paint()
      ..color = AppColors.gray200
      ..strokeWidth = 1;
    for (var i = 1; i < 4; i++) {
      final y = size.height * i / 4;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }
    final points = [
      Offset(0, size.height * .78),
      Offset(size.width * .2, size.height * .6),
      Offset(size.width * .4, size.height * .66),
      Offset(size.width * .6, size.height * .34),
      Offset(size.width * .8, size.height * .43),
      Offset(size.width, size.height * .2),
    ];
    final path = Path()..moveTo(points.first.dx, points.first.dy);
    for (final point in points.skip(1)) {
      path.lineTo(point.dx, point.dy);
    }
    canvas.drawPath(
      path,
      Paint()
        ..color = AppColors.blue
        ..strokeWidth = 3
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round,
    );
    for (final point in points) {
      canvas.drawCircle(point, 4, Paint()..color = AppColors.blue);
      canvas.drawCircle(point, 2, Paint()..color = Colors.white);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
