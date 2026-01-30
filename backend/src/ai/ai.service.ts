import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class AiService {
    private hf: HfInference;

    constructor(private readonly configService: ConfigService) {
        const token = this.configService.get<string>('HF_ACCESS_TOKEN');
        this.hf = new HfInference(token);
    }

    async chat(prompt: string, systemPrompt?: string): Promise<string> {
        try {
            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            // Use a free, high-performance model (Zephyr is reliable on free tier)
            const model = 'HuggingFaceH4/zephyr-7b-beta';

            const response = await this.hf.chatCompletion({
                model,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            return response.choices[0].message.content || '';
        } catch (error) {
            console.error('AI Chat Error:', error);
            throw new InternalServerErrorException('Failed to generate chat response');
        }
    }

    async generateSpeech(text: string): Promise<ArrayBuffer> {
        try {
            // MMS-TTS for Amharic
            const model = 'facebook/mms-tts-amh';

            const response = await this.hf.textToSpeech({
                model,
                inputs: text,
            });

            return await response.arrayBuffer();
        } catch (error) {
            console.error('AI TTS Error:', error);
            throw new InternalServerErrorException('Failed to generate speech');
        }
    }

    // Note: STT usually requires uploading a file, which is more complex to demo simply
    // but we can add the method stub.
    async speechToText(audioData: Blob): Promise<string> {
        try {
            const model = 'facebook/mms-1b-all'; // or openai/whisper-large-v3

            const response = await this.hf.automaticSpeechRecognition({
                model,
                data: audioData,
            });

            return response.text;
        } catch (error) {
            console.error('AI STT Error:', error);
            throw new InternalServerErrorException('Failed to transcribe speech');
        }
    }
}
