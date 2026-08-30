import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class StudentNoticeDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsBoolean()
    @IsOptional()
    includeProgressSummary?: boolean = false;
}
