import { Platform } from 'react-native'

// Android emulator uses 10.0.2.2 to reach host machine's localhost
// iOS simulator can use localhost directly
// For physical devices, replace with your machine's local network IP (e.g. [IP_ADDRESS])
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'

export const BASE_URL = `http://${HOST}:5001/api`
export const SOCKET_URL = `http://${HOST}:5001`
