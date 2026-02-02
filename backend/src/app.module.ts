import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChildrenModule } from './children/children.module';
import { ContentModule } from './content/content.module';
import { ProgressModule } from './progress/progress.module';
import { AiModule } from './ai/ai.module';
import { UploadsModule } from './uploads/uploads.module';

// Entities
import { User } from './entities/user.entity';
import { Child } from './entities/child.entity';
import { Content } from './entities/content.entity';
import { Progress } from './entities/progress.entity';
import { Avatar } from './entities/avatar.entity';
import { Story } from './entities/story.entity';
import { Language } from './entities/language.entity';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DATABASE_TYPE', 'sqlite');

        if (dbType === 'postgres') {
          return {
            type: 'postgres' as const,
            host: configService.get<string>('DATABASE_HOST', 'localhost'),
            port: configService.get<number>('DATABASE_PORT', 5432),
            username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
            password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
            database: configService.get<string>('DATABASE_NAME', 'yene_teacher'),
            entities: [User, Child, Content, Progress, Avatar, Story, Language],
            synchronize: configService.get<string>('NODE_ENV') === 'development',
            logging: configService.get<string>('NODE_ENV') === 'development',
          };
        }

        // Default to SQLite for easy testing
        return {
          type: 'better-sqlite3' as const,
          database: 'yene_teacher.db',
          entities: [User, Child, Content, Progress, Avatar, Story, Language],
          synchronize: true,
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ChildrenModule,
    ContentModule,
    ProgressModule,
    AiModule,
    SettingsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
