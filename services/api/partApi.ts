import { request } from '../http';
import { parts, simulateDelay } from '../mockDb';
import { Part, PartStatus, ClaimDetails, User } from '../../types';

const live = import.meta.env.VITE_API_MODE === 'live';

export const partApi = {
  getParts: async (): Promise<Part[]> => {
    if (!live) return simulateDelay(parts);
    return request<Part[]>('/parts');
  },

  claimPart: async (claimDetails: ClaimDetails, user: User): Promise<Part> => {
    if (!live) {
      const idx = parts.findIndex(p => p.id === claimDetails.partId);
      if (idx === -1) throw new Error('Part not found');
      if (parts[idx].status !== PartStatus.AVAILABLE) throw new Error('Part not available');
      parts[idx] = {
        ...parts[idx],
        status: PartStatus.USED,
        claimedBy: `${user.name} ${user.surname}`,
        claimedAt: new Date().toISOString(),
      };
      return simulateDelay(parts[idx]);
    }
    return request<Part>(`/parts/${claimDetails.partId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ engineerId: user.id }),
    });
  },

  addPart: async (data: Omit<Part, 'id' | 'status'>): Promise<Part> => {
    if (!live) {
      const newPart: Part = { ...data, id: `part-${Date.now()}`, status: PartStatus.AVAILABLE };
      parts.unshift(newPart);
      return simulateDelay(newPart);
    }
    return request<Part>('/parts', { method: 'POST', body: JSON.stringify(data) });
  },
};