import 'api_client.dart';
import 'models/content_models.dart';
import 'models/story_models.dart';
import 'models/avatar_models.dart';

class ContentRepository {
  final ApiClient _apiClient;

  ContentRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<AvatarItem>> fetchAvatars() async {
    final data = await _apiClient.getJsonList('/content/avatars/all');
    return data.map((e) => AvatarItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ContentListResponse> fetchContentPaged({
    required String type,
    required String language,
    int page = 1,
    int pageSize = 20,
  }) async {
    final data = await _apiClient.getJson(
      '/content/paged',
      query: {
        'type': type,
        'language': language,
        'page': page.toString(),
        'pageSize': pageSize.toString(),
      },
    );
    return ContentListResponse.fromJson(data);
  }

  Future<ContentDetail> fetchContentById(String id) async {
    final data = await _apiClient.getJson('/content/$id');
    return ContentDetail.fromJson(data);
  }

  Future<StoryListResponse> fetchStoriesPaged({
    required String language,
    int page = 1,
    int pageSize = 20,
  }) async {
    final data = await _apiClient.getJson(
      '/content/stories',
      query: {
        'language': language,
        'page': page.toString(),
        'pageSize': pageSize.toString(),
      },
    );
    return StoryListResponse.fromJson(data);
  }

  Future<StoryPageResponse> fetchStoryPage({
    required String storyId,
    required int pageNumber,
  }) async {
    final data = await _apiClient.getJson('/content/stories/$storyId/pages/$pageNumber');
    return StoryPageResponse.fromJson(data);
  }
}
