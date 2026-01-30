import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Content } from '../entities/content.entity';
import { Story } from '../entities/story.entity';
import { Avatar } from '../entities/avatar.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Content, Story, Avatar])],
    controllers: [ContentController],
    providers: [ContentService],
    exports: [ContentService],
})
export class ContentModule { }
