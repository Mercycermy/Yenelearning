import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { SupportedLanguage } from './child.entity';
import { DifficultyLevel } from './content.entity';

@Entity('stories')
export class Story {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
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
    coverImageUrl: string;

    @Column({ type: 'simple-json' })
    pages: StoryPage[];

    @Column({ type: 'simple-array', default: '' })
    vocabularyHighlights: string[];

    @Column({ type: 'int', default: 0 })
    estimatedMinutes: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export interface StoryPage {
    pageNumber: number;
    text: string;
    imageUrl?: string;
    audioUrl?: string;
    vocabularyWords?: string[];
    interactionQuestion?: string;
    interactionOptions?: string[];
}
