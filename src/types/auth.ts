// Interfaces para autenticación
export interface RegisterRequest {
  email: string;
  password: string;
  data: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RecoverPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface UpdateUserMetadataRequest {
  data: {
    first_name: string;
    last_name: string;
    phone: string;
    avatar_url: string;
  };
}

export interface UpdateCompleteProfileRequest {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  timezone: string;
  language: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'Other';
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  allergies: string[];
  current_medications: string[];
  medical_history: {
    conditions: string[];
    surgeries: string[];
  };
  insurance_info: {
    provider: string;
    policy_number: string;
  };
  preferred_language: string;
  bio: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Respuestas de la API
export interface AuthUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: {
    avatar_url: string;
    email_verified: boolean;
    first_name: string;
    last_name: string;
    phone: string;
  };
  identities: Array<{
    identity_id: string;
    id: string;
    user_id: string;
    identity_data: any;
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
    email: string;
  }>;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: AuthUser;
  weak_password?: any;
}

export interface UserProfile {
  id: string;
  role: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | 'Other';
  status: string;
  language: string;
  timezone: string;
  is_active: boolean;
  last_name: string;
  avatar_url: string;
  created_at: string;
  first_name: string;
  profile_type: string;
  date_of_birth: string;
  license_number?: string;
  specialization?: string;
  medical_record_number?: string;
}

export interface UserPermissions {
  user_data: {
    role: string;
    email: string;
    user_id: string;
    jwt_role: string;
    last_name: string;
    first_name: string;
    role_active: boolean;
    profile_type: string;
    profile_active: boolean;
  };
  permissions: string[];
  is_super_admin: boolean;
  can_read_services: boolean;
  total_permissions: number;
  can_read_appointments: boolean;
}

// Tipos de error
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Tipos para sesiones
export interface SessionUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: string[];
  access_token: string;
  refresh_token: string;
  expires_at: number;
}