import { defineAction, ActionError } from 'astro:actions';
import { registerSchema } from '../../lib/validation.js';
import { getUserByEmail, createUser, generateJWT } from '../../lib/auth.js';
import { query } from '../../lib/db.js';

export const register = defineAction({
  accept: 'form',
  input: registerSchema,
  handler: async (input, context) => {
    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      
      if (existingUser) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'El email ya está registrado'
        });
      }

      // Get default role ID (doctor by default, admin can change later)
      const roleResult = await query(
        'SELECT id FROM roles WHERE name = $1',
        ['doctor']
      );

      if (roleResult.rows.length === 0) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error en la configuración del sistema'
        });
      }

      const defaultRoleId = roleResult.rows[0].id;

      // Create user
      const newUser = await createUser({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        roleId: defaultRoleId
      });

      // Create JWT token
      const token = generateJWT({ userId: newUser.id, email: newUser.email });

      // Set auth cookie
      context.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      // Set session data
      await context.session?.set('userId', newUser.id);
      await context.session?.set('userEmail', newUser.email);
      await context.session?.set('loginTime', new Date());

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      
      console.error('Registration error:', error);
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }
});