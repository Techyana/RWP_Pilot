import { userApi } from './userApi';
import { partApi } from './partApi';
import { deviceApi } from './deviceApi';
import { tonerApi } from './tonerApi';
import { notificationApi } from './notificationApi';

export const api = {
  user: userApi,
  part: partApi,
  device: deviceApi,
  toner: tonerApi,
  notification: notificationApi,
} as const

