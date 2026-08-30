import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagingService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    async send(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
        const message = this.messageRepository.create({
            senderId,
            recipientId: createMessageDto.recipientId,
            subject: createMessageDto.subject,
            body: createMessageDto.body,
        });
        return this.messageRepository.save(message);
    }

    async getInbox(userId: string): Promise<Message[]> {
        return this.messageRepository.find({
            where: { recipientId: userId },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
        });
    }

    async getSent(userId: string): Promise<Message[]> {
        return this.messageRepository.find({
            where: { senderId: userId },
            relations: ['recipient'],
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(messageId: string, userId: string): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        if (message.recipientId !== userId) {
            throw new ForbiddenException('Access denied');
        }
        message.isRead = true;
        return this.messageRepository.save(message);
    }

    async getUnreadCount(userId: string): Promise<{ count: number }> {
        const count = await this.messageRepository.count({
            where: { recipientId: userId, isRead: false },
        });
        return { count };
    }

    async remove(messageId: string, userId: string): Promise<void> {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        if (message.senderId !== userId && message.recipientId !== userId) {
            throw new ForbiddenException('Access denied');
        }
        await this.messageRepository.remove(message);
    }
}
