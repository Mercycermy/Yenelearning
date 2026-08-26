import { ApiConfig } from './apiConfig';
import { userPrefs } from './userPrefs';

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

async function getHeaders(hasBody = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = await userPrefs.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseJson(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
  const body = await response.text();
  throw new ApiException(response.status, body);
}

export const apiClient = {
  async getJson(path: string, query?: Record<string, string>) {
    const headers = await getHeaders();
    const response = await fetch(buildUrl(path, query), { headers });
    return parseJson(response) as Promise<Record<string, unknown>>;
  },

  async getJsonList(path: string, query?: Record<string, string>) {
    const headers = await getHeaders();
    const response = await fetch(buildUrl(path, query), { headers });
    const data = await parseJson(response);
    return (Array.isArray(data) ? data : []) as unknown[];
  },

  async postJson(path: string, body: Record<string, unknown>) {
    const headers = await getHeaders(true);
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return parseJson(response) as Promise<Record<string, unknown>>;
  },

  async patchJson(path: string, body: Record<string, unknown>) {
    const headers = await getHeaders(true);
    const response = await fetch(buildUrl(path), {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    return parseJson(response) as Promise<Record<string, unknown>>;
  },

  async deleteJson(path: string) {
    const headers = await getHeaders();
    const response = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers,
    });
    return parseJson(response) as Promise<Record<string, unknown>>;
  },
};
