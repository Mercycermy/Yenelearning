import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

interface AuthRequest {
    user: { userId: string; role: string };
}

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('initialize')
    @UseGuards(JwtAuthGuard)
    initialize(@Request() req: AuthRequest, @Body() dto: InitializePaymentDto) {
        return this.paymentsService.initialize(req.user.userId, dto);
    }

    @Get('verify/:txRef')
    @UseGuards(JwtAuthGuard)
    verify(@Param('txRef') txRef: string) {
        return this.paymentsService.verify(txRef);
    }

    @Get('my-history')
    @UseGuards(JwtAuthGuard)
    getMyHistory(@Request() req: AuthRequest) {
        return this.paymentsService.getUserPayments(req.user.userId);
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getAll() {
        return this.paymentsService.getAllPayments();
    }
}
