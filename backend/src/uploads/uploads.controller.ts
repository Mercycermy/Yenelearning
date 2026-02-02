import {
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

function filenameBuilder(_: unknown, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = extname(file.originalname || '') || '.png';
    callback(null, `${uniqueSuffix}${fileExt}`);
}

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
    @Post()
    @Roles(UserRole.ADMIN)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'uploads',
                filename: filenameBuilder,
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            filename: file.filename,
            url: `/uploads/${file.filename}`,
        };
    }
}
