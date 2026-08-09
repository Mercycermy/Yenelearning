import { apiClient } from './apiClient';
import {
  parseAvatar,
  parseContentDetail,
  parseContentList,
  parseStoryList,
  parseStoryPageResponse,
  type AvatarItem,
} from './models';

export const contentRepository = {
  async fetchAvatars(): Promise<AvatarItem[]> {
    const data = await apiClient.getJsonList('/content/avatars/all');
    return data.map((item) => parseAvatar(item as Record<string, unknown>));
  },

  async fetchContentPaged(input: {
    type: string;
    language: string;
    page?: number;
    pageSize?: number;
  }) {
    const data = await apiClient.getJson('/content/paged', {
      type: input.type,
      language: input.language,
      page: String(input.page ?? 1),
      pageSize: String(input.pageSize ?? 20),
    });
    return parseContentList(data);
  },

  async fetchContentById(id: string) {
    const data = await apiClient.getJson(`/content/${id}`);
    return parseContentDetail(data);
  },

  async fetchStoriesPaged(input: {
    language: string;
    page?: number;
    pageSize?: number;
  }) {
    const data = await apiClient.getJson('/content/stories', {
      language: input.language,
      page: String(input.page ?? 1),
      pageSize: String(input.pageSize ?? 20),
    });
    return parseStoryList(data);
  },

  async fetchStoryPage(storyId: string, pageNumber: number) {
    const data = await apiClient.getJson(
      `/content/stories/${storyId}/pages/${pageNumber}`,
    );
    return parseStoryPageResponse(data);
  },
};
