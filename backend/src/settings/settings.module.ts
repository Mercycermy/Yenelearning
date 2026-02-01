import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Language } from '../entities/language.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Language])],
    controllers: [SettingsController],
    providers: [SettingsService],
})
export class SettingsModule { }
