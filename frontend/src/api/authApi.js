import api from './axios';

export const authApi = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  createEmployee: data => {
    return api.post('/auth/create-employee', data);
  },

  forgotPassword: email => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: (email, otp, newPassword) => {
    return api.post('/auth/reset-password', { email, otp, newPassword });
  },

  changePassword: (currentPassword, newPassword) => {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },

  logout: () => {
    return api.post('/auth/logout');
  },
};

//New employee as engineer 
//Bob, bob@hrms.com
//Temp@5620

// Email: anita@hrms.com

// Temporary Password: Temp@5186
