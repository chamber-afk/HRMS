import api from './axios'

export const attendanceApi = {
  getTodayStatus: () => {
    return api.get('/attendance/today')
  },

  clockIn: () => {
    return api.post('/attendance/clock-in')
  },

  clockOut: () => {
    return api.post('/attendance/clock-out')
  },
}