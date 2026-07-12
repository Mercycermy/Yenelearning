import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../data/content_repository.dart';
import '../../data/models/content_models.dart';
import '../../data/user_prefs.dart';

class GamesScreen extends StatefulWidget {
  const GamesScreen({super.key});

  @override
  State<GamesScreen> createState() => _GamesScreenState();
}

class _GamesScreenState extends State<GamesScreen> {
  final ContentRepository _repository = ContentRepository();
  final UserPrefs _prefs = UserPrefs();
  List<ContentListItem> games = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadGames();
  }

  Future<void> _loadGames() async {
    try {
      final language = await _prefs.getLanguage();
      final response = await _repository.fetchContentPaged(
        type: 'game',
        language: language,
        page: 1,
        pageSize: 30,
      );

      if (!mounted) return;
      setState(() {
        games = response.items;
        isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        isLoading = false;
        errorMessage = 'Failed to load games.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Games')),
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
                    Text(
                      errorMessage!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadGames,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (games.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.videogame_asset_rounded,
                      size: 120,
                      color: AppColors.yellow,
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'No games yet',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: AppColors.yellow,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Games will appear here as they are added.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: AppColors.gray500),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _loadGames,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.yellow,
                      ),
                      child: const Text('Refresh'),
                    ),
                  ],
                ),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _loadGames,
            child: ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: games.length,
              itemBuilder: (context, index) {
                final game = games[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.softYellow,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: game.imageUrl == null
                            ? Container(
                                width: 84,
                                height: 84,
                                color: AppColors.softYellow,
                                child: const Icon(
                                  Icons.videogame_asset_rounded,
                                  color: AppColors.yellow,
                                  size: 36,
                                ),
                              )
                            : CachedNetworkImage(
                                imageUrl: game.imageUrl!,
                                width: 84,
                                height: 84,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => const SizedBox(
                                  width: 84,
                                  height: 84,
                                  child: Center(
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  width: 84,
                                  height: 84,
                                  color: AppColors.softYellow,
                                  child: const Icon(
                                    Icons.videogame_asset_rounded,
                                    color: AppColors.yellow,
                                    size: 36,
                                  ),
                                ),
                              ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              game.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              game.description ?? 'Tap to start playing',
                              style: const TextStyle(color: AppColors.gray500),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.orange,
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.orange.withOpacity(0.35),
                                    blurRadius: 10,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                              ),
                              child: const Text(
                                'Play',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.gray500,
                      ),
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
