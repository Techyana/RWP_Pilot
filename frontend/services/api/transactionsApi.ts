// src/services/api/transactionsApi.ts

import { get, post } from '../http'
import type { PartTransaction } from '../../types'

/**
 * Payload for recording a part transaction.
 */
export interface TransactionPayload {
  partId: string
  userId: string
  action: 'claim' | 'collect' | 'request'
  timestamp?: string
}

export const transactionsApi = {
  /**
   * Record a new transaction (claim | collect | request) for a part.
   */
  record: (payload: TransactionPayload): Promise<PartTransaction> =>
    post<PartTransaction>('/transactions', payload),

  /**
   * Fetch recent part transactions (claims & requests) in the last `hours`.
   */
  getRecentTransactions: (hours: number): Promise<PartTransaction[]> =>
    get<PartTransaction[]>(
      `/transactions/recent?hours=${hours}&types=claim,request`
    ),

  /**
   * Fetch recent collection transactions in the last `hours`.
   */
  getRecentCollections: (hours: number): Promise<PartTransaction[]> =>
    get<PartTransaction[]>(
      `/transactions/recent?hours=${hours}&types=collect`
    ),

  /**
   * Fetch all transactions (for audit/reporting).
   */
  getAll: (): Promise<PartTransaction[]> =>
    get<PartTransaction[]>('/transactions'),
}