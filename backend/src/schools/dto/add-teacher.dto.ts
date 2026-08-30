import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class AddTeacherDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    password?: string;
}
