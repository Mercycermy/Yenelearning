import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from '../entities/payment.entity';
import { User } from '../entities/user.entity';
import { Child } from '../entities/child.entity';
import { School } from '../entities/school.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, User, Child, School])],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
