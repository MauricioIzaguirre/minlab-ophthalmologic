import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { authService } from '../lib/auth';
import type { SessionUser } from '../types/auth';

// Esquemas de validación (mantenidos igual)
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  redirect_to: z.string().optional().default('/dashboard'),
});

const recoverPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const updateUserMetadataSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  avatar_url: z.string().url('URL de avatar inválida'),
});

const updateCompleteProfileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  avatar_url: z.string().url('URL de avatar inválida'),
  timezone: z.string().min(1, 'La zona horaria es requerida'),
  language: z.string().min(1, 'El idioma es requerido'),
  date_of_birth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F', 'Other'], { message: 'Género inválido' }),
  emergency_contact_name: z.string().min(1, 'El contacto de emergencia es requerido'),
  emergency_contact_phone: z.string().min(1, 'El teléfono de emergencia es requerido'),
  emergency_contact_relation: z.string().min(1, 'La relación del contacto es requerida'),
  allergies: z.array(z.string()).default([]),
  current_medications: z.array(z.string()).default([]),
  medical_history: z.object({
    conditions: z.array(z.string()).default([]),
    surgeries: z.array(z.string()).default([]),
  }),
  insurance_info: z.object({
    provider: z.string().min(1, 'El proveedor de seguro es requerido'),
    policy_number: z.string().min(1, 'El número de póliza es requerido'),
  }),
  preferred_language: z.string().min(1, 'El idioma preferido es requerido'),
  bio: z.string().optional().default(''),
});

// Función auxiliar para crear SessionUser
function createSessionUser(authResponse: any, permissions: string[]): SessionUser {
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

// Función para mapear errores de autenticación a mensajes amigables
function getAuthErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  // Mapeo de errores comunes
  if (errorMessage.includes('invalid_grant') || errorMessage.includes('invalid credentials')) {
    return 'Credenciales incorrectas. Verifica tu email y contraseña.';
  }
  if (errorMessage.includes('email_not_confirmed') || errorMessage.includes('not confirmed')) {
    return 'Tu cuenta aún no ha sido verificada. Revisa tu email.';
  }
  if (errorMessage.includes('too_many_requests') || errorMessage.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
  }
  if (errorMessage.includes('user_not_found')) {
    return 'No se encontró una cuenta con ese email.';
  }
  if (errorMessage.includes('password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  
  return 'Error inesperado. Por favor, inténtalo más tarde.';
}

export const server = {
  // Registrar usuario
  register: defineAction({
    accept: 'form',
    input: registerSchema,
    handler: async (input, context) => {
      try {
        console.log('🚀 Starting user registration process');
        
        const response = await authService.register({
          email: input.email,
          password: input.password,
          data: {
            first_name: input.first_name,
            last_name: input.last_name,
            phone: input.phone,
          },
        });

        console.log('✅ User registered successfully');

        // Obtener permisos del usuario
        const permissions = await authService.getUserPermissions(response.access_token);
        
        // Crear usuario de sesión
        const sessionUser = createSessionUser(response, permissions.permissions);
        
        // Guardar en sesión
        await context.session?.set('user', sessionUser);

        return { 
          success: true, 
          message: 'Usuario registrado exitosamente',
          redirect: '/dashboard',
          shouldRedirect: true,
          user: {
            id: sessionUser.id,
            email: sessionUser.email,
            first_name: sessionUser.first_name,
            last_name: sessionUser.last_name
          }
        };
      } catch (error) {
        console.error('❌ Registration error:', error);
        
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

  // Iniciar sesión
  login: defineAction({
    accept: 'form',
    input: loginSchema,
    handler: async (input, context) => {
      const startTime = Date.now();
      
      try {
        console.log('🔐 Starting login process for:', input.email);
        
        const response = await authService.login({
          email: input.email,
          password: input.password,
        });

        console.log('✅ Authentication successful, fetching permissions...');

        // Obtener permisos del usuario
        const permissions = await authService.getUserPermissions(response.access_token);
        
        // Crear usuario de sesión
        const sessionUser = createSessionUser(response, permissions.permissions);
        
        // Guardar en sesión
        await context.session?.set('user', sessionUser);
        
        const endTime = Date.now();
        console.log(`🎉 Login completed successfully in ${endTime - startTime}ms`);

        // Determinar URL de redirección
        const redirectUrl = input.redirect_to || '/dashboard';

        return { 
          success: true, 
          message: 'Sesión iniciada exitosamente',
          redirect: redirectUrl,
          shouldRedirect: true,
          user: {
            id: sessionUser.id,
            email: sessionUser.email,
            first_name: sessionUser.first_name,
            last_name: sessionUser.last_name,
            role: sessionUser.role,
            permissions: sessionUser.permissions
          }
        };
      } catch (error) {
        const endTime = Date.now();
        console.error(`❌ Login failed after ${endTime - startTime}ms:`, error);
        
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

// FIXED: Logout action - src/actions/index.ts (fragmento corregido)

// src/actions/index.ts - LOGOUT ACTION CORREGIDA

logout: defineAction({
  accept: 'form',
  handler: async (_input, context) => {
    try {
      console.log('🚪 Starting logout process');
      
      const sessionUser = await context.session?.get('user') as SessionUser | undefined;
      
      if (sessionUser) {
        try {
          // ✅ INTENTO DE LOGOUT EN SUPABASE
          await authService.logout(sessionUser.access_token);
          console.log('✅ Supabase logout successful');
        } catch (supabaseError) {
          // ✅ MEJORADO: Log específico del error pero continúa
          const errorMessage = supabaseError instanceof Error ? supabaseError.message : String(supabaseError);
          
          if (errorMessage.includes('Unexpected end of JSON input')) {
            console.log('✅ Supabase logout successful (empty response - typical behavior)');
          } else {
            console.warn('⚠️ Supabase logout failed, continuing with local logout:', errorMessage);
          }
        }
      }

      // ✅ SIEMPRE DESTRUIR SESIÓN LOCAL
      await context.session?.destroy();
      
      console.log('✅ Local session destroyed');

      return { 
        success: true, 
        message: 'Sesión cerrada exitosamente',
        redirect: '/auth/login?message=logged-out',
        shouldRedirect: true
      };
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // ✅ ASEGURAR LIMPIEZA DE SESIÓN AUNQUE FALLE TODO
      try {
        await context.session?.destroy();
        console.log('✅ Session destroyed in error handler');
      } catch (destroyError) {
        console.error('❌ Failed to destroy session in error handler:', destroyError);
      }
      
      // ✅ DEVOLVER ÉXITO AUNQUE HAYA ERRORES - El logout local es lo importante
      return { 
        success: true, 
        message: 'Sesión cerrada exitosamente (con limpieza forzada)',
        redirect: '/auth/login?message=logged-out',
        shouldRedirect: true
      };
    }
  },
}),

  // Recuperar contraseña
  recoverPassword: defineAction({
    accept: 'form',
    input: recoverPasswordSchema,
    handler: async (input) => {
      try {
        console.log('📧 Starting password recovery for:', input.email);
        
        await authService.recoverPassword({
          email: input.email,
        });

        console.log('✅ Password recovery email sent');

        return { 
          success: true, 
          message: 'Se ha enviado un email para recuperar la contraseña',
          showToast: true,
          toastType: 'success' as const
        };
      } catch (error) {
        console.error('❌ Password recovery error:', error);
        
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

  // Actualizar contraseña
  updatePassword: defineAction({
    accept: 'form',
    input: updatePasswordSchema,
    handler: async (input, context) => {
      const sessionUser = await context.session?.get('user') as SessionUser | undefined;
      
      if (!sessionUser) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes estar autenticado para realizar esta acción',
        });
      }

      try {
        console.log('🔒 Updating password for user:', sessionUser.id);
        
        await authService.updatePassword(
          { password: input.password },
          sessionUser.access_token
        );

        console.log('✅ Password updated successfully');

        return { 
          success: true, 
          message: 'Contraseña actualizada exitosamente',
          showToast: true,
          toastType: 'success' as const
        };
      } catch (error) {
        console.error('❌ Password update error:', error);
        
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

  // Actualizar metadata de usuario
  updateUserMetadata: defineAction({
    accept: 'form',
    input: updateUserMetadataSchema,
    handler: async (input, context) => {
      const sessionUser = await context.session?.get('user') as SessionUser | undefined;
      
      if (!sessionUser) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes estar autenticado para realizar esta acción',
        });
      }

      try {
        console.log('👤 Updating user metadata for:', sessionUser.id);
        
        await authService.updateUserMetadata(
          {
            data: {
              first_name: input.first_name,
              last_name: input.last_name,
              phone: input.phone,
              avatar_url: input.avatar_url,
            },
          },
          sessionUser.access_token
        );

        // Actualizar información en la sesión
        const updatedUser = {
          ...sessionUser,
          first_name: input.first_name,
          last_name: input.last_name,
        };
        await context.session?.set('user', updatedUser);

        console.log('✅ User metadata updated successfully');

        return { 
          success: true, 
          message: 'Perfil actualizado exitosamente',
          showToast: true,
          toastType: 'success' as const
        };
      } catch (error) {
        console.error('❌ Update metadata error:', error);
        
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

  // Actualizar perfil completo
  updateCompleteProfile: defineAction({
    accept: 'form',
    input: updateCompleteProfileSchema,
    handler: async (input, context) => {
      const sessionUser = await context.session?.get('user') as SessionUser | undefined;
      
      if (!sessionUser) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes estar autenticado para realizar esta acción',
        });
      }

      try {
        console.log('📋 Updating complete profile for:', sessionUser.id);
        
        await authService.updateCompleteProfile(input, sessionUser.access_token);

        console.log('✅ Complete profile updated successfully');

        return { 
          success: true, 
          message: 'Perfil completo actualizado exitosamente',
          showToast: true,
          toastType: 'success' as const
        };
      } catch (error) {
        console.error('❌ Update complete profile error:', error);
        
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

  // Obtener perfil del usuario actual
  getCurrentUserProfile: defineAction({
    handler: async (_input, context) => {
      const sessionUser = await context.session?.get('user') as SessionUser | undefined;
      
      if (!sessionUser) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes estar autenticado para realizar esta acción',
        });
      }

      try {
        console.log('👤 Fetching profile for user:', sessionUser.id);
        
        const profile = await authService.getCurrentUserProfile(sessionUser.access_token);
        
        console.log('✅ Profile fetched successfully');
        
        return { success: true, data: profile };
      } catch (error) {
        console.error('❌ Get profile error:', error);
        
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),

  // Obtener permisos del usuario actual
  getUserPermissions: defineAction({
    handler: async (_input, context) => {
      const sessionUser = await context.session?.get('user') as SessionUser | undefined;
      
      if (!sessionUser) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes estar autenticado para realizar esta acción',
        });
      }

      try {
        console.log('🔐 Fetching permissions for user:', sessionUser.id);
        
        const permissions = await authService.getUserPermissions(sessionUser.access_token);
        
        console.log('✅ Permissions fetched successfully');
        
        return { success: true, data: permissions };
      } catch (error) {
        console.error('❌ Get permissions error:', error);
        
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: getAuthErrorMessage(error),
        });
      }
    },
  }),
};