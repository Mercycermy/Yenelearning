import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { PaymentPurpose } from '../../entities/payment.entity';

export class InitializePaymentDto {
    @IsNumber()
    @Min(1)
    amount: number;

    @IsEnum(PaymentPurpose)
    purpose: PaymentPurpose;

    @IsOptional()
    @IsString()
    childId?: string;

    @IsOptional()
    @IsString()
    targetGrade?: string;

    @IsOptional()
    @IsString()
    schoolId?: string;

    @IsOptional()
    @IsNumber()
    licenseQuantity?: number;

    @IsOptional()
    @IsString()
    returnUrl?: string;
}
