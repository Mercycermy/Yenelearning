import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String _webBaseUrl = 'http://localhost:3001/api';
  static const String _deviceBaseUrl = 'http://10.0.2.2:3001/api';

  static String get baseUrl => kIsWeb ? _webBaseUrl : _deviceBaseUrl;
}
