import { defineAction, ActionError } from 'astro:actions';
import { resetPasswordSchema } from '../../lib/validation.js';
import { resetPassword } from '../../lib/auth.js';

export const resetPasswordAction = defineAction({
  accept: 'form',
  input: resetPasswordSchema,
  handler: async (input, context) => {
    try {
      const success = await resetPassword(input.token, input.password);
      
      if (!success) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Token inválido o expirado'
        });
      }

      return { success: true, message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      
      console.error('Reset password error:', error);
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al restablecer la contraseña'
      });
    }
  }
});