// src/lib/auth.ts - COMPLETE IMPROVED with better error handling (English messages)

import type {
  RegisterRequest,
  LoginRequest,
  RecoverPasswordRequest,
  UpdatePasswordRequest,
  UpdateUserMetadataRequest,
  UpdateCompleteProfileRequest,
  RefreshTokenRequest,
  AuthResponse,
  UserProfile,
  UserPermissions,
  ApiError,
  SessionUser
} from '../types/auth';

// Specific Supabase error types
export interface SupabaseAuthError {
  code: number;
  error_code?: string;
  msg: string;
  message?: string;
  error?: string;
  error_description?: string;
}

export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(
    message: string, 
    code: string = 'UNKNOWN_ERROR', 
    statusCode: number = 500,
    userMessage?: string
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
  }

  private getDefaultUserMessage(code: string): string {
    const messages: Record<string, string> = {
      'INVALID_CREDENTIALS': 'Invalid email or password. Please check your credentials and try again.',
      'EMAIL_NOT_CONFIRMED': 'Your account needs to be verified. Please check your email.',
      'TOO_MANY_REQUESTS': 'Too many login attempts. Please wait a few minutes before trying again.',
      'USER_NOT_FOUND': 'No account found with this email address.',
      'WEAK_PASSWORD': 'Password must be at least 6 characters long.',
      'EMAIL_ALREADY_EXISTS': 'An account with this email already exists.',
      'NETWORK_ERROR': 'Connection error. Please check your internet connection.',
      'SERVER_ERROR': 'Server error. Please try again later.',
      'UNAUTHORIZED': 'You do not have permission to perform this action.',
      'SESSION_EXPIRED': 'Your session has expired. Please sign in again.',
      'VALIDATION_ERROR': 'The provided data is invalid. Please check your information.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment before trying again.',
      'FORBIDDEN': 'You do not have permission to perform this action.',
      'BAD_REQUEST': 'Invalid request data. Please verify your information.',
      'PARSE_ERROR': 'Unable to process server response. Please try again.',
      'TIMEOUT': 'Request timeout. Please check your connection and try again.'
    };
    
    return messages[code] || 'An unexpected error occurred. Please try again later.';
  }
}

class AuthService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.SUPABASE_URL;
    this.apiKey = import.meta.env.SUPABASE_ANON_KEY;
    
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('Missing Supabase configuration in environment variables');
    }
  }

  private getHeaders(includeAuth = false, token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'apikey': this.apiKey,
      'Content-Type': 'application/json',
    };

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Detailed logging for debugging
    console.log(`🌐 HTTP Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData: SupabaseAuthError;
      
      try {
        const errorText = await response.text();
        console.error(`❌ Supabase API Error [${response.status}]:`, errorText);
        
        // Try to parse as JSON
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // If not valid JSON, create error structure
        errorData = {
          code: response.status,
          msg: response.statusText || 'Unknown error',
          error_code: 'PARSE_ERROR'
        };
      }

      // Map specific Supabase errors
      throw this.mapSupabaseError(errorData, response.status);
    }

    // Handle successful responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { message: 'Success' } as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return { message: 'Success' } as T;
  }

  private mapSupabaseError(errorData: SupabaseAuthError, statusCode: number): AuthError {
    const message = errorData.msg || errorData.message || errorData.error || errorData.error_description || 'Unknown error';
    const errorCode = errorData.error_code;

    console.error('🔍 Error details:', { errorData, statusCode });

    // Map specific errors
    switch (errorCode) {
      case 'invalid_credentials':
        return new AuthError(
          message,
          'INVALID_CREDENTIALS',
          statusCode,
          'Invalid email or password. Please verify that your credentials are correct.'
        );

      case 'email_not_confirmed':
        return new AuthError(
          message,
          'EMAIL_NOT_CONFIRMED',
          statusCode,
          'Your account needs to be verified. Please check your email and click the confirmation link.'
        );

      case 'too_many_requests':
        return new AuthError(
          message,
          'TOO_MANY_REQUESTS',
          statusCode,
          'Too many login attempts. Please wait a few minutes before trying again.'
        );

      case 'user_not_found':
        return new AuthError(
          message,
          'USER_NOT_FOUND',
          statusCode,
          'No account found with this email. Please verify the email or create a new account.'
        );

      case 'weak_password':
        return new AuthError(
          message,
          'WEAK_PASSWORD',
          statusCode,
          'Password must be at least 6 characters long and more secure.'
        );

      case 'email_already_exists':
      case 'signup_disabled':
        return new AuthError(
          message,
          'EMAIL_ALREADY_EXISTS',
          statusCode,
          'An account with this email already exists. Try signing in or recovering your password.'
        );

      case 'invalid_request':
        return new AuthError(
          message,
          'VALIDATION_ERROR',
          statusCode,
          'Invalid request. Please check your information and try again.'
        );

      default:
        // Map by HTTP status code
        switch (statusCode) {
          case 400:
            return new AuthError(
              message,
              'BAD_REQUEST',
              statusCode,
              'Invalid request data. Please verify your information and try again.'
            );

          case 401:
            return new AuthError(
              message,
              'UNAUTHORIZED',
              statusCode,
              'Invalid credentials or expired session. Please sign in again.'
            );

          case 403:
            return new AuthError(
              message,
              'FORBIDDEN',
              statusCode,
              'You do not have permission to perform this action.'
            );

          case 422:
            return new AuthError(
              message,
              'VALIDATION_ERROR',
              statusCode,
              'The provided data is invalid. Please verify your information.'
            );

          case 429:
            return new AuthError(
              message,
              'RATE_LIMITED',
              statusCode,
              'Too many requests. Please wait a few minutes before trying again.'
            );

          case 500:
          case 502:
          case 503:
          case 504:
            return new AuthError(
              message,
              'SERVER_ERROR',
              statusCode,
              'Server error. Please try again later or contact support.'
            );

          default:
            return new AuthError(
              message,
              'UNKNOWN_ERROR',
              statusCode,
              'An unexpected error occurred. Please try again later.'
            );
        }
    }
  }

  // Wrapper for handling network errors
  private async makeRequest<T>(
    url: string, 
    options: RequestInit,
    operation: string
  ): Promise<T> {
    try {
      console.log(`🔐 ${operation}: ${url}`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 seconds timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);

    } catch (error) {
      console.error(`❌ ${operation} failed:`, error);

      // If it's our custom AuthError, re-throw it
      if (error instanceof AuthError) {
        throw error;
      }

      // Handle abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthError(
          'Request timeout',
          'TIMEOUT',
          408,
          'The request is taking too long. Please check your internet connection.'
        );
      }

      // Handle network/fetch errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthError(
          'Network error',
          'NETWORK_ERROR',
          0,
          'Could not connect to the server. Please check your internet connection.'
        );
      }

      // Generic error
      throw new AuthError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR',
        500,
        'An unexpected error occurred. Please try again later.'
      );
    }
  }

  // REGISTER USER
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      `${this.baseUrl}/auth/v1/signup`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          data: data.data, // user_metadata
        }),
      },
      'User Registration'
    );
  }

  // LOGIN USER - Using the endpoint that works in Postman
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      `${this.baseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      },
      'User Login'
    );
  }

  // RECOVER PASSWORD
  async recoverPassword(data: RecoverPasswordRequest): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/auth/v1/recover`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: data.email,
        }),
      },
      'Password Recovery'
    );
  }

  // UPDATE PASSWORD
  async updatePassword(data: UpdatePasswordRequest, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/auth/v1/user`,
      {
        method: 'PUT',
        headers: this.getHeaders(true, token),
        body: JSON.stringify({
          password: data.password,
        }),
      },
      'Update Password'
    );
  }

  // UPDATE USER METADATA
  async updateUserMetadata(data: UpdateUserMetadataRequest, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/auth/v1/user`,
      {
        method: 'PUT',
        headers: this.getHeaders(true, token),
        body: JSON.stringify({
          data: data.data, // user_metadata
        }),
      },
      'Update User Metadata'
    );
  }

  // UPDATE COMPLETE PROFILE
  async updateCompleteProfile(data: UpdateCompleteProfileRequest, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/rest/v1/rpc/update_complete_profile`,
      {
        method: 'POST',
        headers: this.getHeaders(true, token),
        body: JSON.stringify(data),
      },
      'Update Complete Profile'
    );
  }

  // LOGOUT USER
  async logout(token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      `${this.baseUrl}/auth/v1/logout`,
      {
        method: 'POST',
        headers: this.getHeaders(true, token),
        body: JSON.stringify({}),
      },
      'User Logout'
    );
  }

  // REFRESH TOKEN
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      `${this.baseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          refresh_token: data.refresh_token,
        }),
      },
      'Token Refresh'
    );
  }

  // GET CURRENT USER PROFILE
  async getCurrentUserProfile(token: string): Promise<UserProfile> {
    return this.makeRequest<UserProfile>(
      `${this.baseUrl}/rest/v1/rpc/get_current_user_profile`,
      {
        method: 'POST',
        headers: this.getHeaders(true, token),
        body: JSON.stringify({}),
      },
      'Get Current User Profile'
    );
  }

  // GET USER PERMISSIONS
  async getUserPermissions(token: string): Promise<UserPermissions> {
    return this.makeRequest<UserPermissions>(
      `${this.baseUrl}/rest/v1/rpc/debug_user_permissions`,
      {
        method: 'POST',
        headers: this.getHeaders(true, token),
        body: JSON.stringify({}),
      },
      'Get User Permissions'
    );
  }

  // STATIC UTILITY METHODS

  // Convert AuthResponse to SessionUser
  static toSessionUser(authResponse: AuthResponse, permissions: string[] = []): SessionUser {
    return {
      id: authResponse.user.id,
      email: authResponse.user.email,
      first_name: authResponse.user.user_metadata.first_name,
      last_name: authResponse.user.user_metadata.last_name,
      role: authResponse.user.role,
      permissions,
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
      expires_at: authResponse.expires_at,
    };
  }

  // Check if token has expired
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() / 1000 >= expiresAt;
  }

  // Check if user has a specific permission
  static hasPermission(permissions: string[], permission: string): boolean {
    return permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }

  // Check if user has all specified permissions
  static hasAllPermissions(permissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => permissions.includes(permission));
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    // You can add more password validation rules here
    return { isValid: true };
  }

  // Format user display name
  static getDisplayName(user: SessionUser): string {
    return `${user.first_name} ${user.last_name}`.trim();
  }

  // Get user initials
  static getUserInitials(user: SessionUser): string {
    const firstInitial = user.first_name.charAt(0).toUpperCase();
    const lastInitial = user.last_name.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  // Check if token is expiring soon (within 5 minutes)
  static isTokenExpiringSoon(expiresAt: number): boolean {
    const fiveMinutesInSeconds = 5 * 60;
    const currentTime = Date.now() / 1000;
    return (expiresAt - currentTime) <= fiveMinutesInSeconds;
  }

  // Group permissions by category
  static groupPermissionsByCategory(permissions: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    
    permissions.forEach(permission => {
      const [category] = permission.split('.');
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    
    return grouped;
  }

  // Check if user can perform CRUD operation on resource
  static canPerformCRUD(
    permissions: string[], 
    resource: string, 
    action: 'create' | 'read' | 'update' | 'delete'
  ): boolean {
    const permission = `${resource}.${action}`;
    return permissions.includes(permission);
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  // Generate a secure random string (for state params, etc.)
  static generateSecureRandomString(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return result;
  }

  // Parse JWT token (client-side only, for display purposes)
  static parseJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  // Format error message for display
  static formatErrorMessage(error: unknown): string {
    if (error instanceof AuthError) {
      return error.userMessage;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
}

export const authService = new AuthService();