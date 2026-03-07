import apiClient from '../../../Services/ApiClient';
import type { RegisterPayload, RegisterResponse } from '../Types/registerTypes';

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/api/user/register/', payload);
  return response.data;
};
