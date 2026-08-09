class StoryListItem {
  final String id;
  final String title;
  final String description;
  final String language;
  final String difficulty;
  final int minAge;
  final int maxAge;
  final String? coverImageUrl;
  final int estimatedMinutes;
  final int pagesCount;
  final DateTime createdAt;

  StoryListItem({
    required this.id,
    required this.title,
    required this.description,
    required this.language,
    required this.difficulty,
    required this.minAge,
    required this.maxAge,
    required this.coverImageUrl,
    required this.estimatedMinutes,
    required this.pagesCount,
    required this.createdAt,
  });

  factory StoryListItem.fromJson(Map<String, dynamic> json) {
    return StoryListItem(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      language: json['language'] as String,
      difficulty: json['difficulty'] as String,
      minAge: (json['minAge'] ?? 0) as int,
      maxAge: (json['maxAge'] ?? 0) as int,
      coverImageUrl: json['coverImageUrl'] as String?,
      estimatedMinutes: (json['estimatedMinutes'] ?? 0) as int,
      pagesCount: (json['pagesCount'] ?? 0) as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class StoryListResponse {
  final List<StoryListItem> items;
  final int total;
  final int page;
  final int pageSize;

  StoryListResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  factory StoryListResponse.fromJson(Map<String, dynamic> json) {
    final itemsJson = (json['items'] as List<dynamic>? ?? [])
        .cast<Map<String, dynamic>>();
    return StoryListResponse(
      items: itemsJson.map(StoryListItem.fromJson).toList(),
      total: (json['total'] ?? 0) as int,
      page: (json['page'] ?? 1) as int,
      pageSize: (json['pageSize'] ?? 20) as int,
    );
  }
}

class StoryPage {
  final int pageNumber;
  final String text;
  final String? imageUrl;
  final String? audioUrl;
  final List<String> vocabularyWords;
  final String? interactionQuestion;
  final List<String> interactionOptions;

  StoryPage({
    required this.pageNumber,
    required this.text,
    required this.imageUrl,
    required this.audioUrl,
    required this.vocabularyWords,
    required this.interactionQuestion,
    required this.interactionOptions,
  });

  factory StoryPage.fromJson(Map<String, dynamic> json) {
    return StoryPage(
      pageNumber: (json['pageNumber'] ?? 0) as int,
      text: json['text'] as String,
      imageUrl: json['imageUrl'] as String?,
      audioUrl: json['audioUrl'] as String?,
      vocabularyWords: (json['vocabularyWords'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      interactionQuestion: json['interactionQuestion'] as String?,
      interactionOptions: (json['interactionOptions'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class StoryPageResponse {
  final String storyId;
  final String title;
  final int pageNumber;
  final int totalPages;
  final StoryPage page;

  StoryPageResponse({
    required this.storyId,
    required this.title,
    required this.pageNumber,
    required this.totalPages,
    required this.page,
  });

  factory StoryPageResponse.fromJson(Map<String, dynamic> json) {
    return StoryPageResponse(
      storyId: json['storyId'] as String,
      title: json['title'] as String,
      pageNumber: (json['pageNumber'] ?? 0) as int,
      totalPages: (json['totalPages'] ?? 0) as int,
      page: StoryPage.fromJson(json['page'] as Map<String, dynamic>),
    );
  }
}
