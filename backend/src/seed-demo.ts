import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Avatar, AvatarGender, TeachingStyle } from './entities/avatar.entity';
import { Child, SupportedLanguage } from './entities/child.entity';
import { Content, ContentType, DifficultyLevel } from './entities/content.entity';
import { Language } from './entities/language.entity';
import { Story } from './entities/story.entity';
import { User } from './entities/user.entity';
import { Progress } from './entities/progress.entity';

const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'yene_teacher.db',
  entities: [User, Child, Content, Progress, Avatar, Story, Language],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const languageRepository = dataSource.getRepository(Language);
  const languages = [
    { code: 'amharic', name: 'Amharic', nativeName: 'አማርኛ', isActive: true },
    { code: 'geez', name: "Ge'ez", nativeName: 'ግዕዝ', isActive: true },
    { code: 'english', name: 'English', nativeName: 'English', isActive: true },
  ];
  for (const language of languages) {
    const existing = await languageRepository.findOneBy({ code: language.code });
    await languageRepository.save(existing ? { ...existing, ...language } : languageRepository.create(language));
  }

  const avatarRepository = dataSource.getRepository(Avatar);
  const avatars = [
    { name: 'Abebe', gender: AvatarGender.MALE, teachingStyle: TeachingStyle.PLAYFUL_TEACHER, personalityDescription: 'A cheerful tutor who celebrates every small win.', imageUrl: 'https://api.dicebear.com/9.x/bottts/png?seed=Abebe', voiceId: 'amharic-male-1', speechRate: 0.85, pitchLevel: 1 },
    { name: 'Sara', gender: AvatarGender.FEMALE, teachingStyle: TeachingStyle.CALM_STORYTELLER, personalityDescription: 'A warm storyteller who explains new ideas gently.', imageUrl: 'https://api.dicebear.com/9.x/bottts/png?seed=Sara', voiceId: 'amharic-female-1', speechRate: 0.8, pitchLevel: 1.05 },
    { name: 'Chala', gender: AvatarGender.MALE, teachingStyle: TeachingStyle.SERIOUS_GUIDE, personalityDescription: 'A patient guide who makes practice clear and focused.', imageUrl: 'https://api.dicebear.com/9.x/bottts/png?seed=Chala', voiceId: 'amharic-male-2', speechRate: 0.8, pitchLevel: 0.95 },
  ];
  for (const avatar of avatars) {
    const existing = await avatarRepository.findOneBy({ name: avatar.name });
    await avatarRepository.save(existing ? { ...existing, ...avatar, isActive: true } : avatarRepository.create(avatar));
  }

  const contentRepository = dataSource.getRepository(Content);
  const words = [
    ['ሰላም', 'Selam', 'Hello / peace'], ['ቤት', 'Bet', 'House'], ['ውሃ', 'Wuha', 'Water'],
    ['እናት', 'Enat', 'Mother'], ['አባት', 'Abat', 'Father'], ['መጽሐፍ', 'Metsihaf', 'Book'],
    ['ትምህርት ቤት', 'Timhirt bet', 'School'], ['ፀሐይ', 'Tsehay', 'Sun'], ['ጨረቃ', 'Chereka', 'Moon'],
    ['ጓደኛ', 'Gwadenya', 'Friend'], ['ምግብ', 'Migib', 'Food'], ['አበባ', 'Abeba', 'Flower'],
  ];
  const records: Array<Partial<Content>> = words.map(([title, pronunciation, meaning], index) => ({
    type: ContentType.WORD, title, description: `${meaning}. Say it: ${pronunciation}.`,
    language: SupportedLanguage.AMHARIC, difficulty: DifficultyLevel.BEGINNER,
    minAge: 4, maxAge: 9, imageUrl: `https://api.dicebear.com/9.x/shapes/png?seed=word-${index + 1}`,
    metadata: { pronunciation, meaning, example: `${title} — ${meaning}` }, tags: ['demo', 'beginner'], orderIndex: index + 1, isActive: true,
  }));
  records.push(
    { type: ContentType.GAME, title: 'Match the Word', description: 'Match each Amharic word to its picture.', language: SupportedLanguage.AMHARIC, difficulty: DifficultyLevel.BEGINNER, minAge: 4, maxAge: 9, metadata: { gameType: 'matching', rounds: 5 }, tags: ['demo', 'matching'], orderIndex: 1, isActive: true },
    { type: ContentType.GAME, title: 'Sound Hunt', description: 'Listen carefully and choose the word you hear.', language: SupportedLanguage.AMHARIC, difficulty: DifficultyLevel.BEGINNER, minAge: 5, maxAge: 10, metadata: { gameType: 'listening', rounds: 5 }, tags: ['demo', 'listening'], orderIndex: 2, isActive: true },
    { type: ContentType.GAME, title: 'Letter Builder', description: 'Put the letters in order to build a word.', language: SupportedLanguage.AMHARIC, difficulty: DifficultyLevel.INTERMEDIATE, minAge: 6, maxAge: 12, metadata: { gameType: 'word_builder', rounds: 5 }, tags: ['demo', 'spelling'], orderIndex: 3, isActive: true },
    { type: ContentType.KNOWLEDGE, title: 'The Ethiopian Calendar', description: 'Ethiopia uses a calendar with 13 months. The last month has five days, or six in a leap year.', language: SupportedLanguage.ENGLISH, difficulty: DifficultyLevel.BEGINNER, minAge: 6, maxAge: 12, metadata: { category: 'culture', fact: 'Ethiopia has thirteen months of sunshine.' }, tags: ['demo', 'culture'], orderIndex: 1, isActive: true },
    { type: ContentType.KNOWLEDGE, title: 'Gelada Monkeys', description: 'Geladas live in the Ethiopian highlands and mostly eat grass.', language: SupportedLanguage.ENGLISH, difficulty: DifficultyLevel.BEGINNER, minAge: 5, maxAge: 12, metadata: { category: 'animals', fact: 'Geladas are sometimes called bleeding-heart monkeys.' }, tags: ['demo', 'animals'], orderIndex: 2, isActive: true },
    { type: ContentType.KNOWLEDGE, title: 'The Blue Nile', description: 'The Blue Nile begins at Lake Tana and joins the White Nile in Sudan.', language: SupportedLanguage.ENGLISH, difficulty: DifficultyLevel.BEGINNER, minAge: 6, maxAge: 12, metadata: { category: 'geography', fact: 'Lake Tana is Ethiopia’s largest lake.' }, tags: ['demo', 'geography'], orderIndex: 3, isActive: true },
  );
  for (const record of records) {
    const existing = await contentRepository.findOneBy({ type: record.type!, title: record.title!, language: record.language! });
    await contentRepository.save(existing ? { ...existing, ...record } : contentRepository.create(record));
  }

  const storyRepository = dataSource.getRepository(Story);
  const stories: Partial<Story>[] = [
    { title: 'ሊሊ እና ትንሹ ወፍ', description: 'Lili helps a little bird find its family.', language: SupportedLanguage.AMHARIC, difficulty: DifficultyLevel.BEGINNER, minAge: 4, maxAge: 8, estimatedMinutes: 3, vocabularyHighlights: ['ወፍ', 'ዛፍ', 'ቤት'], coverImageUrl: 'https://api.dicebear.com/9.x/shapes/png?seed=lili-bird', isActive: true, pages: [
      { pageNumber: 1, text: 'ሊሊ በዛፍ ሥር ትንሽ ወፍ አየች።', vocabularyWords: ['ዛፍ', 'ወፍ'], interactionQuestion: 'ሊሊ ምን አየች?', interactionOptions: ['ወፍ', 'ድመት'] },
      { pageNumber: 2, text: 'ወፏ ቤቷን ፈልጋ ነበር። ሊሊ ረዳቻት።', vocabularyWords: ['ቤት', 'ረዳች'] },
      { pageNumber: 3, text: 'ትንሿ ወፍ ወደ ቤተሰቧ ተመለሰች። ሁሉም ደስ አላቸው።', interactionQuestion: 'ወፏ መጨረሻ የት ሄደች?', interactionOptions: ['ወደ ቤተሰቧ', 'ወደ ገበያ'] },
    ] },
    { title: 'The Kind Lion', description: 'A young lion learns that kindness makes a strong friend.', language: SupportedLanguage.ENGLISH, difficulty: DifficultyLevel.BEGINNER, minAge: 5, maxAge: 9, estimatedMinutes: 3, vocabularyHighlights: ['kind', 'friend', 'brave'], coverImageUrl: 'https://api.dicebear.com/9.x/shapes/png?seed=kind-lion', isActive: true, pages: [
      { pageNumber: 1, text: 'A young lion lived near a bright green forest. He wanted a friend.', vocabularyWords: ['lion', 'forest', 'friend'] },
      { pageNumber: 2, text: 'One day, he helped a small rabbit cross a stream.', interactionQuestion: 'Who did the lion help?', interactionOptions: ['A rabbit', 'A fish'] },
      { pageNumber: 3, text: 'The rabbit smiled. “You are strong because you are kind,” she said.' },
      { pageNumber: 4, text: 'From that day on, the lion and rabbit explored the forest together.', interactionQuestion: 'What made the lion strong?', interactionOptions: ['Kindness', 'Loud roaring'] },
    ] },
  ];
  for (const story of stories) {
    const existing = await storyRepository.findOneBy({ title: story.title!, language: story.language! });
    await storyRepository.save(existing ? { ...existing, ...story } : storyRepository.create(story));
  }

  console.log(`Demo content ready: ${languages.length} languages, ${avatars.length} tutors, ${words.length} words, ${stories.length} stories, 3 games, 3 knowledge items.`);
  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
