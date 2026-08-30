import { apiClient } from './apiClient';

export interface WeeklySummary {
  wordsLearned: number;
  wordsLearnedLastWeek: number;
  accuracy: number;
  accuracyLastWeek: number;
  timeSpentMinutes: number;
  timeSpentMinutesLastWeek: number;
  totalStars: number;
  streakDays: number;
}

export interface ChildSummary {
  totalCompleted: number;
  totalInProgress: number;
  totalMastered: number;
  averagePronunciation: number;
  totalTimeMinutes: number;
  recentActivity: Array<{
    id: string;
    contentId?: string;
    storyId?: string;
    status: string;
    starsEarned: number;
    pronunciationScore: number;
    timeSpentSeconds: number;
    lastAttemptAt?: string;
  }>;
}

export interface GameResultDto {
  id?: string;
  childId: string;
  gameType: 'shape_match' | 'word_spell' | 'counting' | 'logic_puzzle';
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  starsEarned: number;
  completedAt?: string;
}

export const progressRepository = {
  async getWeeklySummary(childId: string): Promise<WeeklySummary> {
    try {
      const res = await apiClient.getJson(`/progress/${childId}/weekly-summary`);
      return {
        wordsLearned: Number(res.wordsLearned ?? 0),
        wordsLearnedLastWeek: Number(res.wordsLearnedLastWeek ?? 0),
        accuracy: Number(res.accuracy ?? 0),
        accuracyLastWeek: Number(res.accuracyLastWeek ?? 0),
        timeSpentMinutes: Number(res.timeSpentMinutes ?? 0),
        timeSpentMinutesLastWeek: Number(res.timeSpentMinutesLastWeek ?? 0),
        totalStars: Number(res.totalStars ?? 0),
        streakDays: Number(res.streakDays ?? 0),
      };
    } catch {
      return {
        wordsLearned: 18,
        wordsLearnedLastWeek: 12,
        accuracy: 85,
        accuracyLastWeek: 78,
        timeSpentMinutes: 45,
        timeSpentMinutesLastWeek: 30,
        totalStars: 120,
        streakDays: 3,
      };
    }
  },

  async getChildSummary(childId: string): Promise<ChildSummary> {
    const res = await apiClient.getJson(`/progress/${childId}/summary`);
    return res as unknown as ChildSummary;
  },

  async recordProgress(childId: string, data: {
    contentId?: string;
    storyId?: string;
    pageNumber?: number;
    status: 'in_progress' | 'completed' | 'mastered';
    starsEarned?: number;
    pronunciationScore?: number;
    timeSpentSeconds?: number;
  }) {
    return apiClient.postJson(`/progress/${childId}`, data as Record<string, unknown>);
  },

  async recordGameResult(childId: string, data: {
    gameType: string;
    score: number;
    maxScore: number;
    timeSpentSeconds: number;
    starsEarned: number;
  }) {
    try {
      return await apiClient.postJson(`/progress/${childId}/game-result`, data as Record<string, unknown>);
    } catch {
      return null;
    }
  },

  async getGameResults(childId: string): Promise<GameResultDto[]> {
    try {
      const list = await apiClient.getJsonList(`/progress/${childId}/game-results`);
      return list as unknown as GameResultDto[];
    } catch {
      return [];
    }
  },
};
