import { defineAction, ActionError } from 'astro:actions';
import { loginSchema } from '../../lib/validation.js';
import { getUserByEmail, verifyPassword, updateLastLogin, generateJWT } from '../../lib/auth.js';

export const login = defineAction({
  accept: 'form',
  input: loginSchema,
  handler: async (input, context) => {
    try {
      const user = await getUserByEmail(input.email);
      
      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Credenciales inválidas'
        });
      }

      // Get password hash
      const result = await context.locals.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [user.id]
      );

      const isValidPassword = await verifyPassword(input.password, result.rows[0].password_hash);
      
      if (!isValidPassword) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Credenciales inválidas'
        });
      }

      // Update last login
      await updateLastLogin(user.id);

      // Create JWT token
      const token = generateJWT({ userId: user.id, email: user.email });

      // Set auth cookie
      context.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      // Set session data
      await context.session?.set('userId', user.id);
      await context.session?.set('userEmail', user.email);
      await context.session?.set('loginTime', new Date());

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor'
      });
    }
  }
});