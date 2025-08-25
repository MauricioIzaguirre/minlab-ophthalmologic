import { defineAction, ActionError } from 'astro:actions';
import { forgotPasswordSchema } from '../../lib/validation.js';
import { createPasswordResetToken } from '../../lib/auth.js';
import nodemailer from 'nodemailer';

export const forgotPassword = defineAction({
  accept: 'form',
  input: forgotPasswordSchema,
  handler: async (input, context) => {
    try {
      const token = await createPasswordResetToken(input.email);
      
      if (!token) {
        // Don't reveal if email exists or not for security
        return { success: true, message: 'Si el email existe, recibirás un enlace de recuperación' };
      }

      // Configure email transporter
      const transporter = nodemailer.createTransport({
        host: import.meta.env.SMTP_HOST,
        port: import.meta.env.SMTP_PORT,
        secure: false,
        auth: {
          user: import.meta.env.SMTP_USER,
          pass: import.meta.env.SMTP_PASSWORD
        }
      });

      const resetUrl = `${import.meta.env.BASE_URL}/auth/reset-password?token=${token}`;

      await transporter.sendMail({
        from: import.meta.env.SMTP_USER,
        to: input.email,
        subject: 'Recuperación de contraseña - MinLab Ophthalmologic',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2>Recuperación de contraseña</h2>
            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Restablecer contraseña</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Saludos,<br>Equipo de MinLab Ophthalmologic</p>
          </div>
        `
      });

      return { success: true, message: 'Si el email existe, recibirás un enlace de recuperación' };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al enviar el email'
      });
    }
  }
});