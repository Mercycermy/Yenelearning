import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Progress } from './progress.entity';

export enum SupportedLanguage {
    GEEZ = 'geez',
    AMHARIC = 'amharic',
    ENGLISH = 'english',
    OROMO = 'oromo',
}

export enum GradeLevel {
    KG = 'kg',
    GRADE_1 = 'grade_1',
    GRADE_2 = 'grade_2',
    GRADE_3 = 'grade_3',
    GRADE_4 = 'grade_4',
}

@Entity('children')
export class Child {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int' })
    age: number;

    @Column({
        type: 'varchar',
        enum: GradeLevel,
        default: GradeLevel.KG,
    })
    grade: GradeLevel;

    @Column({ nullable: true })
    avatarId: string;

    @Column({
        type: 'varchar',
        enum: SupportedLanguage,
        default: SupportedLanguage.AMHARIC,
    })
    currentLanguage: SupportedLanguage;

    @Column({ type: 'simple-array', default: '' })
    learningLanguages: string[];

    @Column({ type: 'int', default: 30 })
    dailyTimeLimitMinutes: number;

    @Column({ type: 'int', default: 0 })
    totalTimeSpentMinutes: number;

    @Column({ type: 'int', default: 1 })
    currentLevel: number;

    @Column({ type: 'int', default: 0 })
    totalStars: number;

    @Column({ type: 'varchar', default: 'GRADE_1' })
    gradeLevel: string; // 'KG' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4'

    @Column({ type: 'int', default: 1 })
    streakDays: number;

    @Column({ type: 'int', default: 5 })
    heartsCount: number;

    @Column({ type: 'simple-json', nullable: true })
    avatarConfig: { equippedHat?: string; equippedOutfit?: string; skinColor?: string };

    @Column({ type: 'simple-array', default: '' })
    badges: string[];

    @Column({ nullable: true })
    schoolId: string;

    @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentId' })
    parent: User;

    @Column()
    parentId: string;

    @OneToMany(() => Progress, (progress) => progress.child)
    progress: Progress[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

