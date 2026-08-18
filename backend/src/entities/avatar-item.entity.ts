import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('avatar_items')
export class AvatarItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    nameAmharic: string;

    @Column()
    category: 'HAT' | 'OUTFIT' | 'ACCESSORY';

    @Column({ type: 'int', default: 10 })
    starCost: number;

    @Column()
    iconName: string;

    @Column({ default: '#3B82F6' })
    color: string;

    @CreateDateColumn()
    createdAt: Date;
}
