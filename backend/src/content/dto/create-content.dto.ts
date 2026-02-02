import {
    IsString,
    IsEnum,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsArray,
    IsObject,
    IsUrl,
} from 'class-validator';
import { ContentType, DifficultyLevel } from '../../entities/content.entity';
import { SupportedLanguage } from '../../entities/child.entity';

export class CreateContentDto {
    @IsEnum(ContentType)
    type: ContentType;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

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
    imageUrl?: string;

    @IsOptional()
    @IsUrl({ require_tld: false })
    audioUrl?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsInt()
    @Min(0)
    orderIndex?: number;
}
