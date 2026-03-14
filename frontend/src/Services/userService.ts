import apiClient from './ApiClient';

export interface UserData {
  id: number;
  username: string;
  email: string;
  daily_hours: number;
  bio: string;
}

export const userService = {
  getCurrentUser: async (): Promise<UserData> => {
    const response = await apiClient.get<UserData>('/api/user/me/');
    return response.data;
  },

  updateCurrentUser: async (userData: Partial<UserData>): Promise<UserData> => {
    const response = await apiClient.put<UserData>('/api/user/update/', userData);
    return response.data;
  },
};
