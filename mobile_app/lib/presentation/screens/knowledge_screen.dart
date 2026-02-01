import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class KnowledgeScreen extends StatelessWidget {
  const KnowledgeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Knowledge'),
      ),
      body: Center(
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
              const SizedBox(height: 32),
              Text(
                'Knowledge Hub',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: Colors.orange,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Exciting lessons about the world are coming here soon!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: AppColors.gray500),
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
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
