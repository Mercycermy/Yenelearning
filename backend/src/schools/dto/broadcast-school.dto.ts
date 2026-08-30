import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class BroadcastSchoolDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsString()
    @IsOptional()
    targetGrade?: string; // Optional: filter by grade like 'kg', 'grade_1', etc. or all

    @IsString()
    @IsOptional()
    targetParentId?: string; // Optional: send to specific parent
}
