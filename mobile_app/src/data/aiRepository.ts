import { apiClient } from './apiClient';

export class AiUnavailableException extends Error {
  constructor() {
    super('AI tutor unavailable');
  }
}

export const aiRepository = {
  async chat(prompt: string, language: string) {
    const data = await apiClient.postJson('/ai/chat', {
      prompt,
      systemPrompt: `You are a warm, safe language tutor for a child. Reply in ${language} using at most two short sentences, gently correct mistakes, then ask one easy follow-up question. Avoid adult, dangerous, personal-data, and frightening topics.`,
    });
    const response = data.response ?? data.message;
    if (
      typeof response !== 'string' ||
      !response.trim() ||
      response.startsWith('Mock Response')
    ) {
      throw new AiUnavailableException();
    }
    return response.trim();
  },
};
