import { login } from './auth/login.js';
import { register } from './auth/register.js';
import { logout } from './auth/logout.js';
import { forgotPassword } from './auth/forgot-password.js';
import { resetPasswordAction } from './auth/reset-password.js';

export const server = {
  auth: {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword: resetPasswordAction
  }
};