// src/types/notifications.ts
export type ToastCategory = 'success' | 'info' | 'warning' | 'error';

export interface ToastConfig {
  category: ToastCategory;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onclick?: string;
    href?: string;
  };
  cancel?: {
    label?: string;
    onclick?: string;
  };
}

export interface ToastOptions {
  category?: ToastCategory;
  duration?: number;
  showCancel?: boolean;
  cancelLabel?: string;
  actionLabel?: string;
  actionHandler?: () => void;
}

// Predefined notification messages for consistency
export const NOTIFICATION_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: {
    title: 'Welcome back!',
    description: 'You have been successfully signed in.',
  },
  LOGIN_ERROR: {
    title: 'Sign in failed',
    description: 'Please check your credentials and try again.',
  },
  LOGIN_NETWORK_ERROR: {
    title: 'Connection error',
    description: 'Unable to connect. Please check your internet connection.',
  },
  LOGOUT_SUCCESS: {
    title: 'Signed out',
    description: 'You have been successfully signed out.',
  },
  LOGOUT_ERROR: {
    title: 'Sign out completed',
    description: 'You have been signed out of your account.',
  },
  
  // Registration
  REGISTER_SUCCESS: {
    title: 'Account created!',
    description: 'Welcome to the platform. You can now access your dashboard.',
  },
  REGISTER_ERROR: {
    title: 'Registration failed',
    description: 'Unable to create your account. Please try again.',
  },
  EMAIL_VERIFICATION_NEEDED: {
    title: 'Verify your email',
    description: 'Please check your email and click the verification link.',
  },
  
  // Password
  PASSWORD_RESET_SENT: {
    title: 'Reset link sent',
    description: 'Check your email for password reset instructions.',
  },
  PASSWORD_RESET_ERROR: {
    title: 'Reset failed',
    description: 'Unable to send reset email. Please try again.',
  },
  PASSWORD_UPDATED: {
    title: 'Password updated',
    description: 'Your password has been successfully changed.',
  },
  PASSWORD_UPDATE_ERROR: {
    title: 'Update failed',
    description: 'Unable to update password. Please try again.',
  },
  
  // Profile
  PROFILE_UPDATED: {
    title: 'Profile saved',
    description: 'Your profile information has been updated successfully.',
  },
  PROFILE_UPDATE_ERROR: {
    title: 'Save failed',
    description: 'Unable to save profile changes. Please try again.',
  },
  
  // Generic
  SUCCESS: {
    title: 'Success',
    description: 'Operation completed successfully.',
  },
  ERROR: {
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  },
  NETWORK_ERROR: {
    title: 'Connection error',
    description: 'Please check your internet connection and try again.',
  },
  UNAUTHORIZED: {
    title: 'Access denied',
    description: 'You need to sign in to access this feature.',
  },
  FORBIDDEN: {
    title: 'Permission denied',
    description: 'You don\'t have permission to perform this action.',
  },
  VALIDATION_ERROR: {
    title: 'Invalid input',
    description: 'Please check your information and try again.',
  },
  RATE_LIMITED: {
    title: 'Too many attempts',
    description: 'Please wait a moment before trying again.',
  },
} as const;

export type NotificationMessageKey = keyof typeof NOTIFICATION_MESSAGES;