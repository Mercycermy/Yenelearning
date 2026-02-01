class AvatarItem {
  final String id;
  final String name;
  final String imageUrl;
  final String? gender;
  final String? teachingStyle;
  final String? personalityDescription;
  final String? voiceId;
  final double? speechRate;
  final double? pitchLevel;

  const AvatarItem({
    required this.id,
    required this.name,
    required this.imageUrl,
    this.gender,
    this.teachingStyle,
    this.personalityDescription,
    this.voiceId,
    this.speechRate,
    this.pitchLevel,
  });

  factory AvatarItem.fromJson(Map<String, dynamic> json) {
    return AvatarItem(
      id: json['id'] as String,
      name: json['name'] as String,
      imageUrl: json['imageUrl'] as String,
      gender: json['gender'] as String?,
      teachingStyle: json['teachingStyle'] as String?,
      personalityDescription: json['personalityDescription'] as String?,
      voiceId: json['voiceId'] as String?,
      speechRate: (json['speechRate'] as num?)?.toDouble(),
      pitchLevel: (json['pitchLevel'] as num?)?.toDouble(),
    );
  }
}
