import { DifficultyLevel } from '../../entities/content.entity';
import { SupportedLanguage } from '../../entities/child.entity';

export class StoryListItemDto {
    id: string;
    title: string;
    description: string;
    language: SupportedLanguage;
    difficulty: DifficultyLevel;
    minAge: number;
    maxAge: number;
    coverImageUrl?: string;
    estimatedMinutes: number;
    pagesCount: number;
    createdAt: Date;
}

export class StoryListResponseDto {
    items: StoryListItemDto[];
    total: number;
    page: number;
    pageSize: number;
}
