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
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Registrar usuario
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // Iniciar sesión
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // Recuperar contraseña
  async recoverPassword(data: RecoverPasswordRequest): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Actualizar contraseña
  async updatePassword(data: UpdatePasswordRequest, token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: this.getHeaders(true, token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Actualizar metadata de usuario
  async updateUserMetadata(data: UpdateUserMetadataRequest, token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: this.getHeaders(true, token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Actualizar perfil completo
  async updateCompleteProfile(data: UpdateCompleteProfileRequest, token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/rest/v1/rpc/update_complete_profile`, {
      method: 'POST',
      headers: this.getHeaders(true, token),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Cerrar sesión
  async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: this.getHeaders(true, token),
      body: JSON.stringify({}),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // Renovar token
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // Ver perfil completo de usuario
  async getCurrentUserProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/rest/v1/rpc/get_current_user_profile`, {
      method: 'POST',
      headers: this.getHeaders(true, token),
      body: JSON.stringify({}),
    });

    return this.handleResponse<UserProfile>(response);
  }

  // Revelar permisos de usuario
  async getUserPermissions(token: string): Promise<UserPermissions> {
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