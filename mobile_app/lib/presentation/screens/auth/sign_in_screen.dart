import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../core/app_colors.dart';
import '../../../data/auth_repository.dart';
import '../../../data/user_prefs.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final AuthRepository _authRepository = AuthRepository();
  final UserPrefs _prefs = UserPrefs();
  bool isLoading = false;
  String? errorMessage;
  bool isButtonPressed = false;

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await _authRepository.login(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      await _prefs.saveAuth(
        accessToken: response.accessToken,
        userJson: jsonEncode(response.user),
      );
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/welcome');
    } catch (error) {
      setState(() {
        errorMessage = 'Sign in failed. Please check your credentials.';
      });
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.softMint,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              _MascotHeader(),
              const SizedBox(height: 24),
              Text(
                'Learning Progress',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: AppColors.navy,
                      fontWeight: FontWeight.w700,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign in to continue your learning journey.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.gray500, fontSize: 14),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.navy.withOpacity(0.08),
                      blurRadius: 24,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: _inputDecoration('Email address', Icons.mail_outline),
                        validator: (value) => value == null || value.trim().isEmpty
                            ? 'Email is required'
                            : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: _inputDecoration('Password', Icons.lock_outline),
                        validator: (value) => value == null || value.trim().length < 6
                            ? 'Password is too short'
                            : null,
                      ),
                      const SizedBox(height: 16),
                      if (errorMessage != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Text(errorMessage!, style: const TextStyle(color: AppColors.error)),
                        ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTapDown: (_) => setState(() => isButtonPressed = true),
                        onTapUp: (_) => setState(() => isButtonPressed = false),
                        onTapCancel: () => setState(() => isButtonPressed = false),
                        child: AnimatedScale(
                          duration: const Duration(milliseconds: 120),
                          scale: isButtonPressed ? 0.97 : 1,
                          child: ElevatedButton(
                            onPressed: isLoading ? null : _handleSignIn,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accent,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              elevation: 6,
                              shadowColor: AppColors.accent.withOpacity(0.35),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            child: isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Sign In'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text('Create an account'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: AppColors.navy),
      filled: true,
      fillColor: AppColors.softMint,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: AppColors.navy, width: 2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: AppColors.accent, width: 2),
      ),
    );
  }
}

class _MascotHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        height: 160,
        width: 160,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              height: 150,
              width: 150,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.softMint, AppColors.softSky],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(48),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.navy.withOpacity(0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 18,
              right: 18,
              child: Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.navy.withOpacity(0.12),
                    blurRadius: 12,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Center(
                child: Icon(Icons.auto_awesome_rounded, color: AppColors.navy, size: 48),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
