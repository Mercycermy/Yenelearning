import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('schools')
export class School {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    contactEmail: string;

    @Column({ nullable: true })
    contactPhone: string;

    @Column({ type: 'int', default: 0 })
    licenseCount: number;

    @Column({ type: 'int', default: 0 })
    usedLicenses: number;

    @Column({ unique: true, nullable: true })
    domain: string;

    @Column({ nullable: true })
    logoUrl: string;

    @Column({ default: '#2563EB' })
    primaryColor: string;

    @Column({ nullable: true })
    welcomeMessage: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
