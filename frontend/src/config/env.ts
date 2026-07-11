import { Platform } from 'react-native';

const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/v1' : 'http://localhost:3000/v1';

export const ENV = {
  API_URL: DEV_API_URL,
  DB_NAME: 'ccms_offline.db',
  SYNC_INTERVAL_MS: 30000, // 30 seconds
};
