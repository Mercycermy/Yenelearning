import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile_app/presentation/screens/dashboard_screen.dart';
import 'package:mobile_app/presentation/screens/parent_dashboard_screen.dart';
import 'package:mobile_app/presentation/screens/parent_gate.dart';

Widget testApp() => MaterialApp(
  routes: {
    '/dashboard': (_) => const DashboardScreen(),
    '/parent': (_) => const ParentGate(),
    '/parent-dashboard': (_) => const ParentDashboardScreen(),
  },
  home: const DashboardScreen(),
);

void main() {
  testWidgets('parent space asks for sign in without ending kid mode', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({'selected_language': 'amharic'});

    await tester.pumpWidget(testApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Parents'));
    await tester.pumpAndSettle();

    expect(find.text('Parent sign in'), findsOneWidget);
    expect(find.text('Continue in kid mode'), findsOneWidget);

    await tester.ensureVisible(find.text('Continue in kid mode'));
    await tester.tap(find.text('Continue in kid mode'));
    await tester.pumpAndSettle();
    expect(find.text('Choose an adventure'), findsOneWidget);
  });

  testWidgets('parent space requires a fresh login on every visit', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({
      'selected_language': 'amharic',
      'selected_avatar_id': 'demo-avatar',
      'auth_access_token': 'parent-token',
      'auth_user_json': '{"firstName":"Mimi","role":"parent"}',
    });

    await tester.pumpWidget(testApp());
    await tester.pumpAndSettle();
    await tester.tap(find.text('Parents'));
    await tester.pumpAndSettle();

    expect(find.text('Parent sign in'), findsOneWidget);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('auth_access_token'), isNull);
    expect(prefs.getString('selected_avatar_id'), 'demo-avatar');
  });
}
