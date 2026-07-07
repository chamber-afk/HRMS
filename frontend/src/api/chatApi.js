import api from './axios'

export const chatApi = {
  sendMessage: (receiverId, content) => {
    return api.post('/chat/send', { receiverId, content })
  },

  getInbox: () => {
    return api.get('/chat/inbox')
  },

  getConversation: (userId) => {
    return api.get(`/chat/conversation/${userId}`)
  },
}