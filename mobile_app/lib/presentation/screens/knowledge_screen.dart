import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/content_models.dart';
import '../../data/user_prefs.dart';

class KnowledgeScreen extends StatefulWidget {
  const KnowledgeScreen({super.key});

  @override
  State<KnowledgeScreen> createState() => _KnowledgeScreenState();
}

class _KnowledgeScreenState extends State<KnowledgeScreen> {
  final ContentRepository _repository = ContentRepository();
  final UserPrefs _prefs = UserPrefs();
  List<ContentListItem> lessons = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadLessons();
  }

  Future<void> _loadLessons() async {
    try {
      final language = await _prefs.getLanguage();
      final response = await _repository.fetchContentPaged(
        type: 'knowledge',
        language: language,
        page: 1,
        pageSize: 30,
      );

      if (!mounted) return;
      setState(() {
        lessons = response.items;
        isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load knowledge lessons.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Knowledge'),
      ),
      body: Builder(
        builder: (context) {
          if (isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (errorMessage != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(errorMessage!, style: const TextStyle(color: AppColors.error)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadLessons,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (lessons.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.lightbulb_rounded,
                      size: 120,
                      color: Colors.orange,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'No knowledge yet',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: Colors.orange,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Lessons will appear here as they are added.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: AppColors.gray500),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _loadLessons,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                      ),
                      child: const Text('Refresh'),
                    ),
                  ],
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _loadLessons,
            child: ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: lessons.length,
              itemBuilder: (context, index) {
                final lesson = lessons[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
                    ],
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: lesson.imageUrl == null
                            ? Container(
                                width: 72,
                                height: 72,
                                color: AppColors.softOrange,
                                child: const Icon(Icons.lightbulb_rounded, color: Colors.orange),
                              )
                            : CachedNetworkImage(
                                imageUrl: lesson.imageUrl!,
                                width: 72,
                                height: 72,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => const SizedBox(
                                  width: 72,
                                  height: 72,
                                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  width: 72,
                                  height: 72,
                                  color: AppColors.softOrange,
                                  child: const Icon(Icons.lightbulb_rounded, color: Colors.orange),
                                ),
                              ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(lesson.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 6),
                            Text(
                              lesson.description ?? 'Tap to explore',
                              style: const TextStyle(color: AppColors.gray500),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded, color: AppColors.gray500),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
