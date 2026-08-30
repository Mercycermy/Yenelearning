import { apiClient } from './apiClient';

export interface ChildItem {
  id: string;
  name: string;
  age: number;
  grade: 'kg' | 'grade_1' | 'grade_2' | 'grade_3' | 'grade_4';
  avatarId?: string | null;
  currentLanguage: string;
  learningLanguages: string[];
  dailyTimeLimitMinutes: number;
  totalTimeSpentMinutes: number;
  currentLevel: number;
  totalStars: number;
  badges: string[];
  schoolId?: string | null;
  createdAt: string;
}

export const childrenRepository = {
  async getMyChildren(): Promise<ChildItem[]> {
    try {
      const list = await apiClient.getJsonList('/children');
      return (list as unknown[]).map((raw) => {
        const item = raw as Record<string, unknown>;
        return {
          id: String(item.id),
          name: String(item.name),
          age: Number(item.age ?? 5),
          grade: (item.grade as ChildItem['grade']) ?? 'kg',
          avatarId: (item.avatarId as string) ?? null,
          currentLanguage: String(item.currentLanguage ?? 'amharic'),
          learningLanguages: Array.isArray(item.learningLanguages) ? item.learningLanguages.map(String) : [],
          dailyTimeLimitMinutes: Number(item.dailyTimeLimitMinutes ?? 30),
          totalTimeSpentMinutes: Number(item.totalTimeSpentMinutes ?? 0),
          currentLevel: Number(item.currentLevel ?? 1),
          totalStars: Number(item.totalStars ?? 0),
          badges: Array.isArray(item.badges) ? item.badges.map(String) : [],
          schoolId: (item.schoolId as string) ?? null,
          createdAt: String(item.createdAt),
        };
      });
    } catch {
      return [];
    }
  },

  async createChild(data: {
    name: string;
    age: number;
    grade?: string;
    currentLanguage?: string;
    avatarId?: string;
    dailyTimeLimitMinutes?: number;
  }): Promise<ChildItem> {
    const res = await apiClient.postJson('/children', data as Record<string, unknown>);
    return res as unknown as ChildItem;
  },

  async updateChild(id: string, data: Partial<ChildItem>): Promise<ChildItem> {
    const res = await apiClient.patchJson(`/children/${id}`, data as Record<string, unknown>);
    return res as unknown as ChildItem;
  },

  async deleteChild(id: string): Promise<void> {
    await apiClient.deleteJson(`/children/${id}`);
  },
};
