import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';
import { Content } from './content.entity';
import { Story } from './story.entity';

export enum ProgressStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    MASTERED = 'mastered',
}

@Entity('progress')
export class Progress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Child, (child) => child.progress, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'childId' })
    child: Child;

    @Column()
    childId: string;

    @ManyToOne(() => Content, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'contentId' })
    content?: Content;

    @Column({ nullable: true })
    contentId?: string;

    @ManyToOne(() => Story, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'storyId' })
    story?: Story;

    @Column({ nullable: true })
    storyId?: string;

    @Column({ type: 'int', nullable: true })
    pageNumber?: number;

    @Column({
        type: 'varchar',
        enum: ProgressStatus,
        default: ProgressStatus.NOT_STARTED,
    })
    status: ProgressStatus;

    @Column({ type: 'int', default: 0 })
    starsEarned: number;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'real', default: 0 })
    pronunciationScore: number;

    @Column({ type: 'int', default: 0 })
    timeSpentSeconds: number;

    @Column({ nullable: true })
    lastAttemptAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
