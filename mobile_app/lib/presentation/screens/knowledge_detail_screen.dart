import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/content_models.dart';

class KnowledgeDetailScreen extends StatefulWidget {
  final String contentId;

  const KnowledgeDetailScreen({super.key, required this.contentId});

  @override
  State<KnowledgeDetailScreen> createState() => _KnowledgeDetailScreenState();
}

class _KnowledgeDetailScreenState extends State<KnowledgeDetailScreen> {
  final ContentRepository _repository = ContentRepository();
  ContentDetail? detail;
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    try {
      final data = await _repository.fetchContentById(widget.contentId);
      if (!mounted) return;
      setState(() {
        detail = data;
        isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load knowledge details.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Knowledge Details'),
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
                      onPressed: _loadDetail,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final content = detail;
          if (content == null) {
            return const Center(child: Text('No details found.'));
          }

          final category = content.metadata?['category']?.toString();

          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: content.imageUrl == null
                    ? Container(
                        height: 220,
                        color: AppColors.softOrange,
                        child: const Icon(Icons.lightbulb_rounded, color: Colors.orange, size: 64),
                      )
                    : CachedNetworkImage(
                        imageUrl: content.imageUrl!,
                        height: 220,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => const SizedBox(
                          height: 220,
                          child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                        ),
                        errorWidget: (context, url, error) => Container(
                          height: 220,
                          color: AppColors.softOrange,
                          child: const Icon(Icons.lightbulb_rounded, color: Colors.orange, size: 64),
                        ),
                      ),
              ),
              const SizedBox(height: 20),
              Text(
                content.title,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              if (category != null && category.trim().isNotEmpty)
                Text(
                  'Category: $category',
                  style: const TextStyle(color: AppColors.gray500),
                ),
              const SizedBox(height: 12),
              Text(
                content.description ?? 'No description provided.',
                style: const TextStyle(fontSize: 16, height: 1.4),
              ),
              const SizedBox(height: 24),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _InfoChip(label: 'Language', value: content.language),
                  _InfoChip(label: 'Difficulty', value: content.difficulty),
                  _InfoChip(label: 'Ages', value: '${content.minAge}-${content.maxAge}'),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;

  const _InfoChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.gray100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(color: AppColors.gray900, fontSize: 12),
      ),
    );
  }
}
