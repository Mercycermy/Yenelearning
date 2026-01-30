import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ContentType, DifficultyLevel } from '../entities/content.entity';
import { SupportedLanguage } from '../entities/child.entity';

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    // ===== WORDS/CONTENT ENDPOINTS =====

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createContent(@Body() createContentDto: CreateContentDto) {
        return this.contentService.createContent(createContentDto);
    }

    @Get()
    findAllContent(
        @Query('type') type?: ContentType,
        @Query('language') language?: SupportedLanguage,
        @Query('difficulty') difficulty?: DifficultyLevel,
        @Query('minAge') minAge?: number,
        @Query('maxAge') maxAge?: number,
    ) {
        return this.contentService.findAllContent({ type, language, difficulty, minAge, maxAge });
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    getContentStats() {
        return this.contentService.getContentStats();
    }

    @Get(':id')
    findOneContent(@Param('id', ParseUUIDPipe) id: string) {
        return this.contentService.findOneContent(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateContent(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateData: Partial<CreateContentDto>,
    ) {
        return this.contentService.updateContent(id, updateData);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    deleteContent(@Param('id', ParseUUIDPipe) id: string) {
        return this.contentService.deleteContent(id);
    }

    // ===== STORY ENDPOINTS =====

    @Post('stories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createStory(@Body() createStoryDto: CreateStoryDto) {
        return this.contentService.createStory(createStoryDto);
    }

    @Get('stories/all')
    findAllStories(
        @Query('language') language?: SupportedLanguage,
        @Query('difficulty') difficulty?: DifficultyLevel,
        @Query('age') age?: number,
    ) {
        return this.contentService.findAllStories({ language, difficulty, age });
    }

    @Get('stories/:id')
    findOneStory(@Param('id', ParseUUIDPipe) id: string) {
        return this.contentService.findOneStory(id);
    }

    @Patch('stories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStory(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateData: Partial<CreateStoryDto>,
    ) {
        return this.contentService.updateStory(id, updateData);
    }

    @Delete('stories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    deleteStory(@Param('id', ParseUUIDPipe) id: string) {
        return this.contentService.deleteStory(id);
    }

    // ===== AVATAR ENDPOINTS =====

    @Post('avatars')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    createAvatar(@Body() createAvatarDto: CreateAvatarDto) {
        return this.contentService.createAvatar(createAvatarDto);
    }

    @Get('avatars/all')
    findAllAvatars() {
        return this.contentService.findAllAvatars();
    }

    @Get('avatars/:id')
    findOneAvatar(@Param('id', ParseUUIDPipe) id: string) {
        return this.contentService.findOneAvatar(id);
    }

    @Patch('avatars/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateAvatar(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateData: Partial<CreateAvatarDto>,
    ) {
        return this.contentService.updateAvatar(id, updateData);
    }

    @Delete('avatars/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    deleteAvatar(@Param('id', ParseUUIDPipe) id: string) {
        return this.contentService.deleteAvatar(id);
    }
}
