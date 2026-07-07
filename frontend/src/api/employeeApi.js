import api from './axios'

export const employeeApi = {
  getAllEmployees: (search) => {
    const params = search ? { search } : {}
    return api.get('/employees', { params })
  },

  getEmployeeById: (id) => {
    return api.get(`/employees/${id}`)
  },

  updateEmployee: (id, data) => {
    return api.put(`/employees/${id}`, data)
  },

  deactivateEmployee: (id) => {
    return api.delete(`/employees/${id}`)
  },
  
  getMyTeam: () => {
    return api.get('/employees/my-team');
  },
};