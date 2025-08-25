import { defineMiddleware } from 'astro:middleware';
import { getUserWithRole, verifyJWT } from './lib/auth.js';
import { query } from './lib/db.js';

export const onRequest = defineMiddleware(async (context, next) => {
  // Agregar función query a context.locals para actions
  context.locals.query = query;
  
  // Skip middleware for auth pages and public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
  const isAuthRoute = publicRoutes.some(route => context.url.pathname.startsWith(route));
  
  if (isAuthRoute) {
    return next();
  }

  // Check for JWT token in cookies
  const token = context.cookies.get('auth_token')?.value;
  let user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
      id: string;
      name: string;
      permissions: string[];
    };
  } | null = null;

  if (token) {
    try {
      const decoded = verifyJWT(token);
      if (decoded && decoded.userId) {
        const userData = await getUserWithRole(decoded.userId);
        if (userData) {
          user = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: {
              id: userData.role.id,
              name: userData.role.name,
              permissions: userData.role.permissions
            }
          };
        }
      }
    } catch (error) {
      // Token is invalid, continue without user
      context.cookies.delete('auth_token');
    }
  }

  // Set user in locals (ahora con tipo correcto)
  context.locals.user = user || undefined;
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