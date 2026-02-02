import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/content_models.dart';
import '../../data/user_prefs.dart';
import 'knowledge_detail_screen.dart';

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
            child: GridView.builder(
              padding: const EdgeInsets.all(24),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.8,
              ),
              itemCount: lessons.length,
              itemBuilder: (context, index) {
                final lesson = lessons[index];
                return _KnowledgeTile(
                  lesson: lesson,
                  index: index,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => KnowledgeDetailScreen(contentId: lesson.id),
                      ),
                    );
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _KnowledgeTile extends StatelessWidget {
  final ContentListItem lesson;
  final int index;
  final VoidCallback onTap;

  const _KnowledgeTile({
    required this.lesson,
    required this.index,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = [AppColors.softOrange, AppColors.softBlue, AppColors.softGreen, AppColors.softPink];
    final accent = [Colors.orange, AppColors.blue, AppColors.green, AppColors.pink];
    final bgColor = colors[index % colors.length];
    final iconColor = accent[index % accent.length];
    final progress = ((index % 5) + 1) / 5;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: iconColor.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 6)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: lesson.imageUrl == null
                  ? Container(
                      height: 90,
                      width: double.infinity,
                      color: Colors.white.withOpacity(0.6),
                      child: Icon(Icons.lightbulb_rounded, color: iconColor, size: 40),
                    )
                  : CachedNetworkImage(
                      imageUrl: lesson.imageUrl!,
                      height: 90,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const SizedBox(
                        height: 90,
                        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      errorWidget: (context, url, error) => Container(
                        height: 90,
                        color: Colors.white.withOpacity(0.6),
                        child: Icon(Icons.lightbulb_rounded, color: iconColor, size: 40),
                      ),
                    ),
            ),
            const SizedBox(height: 12),
            Text(
              lesson.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Text(
              lesson.description ?? 'Tap to explore',
              style: const TextStyle(color: AppColors.gray500, fontSize: 13),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const Spacer(),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white.withOpacity(0.5),
                color: iconColor,
                minHeight: 8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
