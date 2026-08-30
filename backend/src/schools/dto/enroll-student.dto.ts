import { IsNotEmpty, IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { GradeLevel, SupportedLanguage } from '../../entities/child.entity';

export class EnrollStudentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @Min(3)
    @Max(15)
    age: number;

    @IsEnum(GradeLevel)
    @IsOptional()
    grade?: GradeLevel = GradeLevel.KG;

    @IsEnum(SupportedLanguage)
    @IsOptional()
    currentLanguage?: SupportedLanguage = SupportedLanguage.AMHARIC;

    @IsInt()
    @IsOptional()
    @Min(10)
    @Max(180)
    dailyTimeLimitMinutes?: number = 30;

    @IsString()
    @IsOptional()
    parentId?: string;

    @IsString()
    @IsOptional()
    parentEmail?: string;

    @IsString()
    @IsOptional()
    parentFirstName?: string;

    @IsString()
    @IsOptional()
    parentLastName?: string;
}
