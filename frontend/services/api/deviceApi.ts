// src/services/api/deviceApi.ts

import { get, post, del } from '../http'
import { devices, simulateDelay } from '../mockDb'
import type { Device } from '../../types'
import { DeviceCondition, DeviceStatus } from '../../types'

const live = import.meta.env.VITE_API_MODE === 'live'

export const deviceApi = {
  /**
   * Fetch all devices
   */
  getDevices: async (): Promise<Device[]> => {
    if (!live) {
      return simulateDelay(devices)
    }
    try {
      return await get<Device[]>('/devices')
    } catch (err) {
      console.warn('[deviceApi] GET /devices failed, returning empty list', err)
      return []
    }
  },

  /**
   * Add a new device
   */
  addDevice: async (
    data: Omit<
      Device,
      'id' | 'status' | 'customerName' | 'condition' | 'comments' | 'strippedParts'
    >
  ): Promise<Device> => {
    if (!live) {
      const newDevice: Device = {
        ...data,
        id: `device-${Date.now()}`,
        status: DeviceStatus.APPROVED_FOR_DISPOSAL,
        customerName: 'Unknown',
        condition: DeviceCondition.FAIR,
        comments: 'Newly added device.',
        strippedParts: [],
      }
      devices.unshift(newDevice)
      return simulateDelay(newDevice)
    }

    return post<Device>('/devices', data)
  },

  /**
   * Delete (remove) a device
   */
  deleteDevice: async (
    deviceId: string,
    reason: string
  ): Promise<Device> => {
    if (!live) {
      const idx = devices.findIndex((d) => d.id === deviceId)
      if (idx === -1) throw new Error('Device not found')
      devices[idx] = {
        ...devices[idx],
        status: DeviceStatus.REMOVED,
        removalReason: reason,
      }
      return simulateDelay(devices[idx])
    }

    return del<Device>(`/devices/${deviceId}`, {
      body: JSON.stringify({ reason }),
    })
  },
}