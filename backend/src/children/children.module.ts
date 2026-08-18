import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { StudentExperienceService } from './student-experience.service';
import { StudentExperienceController } from './student-experience.controller';
import { Child } from '../entities/child.entity';
import { User } from '../entities/user.entity';
import { Chapter } from '../entities/chapter.entity';
import { ChapterProgress } from '../entities/chapter-progress.entity';
import { AvatarItem } from '../entities/avatar-item.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Child, User, Chapter, ChapterProgress, AvatarItem])],
    controllers: [ChildrenController, StudentExperienceController],
    providers: [ChildrenService, StudentExperienceService],
    exports: [ChildrenService, StudentExperienceService],
})
export class ChildrenModule { }
