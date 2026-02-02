import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    ParseUUIDPipe,
    ParseIntPipe,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { RecordProgressDto } from './dto/record-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

interface AuthRequest {
    user: { userId: string; role: string };
}

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @Post(':childId')
    recordProgress(
        @Param('childId', ParseUUIDPipe) childId: string,
        @Body() dto: RecordProgressDto,
    ) {
        return this.progressService.recordProgress(childId, dto);
    }

    @Get('stats/dashboard')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getDashboardStats() {
        return this.progressService.getDashboardStats();
    }

    @Get(':childId')
    getChildProgress(@Param('childId', ParseUUIDPipe) childId: string) {
        return this.progressService.getChildProgress(childId);
    }

    @Get(':childId/summary')
    getChildSummary(@Param('childId', ParseUUIDPipe) childId: string) {
        return this.progressService.getChildSummary(childId);
    }

    @Get(':childId/content/:contentId')
    getProgressByContent(
        @Param('childId', ParseUUIDPipe) childId: string,
        @Param('contentId', ParseUUIDPipe) contentId: string,
    ) {
        return this.progressService.getProgressByContent(childId, contentId);
    }

    @Get(':childId/story/:storyId/page/:pageNumber')
    getProgressByStoryPage(
        @Param('childId', ParseUUIDPipe) childId: string,
        @Param('storyId', ParseUUIDPipe) storyId: string,
        @Param('pageNumber', ParseIntPipe) pageNumber: number,
    ) {
        return this.progressService.getProgressByStoryPage(childId, storyId, pageNumber);
    }

    @Get('stats/global')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getGlobalStats() {
        return this.progressService.getGlobalStats();
    }
}
