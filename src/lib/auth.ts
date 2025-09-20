// src/lib/auth.ts - CORREGIDO: Usar el endpoint que funciona en Postman

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
    if (!response.ok) {
      // Log más detallado del error
      const errorText = await response.text();
      console.error(`❌ Supabase API Error [${response.status}]:`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(errorData.message || errorData.error_description || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Manejar respuestas vacías (204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { message: 'Success' } as T;
    }

    // Verificar si hay contenido JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return { message: 'Success' } as T;
  }

  // Registrar usuario
  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('🔐 Calling Supabase register endpoint:', `${this.baseUrl}/auth/v1/signup`);
    
    const response = await fetch(`${this.baseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        data: data.data, // user_metadata
      }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // ✅ CORREGIDO: Usar el endpoint que funciona en Postman
  async login(data: LoginRequest): Promise<AuthResponse> {
    const endpoint = `${this.baseUrl}/auth/v1/token?grant_type=password`;
    console.log('🔐 Calling Supabase login endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // Recuperar contraseña
  async recoverPassword(data: RecoverPasswordRequest): Promise<{ message: string }> {
    console.log('📧 Calling Supabase recover endpoint:', `${this.baseUrl}/auth/v1/recover`);
    
    const response = await fetch(`${this.baseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email: data.email,
      }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Actualizar contraseña
  async updatePassword(data: UpdatePasswordRequest, token: string): Promise<{ message: string }> {
    console.log('🔒 Calling Supabase update password endpoint:', `${this.baseUrl}/auth/v1/user`);
    
    const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: this.getHeaders(true, token),
      body: JSON.stringify({
        password: data.password,
      }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Actualizar metadata de usuario
  async updateUserMetadata(data: UpdateUserMetadataRequest, token: string): Promise<{ message: string }> {
    console.log('👤 Calling Supabase update metadata endpoint:', `${this.baseUrl}/auth/v1/user`);
    
    const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: this.getHeaders(true, token),
      body: JSON.stringify({
        data: data.data, // user_metadata
      }),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Actualizar perfil completo
  async updateCompleteProfile(data: UpdateCompleteProfileRequest, token: string): Promise<{ message: string }> {
    console.log('📋 Calling Supabase RPC complete profile endpoint');
    
    const response = await fetch(`${this.baseUrl}/rest/v1/rpc/update_complete_profile`, {
      method: 'POST',
      headers: this.getHeaders(true, token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Logout
  async logout(token: string): Promise<{ message: string }> {
    console.log('🚪 Calling Supabase logout endpoint:', `${this.baseUrl}/auth/v1/logout`);
    
    try {
      const response = await fetch(`${this.baseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: this.getHeaders(true, token),
        body: JSON.stringify({}),
      });

      // Supabase logout típicamente devuelve 204 No Content
      if (response.status === 204 || response.ok) {
        console.log('✅ Supabase logout successful');
        return { message: 'Logout successful' };
      }

      throw new Error(`Logout failed with status ${response.status}`);
    } catch (error) {
      console.error('❌ Supabase logout error:', error);
      throw error;
    }
  }

  // ✅ CORREGIDO: Refresh token endpoint - sin query params
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const endpoint = `${this.baseUrl}/auth/v1/token?grant_type=refresh_token`;
    console.log('🔄 Calling Supabase refresh token endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        refresh_token: data.refresh_token,
      }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // Ver perfil completo de usuario
  async getCurrentUserProfile(token: string): Promise<UserProfile> {
    console.log('👤 Calling RPC get current user profile');
    
    const response = await fetch(`${this.baseUrl}/rest/v1/rpc/get_current_user_profile`, {
      method: 'POST',
      headers: this.getHeaders(true, token),
      body: JSON.stringify({}),
    });

    return this.handleResponse<UserProfile>(response);
  }

  // Obtener permisos de usuario
  async getUserPermissions(token: string): Promise<UserPermissions> {
    console.log('🔐 Calling RPC debug user permissions');
    
    const response = await fetch(`${this.baseUrl}/rest/v1/rpc/debug_user_permissions`, {
      method: 'POST',
      headers: this.getHeaders(true, token),
      body: JSON.stringify({}),
    });

    return this.handleResponse<UserPermissions>(response);
  }

  // Convertir AuthResponse a SessionUser
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

  // Verificar si el token ha expirado
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() / 1000 >= expiresAt;
  }

  // Verificar si el usuario tiene un permiso específico
  static hasPermission(permissions: string[], permission: string): boolean {
    return permissions.includes(permission);
  }

  // Verificar si el usuario tiene alguno de los permisos especificados
  static hasAnyPermission(permissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => permissions.includes(permission));
  }
}

export const authService = new AuthService();