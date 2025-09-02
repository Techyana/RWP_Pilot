// services/api/deviceApi.ts
import { request } from '../http';
import { devices, simulateDelay } from '../mockDb';
import { Device, DeviceCondition, DeviceStatus } from '../../types';

const live = import.meta.env.VITE_API_MODE === 'live';

export const deviceApi = {
  getDevices: async (): Promise<Device[]> => {
    if (!live) {
      return simulateDelay(devices);
    }
    return request<Device[]>('/devices');
  },

  addDevice: async (
    deviceData: Omit<Device, 'id' | 'status' | 'customerName' | 'condition' | 'comments' | 'strippedParts'>
  ): Promise<Device> => {
    if (!live) {
      const newDevice: Device = {
        ...deviceData,
        id: `device-${Date.now()}`,
        status: DeviceStatus.APPROVED_FOR_DISPOSAL,
        customerName: 'Unknown',
        condition: DeviceCondition.FAIR,
        comments: 'Newly added device.',
        strippedParts: [],
      };
      devices.unshift(newDevice);
      return simulateDelay(newDevice);
    }
    return request<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  },

  deleteDevice: async (deviceId: string, reason: string): Promise<Device> => {
    if (!live) {
      const deviceIndex = devices.findIndex(d => d.id === deviceId);
      if (deviceIndex === -1) throw new Error('Device not found');
      devices[deviceIndex] = {
        ...devices[deviceIndex],
        status: DeviceStatus.REMOVED,
        removalReason: reason,
      };
      return simulateDelay(devices[deviceIndex]);
    }
    return request<Device>(`/devices/${deviceId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },
};