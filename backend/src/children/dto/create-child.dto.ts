import { IsString, IsInt, IsOptional, IsEnum, Min, Max, IsArray } from 'class-validator';
import { SupportedLanguage } from '../../entities/child.entity';

export class CreateChildDto {
    @IsString()
    name: string;

    @IsInt()
    @Min(4)
    @Max(12)
    age: number;

    @IsOptional()
    @IsString()
    avatarId?: string;

    @IsOptional()
    @IsEnum(SupportedLanguage)
    currentLanguage?: SupportedLanguage;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    learningLanguages?: string[];

    @IsOptional()
    @IsInt()
    @Min(5)
    @Max(120)
    dailyTimeLimitMinutes?: number;
}
