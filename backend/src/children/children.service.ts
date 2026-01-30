import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from '../entities/child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectRepository(Child)
        private readonly childRepository: Repository<Child>,
    ) { }

    async create(parentId: string, createChildDto: CreateChildDto): Promise<Child> {
        const child = this.childRepository.create({
            ...createChildDto,
            parentId,
        });
        return this.childRepository.save(child);
    }

    async findAllByParent(parentId: string): Promise<Child[]> {
        return this.childRepository.find({
            where: { parentId },
            relations: ['progress'],
            order: { createdAt: 'DESC' },
        });
    }

    async findAll(): Promise<Child[]> {
        return this.childRepository.find({
            relations: ['parent', 'progress'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, parentId?: string): Promise<Child> {
        const child = await this.childRepository.findOne({
            where: { id },
            relations: ['progress', 'progress.content'],
        });

        if (!child) {
            throw new NotFoundException('Child not found');
        }

        if (parentId && child.parentId !== parentId) {
            throw new ForbiddenException('Access denied');
        }

        return child;
    }

    async update(id: string, parentId: string, updateChildDto: UpdateChildDto): Promise<Child> {
        const child = await this.findOne(id, parentId);
        Object.assign(child, updateChildDto);
        return this.childRepository.save(child);
    }

    async remove(id: string, parentId: string): Promise<void> {
        const child = await this.findOne(id, parentId);
        await this.childRepository.remove(child);
    }

    async updateTimeSpent(id: string, minutes: number): Promise<void> {
        const child = await this.childRepository.findOne({ where: { id } });
        if (!child) {
            throw new NotFoundException('Child not found');
        }
        child.totalTimeSpentMinutes += minutes;
        await this.childRepository.save(child);
    }

    async addStars(id: string, stars: number): Promise<void> {
        const child = await this.childRepository.findOne({ where: { id } });
        if (!child) {
            throw new NotFoundException('Child not found');
        }
        child.totalStars += stars;
        await this.childRepository.save(child);
    }

    async addBadge(id: string, badge: string): Promise<void> {
        const child = await this.childRepository.findOne({ where: { id } });
        if (!child) {
            throw new NotFoundException('Child not found');
        }
        if (!child.badges.includes(badge)) {
            child.badges.push(badge);
            await this.childRepository.save(child);
        }
    }

    async getStats(): Promise<{
        totalChildren: number;
        averageAge: number;
        languageDistribution: Record<string, number>;
    }> {
        const children = await this.childRepository.find();
        const totalChildren = children.length;

        const averageAge = totalChildren > 0
            ? children.reduce((sum, c) => sum + c.age, 0) / totalChildren
            : 0;

        const languageDistribution: Record<string, number> = {};
        children.forEach((child) => {
            const lang = child.currentLanguage;
            languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
        });

        return { totalChildren, averageAge: Math.round(averageAge * 10) / 10, languageDistribution };
    }
}
