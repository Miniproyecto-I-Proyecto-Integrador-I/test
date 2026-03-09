import apiClient from '../../../Services/ApiClient';
import type { Subtask } from '../../ManageTodayPage/Types/models';

export const calendarService = {
  /**
   * Fetches subtasks with planification_date between [from, to] (inclusive).
   * Both params must be 'YYYY-MM-DD' strings.
   */
  getSubtasksByRange: async (from: string, to: string): Promise<Subtask[]> => {
    const response = await apiClient.get<Subtask[]>(
      `/api/subtasks/?planification_date_gte=${from}&planification_date_lte=${to}`,
    );
    return response.data;
  },
};
