import apiClient from '../../../Services/ApiClient'
import type { LoginPayload, LoginResponse } from '../Types/loginTypes'

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
	const response = await apiClient.post<LoginResponse>('/api/auth/login/', payload)
	return response.data
}
