import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../data/user_prefs.dart';
import 'auth/sign_in_screen.dart';

class ParentGate extends StatefulWidget {
  const ParentGate({super.key});

  @override
  State<ParentGate> createState() => _ParentGateState();
}

class _ParentGateState extends State<ParentGate> {
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _prepareProtectedAccess();
  }

  Future<void> _prepareProtectedAccess() async {
    // Parent Space is intentionally locked on every visit. The account remains
    // set up for kid mode, but a fresh parent login is always required.
    await UserPrefs().clearAuth();
    if (!mounted) return;
    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF7F8FC),
        body: Center(child: CircularProgressIndicator(color: AppColors.purple)),
      );
    }
    return const SignInScreen(destination: SignInDestination.parentDashboard);
  }
}
