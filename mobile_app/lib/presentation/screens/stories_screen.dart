import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class StoriesScreen extends StatelessWidget {
  const StoriesScreen({super.key});

  final List<Map<String, String>> stories = const [
    {
      'title': 'The Brave Lion',
      'author': 'Yene Teacher',
      'image': 'https://api.dicebear.com/7.x/identicon/png?seed=LionStory',
      'pages': '12 pages',
    },
    {
      'title': 'The Clever Elephant',
      'author': 'Yene Teacher',
      'image': 'https://api.dicebear.com/7.x/identicon/png?seed=ElephantStory',
      'pages': '8 pages',
    },
    {
      'title': 'Rainy Day Adventure',
      'author': 'Yene Teacher',
      'image': 'https://api.dicebear.com/7.x/identicon/png?seed=RainStory',
      'pages': '10 pages',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Stories'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(24),
        itemCount: stories.length,
        itemBuilder: (context, index) {
          final story = stories[index];
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              print('Opening story: ${story['title']}');
              Navigator.pushNamed(
                context, 
                '/story-reader', 
                arguments: {'title': story['title']!},
              );
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10),
                ],
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(24),
                      bottomLeft: Radius.circular(24),
                    ),
                    child: Image.network(
                      story['image']!,
                      width: 120,
                      height: 120,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            story['title']!,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'By ${story['author']}',
                            style: const TextStyle(color: AppColors.gray500),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Icon(Icons.menu_book_rounded, size: 16, color: AppColors.green),
                              const SizedBox(width: 4),
                              Text(
                                story['pages']!,
                                style: const TextStyle(fontSize: 12, color: AppColors.green),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.softGreen,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'Read',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.green,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
