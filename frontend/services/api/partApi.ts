// src/services/api/partApi.ts

import { get, post, del } from '../http'
import type {
  Part,
  ClaimDetails,
  ReturnDetails,
  RemoveDetails,
  User,
  PartTransaction,
} from '../../types'

export const partApi = {
  /** GET /parts?t=… — fetch all parts (no-store to bypass any HTTP cache) */
  getParts: (): Promise<Part[]> =>
    get<Part[]>(`/parts?t=${Date.now()}`, { cache: 'no-store' }),

  /** POST /parts — create a new part */
  addPart: (
    data: Omit<
      Part,
      | 'id'
      | 'status'
      | 'claimedByName'
      | 'claimedAt'
      | 'requestedByName'
      | 'requestedAtTimestamp'
      | 'availableQuantity'
    >
  ): Promise<Part> => post<Part>('/parts', data),

  /** POST /parts/:id/claim — claim one unit */
  claimPart: (opts: ClaimDetails, user: User): Promise<Part> =>
    post<Part>(`/parts/${opts.partId}/claim`, {}),

  /** POST /parts/:id/request — request part order */
  requestPart: (opts: ClaimDetails, user: User): Promise<Part> =>
    post<Part>(`/parts/${opts.partId}/request`, {}),

  /** POST /parts/:id/collect — mark claimed part as collected */
  collectPart: (opts: ClaimDetails, user: User): Promise<Part> =>
    post<Part>(`/parts/${opts.partId}/collect`, {}),

  /** GET /parts/transactions/recent?hours=… — last N hrs of claims & requests */
  getRecentTransactions: (hours = 12): Promise<PartTransaction[]> =>
    get<PartTransaction[]>(`/parts/transactions/recent?hours=${hours}`),

  /** GET /parts/transactions/collected?hours=… — last N hrs of collections */
  getRecentCollections: (hours = 12): Promise<PartTransaction[]> =>
    get<PartTransaction[]>(`/parts/transactions/collected?hours=${hours}`),

  /** DELETE /parts/:id — remove a part with a reason */
  removePart: (opts: RemoveDetails): Promise<void> =>
    del<void>(`/parts/${opts.partId}`, {
      body: JSON.stringify({ reason: opts.reason }),
    }),

  /** POST /parts/:id/return — return a previously claimed unit */
  returnPart: (opts: ReturnDetails): Promise<Part> =>
    post<Part>(`/parts/${opts.partId}/return`, { reason: opts.reason }),
}