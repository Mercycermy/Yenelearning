import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export interface LessonNode {
    id: string;
    title: string;
    titleAmharic: string;
    type: 'STORY' | 'WORD_GAME' | 'MATH_SHAPES' | 'AI_TALK' | 'LOGIC_PUZZLE';
    icon: string;
    starReward: number;
    description?: string;
}

@Entity('chapters')
export class Chapter {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    monthNumber: number;

    @Column()
    titleAmharic: string;

    @Column()
    titleEnglish: string;

    @Column({ default: 'GRADE_1' })
    targetGrade: string; // 'KG' | 'GRADE_1' .. 'GRADE_4'

    @Column({ default: '#10B981' })
    themeColor: string;

    @Column({ default: false })
    isLockedByDefault: boolean;

    @Column({ type: 'simple-json' })
    nodes: LessonNode[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
