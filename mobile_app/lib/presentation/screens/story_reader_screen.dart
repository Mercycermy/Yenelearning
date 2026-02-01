import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class StoryReaderScreen extends StatefulWidget {
  final String title;
  const StoryReaderScreen({super.key, required this.title});

  @override
  State<StoryReaderScreen> createState() => _StoryReaderScreenState();
}

class _StoryReaderScreenState extends State<StoryReaderScreen> {
  int currentPage = 0;
  
  final List<Map<String, String>> storyPages = [
    {
      'text': 'Once upon a time, there was a brave lion who lived in the Ethiopian highlands.',
      'image': 'https://api.dicebear.com/7.x/identicon/png?seed=story1',
    },
    {
      'text': 'He had a very loud roar, but he was also very kind to all the other animals.',
      'image': 'https://api.dicebear.com/7.x/identicon/png?seed=story2',
    },
    {
      'text': 'One day, he found a small bird who had lost its way home.',
      'image': 'https://api.dicebear.com/7.x/identicon/png?seed=story3',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final page = storyPages[currentPage];
    
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
                  child: Image.network(page['image']!, height: 200),
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
                    page['text']!,
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
                if (currentPage > 0)
                  ElevatedButton(
                    onPressed: () => setState(() => currentPage--),
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
                  '${currentPage + 1} / ${storyPages.length}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),

                ElevatedButton(
                  onPressed: () {
                    if (currentPage < storyPages.length - 1) {
                      setState(() => currentPage++);
                    } else {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('The End! You finished the story!')),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.green,
                    minimumSize: const Size(120, 60),
                  ),
                  child: Text(currentPage < storyPages.length - 1 ? 'Next' : 'Finish'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
