import { defineMiddleware } from 'astro:middleware';
import type { SessionUser } from './types/auth';
import { authService } from './lib/auth';

// Rutas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/recover-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/recover-password',
];

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/admin',
];

// Función para verificar si una ruta es pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === pathname) return true;
    // Verificar rutas con parámetros dinámicos si es necesario
    return false;
  });
}

// Función para verificar si una ruta requiere autenticación
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Función para verificar si el usuario tiene permisos para acceder a una ruta
function hasRoutePermission(user: SessionUser, pathname: string): boolean {
  // Ejemplo de verificación de permisos basada en rutas
  if (pathname.startsWith('/admin')) {
    return user.permissions.includes('admin.access');
  }
  
  if (pathname.startsWith('/dashboard')) {
    return user.permissions.includes('dashboard.access');
  }
  
  // Por defecto, si está autenticado y no es una ruta específica, permitir acceso
  return true;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, cookies, locals, session } = context;
  const pathname = url.pathname;

  // Inicializar locals
  locals.isAuthenticated = false;
  locals.user = undefined;

  // Obtener usuario de la sesión
  const sessionUser = await session?.get('user') as SessionUser | undefined;

  if (sessionUser) {
    // Verificar si el token ha expirado
    if (authService.isTokenExpired(sessionUser.expires_at)) {
      // Intentar refrescar el token
      try {
        const refreshResponse = await authService.refreshToken({
          refresh_token: sessionUser.refresh_token
        });

        // Obtener permisos actualizados
        const permissions = await authService.getUserPermissions(refreshResponse.access_token);
        
        // Actualizar usuario en sesión
        const updatedUser = authService.toSessionUser(refreshResponse, permissions.permissions);
        await session?.set('user', updatedUser);
        
        locals.user = updatedUser;
        locals.isAuthenticated = true;
      } catch (error) {
        // Si falla el refresh, limpiar la sesión
        await session?.destroy();
        locals.user = undefined;
        locals.isAuthenticated = false;
      }
    } else {
      // Token válido
      locals.user = sessionUser;
      locals.isAuthenticated = true;
    }
  }

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(pathname)) {
    return next();
  }

  // Si es una ruta protegida y no está autenticado, redirigir al login
  if (isProtectedRoute(pathname) && !locals.isAuthenticated) {
    return context.redirect('/login');
  }

  // Si está autenticado pero no tiene permisos para la ruta, redirigir
  if (locals.isAuthenticated && locals.user && !hasRoutePermission(locals.user, pathname)) {
    return context.redirect('/unauthorized');
  }

  // Si es una ruta de autenticación y ya está autenticado, redirigir al dashboard
  if ((pathname === '/login' || pathname === '/register') && locals.isAuthenticated) {
    return context.redirect('/dashboard');
  }

  return next();
});