import { defineAction } from 'astro:actions';

export const logout = defineAction({
  handler: async (input, context) => {
    // Clear auth cookie
    context.cookies.delete('auth_token');
    
    // Destroy session
    await context.session?.destroy();

    return { success: true };
  }
});
