import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { Avatar, AvatarGender, TeachingStyle } from './entities/avatar.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS for frontend apps
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  await seedDefaultAvatars(app, logger);

  console.log(`🚀 Yene Teacher API is running on: http://localhost:${port}/api`);
  console.log(`📚 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap();

async function seedDefaultAvatars(app: any, logger: Logger) {
  try {
    const avatarRepository = app.get(getRepositoryToken(Avatar)) as Repository<Avatar>;
    const count = await avatarRepository.count();
    if (count > 0) {
      return;
    }

    const seedAvatars: Partial<Avatar>[] = [
      {
        name: 'Abebe',
        gender: AvatarGender.MALE,
        teachingStyle: TeachingStyle.PLAYFUL_TEACHER,
        imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Abebe',
        personalityDescription: 'Playful and encouraging teacher.',
      },
      {
        name: 'Chala',
        gender: AvatarGender.MALE,
        teachingStyle: TeachingStyle.CALM_STORYTELLER,
        imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Chala',
        personalityDescription: 'Calm storyteller who loves adventures.',
      },
      {
        name: 'Sara',
        gender: AvatarGender.FEMALE,
        teachingStyle: TeachingStyle.PLAYFUL_TEACHER,
        imageUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=Sara',
        personalityDescription: 'Cheerful guide who celebrates progress.',
      },
    ];

    await avatarRepository.save(avatarRepository.create(seedAvatars));
    logger.log('Seeded default buddy avatars.');
  } catch (error) {
    logger.warn('Avatar seeding skipped.', error as Error);
  }
}
