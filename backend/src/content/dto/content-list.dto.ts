import { ContentType, DifficultyLevel } from '../../entities/content.entity';
import { SupportedLanguage } from '../../entities/child.entity';

export class ContentListItemDto {
    id: string;
    type: ContentType;
    title: string;
    description?: string;
    language: SupportedLanguage;
    difficulty: DifficultyLevel;
    minAge: number;
    maxAge: number;
    imageUrl?: string;
    tags: string[];
    createdAt: Date;
}

export class ContentListResponseDto {
    items: ContentListItemDto[];
    total: number;
    page: number;
    pageSize: number;
}
