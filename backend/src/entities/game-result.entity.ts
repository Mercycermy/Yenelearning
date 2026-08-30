import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Child } from './child.entity';

export enum GameType {
    SHAPE_MATCH = 'shape_match',
    WORD_SPELL = 'word_spell',
    COUNTING = 'counting',
    LOGIC_PUZZLE = 'logic_puzzle',
}

@Entity('game_results')
export class GameResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Child, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'childId' })
    child: Child;

    @Column()
    childId: string;

    @Column({
        type: 'varchar',
        enum: GameType,
    })
    gameType: GameType;

    @Column({ type: 'int', default: 0 })
    score: number;

    @Column({ type: 'int', default: 0 })
    maxScore: number;

    @Column({ type: 'int', default: 0 })
    timeSpentSeconds: number;

    @Column({ type: 'int', default: 0 })
    starsEarned: number;

    @CreateDateColumn()
    completedAt: Date;
}
