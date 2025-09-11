// services/api/partApi.ts

import { request } from '../http'
import { parts, simulateDelay } from '../mockDb'
import type {
  Part,
  ClaimDetails,
  ReturnDetails,
  RemoveDetails,
  User,
} from '../../types'
import { PartStatus } from '../../types'

const live = import.meta.env.VITE_API_MODE === 'live'

export const partApi = {
  /** GET /parts?t=… */
  getParts: async (): Promise<Part[]> => {
    if (!live) return simulateDelay(parts)
    return request<Part[]>(`/parts?t=${Date.now()}`, {
      cache: 'no-store',
    })
  },

  /** POST /parts */
  addPart: async (
    data: Omit<Part, 'id' | 'status' | 'availableQuantity' | 'claimedBy' | 'claimedAt'>
  ): Promise<Part> => {
    if (!live) {
      const newPart: Part = {
        ...data,
        id: `part-${Date.now()}`,
        status: PartStatus.AVAILABLE,
        availableQuantity: data.quantity,
      }
      parts.unshift(newPart)
      return simulateDelay(newPart)
    }
    return request<Part>('/parts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /** POST /parts/:id/claim */
  claimPart: async (
    opts: ClaimDetails,
    user: User
  ): Promise<Part> => {
    if (!live) {
      const idx = parts.findIndex((p) => p.id === opts.partId)
      if (idx === -1) throw new Error('Part not found')
      if (parts[idx].status !== PartStatus.AVAILABLE)
        throw new Error('Part not available')

      parts[idx] = {
        ...parts[idx],
        status: PartStatus.PENDING_COLLECTION,
        claimedBy: user,
        claimedAt: new Date().toISOString(),
      }
      return simulateDelay(parts[idx])
    }
    return request<Part>(`/parts/${opts.partId}/claim`, {
      method: 'POST',
    })
  },

  /** POST /parts/:id/request */
  requestPart: async (
    opts: ClaimDetails,
    user: User
  ): Promise<Part> => {
    if (!live) {
      const idx = parts.findIndex((p) => p.id === opts.partId)
      if (idx === -1) throw new Error('Part not found')
      if (parts[idx].status !== PartStatus.AVAILABLE)
        throw new Error('Cannot request non-available part')

      parts[idx] = {
        ...parts[idx],
        status: PartStatus.REQUESTED,
        requestedByUserId: user.id,
        requestedByUserEmail: user.email,
        requestedAtTimestamp: new Date().toISOString(),
      }
      return simulateDelay(parts[idx])
    }
    return request<Part>(`/parts/${opts.partId}/request`, {
      method: 'POST',
    })
  },

  /** DELETE /parts/:id */
  removePart: async (
    opts: RemoveDetails,
    user: User
  ): Promise<void> => {
    if (!live) {
      const idx = parts.findIndex((p) => p.id === opts.partId)
      if (idx === -1) throw new Error('Part not found')
      parts.splice(idx, 1)
      return simulateDelay(undefined)
    }
    await request<void>(`/parts/${opts.partId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason: opts.reason }),
    })
  },

  /** POST /parts/:id/return */
  returnPart: async (
    opts: ReturnDetails,
    user: User
  ): Promise<Part> => {
    if (!live) {
      const idx = parts.findIndex((p) => p.id === opts.partId)
      if (idx === -1) throw new Error('Part not found')

      parts[idx] = {
        ...parts[idx],
        status: PartStatus.AVAILABLE,
        claimedBy: undefined,
        claimedAt: undefined,
      }
      return simulateDelay(parts[idx])
    }
    return request<Part>(`/parts/${opts.partId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason: opts.reason }),
    })
  },
}