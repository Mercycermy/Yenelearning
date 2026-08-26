import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Progress, ProgressStatus } from '../entities/progress.entity';
import { Child } from '../entities/child.entity';
import { GameResult } from '../entities/game-result.entity';
import { RecordProgressDto } from './dto/record-progress.dto';
import { ContentType } from '../entities/content.entity';


@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @InjectRepository(Child)
        private readonly childRepository: Repository<Child>,
        @InjectRepository(GameResult)
        private readonly gameResultRepository: Repository<GameResult>,
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
            const payload: Partial<Progress> = {
                childId,
                contentId: dto.contentId,
                storyId: dto.storyId,
                pageNumber: dto.pageNumber,
            };

            progress = this.progressRepository.create(payload);
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
            if (!p.contentId) return;
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

    async getDashboardStats(): Promise<{
        totalLearners: number;
        wordsLearned: number;
        storiesCompleted: number;
        avgLearningMinutes: number;
        changes: {
            learners: number;
            words: number;
            stories: number;
            avgTime: number;
        };
        recentActivity: Array<{
            id: string;
            type: string;
            title: string;
            childName: string;
            status: ProgressStatus;
            occurredAt: Date | null;
        }>;
    }> {
        const now = new Date();
        const last7 = new Date(now);
        last7.setDate(now.getDate() - 7);
        const prev7 = new Date(now);
        prev7.setDate(now.getDate() - 14);

        const totalLearners = await this.childRepository.count();

        const learnersLast7 = await this.childRepository.count({
            where: { createdAt: MoreThanOrEqual(last7) },
        });
        const learnersPrev7 = await this.childRepository.count({
            where: { createdAt: Between(prev7, last7) },
        });

        const completedStatuses = [ProgressStatus.COMPLETED, ProgressStatus.MASTERED];

        const wordsLearned = await this.progressRepository
            .createQueryBuilder('progress')
            .innerJoin('progress.content', 'content')
            .where('content.type = :type', { type: ContentType.WORD })
            .andWhere('progress.status IN (:...statuses)', { statuses: completedStatuses })
            .getCount();

        const wordsLast7 = await this.progressRepository
            .createQueryBuilder('progress')
            .innerJoin('progress.content', 'content')
            .where('content.type = :type', { type: ContentType.WORD })
            .andWhere('progress.status IN (:...statuses)', { statuses: completedStatuses })
            .andWhere('progress.completedAt >= :last7', { last7 })
            .getCount();

        const wordsPrev7 = await this.progressRepository
            .createQueryBuilder('progress')
            .innerJoin('progress.content', 'content')
            .where('content.type = :type', { type: ContentType.WORD })
            .andWhere('progress.status IN (:...statuses)', { statuses: completedStatuses })
            .andWhere('progress.completedAt BETWEEN :prev7 AND :last7', { prev7, last7 })
            .getCount();

        const storiesCompleted = await this.progressRepository
            .createQueryBuilder('progress')
            .where('progress.storyId IS NOT NULL')
            .andWhere('progress.status IN (:...statuses)', { statuses: completedStatuses })
            .getCount();

        const storiesLast7 = await this.progressRepository
            .createQueryBuilder('progress')
            .where('progress.storyId IS NOT NULL')
            .andWhere('progress.status IN (:...statuses)', { statuses: completedStatuses })
            .andWhere('progress.completedAt >= :last7', { last7 })
            .getCount();

        const storiesPrev7 = await this.progressRepository
            .createQueryBuilder('progress')
            .where('progress.storyId IS NOT NULL')
            .andWhere('progress.status IN (:...statuses)', { statuses: completedStatuses })
            .andWhere('progress.completedAt BETWEEN :prev7 AND :last7', { prev7, last7 })
            .getCount();

        const recentProgress = await this.progressRepository.find({
            relations: ['content', 'story', 'child'],
            order: { lastAttemptAt: 'DESC' },
            take: 10,
        });

        const last7Time = await this.progressRepository.find({
            where: { lastAttemptAt: MoreThanOrEqual(last7) },
        });
        const prev7Time = await this.progressRepository.find({
            where: { lastAttemptAt: Between(prev7, last7) },
        });

        const totalSecondsLast7 = last7Time.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0);
        const totalSecondsPrev7 = prev7Time.reduce((sum, p) => sum + (p.timeSpentSeconds || 0), 0);

        const avgLearningMinutes = totalLearners > 0
            ? Math.round((totalSecondsLast7 / 60 / totalLearners) * 10) / 10
            : 0;
        const avgLearningMinutesPrev = totalLearners > 0
            ? Math.round((totalSecondsPrev7 / 60 / totalLearners) * 10) / 10
            : 0;

        const pctChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 1000) / 10;
        };

        return {
            totalLearners,
            wordsLearned,
            storiesCompleted,
            avgLearningMinutes,
            changes: {
                learners: pctChange(learnersLast7, learnersPrev7),
                words: pctChange(wordsLast7, wordsPrev7),
                stories: pctChange(storiesLast7, storiesPrev7),
                avgTime: pctChange(avgLearningMinutes, avgLearningMinutesPrev),
            },
            recentActivity: recentProgress.map((p) => ({
                id: p.id,
                type: p.content ? p.content.type : 'story',
                title: p.content?.title || p.story?.title || 'Activity',
                childName: p.child?.name || 'Learner',
                status: p.status,
                occurredAt: p.lastAttemptAt || p.completedAt || null,
            })),
        };
    }

    async getWeeklySummary(childId: string): Promise<{
        wordsLearned: number;
        wordsLearnedLastWeek: number;
        accuracy: number;
        accuracyLastWeek: number;
        timeSpentMinutes: number;
        timeSpentMinutesLastWeek: number;
        totalStars: number;
        streakDays: number;
    }> {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const prevWeekStart = new Date(now);
        prevWeekStart.setDate(now.getDate() - 14);

        const child = await this.childRepository.findOne({ where: { id: childId } });
        if (!child) throw new NotFoundException('Child not found');

        const completedStatuses = [ProgressStatus.COMPLETED, ProgressStatus.MASTERED];

        // Words learned this week
        const wordsLearned = await this.progressRepository
            .createQueryBuilder('p')
            .innerJoin('p.content', 'c')
            .where('p.childId = :childId', { childId })
            .andWhere('c.type = :type', { type: ContentType.WORD })
            .andWhere('p.status IN (:...statuses)', { statuses: completedStatuses })
            .andWhere('p.completedAt >= :weekStart', { weekStart })
            .getCount();

        const wordsLearnedLastWeek = await this.progressRepository
            .createQueryBuilder('p')
            .innerJoin('p.content', 'c')
            .where('p.childId = :childId', { childId })
            .andWhere('c.type = :type', { type: ContentType.WORD })
            .andWhere('p.status IN (:...statuses)', { statuses: completedStatuses })
            .andWhere('p.completedAt BETWEEN :prevWeekStart AND :weekStart', { prevWeekStart, weekStart })
            .getCount();

        // Accuracy
        const allAttempts = await this.progressRepository.find({
            where: { childId },
        });
        const withScores = allAttempts.filter((p) => p.pronunciationScore > 0);
        const accuracy = withScores.length > 0
            ? Math.round(withScores.reduce((sum, p) => sum + Number(p.pronunciationScore), 0) / withScores.length)
            : 0;

        const prevWeekAttempts = allAttempts.filter(
            (p) => p.lastAttemptAt && p.lastAttemptAt >= prevWeekStart && p.lastAttemptAt < weekStart,
        );
        const prevWithScores = prevWeekAttempts.filter((p) => p.pronunciationScore > 0);
        const accuracyLastWeek = prevWithScores.length > 0
            ? Math.round(prevWithScores.reduce((sum, p) => sum + Number(p.pronunciationScore), 0) / prevWithScores.length)
            : 0;

        // Time spent
        const thisWeekProgress = allAttempts.filter(
            (p) => p.lastAttemptAt && p.lastAttemptAt >= weekStart,
        );
        const timeSpentMinutes = Math.round(
            thisWeekProgress.reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60,
        );
        const timeSpentMinutesLastWeek = Math.round(
            prevWeekAttempts.reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60,
        );

        // Streak: count consecutive days with activity
        let streakDays = 0;
        const today = new Date();
        for (let d = 0; d < 30; d++) {
            const dayStart = new Date(today);
            dayStart.setDate(today.getDate() - d);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);
            const hasActivity = allAttempts.some(
                (p) => p.lastAttemptAt && p.lastAttemptAt >= dayStart && p.lastAttemptAt < dayEnd,
            );
            if (hasActivity) {
                streakDays++;
            } else if (d > 0) {
                break;
            }
        }

        return {
            wordsLearned,
            wordsLearnedLastWeek,
            accuracy,
            accuracyLastWeek,
            timeSpentMinutes,
            timeSpentMinutesLastWeek,
            totalStars: child.totalStars,
            streakDays,
        };
    }

    async recordGameResult(childId: string, data: {
        gameType: string;
        score: number;
        maxScore: number;
        timeSpentSeconds: number;
        starsEarned: number;
    }): Promise<GameResult> {
        const child = await this.childRepository.findOne({ where: { id: childId } });
        if (!child) throw new NotFoundException('Child not found');

        const result = this.gameResultRepository.create({
            childId,
            gameType: data.gameType as any,
            score: data.score,
            maxScore: data.maxScore,
            timeSpentSeconds: data.timeSpentSeconds,
            starsEarned: data.starsEarned,
        });

        await this.gameResultRepository.save(result);

        // Update child stars
        if (data.starsEarned > 0) {
            child.totalStars += data.starsEarned;
            await this.childRepository.save(child);
        }

        return result;
    }

    async getGameResults(childId: string): Promise<GameResult[]> {
        return this.gameResultRepository.find({
            where: { childId },
            order: { completedAt: 'DESC' },
            take: 50,
        });
    }
}
