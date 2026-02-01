import 'api_client.dart';
import 'models/auth_models.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<AuthResponse> login({required String email, required String password}) async {
    final data = await _apiClient.postJson('/auth/login', {
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(data);
  }

  Future<AuthResponse> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final data = await _apiClient.postJson('/auth/register', {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(data);
  }
}
