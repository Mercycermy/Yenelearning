import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentType, DifficultyLevel } from '../entities/content.entity';
import { Story } from '../entities/story.entity';
import { Avatar } from '../entities/avatar.entity';
import { SupportedLanguage } from '../entities/child.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import {
    ContentListItemDto,
    ContentListResponseDto,
} from './dto/content-list.dto';
import {
    StoryListItemDto,
    StoryListResponseDto,
} from './dto/story-list.dto';
import { StoryPageResponseDto } from './dto/story-page.dto';

@Injectable()
export class ContentService {
    constructor(
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(Story)
        private readonly storyRepository: Repository<Story>,
        @InjectRepository(Avatar)
        private readonly avatarRepository: Repository<Avatar>,
    ) { }

    // ===== CONTENT (Words, Games, Knowledge) =====

    async createContent(createContentDto: CreateContentDto): Promise<Content> {
        const content = this.contentRepository.create(createContentDto);
        return this.contentRepository.save(content);
    }

    async findAllContent(filters?: {
        type?: ContentType;
        language?: SupportedLanguage;
        difficulty?: DifficultyLevel;
        minAge?: number;
        maxAge?: number;
    }): Promise<Content[]> {
        const query = this.contentRepository.createQueryBuilder('content');

        if (filters?.type) {
            query.andWhere('content.type = :type', { type: filters.type });
        }
        if (filters?.language) {
            query.andWhere('content.language = :language', { language: filters.language });
        }
        if (filters?.difficulty) {
            query.andWhere('content.difficulty = :difficulty', { difficulty: filters.difficulty });
        }
        if (filters?.minAge) {
            query.andWhere('content.minAge <= :age', { age: filters.minAge });
        }
        if (filters?.maxAge) {
            query.andWhere('content.maxAge >= :age', { age: filters.maxAge });
        }

        query.andWhere('content.isActive = :isActive', { isActive: true });
        query.orderBy('content.orderIndex', 'ASC');

        return query.getMany();
    }

    async findAllContentPaged(filters?: {
        type?: ContentType;
        language?: SupportedLanguage;
        difficulty?: DifficultyLevel;
        minAge?: number;
        maxAge?: number;
        page?: number;
        pageSize?: number;
    }): Promise<ContentListResponseDto> {
        const query = this.contentRepository.createQueryBuilder('content');

        if (filters?.type) {
            query.andWhere('content.type = :type', { type: filters.type });
        }
        if (filters?.language) {
            query.andWhere('content.language = :language', { language: filters.language });
        }
        if (filters?.difficulty) {
            query.andWhere('content.difficulty = :difficulty', { difficulty: filters.difficulty });
        }
        if (filters?.minAge) {
            query.andWhere('content.minAge <= :age', { age: filters.minAge });
        }
        if (filters?.maxAge) {
            query.andWhere('content.maxAge >= :age', { age: filters.maxAge });
        }

        query.andWhere('content.isActive = :isActive', { isActive: true });
        query.orderBy('content.createdAt', 'DESC');

        const { page, pageSize } = this.normalizePagination(filters?.page, filters?.pageSize);
        query.skip((page - 1) * pageSize).take(pageSize);

        const [items, total] = await query.getManyAndCount();

        return {
            items: items.map((item) => this.toContentListItem(item)),
            total,
            page,
            pageSize,
        };
    }

    async findOneContent(id: string): Promise<Content> {
        const content = await this.contentRepository.findOne({ where: { id } });
        if (!content) {
            throw new NotFoundException('Content not found');
        }
        return content;
    }

    async updateContent(id: string, updateData: Partial<Content>): Promise<Content> {
        const content = await this.findOneContent(id);
        Object.assign(content, updateData);
        return this.contentRepository.save(content);
    }

    async deleteContent(id: string): Promise<void> {
        const content = await this.findOneContent(id);
        content.isActive = false;
        await this.contentRepository.save(content);
    }

    // ===== STORIES =====

    async createStory(createStoryDto: CreateStoryDto): Promise<Story> {
        const story = this.storyRepository.create(createStoryDto);
        return this.storyRepository.save(story);
    }

    async findAllStories(filters?: {
        language?: SupportedLanguage;
        difficulty?: DifficultyLevel;
        age?: number;
    }): Promise<Story[]> {
        const query = this.storyRepository.createQueryBuilder('story');

        if (filters?.language) {
            query.andWhere('story.language = :language', { language: filters.language });
        }
        if (filters?.difficulty) {
            query.andWhere('story.difficulty = :difficulty', { difficulty: filters.difficulty });
        }
        if (filters?.age) {
            query.andWhere('story.minAge <= :age AND story.maxAge >= :age', { age: filters.age });
        }

        query.andWhere('story.isActive = :isActive', { isActive: true });
        query.orderBy('story.createdAt', 'DESC');

        return query.getMany();
    }

    async findAllStoriesPaged(filters?: {
        language?: SupportedLanguage;
        difficulty?: DifficultyLevel;
        age?: number;
        page?: number;
        pageSize?: number;
    }): Promise<StoryListResponseDto> {
        const query = this.storyRepository.createQueryBuilder('story');

        if (filters?.language) {
            query.andWhere('story.language = :language', { language: filters.language });
        }
        if (filters?.difficulty) {
            query.andWhere('story.difficulty = :difficulty', { difficulty: filters.difficulty });
        }
        if (filters?.age) {
            query.andWhere('story.minAge <= :age AND story.maxAge >= :age', { age: filters.age });
        }

        query.andWhere('story.isActive = :isActive', { isActive: true });
        query.orderBy('story.createdAt', 'DESC');

        const { page, pageSize } = this.normalizePagination(filters?.page, filters?.pageSize);
        query.skip((page - 1) * pageSize).take(pageSize);

        const [items, total] = await query.getManyAndCount();

        return {
            items: items.map((item) => this.toStoryListItem(item)),
            total,
            page,
            pageSize,
        };
    }

    async findStoryPage(storyId: string, pageNumber: number): Promise<StoryPageResponseDto> {
        const story = await this.findOneStory(storyId);
        const page = story.pages.find((p) => p.pageNumber === pageNumber);

        if (!page) {
            throw new NotFoundException('Story page not found');
        }

        return {
            storyId: story.id,
            title: story.title,
            pageNumber: page.pageNumber,
            totalPages: story.pages.length,
            page,
        };
    }

    async findOneStory(id: string): Promise<Story> {
        const story = await this.storyRepository.findOne({ where: { id } });
        if (!story) {
            throw new NotFoundException('Story not found');
        }
        return story;
    }

    async updateStory(id: string, updateData: Partial<Story>): Promise<Story> {
        const story = await this.findOneStory(id);
        Object.assign(story, updateData);
        return this.storyRepository.save(story);
    }

    async deleteStory(id: string): Promise<void> {
        const story = await this.findOneStory(id);
        story.isActive = false;
        await this.storyRepository.save(story);
    }

    // ===== AVATARS =====

    async createAvatar(createAvatarDto: CreateAvatarDto): Promise<Avatar> {
        const avatar = this.avatarRepository.create(createAvatarDto);
        return this.avatarRepository.save(avatar);
    }

    async findAllAvatars(): Promise<Avatar[]> {
        return this.avatarRepository.find({
            where: { isActive: true },
            order: { createdAt: 'ASC' },
        });
    }

    async findOneAvatar(id: string): Promise<Avatar> {
        const avatar = await this.avatarRepository.findOne({ where: { id } });
        if (!avatar) {
            throw new NotFoundException('Avatar not found');
        }
        return avatar;
    }

    async updateAvatar(id: string, updateData: Partial<Avatar>): Promise<Avatar> {
        const avatar = await this.findOneAvatar(id);
        Object.assign(avatar, updateData);
        return this.avatarRepository.save(avatar);
    }

    async deleteAvatar(id: string): Promise<void> {
        const avatar = await this.findOneAvatar(id);
        avatar.isActive = false;
        await this.avatarRepository.save(avatar);
    }

    // ===== STATS =====

    async getContentStats(): Promise<{
        totalWords: number;
        totalStories: number;
        totalGames: number;
        totalAvatars: number;
        byLanguage: Record<string, number>;
    }> {
        const [totalWords, totalStories, totalGames, totalAvatars] = await Promise.all([
            this.contentRepository.count({ where: { type: ContentType.WORD, isActive: true } }),
            this.storyRepository.count({ where: { isActive: true } }),
            this.contentRepository.count({ where: { type: ContentType.GAME, isActive: true } }),
            this.avatarRepository.count({ where: { isActive: true } }),
        ]);

        const contents = await this.contentRepository.find({ where: { isActive: true } });
        const byLanguage: Record<string, number> = {};
        contents.forEach((c) => {
            byLanguage[c.language] = (byLanguage[c.language] || 0) + 1;
        });

        return { totalWords, totalStories, totalGames, totalAvatars, byLanguage };
    }

    private normalizePagination(page?: number, pageSize?: number): { page: number; pageSize: number } {
        const normalizedPage = Number.isFinite(page) ? Math.max(1, Math.floor(page as number)) : 1;
        const normalizedSize = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize as number)) : 20;
        return { page: normalizedPage, pageSize: Math.min(100, normalizedSize) };
    }

    private toContentListItem(content: Content): ContentListItemDto {
        return {
            id: content.id,
            type: content.type,
            title: content.title,
            description: content.description,
            language: content.language,
            difficulty: content.difficulty,
            minAge: content.minAge,
            maxAge: content.maxAge,
            imageUrl: content.imageUrl,
            tags: content.tags,
            createdAt: content.createdAt,
        };
    }

    private toStoryListItem(story: Story): StoryListItemDto {
        return {
            id: story.id,
            title: story.title,
            description: story.description,
            language: story.language,
            difficulty: story.difficulty,
            minAge: story.minAge,
            maxAge: story.maxAge,
            coverImageUrl: story.coverImageUrl,
            estimatedMinutes: story.estimatedMinutes,
            pagesCount: story.pages?.length ?? 0,
            createdAt: story.createdAt,
        };
    }
}
