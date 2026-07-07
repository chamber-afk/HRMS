import api from './axios'

export const departmentApi = {
  getAllDepartments: () => {
    return api.get('/departments')
  },

  createDepartment: (name, description) => {
    return api.post('/departments', { name, description })
  },

  updateDepartment: (id, data) => {
    return api.put(`/departments/${id}`, data)
  },
}