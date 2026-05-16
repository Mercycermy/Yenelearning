import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum AvatarGender {
    MALE = 'male',
    FEMALE = 'female',
}

export enum TeachingStyle {
    CALM_STORYTELLER = 'calm_storyteller',
    PLAYFUL_TEACHER = 'playful_teacher',
    SERIOUS_GUIDE = 'serious_guide',
}

@Entity('avatars')
export class Avatar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'varchar',
        enum: AvatarGender,
    })
    gender: AvatarGender;

    @Column({
        type: 'varchar',
        enum: TeachingStyle,
        default: TeachingStyle.PLAYFUL_TEACHER,
    })
    teachingStyle: TeachingStyle;

    @Column({ type: 'text', nullable: true })
    personalityDescription: string;

    @Column()
    imageUrl: string;

    @Column({ nullable: true })
    voiceId: string;

    @Column({ type: 'real', default: 0.8 })
    speechRate: number;

    @Column({ type: 'real', default: 1.0 })
    pitchLevel: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
