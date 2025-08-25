import { defineMiddleware } from 'astro:middleware';
import { getUserWithRole, verifyJWT } from './lib/auth.js';

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip middleware for auth pages and public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  const isAuthRoute = publicRoutes.some(route => context.url.pathname.startsWith(route));
  
  if (isAuthRoute) {
    return next();
  }

  // Check for JWT token in cookies
  const token = context.cookies.get('auth_token')?.value;
  let user = null;

  if (token) {
    try {
      const decoded = verifyJWT(token);
      if (decoded && decoded.userId) {
        user = await getUserWithRole(decoded.userId);
      }
    } catch (error) {
      // Token is invalid, continue without user
      context.cookies.delete('auth_token');
    }
  }

  // Set user in locals
  context.locals.user = user;
  context.locals.isAuthenticated = !!user;

  // For protected routes, redirect to login if not authenticated
  const protectedRoutes = ['/dashboard', '/admin', '/patients', '/appointments'];
  const isProtectedRoute = protectedRoutes.some(route => 
    context.url.pathname.startsWith(route)
  );

  if (isProtectedRoute && !context.locals.isAuthenticated) {
    return context.redirect('/auth/login?redirect=' + encodeURIComponent(context.url.pathname));
  }

  return next();
});