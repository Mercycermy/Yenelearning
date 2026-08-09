export type AuthResponse = {
  accessToken: string;
  user: Record<string, unknown>;
};

export type AvatarItem = {
  id: string;
  name: string;
  imageUrl: string;
  gender?: string | null;
  teachingStyle?: string | null;
  personalityDescription?: string | null;
  voiceId?: string | null;
  speechRate?: number | null;
  pitchLevel?: number | null;
};

export type ContentListItem = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  language: string;
  difficulty: string;
  minAge: number;
  maxAge: number;
  imageUrl?: string | null;
  tags: string[];
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type ContentListResponse = {
  items: ContentListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ContentDetail = ContentListItem & {
  audioUrl?: string | null;
  updatedAt: string;
};

export type StoryListItem = {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  minAge: number;
  maxAge: number;
  coverImageUrl?: string | null;
  estimatedMinutes: number;
  pagesCount: number;
  createdAt: string;
};

export type StoryListResponse = {
  items: StoryListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type StoryPage = {
  pageNumber: number;
  text: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  vocabularyWords: string[];
  interactionQuestion?: string | null;
  interactionOptions: string[];
};

export type StoryPageResponse = {
  storyId: string;
  title: string;
  pageNumber: number;
  totalPages: number;
  page: StoryPage;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function parseAuthResponse(json: Record<string, unknown>): AuthResponse {
  return {
    accessToken: String(json.accessToken),
    user: (json.user as Record<string, unknown>) ?? {},
  };
}

export function parseAvatar(json: Record<string, unknown>): AvatarItem {
  return {
    id: String(json.id),
    name: String(json.name),
    imageUrl: String(json.imageUrl),
    gender: (json.gender as string) ?? null,
    teachingStyle: (json.teachingStyle as string) ?? null,
    personalityDescription: (json.personalityDescription as string) ?? null,
    voiceId: (json.voiceId as string) ?? null,
    speechRate: json.speechRate == null ? null : Number(json.speechRate),
    pitchLevel: json.pitchLevel == null ? null : Number(json.pitchLevel),
  };
}

export function parseContentItem(json: Record<string, unknown>): ContentListItem {
  return {
    id: String(json.id),
    type: String(json.type),
    title: String(json.title),
    description: (json.description as string) ?? null,
    language: String(json.language),
    difficulty: String(json.difficulty),
    minAge: Number(json.minAge ?? 0),
    maxAge: Number(json.maxAge ?? 0),
    imageUrl: (json.imageUrl as string) ?? null,
    tags: asStringArray(json.tags),
    createdAt: String(json.createdAt),
    metadata: (json.metadata as Record<string, unknown>) ?? null,
  };
}

export function parseContentList(json: Record<string, unknown>): ContentListResponse {
  const items = ((json.items as Record<string, unknown>[]) ?? []).map(parseContentItem);
  return {
    items,
    total: Number(json.total ?? 0),
    page: Number(json.page ?? 1),
    pageSize: Number(json.pageSize ?? 20),
  };
}

export function parseContentDetail(json: Record<string, unknown>): ContentDetail {
  return {
    ...parseContentItem(json),
    audioUrl: (json.audioUrl as string) ?? null,
    updatedAt: String(json.updatedAt),
  };
}

export function parseStoryItem(json: Record<string, unknown>): StoryListItem {
  return {
    id: String(json.id),
    title: String(json.title),
    description: String(json.description),
    language: String(json.language),
    difficulty: String(json.difficulty),
    minAge: Number(json.minAge ?? 0),
    maxAge: Number(json.maxAge ?? 0),
    coverImageUrl: (json.coverImageUrl as string) ?? null,
    estimatedMinutes: Number(json.estimatedMinutes ?? 0),
    pagesCount: Number(json.pagesCount ?? 0),
    createdAt: String(json.createdAt),
  };
}

export function parseStoryList(json: Record<string, unknown>): StoryListResponse {
  const items = ((json.items as Record<string, unknown>[]) ?? []).map(parseStoryItem);
  return {
    items,
    total: Number(json.total ?? 0),
    page: Number(json.page ?? 1),
    pageSize: Number(json.pageSize ?? 20),
  };
}

export function parseStoryPageResponse(json: Record<string, unknown>): StoryPageResponse {
  const page = json.page as Record<string, unknown>;
  return {
    storyId: String(json.storyId),
    title: String(json.title),
    pageNumber: Number(json.pageNumber ?? 0),
    totalPages: Number(json.totalPages ?? 0),
    page: {
      pageNumber: Number(page.pageNumber ?? 0),
      text: String(page.text),
      imageUrl: (page.imageUrl as string) ?? null,
      audioUrl: (page.audioUrl as string) ?? null,
      vocabularyWords: asStringArray(page.vocabularyWords),
      interactionQuestion: (page.interactionQuestion as string) ?? null,
      interactionOptions: asStringArray(page.interactionOptions),
    },
  };
}
