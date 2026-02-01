class AvatarItem {
  final String id;
  final String name;
  final String imageUrl;

  AvatarItem({
    required this.id,
    required this.name,
    required this.imageUrl,
  });

  factory AvatarItem.fromJson(Map<String, dynamic> json) {
    return AvatarItem(
      id: json['id'] as String,
      name: json['name'] as String,
      imageUrl: json['imageUrl'] as String,
    );
  }
}
