import 'package:flutter/material.dart';
import '../../data/user_prefs.dart';
import 'auth/sign_in_screen.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final UserPrefs _prefs = UserPrefs();
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await _prefs.getAccessToken();
    final avatarId = await _prefs.getAvatarId();
    if (!mounted) return;
    if (token == null || token.isEmpty) {
      setState(() => isLoading = false);
      return;
    }
    Navigator.pushReplacementNamed(
      context,
      avatarId == null || avatarId.isEmpty ? '/welcome' : '/dashboard',
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return const SignInScreen();
  }
}
