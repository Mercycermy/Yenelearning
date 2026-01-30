import { IsUUID, IsOptional, IsInt, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ProgressStatus } from '../../entities/progress.entity';

export class RecordProgressDto {
    @IsUUID()
    contentId: string;

    @IsOptional()
    @IsEnum(ProgressStatus)
    status?: ProgressStatus;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(3)
    starsEarned?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    pronunciationScore?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    timeSpentSeconds?: number;
}
