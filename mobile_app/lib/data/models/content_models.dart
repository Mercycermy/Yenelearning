class ContentListItem {
  final String id;
  final String type;
  final String title;
  final String? description;
  final String language;
  final String difficulty;
  final int minAge;
  final int maxAge;
  final String? imageUrl;
  final List<String> tags;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  ContentListItem({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.language,
    required this.difficulty,
    required this.minAge,
    required this.maxAge,
    required this.imageUrl,
    required this.tags,
    required this.createdAt,
    required this.metadata,
  });

  factory ContentListItem.fromJson(Map<String, dynamic> json) {
    return ContentListItem(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      language: json['language'] as String,
      difficulty: json['difficulty'] as String,
      minAge: (json['minAge'] ?? 0) as int,
      maxAge: (json['maxAge'] ?? 0) as int,
      imageUrl: json['imageUrl'] as String?,
      tags: (json['tags'] as List<dynamic>? ?? []).map((e) => e.toString()).toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}

class ContentListResponse {
  final List<ContentListItem> items;
  final int total;
  final int page;
  final int pageSize;

  ContentListResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  factory ContentListResponse.fromJson(Map<String, dynamic> json) {
    final itemsJson = (json['items'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
    return ContentListResponse(
      items: itemsJson.map(ContentListItem.fromJson).toList(),
      total: (json['total'] ?? 0) as int,
      page: (json['page'] ?? 1) as int,
      pageSize: (json['pageSize'] ?? 20) as int,
    );
  }
}

class ContentDetail {
  final String id;
  final String type;
  final String title;
  final String? description;
  final String language;
  final String difficulty;
  final int minAge;
  final int maxAge;
  final String? imageUrl;
  final String? audioUrl;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? metadata;

  ContentDetail({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.language,
    required this.difficulty,
    required this.minAge,
    required this.maxAge,
    required this.imageUrl,
    required this.audioUrl,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    required this.metadata,
  });

  factory ContentDetail.fromJson(Map<String, dynamic> json) {
    return ContentDetail(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      language: json['language'] as String,
      difficulty: json['difficulty'] as String,
      minAge: (json['minAge'] ?? 0) as int,
      maxAge: (json['maxAge'] ?? 0) as int,
      imageUrl: json['imageUrl'] as String?,
      audioUrl: json['audioUrl'] as String?,
      tags: (json['tags'] as List<dynamic>? ?? []).map((e) => e.toString()).toList(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}
