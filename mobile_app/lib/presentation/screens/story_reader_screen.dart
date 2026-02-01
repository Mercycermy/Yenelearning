import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/story_models.dart';

class StoryReaderScreen extends StatefulWidget {
  final String storyId;
  final String title;
  const StoryReaderScreen({super.key, required this.storyId, required this.title});

  @override
  State<StoryReaderScreen> createState() => _StoryReaderScreenState();
}

class _StoryReaderScreenState extends State<StoryReaderScreen> {
  int currentPage = 1;
  bool isLoading = true;
  String? errorMessage;
  StoryPageResponse? pageResponse;

  final ContentRepository _repository = ContentRepository();

  @override
  void initState() {
    super.initState();
    _loadPage();
  }

  Future<void> _loadPage() async {
    try {
      final response = await _repository.fetchStoryPage(
        storyId: widget.storyId,
        pageNumber: currentPage,
      );

      if (!mounted) return;
      setState(() {
        pageResponse = response;
        isLoading = false;
        errorMessage = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load story page.';
      });
    }
  }

  Future<void> _nextPage() async {
    if (pageResponse == null) return;
    if (currentPage >= pageResponse!.totalPages) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('The End! You finished the story!')),
      );
      return;
    }

    setState(() {
      currentPage += 1;
      isLoading = true;
    });
    await _loadPage();
  }

  Future<void> _previousPage() async {
    if (currentPage <= 1) return;
    setState(() {
      currentPage -= 1;
      isLoading = true;
    });
    await _loadPage();
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (errorMessage != null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.title),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(errorMessage!, style: const TextStyle(color: AppColors.error)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadPage,
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final page = pageResponse!.page;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            // Image Placeholder
            Expanded(
              flex: 4,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.gray100,
                  borderRadius: BorderRadius.circular(32),
                ),
                child: Center(
                  child: page.imageUrl == null
                      ? const Icon(Icons.image, size: 80, color: AppColors.gray500)
                      : CachedNetworkImage(
                          imageUrl: page.imageUrl!,
                          height: 200,
                          placeholder: (context, url) => const SizedBox(
                            height: 80,
                            width: 80,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                          errorWidget: (context, url, error) => const Icon(Icons.image, size: 80),
                        ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            
            // Text Content
            Expanded(
              flex: 3,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
                  ],
                ),
                child: Center(
                  child: Text(
                    page.text,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w500,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Navigation
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (currentPage > 1)
                  ElevatedButton(
                    onPressed: _previousPage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gray200,
                      foregroundColor: AppColors.gray900,
                      minimumSize: const Size(120, 60),
                    ),
                    child: const Text('Back'),
                  )
                else
                  const SizedBox(width: 120),
                
                Text(
                  '${pageResponse!.pageNumber} / ${pageResponse!.totalPages}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),

                ElevatedButton(
                  onPressed: _nextPage,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.green,
                    minimumSize: const Size(120, 60),
                  ),
                  child: Text(currentPage < (pageResponse?.totalPages ?? 0) ? 'Next' : 'Finish'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
