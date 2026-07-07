import axios from 'axios'
import { BASE_URL } from '../constants/api'
import { storage } from '../utils/storage'

console.log('=== AXIOS BASE_URL ===', BASE_URL)

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('=== REQUEST FIRED ===', config.method, config.baseURL + config.url)
    return config
  },
  (error) => {
    console.log('=== REQUEST INTERCEPTOR ERROR ===', error.message)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('=== RESPONSE OK ===', response.status)
    return response
  },
  (error) => {
    console.log('=== RESPONSE ERROR ===', error.message, error.code)
    return Promise.reject(error)
  }
)

export default api