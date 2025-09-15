import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { authService } from '../lib/auth';
import type { SessionUser } from '../types/auth';

// Esquemas de validación
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

export const server = {
  // Registrar usuario
  register: defineAction({
    accept: 'form',
    input: registerSchema,
    handler: async (input, context) => {
      try {
        const response = await authService.register({
          email: input.email,
          password: input.password,
          data: {
            first_name: input.first_name,
            last_name: input.last_name,
            phone: input.phone,
          },
        });

        // Obtener permisos del usuario
        const permissions = await authService.getUserPermissions(response.access_token);
        
        // Crear usuario de sesión
        const sessionUser = authService.toSessionUser(response, permissions.permissions);
        
        // Guardar en sesión
        await context.session?.set('user', sessionUser);

        return { success: true, message: 'Usuario registrado exitosamente' };
      } catch (error) {
        throw new ActionError({
          code: 'REGISTRATION_FAILED',
          message: error instanceof Error ? error.message : 'Error al registrar usuario',
        });
      }
    },
  }),

  // Iniciar sesión
  login: defineAction({
    accept: 'form',
    input: loginSchema,
    handler: async (input, context) => {
      try {
        const response = await authService.login({
          email: input.email,
          password: input.password,
        });

        // Obtener permisos del usuario
        const permissions = await authService.getUserPermissions(response.access_token);
        
        // Crear usuario de sesión
        const sessionUser = authService.toSessionUser(response, permissions.permissions);
        
        // Guardar en sesión
        await context.session?.set('user', sessionUser);

        return { success: true, message: 'Sesión iniciada exitosamente' };
      } catch (error) {
        throw new ActionError({
          code: 'LOGIN_FAILED',
          message: error instanceof Error ? error.message : 'Error al iniciar sesión',
        });
      }
    },
  }),

  // Cerrar sesión
  logout: defineAction({
    handler: async (_input, context) => {
      try {
        const sessionUser = await context.session?.get('user') as SessionUser | undefined;
        
        if (sessionUser) {
          // Cerrar sesión en Supabase
          await authService.logout(sessionUser.access_token);
        }

        // Destruir sesión local
        await context.session?.destroy();

        return { success: true, message: 'Sesión cerrada exitosamente' };
      } catch (error) {
        // Aunque falle el logout en Supabase, limpiar sesión local
        await context.session?.destroy();
        
        throw new ActionError({
          code: 'LOGOUT_FAILED',
          message: error instanceof Error ? error.message : 'Error al cerrar sesión',
        });
      }
    },
  }),

  // Recuperar contraseña
  recoverPassword: defineAction({
    accept: 'form',
    input: recoverPasswordSchema,
    handler: async (input) => {
      try {
        await authService.recoverPassword({
          email: input.email,
        });

        return { success: true, message: 'Se ha enviado un email para recuperar la contraseña' };
      } catch (error) {
        throw new ActionError({
          code: 'RECOVERY_FAILED',
          message: error instanceof Error ? error.message : 'Error al recuperar contraseña',
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
        await authService.updatePassword(
          { password: input.password },
          sessionUser.access_token
        );

        return { success: true, message: 'Contraseña actualizada exitosamente' };
      } catch (error) {
        throw new ActionError({
          code: 'UPDATE_PASSWORD_FAILED',
          message: error instanceof Error ? error.message : 'Error al actualizar contraseña',
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

        return { success: true, message: 'Perfil actualizado exitosamente' };
      } catch (error) {
        throw new ActionError({
          code: 'UPDATE_METADATA_FAILED',
          message: error instanceof Error ? error.message : 'Error al actualizar perfil',
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
        await authService.updateCompleteProfile(input, sessionUser.access_token);

        return { success: true, message: 'Perfil completo actualizado exitosamente' };
      } catch (error) {
        throw new ActionError({
          code: 'UPDATE_COMPLETE_PROFILE_FAILED',
          message: error instanceof Error ? error.message : 'Error al actualizar perfil completo',
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
        const profile = await authService.getCurrentUserProfile(sessionUser.access_token);
        return { success: true, data: profile };
      } catch (error) {
        throw new ActionError({
          code: 'GET_PROFILE_FAILED',
          message: error instanceof Error ? error.message : 'Error al obtener perfil',
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
        const permissions = await authService.getUserPermissions(sessionUser.access_token);
        return { success: true, data: permissions };
      } catch (error) {
        throw new ActionError({
          code: 'GET_PERMISSIONS_FAILED',
          message: error instanceof Error ? error.message : 'Error al obtener permisos',
        });
      }
    },
  }),
};