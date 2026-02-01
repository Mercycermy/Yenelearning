import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'presentation/screens/auth_gate.dart';
import 'presentation/screens/auth/sign_in_screen.dart';
import 'presentation/screens/auth/sign_up_screen.dart';
import 'presentation/screens/dashboard_screen.dart';
import 'presentation/screens/games_screen.dart';
import 'presentation/screens/knowledge_screen.dart';
import 'presentation/screens/parent_dashboard_screen.dart';
import 'presentation/screens/stories_screen.dart';
import 'presentation/screens/story_reader_screen.dart';
import 'presentation/screens/talk_with_tutor_screen.dart';
import 'presentation/screens/welcome_screen.dart';
import 'presentation/screens/word_lesson_screen.dart';

void main() {
  runApp(const YeneTeacherApp());
}

class YeneTeacherApp extends StatelessWidget {
  const YeneTeacherApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Yene Teacher',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthGate(),
        '/login': (context) => const SignInScreen(),
        '/register': (context) => const SignUpScreen(),
        '/welcome': (context) => const WelcomeScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/words': (context) => const WordLessonScreen(),
        '/tutor': (context) => const TalkWithTutorScreen(),
        '/parent': (context) => const ParentDashboardScreen(),
        '/stories': (context) => const StoriesScreen(),
        '/story-reader': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, String>;
          return StoryReaderScreen(
            storyId: args['id']!,
            title: args['title']!,
          );
        },
        '/games': (context) => const GamesScreen(),
        '/knowledge': (context) => const KnowledgeScreen(),
      },
    );
  }
}
