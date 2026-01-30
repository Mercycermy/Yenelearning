import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Progress } from '../entities/progress.entity';
import { Child } from '../entities/child.entity';
import { Content } from '../entities/content.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Progress, Child, Content])],
    controllers: [ProgressController],
    providers: [ProgressService],
    exports: [ProgressService],
})
export class ProgressModule { }
