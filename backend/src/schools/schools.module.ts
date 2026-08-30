import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { School } from '../entities/school.entity';
import { User } from '../entities/user.entity';
import { Child } from '../entities/child.entity';
import { Message } from '../entities/message.entity';
import { Progress } from '../entities/progress.entity';

@Module({
    imports: [TypeOrmModule.forFeature([School, User, Child, Message, Progress])],
    controllers: [SchoolsController],
    providers: [SchoolsService],
    exports: [SchoolsService],
})
export class SchoolsModule {}
