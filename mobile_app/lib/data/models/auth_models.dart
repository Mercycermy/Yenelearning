class AuthResponse {
  final String accessToken;
  final Map<String, dynamic> user;

  AuthResponse({required this.accessToken, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      user: (json['user'] as Map).cast<String, dynamic>(),
    );
  }
}
