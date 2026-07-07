import api from './axios'

export const leaveApi = {
  // POST /api/leaves — apply for a new leave
  applyLeave: (type, startDate, endDate, reason) => {
    return api.post('/leaves', { type, startDate, endDate, reason })
  },

  // GET /api/leaves — scoped automatically by backend based on role
  // Employee gets only their own leaves, no extra params needed
  getMyLeaves: () => {
    return api.get('/leaves')
  },

  // DELETE /api/leaves/:id — cancel a pending leave
  cancelLeave: (leaveId) => {
    return api.delete(`/leaves/${leaveId}`)
  },
}