import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Avatar } from './entities/avatar.entity';
import { Child, SupportedLanguage } from './entities/child.entity';
import { Content, ContentType, DifficultyLevel } from './entities/content.entity';
import { Language } from './entities/language.entity';
import { Progress } from './entities/progress.entity';
import { Story } from './entities/story.entity';
import { User } from './entities/user.entity';

type SeedContent = Omit<Content, 'id' | 'createdAt' | 'updatedAt'>;
type SeedStory = Omit<Story, 'id' | 'createdAt' | 'updatedAt'>;
interface SeedFile {
  version: number;
  languages: Array<Pick<Language, 'code' | 'name' | 'nativeName' | 'isActive'>>;
  content: SeedContent[];
  stories: SeedStory[];
}

const database = process.env.DATABASE_PATH ?? 'yene_teacher.db';
const dataSource = new DataSource({
  type: 'better-sqlite3', database,
  entities: [User, Child, Content, Progress, Avatar, Story, Language], synchronize: true,
});

function assertSeed(seed: SeedFile): void {
  const languages = new Set(Object.values(SupportedLanguage));
  const types = new Set(Object.values(ContentType));
  if (seed.version !== 1 || !seed.content?.length || !seed.stories?.length) throw new Error('Invalid or empty seed file');
  for (const item of seed.content) {
    if (!languages.has(item.language) || !types.has(item.type)) throw new Error(`Invalid content: ${item.title}`);
    if (!item.title?.trim() || item.minAge > item.maxAge) throw new Error(`Malformed content: ${item.title}`);
  }
  for (const story of seed.stories) {
    if (!languages.has(story.language) || !story.pages?.length) throw new Error(`Invalid story: ${story.title}`);
  }
}

async function seed(): Promise<void> {
  const file = process.env.SEED_FILE ?? join(__dirname, '..', 'data', 'learning-content.seed.json');
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as SeedFile;
  assertSeed(parsed);
  await dataSource.initialize();
  const languageRepo = dataSource.getRepository(Language);
  for (const language of parsed.languages) {
    const old = await languageRepo.findOneBy({ code: language.code });
    await languageRepo.save(old ? { ...old, ...language } : languageRepo.create(language));
  }
  const contentRepo = dataSource.getRepository(Content);
  for (const item of parsed.content) {
    const old = await contentRepo.findOneBy({ type: item.type, title: item.title, language: item.language });
    await contentRepo.save(old ? { ...old, ...item } : contentRepo.create(item));
  }
  const storyRepo = dataSource.getRepository(Story);
  for (const story of parsed.stories) {
    const old = await storyRepo.findOneBy({ title: story.title, language: story.language });
    await storyRepo.save(old ? { ...old, ...story } : storyRepo.create(story));
  }
  console.log(`Seeded ${parsed.languages.length} languages, ${parsed.content.length} lessons, and ${parsed.stories.length} stories into ${database}.`);
  await dataSource.destroy();
}

seed().catch(async (error: unknown) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
