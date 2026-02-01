import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('languages')
    @Roles(UserRole.ADMIN)
    listLanguages() {
        return this.settingsService.listLanguages();
    }

    @Post('languages')
    @Roles(UserRole.ADMIN)
    createLanguage(@Body() data: { code: string; name: string; nativeName: string }) {
        return this.settingsService.createLanguage(data);
    }

    @Patch('languages/:id')
    @Roles(UserRole.ADMIN)
    toggleLanguage(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: { isActive: boolean },
    ) {
        return this.settingsService.toggleLanguage(id, data.isActive);
    }

    @Delete('languages/:id')
    @Roles(UserRole.ADMIN)
    deleteLanguage(@Param('id', ParseUUIDPipe) id: string) {
        return this.settingsService.deleteLanguage(id);
    }
}
