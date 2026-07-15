import { Platform } from 'react-native';

// Toggle this to true if you are testing on a physical device (e.g. via Expo Go).
// Set to false if you are testing on an Android Emulator or iOS Simulator.
const IS_PHYSICAL_DEVICE = true; 
const USE_ADB_REVERSE = true; 

const COMPUTER_IP = '192.168.138.134';

const DEV_API_URL = USE_ADB_REVERSE
  ? 'http://localhost:3000/v1'
  : (IS_PHYSICAL_DEVICE
    ? `http://${COMPUTER_IP}:3000/v1`
    : (Platform.OS === 'android' ? 'http://10.0.2.2:3000/v1' : 'http://localhost:3000/v1'));

export const ENV = {
  API_URL: DEV_API_URL,
  DB_NAME: 'ccms_offline.db',
  SYNC_INTERVAL_MS: 30000, // 30 seconds
};
