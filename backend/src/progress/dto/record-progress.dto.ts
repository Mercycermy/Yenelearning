import {
    IsUUID,
    IsOptional,
    IsInt,
    IsNumber,
    Min,
    Max,
    IsEnum,
    ValidateIf,
} from 'class-validator';
import { ProgressStatus } from '../../entities/progress.entity';

export class RecordProgressDto {
    @ValidateIf((o) => !o.storyId)
    @IsUUID()
    @IsOptional()
    contentId?: string;

    @ValidateIf((o) => !o.contentId)
    @IsUUID()
    @IsOptional()
    storyId?: string;

    @ValidateIf((o) => !!o.storyId)
    @IsInt()
    @Min(1)
    pageNumber?: number;

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
