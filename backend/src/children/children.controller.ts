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
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

interface AuthRequest {
    user: { userId: string; role: string };
}

@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildrenController {
    constructor(private readonly childrenService: ChildrenService) { }

    @Post()
    create(@Request() req: AuthRequest, @Body() createChildDto: CreateChildDto) {
        return this.childrenService.create(req.user.userId, createChildDto);
    }

    @Get()
    findAll(@Request() req: AuthRequest) {
        if (req.user.role === UserRole.ADMIN) {
            return this.childrenService.findAll();
        }
        return this.childrenService.findAllByParent(req.user.userId);
    }

    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.childrenService.getStats();
    }

    @Get(':id')
    findOne(@Request() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
        const parentId = req.user.role === UserRole.ADMIN ? undefined : req.user.userId;
        return this.childrenService.findOne(id, parentId);
    }

    @Patch(':id')
    update(
        @Request() req: AuthRequest,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateChildDto: UpdateChildDto,
    ) {
        return this.childrenService.update(id, req.user.userId, updateChildDto);
    }

    @Delete(':id')
    remove(@Request() req: AuthRequest, @Param('id', ParseUUIDPipe) id: string) {
        return this.childrenService.remove(id, req.user.userId);
    }

    @Patch(':id/add-stars')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    addStars(@Param('id', ParseUUIDPipe) id: string, @Body('stars') stars: number) {
        return this.childrenService.addStars(id, stars);
    }

    @Patch(':id/add-badge')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    addBadge(@Param('id', ParseUUIDPipe) id: string, @Body('badge') badge: string) {
        return this.childrenService.addBadge(id, badge);
    }
}
