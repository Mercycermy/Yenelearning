import { IsNotEmpty, IsInt, Min, Max, IsEnum, IsOptional, IsString } from 'class-validator';
import { GradeLevel, SupportedLanguage } from '../../entities/child.entity';

export class GenerateStudentCredsDto {
    @IsInt()
    @Min(1)
    @Max(100)
    count: number;

    @IsEnum(GradeLevel)
    @IsOptional()
    grade?: GradeLevel = GradeLevel.KG;

    @IsInt()
    @Min(3)
    @Max(15)
    @IsOptional()
    age?: number = 6;

    @IsEnum(SupportedLanguage)
    @IsOptional()
    currentLanguage?: SupportedLanguage = SupportedLanguage.AMHARIC;

    @IsString()
    @IsOptional()
    prefix?: string = 'student';
}
