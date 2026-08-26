import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { GradeLevel, SupportedLanguage } from '../../entities/child.entity';

export class UpdateSchoolStudentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsInt()
    @Min(3)
    @Max(15)
    @IsOptional()
    age?: number;

    @IsEnum(GradeLevel)
    @IsOptional()
    grade?: GradeLevel;

    @IsEnum(SupportedLanguage)
    @IsOptional()
    currentLanguage?: SupportedLanguage;

    @IsInt()
    @IsOptional()
    @Min(10)
    @Max(180)
    dailyTimeLimitMinutes?: number;
}
