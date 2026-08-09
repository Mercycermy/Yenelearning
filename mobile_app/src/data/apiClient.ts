import { ApiConfig } from './apiConfig';

export class ApiException extends Error {
  statusCode: number;
  body: string;

  constructor(statusCode: number, body: string) {
    super(`ApiException(${statusCode}): ${body}`);
    this.statusCode = statusCode;
    this.body = body;
  }
}

function buildUrl(path: string, query?: Record<string, string>) {
  const url = new URL(`${ApiConfig.baseUrl}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function parseJson(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    const text = await response.text();
    if (!text) return {};
    return JSON.parse(text);
  }
  const body = await response.text();
  throw new ApiException(response.status, body);
}

export const apiClient = {
  async getJson(path: string, query?: Record<string, string>) {
    const response = await fetch(buildUrl(path, query), {
      headers: { Accept: 'application/json' },
    });
    return parseJson(response) as Promise<Record<string, unknown>>;
  },

  async getJsonList(path: string, query?: Record<string, string>) {
    const response = await fetch(buildUrl(path, query), {
      headers: { Accept: 'application/json' },
    });
    const data = await parseJson(response);
    return (Array.isArray(data) ? data : []) as unknown[];
  },

  async postJson(path: string, body: Record<string, unknown>) {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return parseJson(response) as Promise<Record<string, unknown>>;
  },
};
