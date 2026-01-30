import { IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsUrl } from 'class-validator';
import { AvatarGender, TeachingStyle } from '../../entities/avatar.entity';

export class CreateAvatarDto {
    @IsString()
    name: string;

    @IsEnum(AvatarGender)
    gender: AvatarGender;

    @IsOptional()
    @IsEnum(TeachingStyle)
    teachingStyle?: TeachingStyle;

    @IsOptional()
    @IsString()
    personalityDescription?: string;

    @IsUrl()
    imageUrl: string;

    @IsOptional()
    @IsString()
    voiceId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0.5)
    @Max(2.0)
    speechRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0.5)
    @Max(2.0)
    pitchLevel?: number;
}
