import 'package:flutter/material.dart';
import '../../data/user_prefs.dart';
import 'dashboard_screen.dart';
import 'welcome_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final UserPrefs _prefs = UserPrefs();
  bool isLoading = true;
  bool hasLearnerProfile = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final avatarId = await _prefs.getAvatarId();
    if (!mounted) return;
    setState(() {
      hasLearnerProfile = avatarId != null && avatarId.isNotEmpty;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return hasLearnerProfile ? const DashboardScreen() : const WelcomeScreen();
  }
}
