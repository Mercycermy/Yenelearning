import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentPurpose, PaymentStatus } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { Child, GradeLevel } from '../entities/child.entity';
import { School } from '../entities/school.entity';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly chapaSecretKey: string;
    private readonly chapaBaseUrl = 'https://api.chapa.co/v1';

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Child)
        private readonly childRepository: Repository<Child>,
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>,
        private readonly configService: ConfigService,
    ) {
        this.chapaSecretKey = this.configService.get<string>('CHAPA_SECRET_KEY', 'CHASECK_TEST-sandbox-key');
    }

    async initialize(userId: string, dto: InitializePaymentDto): Promise<{ checkoutUrl: string; txRef: string; payment: Payment }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const txRef = `YENE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const payment = this.paymentRepository.create({
            userId,
            txRef,
            amount: dto.amount,
            currency: 'ETB',
            purpose: dto.purpose,
            status: PaymentStatus.PENDING,
            childId: dto.childId,
            targetGrade: dto.targetGrade,
            schoolId: dto.schoolId,
            licenseQuantity: dto.licenseQuantity,
            metadata: {
                userEmail: user.email,
                userName: `${user.firstName} ${user.lastName}`,
            },
        });

        let checkoutUrl = `https://checkout.chapa.co/checkout/test/${txRef}`;

        // Attempt live Chapa initialization if configured with a real key
        if (this.chapaSecretKey && !this.chapaSecretKey.includes('sandbox')) {
            try {
                const response = await fetch(`${this.chapaBaseUrl}/transaction/initialize`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.chapaSecretKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: dto.amount.toString(),
                        currency: 'ETB',
                        email: user.email,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        tx_ref: txRef,
                        callback_url: `${this.configService.get<string>('API_BASE_URL', 'http://localhost:3001')}/api/payments/webhook`,
                        return_url: dto.returnUrl || 'http://localhost:3000/parent-dashboard',
                        'customization[title]': 'YeneLearning Educational Upgrade',
                        'customization[description]': `Payment for ${dto.purpose.replace('_', ' ')}`,
                    }),
                });

                const data = await response.json();
                if (data.status === 'success' && data.data?.checkout_url) {
                    checkoutUrl = data.data.checkout_url;
                }
            } catch (error) {
                this.logger.warn(`Chapa API call failed, using sandbox checkout fallback: ${error}`);
            }
        }

        payment.checkoutUrl = checkoutUrl;
        await this.paymentRepository.save(payment);

        return { checkoutUrl, txRef, payment };
    }

    async verify(txRef: string): Promise<{ status: PaymentStatus; payment: Payment; message: string }> {
        const payment = await this.paymentRepository.findOne({ where: { txRef } });
        if (!payment) {
            throw new NotFoundException('Transaction not found');
        }

        if (payment.status === PaymentStatus.SUCCESS) {
            return { status: PaymentStatus.SUCCESS, payment, message: 'Payment already processed successfully' };
        }

        let isVerified = false;

        if (this.chapaSecretKey && !this.chapaSecretKey.includes('sandbox')) {
            try {
                const response = await fetch(`${this.chapaBaseUrl}/transaction/verify/${txRef}`, {
                    headers: { Authorization: `Bearer ${this.chapaSecretKey}` },
                });
                const data = await response.json();
                if (data.status === 'success' && data.data?.status === 'success') {
                    isVerified = true;
                }
            } catch (error) {
                this.logger.warn(`Chapa verification call failed: ${error}`);
            }
        } else {
            // Mock sandbox auto-verification
            isVerified = true;
        }

        if (isVerified) {
            payment.status = PaymentStatus.SUCCESS;
            await this.paymentRepository.save(payment);
            await this.fulfillPayment(payment);
            return { status: PaymentStatus.SUCCESS, payment, message: 'Payment verified and benefits applied' };
        } else {
            payment.status = PaymentStatus.FAILED;
            await this.paymentRepository.save(payment);
            return { status: PaymentStatus.FAILED, payment, message: 'Payment verification failed' };
        }
    }

    private async fulfillPayment(payment: Payment): Promise<void> {
        if (payment.purpose === PaymentPurpose.GRADE_UPGRADE && payment.childId && payment.targetGrade) {
            const child = await this.childRepository.findOne({ where: { id: payment.childId } });
            if (child) {
                child.grade = payment.targetGrade as GradeLevel;
                await this.childRepository.save(child);
                this.logger.log(`Upgraded child ${child.id} to grade ${payment.targetGrade}`);
            }
        } else if (payment.purpose === PaymentPurpose.SCHOOL_LICENSE && payment.schoolId && payment.licenseQuantity) {
            const school = await this.schoolRepository.findOne({ where: { id: payment.schoolId } });
            if (school) {
                school.licenseCount += payment.licenseQuantity;
                await this.schoolRepository.save(school);
                this.logger.log(`Added ${payment.licenseQuantity} licenses to school ${school.name}`);
            }
        } else if (payment.purpose === PaymentPurpose.SUBSCRIPTION) {
            const user = await this.userRepository.findOne({ where: { id: payment.userId } });
            if (user) {
                user.subscriptionPlan = 'premium';
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                user.subscriptionExpiresAt = nextYear;
                await this.userRepository.save(user);
                this.logger.log(`Activated annual subscription for user ${user.email}`);
            }
        }
    }

    async getUserPayments(userId: string): Promise<Payment[]> {
        return this.paymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async getAllPayments(): Promise<Payment[]> {
        return this.paymentRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
}
