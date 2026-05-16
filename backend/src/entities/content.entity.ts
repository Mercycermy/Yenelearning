import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { SupportedLanguage } from './child.entity';

export enum ContentType {
    WORD = 'word',
    STORY = 'story',
    GAME = 'game',
    KNOWLEDGE = 'knowledge',
}

export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}

@Entity('content')
export class Content {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        enum: ContentType,
    })
    type: ContentType;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'varchar',
        enum: SupportedLanguage,
    })
    language: SupportedLanguage;

    @Column({
        type: 'varchar',
        enum: DifficultyLevel,
        default: DifficultyLevel.BEGINNER,
    })
    difficulty: DifficultyLevel;

    @Column({ type: 'int', default: 4 })
    minAge: number;

    @Column({ type: 'int', default: 12 })
    maxAge: number;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    audioUrl: string;

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, unknown>;

    @Column({ type: 'simple-array', default: '' })
    tags: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    orderIndex: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
