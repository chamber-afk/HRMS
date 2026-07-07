import AsyncStorage from '@react-native-async-storage/async-storage'

export const storage = {
  setTokens: async (accessToken, refreshToken) => {
    await AsyncStorage.setItem('accessToken', accessToken)
    await AsyncStorage.setItem('refreshToken', refreshToken)
  },

  getAccessToken: async () => {
    return await AsyncStorage.getItem('accessToken')
  },

  getRefreshToken: async () => {
    return await AsyncStorage.getItem('refreshToken')
  },

  setUser: async (user) => {
    await AsyncStorage.setItem('user', JSON.stringify(user))
  },

  getUser: async () => {
    const userString = await AsyncStorage.getItem('user')
    return userString ? JSON.parse(userString) : null
  },

  clear: async () => {
    await AsyncStorage.removeItem('accessToken')
    await AsyncStorage.removeItem('refreshToken')
    await AsyncStorage.removeItem('user')
  },
}