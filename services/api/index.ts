import { userApi } from './userApi';
import { partApi } from './partApi';
import { deviceApi } from './deviceApi';
import { tonerApi } from './tonerApi';
import { notificationApi } from './notificationApi';

export const api = {
  ...userApi,
  ...partApi,
  ...deviceApi,
  ...tonerApi,
  ...notificationApi,
};
