import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { User, UserRole } from './entities/user.entity';
import { Avatar, AvatarGender, TeachingStyle } from './entities/avatar.entity';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS for frontend apps
  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

      if (!origin) {
        return callback(null, true);
      }

      if (nodeEnv !== 'production') {
        return callback(null, true);
      }

      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  };

  app.enableCors(corsOptions);

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

  const uploadsPath = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  await seedDefaultAvatars(app, logger);
  await seedAdminUser(app, logger);

  console.log(`🚀 Yene Teacher API is running on: http://localhost:${port}/api`);
  console.log(`📚 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

async function seedAdminUser(app: any, logger: Logger) {
  try {
    const userRepository = app.get(getRepositoryToken(User)) as Repository<User>;
    const adminEmail = 'admin@yenelearning.com';
    const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const bcrypt = require('bcrypt');
      const password = 'AdminPassword123!';
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await userRepository.save(admin);
      logger.log('Seeded default admin user: admin@yenelearning.com');
    }
  } catch (error) {
    logger.error('Admin seeding failed', error as Error);
  }
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
