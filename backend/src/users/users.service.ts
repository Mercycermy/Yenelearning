import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async findAll(): Promise<Partial<User>[]> {
        const users = await this.userRepository.find({
            relations: ['children'],
            order: { createdAt: 'DESC' },
        });
        return users.map(({ password, ...user }) => user);
    }

    async findOne(id: string): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['children'],
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { password, ...result } = user;
        return result;
    }

    async update(id: string, updateData: Partial<User>): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Don't allow updating password through this method
        const { password, ...safeUpdateData } = updateData;
        Object.assign(user, safeUpdateData);
        await this.userRepository.save(user);

        const { password: _, ...result } = user;
        return result;
    }

    async deactivate(id: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.isActive = false;
        await this.userRepository.save(user);
    }

    async activate(id: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.isActive = true;
        await this.userRepository.save(user);
    }

    async getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        parentCount: number;
        adminCount: number;
    }> {
        const [totalUsers, activeUsers, parentCount, adminCount] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { isActive: true } }),
            this.userRepository.count({ where: { role: UserRole.PARENT } }),
            this.userRepository.count({ where: { role: UserRole.ADMIN } }),
        ]);

        return { totalUsers, activeUsers, parentCount, adminCount };
    }
}
