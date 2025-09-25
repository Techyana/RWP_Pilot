// src/services/api/tonerApi.ts

import { get, post } from '../http'
import { toners, simulateDelay } from '../mockDb'
import type { Toner } from '../../types'

const live = import.meta.env.VITE_API_MODE === 'live'

export const tonerApi = {
  /**
   * Fetch all toners
   */
  getToners: (): Promise<Toner[]> => {
    if (!live) {
      return simulateDelay(toners)
    }
    return get<Toner[]>('/toners')
  },

  /**
   * Add a new toner
   */
  addToner: (tonerData: Omit<Toner, 'id'>): Promise<Toner> => {
    if (!live) {
      const newToner: Toner = {
        ...tonerData,
        id: `toner-${Date.now()}`,
      }
      toners.unshift(newToner)
      return simulateDelay(newToner)
    }
    return post<Toner>('/toners', tonerData)
  },
}