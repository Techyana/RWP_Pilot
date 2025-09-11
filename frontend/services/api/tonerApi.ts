// services/api/tonerApi.ts
import { request } from '../http';
import { toners, simulateDelay } from '../mockDb';
import { Toner } from '../../types';

const live = import.meta.env.VITE_API_MODE === 'live';

export const tonerApi = {
  /**
   * Fetch all toners
   */
  getToners: async (): Promise<Toner[]> => {
    if (!live) {
      return simulateDelay(toners);
    }
    return request<Toner[]>('/toners');
  },

  /**
   * Add a new toner
   */
  addToner: async (tonerData: Omit<Toner, 'id'>): Promise<Toner> => {
    if (!live) {
      const newToner: Toner = {
        ...tonerData,
        id: `toner-${Date.now()}`,
      };
      toners.unshift(newToner);
      return simulateDelay(newToner);
    }
    return request<Toner>('/toners', {
      method: 'POST',
      body: JSON.stringify(tonerData),
    });
  },
};