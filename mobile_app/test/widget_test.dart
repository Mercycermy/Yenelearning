import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile_app/presentation/screens/dashboard_screen.dart';
import 'package:mobile_app/presentation/screens/parent_dashboard_screen.dart';

void main() {
  testWidgets('kid dashboard opens the parent space', (tester) async {
    SharedPreferences.setMockInitialValues({'selected_language': 'amharic'});

    await tester.pumpWidget(
      MaterialApp(
        routes: {'/parent': (_) => const ParentDashboardScreen()},
        home: const DashboardScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Today’s mission'), findsOneWidget);
    expect(find.text('Choose an adventure'), findsOneWidget);
    expect(find.text('Play Games'), findsOneWidget);

    await tester.tap(find.text('Parents'));
    await tester.pumpAndSettle();

    expect(find.text('Parent space'), findsOneWidget);
    expect(find.text('Healthy learning'), findsOneWidget);
    expect(find.text('Weekly progress'), findsOneWidget);
  });
}
