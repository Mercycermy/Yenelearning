import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum PaymentPurpose {
    GRADE_UPGRADE = 'grade_upgrade',
    SUBSCRIPTION = 'subscription',
    SCHOOL_LICENSE = 'school_license',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({ unique: true })
    txRef: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'ETB' })
    currency: string;

    @Column({
        type: 'varchar',
        enum: PaymentPurpose,
        default: PaymentPurpose.GRADE_UPGRADE,
    })
    purpose: PaymentPurpose;

    @Column({
        type: 'varchar',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ nullable: true })
    childId: string;

    @Column({ nullable: true })
    targetGrade: string;

    @Column({ nullable: true })
    schoolId: string;

    @Column({ type: 'int', nullable: true })
    licenseQuantity: number;

    @Column({ nullable: true })
    checkoutUrl: string;

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, unknown>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
