import { defineMiddleware } from 'astro:middleware';
import type { SessionUser } from './types/auth';
import { authService } from './lib/auth';

// Rutas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/recover-password',
  '/unauthorized',
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

// Función para verificar si el token ha expirado
function isTokenExpired(expiresAt: number): boolean {
  return Date.now() / 1000 >= expiresAt;
}

// Función para crear SessionUser desde AuthResponse
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

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals, session } = context;
  const pathname = url.pathname;

  // Inicializar locals con valores por defecto
  locals.isAuthenticated = false;
  locals.user = undefined;

  // Obtener usuario de la sesión
  const sessionUser = await session?.get('user') as SessionUser | undefined;

  if (sessionUser) {
    // Verificar si el token ha expirado
    if (isTokenExpired(sessionUser.expires_at)) {
      // Intentar refrescar el token
      try {
        const refreshResponse = await authService.refreshToken({
          refresh_token: sessionUser.refresh_token
        });

        // Obtener permisos actualizados
        const permissions = await authService.getUserPermissions(refreshResponse.access_token);
        
        // Crear usuario actualizado
        const updatedUser = createSessionUser(refreshResponse, permissions.permissions);
        await session?.set('user', updatedUser);
        
        locals.user = updatedUser;
        locals.isAuthenticated = true;
      } catch (error) {
        console.error('Error refreshing token:', error);
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