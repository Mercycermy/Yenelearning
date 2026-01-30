import { Controller, Post, Body, Res, BadRequestException } from '@nestjs/common';
import * as Express from 'express';
import { AiService } from './ai.service';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class ChatDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsString()
    @IsOptional()
    systemPrompt?: string;
}

class TtsDto {
    @IsString()
    @IsNotEmpty()
    text: string;
}

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    async chat(@Body() dto: ChatDto) {
        if (!process.env.HF_ACCESS_TOKEN) {
            return { message: "Mock Response: AI not configured (missing HF_ACCESS_TOKEN)" };
        }
        const response = await this.aiService.chat(dto.prompt, dto.systemPrompt);
        return { response };
    }

    @Post('tts')
    async generateSpeech(@Body() dto: TtsDto, @Res() res: Express.Response) {
        if (!process.env.HF_ACCESS_TOKEN) {
            throw new BadRequestException("AI not configured (missing HF_ACCESS_TOKEN)");
        }
        const audioBuffer = await this.aiService.generateSpeech(dto.text);

        // Convert ArrayBuffer to Buffer
        const buffer = Buffer.from(audioBuffer);

        res.set({
            'Content-Type': 'audio/flac',
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    }
}
