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

            // Keep the model configurable because provider availability changes.
            const model = this.configService.get<string>('HF_CHAT_MODEL')
                ?? 'Qwen/Qwen2.5-7B-Instruct';

            const response = await this.hf.chatCompletion({
                model,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            return response.choices[0].message.content || '';
        } catch (error) {
            console.error('AI Chat Error:', error);
            return "This is a mock response because the AI service is currently unavailable. Please check your Hugging Face token and quota.";
        }
    }

    async generateSpeech(text: string): Promise<ArrayBuffer> {
        try {
            // MMS-TTS for Amharic
            const model = 'facebook/mms-tts-amh';

            try {
                const response = await this.hf.textToSpeech({
                    model,
                    inputs: text,
                });
                return await response.arrayBuffer();
            } catch (err) {
                console.error('TTS Model Error, falling back to English model:', err);
                const fallbackResponse = await this.hf.textToSpeech({
                    model: 'facebook/fastspeech2-en-ljspeech',
                    inputs: text,
                });
                return await fallbackResponse.arrayBuffer();
            }
        } catch (error) {
            console.error('AI TTS Error:', error);
            throw new InternalServerErrorException('Failed to generate speech');
        }
    }

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
