import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress, ProgressStatus } from '../entities/progress.entity';
import { Child } from '../entities/child.entity';
import { RecordProgressDto } from './dto/record-progress.dto';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @InjectRepository(Child)
        private readonly childRepository: Repository<Child>,
    ) { }

    async recordProgress(childId: string, dto: RecordProgressDto): Promise<Progress> {
        if (!dto.contentId && !dto.storyId) {
            throw new BadRequestException('contentId or storyId is required');
        }

        if (dto.storyId && !dto.pageNumber) {
            throw new BadRequestException('pageNumber is required when storyId is provided');
        }

        const isStoryProgress = !!dto.storyId;

        let progress = await this.progressRepository.findOne({
            where: isStoryProgress
                ? { childId, storyId: dto.storyId, pageNumber: dto.pageNumber }
                : { childId, contentId: dto.contentId },
        });

        if (!progress) {
            progress = this.progressRepository.create({
                childId,
                contentId: dto.contentId ?? null,
                storyId: dto.storyId ?? null,
                pageNumber: dto.pageNumber ?? null,
            });
        }

        progress.attempts += 1;
        progress.lastAttemptAt = new Date();

        if (dto.starsEarned !== undefined) {
            progress.starsEarned = Math.max(progress.starsEarned, dto.starsEarned);
        }

        if (dto.pronunciationScore !== undefined) {
            progress.pronunciationScore = dto.pronunciationScore;
        }

        if (dto.timeSpentSeconds) {
            progress.timeSpentSeconds += dto.timeSpentSeconds;
        }

        if (dto.status) {
            progress.status = dto.status;
            if (dto.status === ProgressStatus.COMPLETED || dto.status === ProgressStatus.MASTERED) {
                progress.completedAt = new Date();
            }
        }

        await this.progressRepository.save(progress);

        // Update child's total stars if stars were earned
        if (dto.starsEarned && dto.starsEarned > 0) {
            const child = await this.childRepository.findOne({ where: { id: childId } });
            if (child) {
                child.totalStars += dto.starsEarned;
                await this.childRepository.save(child);
            }
        }

        return progress;
    }

    async getChildProgress(childId: string): Promise<Progress[]> {
        return this.progressRepository.find({
            where: { childId },
            relations: ['content', 'story'],
            order: { lastAttemptAt: 'DESC' },
        });
    }

    async getProgressByContent(childId: string, contentId: string): Promise<Progress | null> {
        return this.progressRepository.findOne({
            where: { childId, contentId },
            relations: ['content'],
        });
    }

    async getProgressByStoryPage(
        childId: string,
        storyId: string,
        pageNumber: number,
    ): Promise<Progress | null> {
        return this.progressRepository.findOne({
            where: { childId, storyId, pageNumber },
            relations: ['story'],
        });
    }

    async getChildSummary(childId: string): Promise<{
        totalCompleted: number;
        totalInProgress: number;
        totalMastered: number;
        averagePronunciation: number;
        totalTimeMinutes: number;
        recentActivity: Progress[];
    }> {
        const allProgress = await this.progressRepository.find({ where: { childId } });

        const totalCompleted = allProgress.filter(
            (p) => p.status === ProgressStatus.COMPLETED || p.status === ProgressStatus.MASTERED,
        ).length;
        const totalInProgress = allProgress.filter(
            (p) => p.status === ProgressStatus.IN_PROGRESS,
        ).length;
        const totalMastered = allProgress.filter(
            (p) => p.status === ProgressStatus.MASTERED,
        ).length;

        const withScores = allProgress.filter((p) => p.pronunciationScore > 0);
        const averagePronunciation =
            withScores.length > 0
                ? withScores.reduce((sum, p) => sum + Number(p.pronunciationScore), 0) / withScores.length
                : 0;

        const totalTimeMinutes = Math.round(
            allProgress.reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60,
        );

        const recentActivity = await this.progressRepository.find({
            where: { childId },
            relations: ['content', 'story'],
            order: { lastAttemptAt: 'DESC' },
            take: 10,
        });

        return {
            totalCompleted,
            totalInProgress,
            totalMastered,
            averagePronunciation: Math.round(averagePronunciation * 100) / 100,
            totalTimeMinutes,
            recentActivity,
        };
    }

    async getGlobalStats(): Promise<{
        totalProgressRecords: number;
        averageCompletionRate: number;
        topPerformingContent: Array<{ contentId: string; completions: number }>;
    }> {
        const allProgress = await this.progressRepository.find();
        const totalProgressRecords = allProgress.length;

        const completed = allProgress.filter(
            (p) => p.status === ProgressStatus.COMPLETED || p.status === ProgressStatus.MASTERED,
        );
        const averageCompletionRate =
            totalProgressRecords > 0 ? (completed.length / totalProgressRecords) * 100 : 0;

        // Get top performing content
        const contentCounts: Record<string, number> = {};
        completed.forEach((p) => {
            contentCounts[p.contentId] = (contentCounts[p.contentId] || 0) + 1;
        });

        const topPerformingContent = Object.entries(contentCounts)
            .map(([contentId, completions]) => ({ contentId, completions }))
            .sort((a, b) => b.completions - a.completions)
            .slice(0, 10);

        return {
            totalProgressRecords,
            averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
            topPerformingContent,
        };
    }
}
