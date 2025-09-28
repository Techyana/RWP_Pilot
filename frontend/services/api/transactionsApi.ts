// src/services/api/transactionsApi.ts

import { get, post } from '../http'
import type { PartTransaction, TonerTransaction } from '../../types'

/**
 * Payload for recording a transaction (part or toner).
 */
export interface TransactionPayload {
  partId?: string;
  tonerId?: string;
  userId: string;
  action: 'claim' | 'collect' | 'request';
  timestamp?: string;
  serialNumber?: string;
  clientName?: string;
  monoTotal?: string;
  colorTotal?: string;
}

export const transactionsApi = {
  /**
   * Record a new transaction (claim | collect | request) for a part or toner.
   */
  record: (payload: TransactionPayload): Promise<PartTransaction | TonerTransaction> =>
    post<PartTransaction | TonerTransaction>('/transactions', payload),

  /**
   * Fetch recent part transactions (claims & requests) in the last `hours`.
   */
  getRecentPartTransactions: (hours: number): Promise<PartTransaction[]> =>
    get<PartTransaction[]>(
      `/transactions/recent?hours=${hours}&types=claim,request`
    ),

  /**
   * Fetch recent toner transactions (claims & requests) in the last `hours`.
   */
  getRecentTonerTransactions: (hours: number): Promise<TonerTransaction[]> =>
    get<TonerTransaction[]>(
      `/transactions/recent?hours=${hours}&types=claim,request`
    ),

  /**
   * Fetch recent part collection transactions in the last `hours`.
   */
  getRecentPartCollections: (hours: number): Promise<PartTransaction[]> =>
    get<PartTransaction[]>(
      `/transactions/recent?hours=${hours}&types=collect`
    ),

  /**
   * Fetch recent toner collection transactions in the last `hours`.
   */
  getRecentTonerCollections: (hours: number): Promise<TonerTransaction[]> =>
    get<TonerTransaction[]>(
      `/transactions/recent?hours=${hours}&types=collect`
    ),

  /**
   * Fetch all transactions (for audit/reporting).
   */
  getAll: (): Promise<Array<PartTransaction | TonerTransaction>> =>
    get<Array<PartTransaction | TonerTransaction>>('/transactions'),
}