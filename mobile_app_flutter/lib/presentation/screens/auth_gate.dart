import 'package:flutter/material.dart';
import '../../data/user_prefs.dart';
import 'auth/sign_in_screen.dart';
import 'dashboard_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final UserPrefs _prefs = UserPrefs();
  bool isLoading = true;
  bool familySetupComplete = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final setupComplete = await _prefs.isFamilySetupComplete();
    if (!mounted) return;
    setState(() {
      familySetupComplete = setupComplete;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return familySetupComplete
        ? const DashboardScreen()
        : const SignInScreen(destination: SignInDestination.kidDashboard);
  }
}
