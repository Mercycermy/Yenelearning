import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
    user: { userId: string; role: string };
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) {}

    @Post()
    send(@Request() req: AuthRequest, @Body() createMessageDto: CreateMessageDto) {
        return this.messagingService.send(req.user.userId, createMessageDto);
    }

    @Get('inbox')
    getInbox(@Request() req: AuthRequest) {
        return this.messagingService.getInbox(req.user.userId);
    }

    @Get('sent')
    getSent(@Request() req: AuthRequest) {
        return this.messagingService.getSent(req.user.userId);
    }

    @Get('unread-count')
    getUnreadCount(@Request() req: AuthRequest) {
        return this.messagingService.getUnreadCount(req.user.userId);
    }

    @Patch(':id/read')
    markAsRead(
        @Request() req: AuthRequest,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.messagingService.markAsRead(id, req.user.userId);
    }

    @Delete(':id')
    remove(
        @Request() req: AuthRequest,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.messagingService.remove(id, req.user.userId);
    }
}
