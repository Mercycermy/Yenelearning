import {
    IsString,
    IsEnum,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsArray,
    IsUrl,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../entities/content.entity';
import { SupportedLanguage } from '../../entities/child.entity';

export class StoryPageDto {
    @IsInt()
    @Min(1)
    pageNumber: number;

    @IsString()
    text: string;

    @IsOptional()
    @IsUrl({ require_tld: false })
    imageUrl?: string;

    @IsOptional()
    @IsUrl({ require_tld: false })
    audioUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    vocabularyWords?: string[];

    @IsOptional()
    @IsString()
    interactionQuestion?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    interactionOptions?: string[];
}

export class CreateStoryDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsEnum(SupportedLanguage)
    language: SupportedLanguage;

    @IsOptional()
    @IsEnum(DifficultyLevel)
    difficulty?: DifficultyLevel;

    @IsOptional()
    @IsInt()
    @Min(4)
    @Max(12)
    minAge?: number;

    @IsOptional()
    @IsInt()
    @Min(4)
    @Max(12)
    maxAge?: number;

    @IsOptional()
    @IsUrl({ require_tld: false })
    coverImageUrl?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StoryPageDto)
    pages: StoryPageDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    vocabularyHighlights?: string[];

    @IsOptional()
    @IsInt()
    @Min(1)
    estimatedMinutes?: number;
}
