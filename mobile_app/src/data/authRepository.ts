import { apiClient } from './apiClient';
import { parseAuthResponse } from './models';

export const authRepository = {
  async login(email: string, password: string) {
    const data = await apiClient.postJson('/auth/login', { email, password });
    return parseAuthResponse(data);
  },

  async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const data = await apiClient.postJson('/auth/register', input);
    return parseAuthResponse(data);
  },
};
