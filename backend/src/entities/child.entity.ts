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
}

@Entity('children')
export class Child {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int' })
    age: number;

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

    @Column({ type: 'simple-array', default: '' })
    badges: string[];

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
