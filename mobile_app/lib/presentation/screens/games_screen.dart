import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class GamesScreen extends StatelessWidget {
  const GamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Games'),
      ),
      body: Center(
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
              const SizedBox(height: 32),
              Text(
                'Coming Soon!',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: AppColors.yellow,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Fun and educational games are being prepared just for you!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: AppColors.gray500),
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.yellow,
                ),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
