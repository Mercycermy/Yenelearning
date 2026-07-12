import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../data/user_prefs.dart';
import 'auth/sign_in_screen.dart';
import 'parent_dashboard_screen.dart';

class ParentGate extends StatefulWidget {
  const ParentGate({super.key});

  @override
  State<ParentGate> createState() => _ParentGateState();
}

class _ParentGateState extends State<ParentGate> {
  final UserPrefs _prefs = UserPrefs();
  bool loading = true;
  bool signedIn = false;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final token = await _prefs.getAccessToken();
    if (!mounted) return;
    setState(() {
      signedIn = token != null && token.isNotEmpty;
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF7F8FC),
        body: Center(child: CircularProgressIndicator(color: AppColors.purple)),
      );
    }
    return signedIn ? const ParentDashboardScreen() : const SignInScreen();
  }
}
