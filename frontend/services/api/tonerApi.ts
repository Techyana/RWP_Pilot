import { get, post, patch } from '../http'
import type {
  Toner,
  User,
  TonerTransaction,
} from '../../types'

export const tonerApi = {
  /** GET /toners — fetch all toners */
  getToners: (): Promise<Toner[]> => {
    return get<Toner[]>(`/toners?t=${Date.now()}`, { cache: 'no-store' })
  },

  /** POST /toners — add a new toner */
  addToner: (
    data: Omit<Toner, 'id' | 'claimedByName' | 'claimedAt' | 'collected' | 'collectedByName' | 'collectedAt' | 'requestedByName' | 'requestedAtTimestamp'>
  ): Promise<Toner> => {
    return post<Toner>('/toners', data)
  },

  /** PATCH /toners/:id/claim — claim one unit */
  claimToner: (tonerId: string, user: User, clientName: string, serialNumber: string): Promise<Toner> => {
    return patch<Toner>(`/toners/${tonerId}/claim`, {
      claimedBy: user.name,
      clientName,
      serialNumber,
    });
  },

  /** POST /toners/:id/request — request toner order (not implemented in backend) */
  requestToner: (tonerId: string, user: User): Promise<Toner> => {
    return post<Toner>(`/toners/${tonerId}/request`, {});
  },

  /** PATCH /toners/:id/collect — mark claimed toner as collected */
  collectToner: (tonerId: string, user: User): Promise<Toner> => {
    return patch<Toner>(`/toners/${tonerId}/collect`, {
      collectedBy: user.name,
    });
  },

  /** GET /toners/transactions/recent?hours=… — last N hrs of claims & requests */
  getRecentTransactions: (hours = 12): Promise<TonerTransaction[]> => {
    return get<TonerTransaction[]>(`/toners/transactions/recent?hours=${hours}`)
  },

  /** GET /toners/transactions/collected?hours=… — last N hrs of collections */
  getRecentCollections: (hours = 12): Promise<TonerTransaction[]> => {
    return get<TonerTransaction[]>(`/toners/transactions/collected?hours=${hours}`)
  },
}