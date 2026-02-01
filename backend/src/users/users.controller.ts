import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    ParseUUIDPipe,
    Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.usersService.getStats();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateData: Record<string, unknown>) {
        return this.usersService.update(id, updateData);
    }

    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    deactivate(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/activate')
    @Roles(UserRole.ADMIN)
    activate(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.activate(id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.remove(id);
    }
}
