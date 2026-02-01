import 'presentation/screens/dashboard_screen.dart';
import 'presentation/screens/parent_dashboard_screen.dart';
import 'presentation/screens/stories_screen.dart';
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
        '/': (context) => const WelcomeScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/words': (context) => const WordLessonScreen(),
        '/tutor': (context) => const TalkWithTutorScreen(),
        '/parent': (context) => const ParentDashboardScreen(),
        '/stories': (context) => const StoriesScreen(),
      },
    );
  }
}
