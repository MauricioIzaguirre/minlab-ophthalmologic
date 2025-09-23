// src/utils/notifications.ts
import type { 
  ToastConfig, 
  ToastOptions, 
  ToastCategory, 
  NotificationMessageKey
} from '../../types/notifications';
import { NOTIFICATION_MESSAGES } from '../../types/notifications';

/**
 * Toast Notification Utility
 * Uses Basecoat UI's native toast system for optimal performance
 */
export class NotificationService {
  private static instance: NotificationService;
  private initialized = false;

  constructor() {
    this.ensureToasterExists();
    this.waitForBasecoat();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Ensure toaster container exists
   */
  private ensureToasterExists(): void {
    if (typeof document === 'undefined') return;
    
    let toaster = document.getElementById('toaster');
    if (!toaster) {
      toaster = document.createElement('div');
      toaster.id = 'toaster';
      toaster.className = 'toaster';
      toaster.setAttribute('data-align', 'end');
      document.body.appendChild(toaster);
    }
  }

  /**
   * Wait for Basecoat to initialize
   */
  private waitForBasecoat(): void {
    if (typeof document === 'undefined') return;

    const checkBasecoat = () => {
      const toaster = document.getElementById('toaster');
      if (toaster) {
        // Listen for basecoat initialization
        toaster.addEventListener('basecoat:initialized', () => {
          this.initialized = true;
          console.log('🎉 Basecoat toast system initialized');
        });

        // If already initialized, mark as ready
        if (toaster.classList.contains('basecoat-initialized')) {
          this.initialized = true;
        }
      }

      // Retry if not ready yet
      if (!this.initialized) {
        setTimeout(checkBasecoat, 100);
      }
    };

    // Start checking after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkBasecoat);
    } else {
      checkBasecoat();
    }
  }

  /**
   * Show a toast notification
   */
  show(config: ToastConfig): void {
    if (typeof document === 'undefined') {
      console.warn('Toast notification skipped: not in browser environment');
      return;
    }

    try {
      // Dispatch the basecoat:toast event
      const event = new CustomEvent('basecoat:toast', {
        detail: { config }
      });
      
      document.dispatchEvent(event);
      
      console.log(`📢 Toast notification sent: ${config.category} - ${config.title}`);
    } catch (error) {
      console.error('❌ Failed to show toast notification:', error);
      // Fallback to console for development
      console.log(`📢 Toast (fallback): ${config.title} - ${config.description}`);
    }
  }

  /**
   * Show success notification
   */
  success(title: string, description?: string, options?: ToastOptions): void {
    this.show({
      category: 'success',
      title,
      description,
      duration: options?.duration || 4000,
      cancel: {
        label: options?.cancelLabel || 'Dismiss'
      }
    });
  }

  /**
   * Show error notification
   */
  error(title: string, description?: string, options?: ToastOptions): void {
    this.show({
      category: 'error',
      title,
      description,
      duration: options?.duration || 6000, // Longer for errors
      cancel: {
        label: options?.cancelLabel || 'Dismiss'
      }
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, description?: string, options?: ToastOptions): void {
    this.show({
      category: 'warning',
      title,
      description,
      duration: options?.duration || 5000,
      cancel: {
        label: options?.cancelLabel || 'Dismiss'
      }
    });
  }

  /**
   * Show info notification
   */
  info(title: string, description?: string, options?: ToastOptions): void {
    this.show({
      category: 'info',
      title,
      description,
      duration: options?.duration || 4000,
      cancel: {
        label: options?.cancelLabel || 'Dismiss'
      }
    });
  }

  /**
   * Show predefined notification message
   */
  showMessage(messageKey: NotificationMessageKey, category: ToastCategory = 'info', options?: ToastOptions): void {
    const message = NOTIFICATION_MESSAGES[messageKey];
    if (!message) {
      console.error(`❌ Unknown notification message key: ${messageKey}`);
      return;
    }

    this.show({
      category,
      title: message.title,
      description: message.description,
      duration: options?.duration || (category === 'error' ? 6000 : 4000),
      cancel: {
        label: options?.cancelLabel || 'Dismiss'
      }
    });
  }

  /**
   * Handle action results from Astro actions
   */
  handleActionResult(result: any, successMessage?: NotificationMessageKey, errorMessage?: NotificationMessageKey): void {
    if (!result) return;

    if (result.error) {
      // Handle different error types
      if (result.error.code === 'UNAUTHORIZED') {
        this.showMessage('UNAUTHORIZED', 'error');
      } else if (result.error.code === 'BAD_REQUEST') {
        this.error('Invalid request', result.error.message || 'Please check your input and try again.');
      } else if (result.error.message?.toLowerCase().includes('network')) {
        this.showMessage('NETWORK_ERROR', 'error');
      } else if (result.error.message?.toLowerCase().includes('rate')) {
        this.showMessage('RATE_LIMITED', 'warning');
      } else {
        // Generic error with custom message if provided
        if (errorMessage) {
          this.showMessage(errorMessage, 'error');
        } else {
          this.error('Operation failed', result.error.message || 'Something went wrong. Please try again.');
        }
      }
    } else if (result.data?.success) {
      // Handle success
      if (successMessage) {
        this.showMessage(successMessage, 'success');
      } else if (result.data.message) {
        this.success('Success', result.data.message);
      } else {
        this.showMessage('SUCCESS', 'success');
      }
    }
  }

  /**
   * Show authentication-specific notifications
   */
  auth = {
    loginSuccess: () => this.showMessage('LOGIN_SUCCESS', 'success'),
    loginError: (message?: string) => this.error(
      NOTIFICATION_MESSAGES.LOGIN_ERROR.title, 
      message || NOTIFICATION_MESSAGES.LOGIN_ERROR.description
    ),
    logoutSuccess: () => this.showMessage('LOGOUT_SUCCESS', 'info'),
    registerSuccess: () => this.showMessage('REGISTER_SUCCESS', 'success'),
    registerError: (message?: string) => this.error(
      NOTIFICATION_MESSAGES.REGISTER_ERROR.title, 
      message || NOTIFICATION_MESSAGES.REGISTER_ERROR.description
    ),
    passwordResetSent: () => this.showMessage('PASSWORD_RESET_SENT', 'info'),
    passwordResetError: () => this.showMessage('PASSWORD_RESET_ERROR', 'error'),
    emailVerificationNeeded: () => this.showMessage('EMAIL_VERIFICATION_NEEDED', 'warning')
  };

  /**
   * Show profile-specific notifications
   */
  profile = {
    updated: () => this.showMessage('PROFILE_UPDATED', 'success'),
    updateError: (message?: string) => this.error(
      NOTIFICATION_MESSAGES.PROFILE_UPDATE_ERROR.title,
      message || NOTIFICATION_MESSAGES.PROFILE_UPDATE_ERROR.description
    )
  };
}

// Export singleton instance
export const notifications = NotificationService.getInstance();

// Export convenience functions for easier imports
export const showToast = (config: ToastConfig) => notifications.show(config);
export const showSuccess = (title: string, description?: string, options?: ToastOptions) => 
  notifications.success(title, description, options);
export const showError = (title: string, description?: string, options?: ToastOptions) => 
  notifications.error(title, description, options);
export const showWarning = (title: string, description?: string, options?: ToastOptions) => 
  notifications.warning(title, description, options);
export const showInfo = (title: string, description?: string, options?: ToastOptions) => 
  notifications.info(title, description, options);