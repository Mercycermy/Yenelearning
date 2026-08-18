import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { Chapter } from './chapter.entity';

@Entity('chapter_progress')
export class ChapterProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Child, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'childId' })
    child: Child;

    @Column()
    childId: string;

    @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chapterId' })
    chapter: Chapter;

    @Column()
    chapterId: string;

    @Column({ default: 'IN_PROGRESS' })
    status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';

    @Column({ type: 'int', default: 0 })
    completedNodesCount: number;

    @Column({ type: 'simple-array', default: '' })
    completedNodeIds: string[];

    @Column({ type: 'int', default: 0 })
    totalStarsEarned: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
