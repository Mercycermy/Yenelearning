import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../entities/language.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Language)
        private readonly languageRepository: Repository<Language>,
    ) { }

    private async ensureDefaults(): Promise<void> {
        const count = await this.languageRepository.count();
        if (count > 0) return;
        await this.languageRepository.save(
            this.languageRepository.create([
                { code: 'amharic', name: 'Amharic', nativeName: 'አማርኛ', isActive: true },
                { code: 'geez', name: 'Ge\'ez', nativeName: 'ግዕዝ', isActive: true },
                { code: 'english', name: 'English', nativeName: 'English', isActive: true },
                { code: 'oromo', name: 'Oromo', nativeName: 'Afaan Oromoo', isActive: true },
            ]),
        );
    }

    async listLanguages(): Promise<Language[]> {
        await this.ensureDefaults();
        return this.languageRepository.find({ order: { createdAt: 'ASC' } });
    }

    async createLanguage(data: { code: string; name: string; nativeName: string }): Promise<Language> {
        const language = this.languageRepository.create({
            code: data.code.toLowerCase(),
            name: data.name,
            nativeName: data.nativeName,
            isActive: true,
        });
        return this.languageRepository.save(language);
    }

    async toggleLanguage(id: string, isActive: boolean): Promise<Language> {
        const language = await this.languageRepository.findOne({ where: { id } });
        if (!language) {
            throw new NotFoundException('Language not found');
        }
        language.isActive = isActive;
        return this.languageRepository.save(language);
    }

    async deleteLanguage(id: string): Promise<void> {
        const language = await this.languageRepository.findOne({ where: { id } });
        if (!language) {
            throw new NotFoundException('Language not found');
        }
        await this.languageRepository.remove(language);
    }
}
