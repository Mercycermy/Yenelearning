import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from '../entities/child.entity';
import { Chapter } from '../entities/chapter.entity';
import { ChapterProgress } from '../entities/chapter-progress.entity';
import { AvatarItem } from '../entities/avatar-item.entity';

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class StudentExperienceService {
  constructor(
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(ChapterProgress)
    private readonly chapterProgressRepository: Repository<ChapterProgress>,
    @InjectRepository(AvatarItem)
    private readonly avatarItemRepository: Repository<AvatarItem>,
  ) {}

  async getRoadmapForChild(childId: string) {
    const isValidUuid = childId && IS_UUID_REGEX.test(childId);
    let child: Child | null = null;
    
    if (isValidUuid) {
      child = await this.childRepository.findOneBy({ id: childId });
    }

    if (!child) {
      // Fallback guest child profile for Kid Mode
      child = {
        id: childId || 'demo-child-id',
        name: 'Little Learner',
        gradeLevel: 'GRADE_1',
        totalStars: 120,
        streakDays: 3,
        heartsCount: 5,
        avatarConfig: { equippedHat: 'headset' },
      } as Child;
    }

    const grade = child.gradeLevel || 'GRADE_1';
    const chapters = await this.chapterRepository.find({
      where: [{ targetGrade: grade }, { targetGrade: 'GRADE_1' }],
      order: { monthNumber: 'ASC' },
    });

    const progressRecords = isValidUuid
      ? await this.chapterProgressRepository.find({ where: { childId } })
      : [];

    const progressMap = new Map(progressRecords.map((p) => [p.chapterId, p]));

    const formattedChapters = chapters.map((ch, index) => {
      const p = progressMap.get(ch.id);
      const isLocked = ch.isLockedByDefault && index > 0 && !p;
      return {
        ...ch,
        isLocked,
        status: p ? p.status : isLocked ? 'LOCKED' : 'UNLOCKED',
        completedNodeIds: p ? p.completedNodeIds : [],
        totalStarsEarned: p ? p.totalStarsEarned : 0,
      };
    });

    return {
      child: {
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevel,
        totalStars: child.totalStars,
        streakDays: child.streakDays,
        heartsCount: child.heartsCount,
        avatarConfig: child.avatarConfig || {},
      },
      chapters: formattedChapters,
    };
  }

  async getAvatarShopItems() {
    return this.avatarItemRepository.find({ order: { starCost: 'ASC' } });
  }

  async equipAvatarItem(childId: string, itemId: string) {
    const child = await this.childRepository.findOneBy({ id: childId });
    if (!child) throw new NotFoundException('Child not found');

    const item = await this.avatarItemRepository.findOneBy({ id: itemId });
    if (!item) throw new NotFoundException('Item not found');

    const currentConfig = child.avatarConfig || {};

    if (item.category === 'HAT') currentConfig.equippedHat = item.iconName;
    if (item.category === 'OUTFIT') currentConfig.equippedOutfit = item.iconName;

    child.avatarConfig = currentConfig;
    await this.childRepository.save(child);
    return { success: true, avatarConfig: child.avatarConfig };
  }

  async completeNode(childId: string, chapterId: string, nodeId: string, starsEarned: number) {
    const isValidUuid = childId && IS_UUID_REGEX.test(childId);
    const isValidChapterUuid = chapterId && IS_UUID_REGEX.test(chapterId);

    const child = isValidUuid ? await this.childRepository.findOneBy({ id: childId }) : null;

    let p: ChapterProgress | null = null;
    if (isValidUuid && isValidChapterUuid) {
      p = await this.chapterProgressRepository.findOneBy({ childId, chapterId });
    }

    if (!p) {
      p = this.chapterProgressRepository.create({
        childId: childId || 'demo-child-id',
        chapterId,
        completedNodeIds: [],
        totalStarsEarned: 0,
        completedNodesCount: 0,
        status: 'IN_PROGRESS',
      });
    }

    if (!p.completedNodeIds.includes(nodeId)) {
      p.completedNodeIds.push(nodeId);
      p.completedNodesCount += 1;
      if (child) {
        child.totalStars += starsEarned;
        await this.childRepository.save(child);
      }
    }

    if (isValidUuid && isValidChapterUuid) {
      await this.chapterProgressRepository.save(p);
    }

    return {
      success: true,
      totalStars: child ? child.totalStars : 120,
      chapterProgress: p,
    };
  }
}
