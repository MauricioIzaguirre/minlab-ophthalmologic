import { defineMiddleware } from 'astro:middleware';
import type { SessionUser } from './types/auth';
import { authService } from './lib/auth';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/unauthorized',
  '/api',
];

// Authentication-related routes (redirect if already logged in)
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Routes that require authentication 
const protectedRoutes = [
  '/dashboard',
  '/appointment',
  '/doctors',
  '/auth/logout',
  '/services',
  '/patients',
  '/histories',
  '/reports',
  '/settings'
];

// Function to check if a path matches any route pattern
function matchesRoutePattern(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route === pathname) return true;
    // Handle API routes and wildcards
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    if (route.includes('/api')) {
      return pathname.startsWith(route);
    }
    return pathname.startsWith(route);
  });
}

// Function to verify route permissions based on user role/permissions
function hasRoutePermission(user: SessionUser, pathname: string): boolean {
  // Admin routes require admin access
  if (pathname.startsWith('/admin')) {
    return user.permissions.includes('admin.access') || user.role === 'super_admin';
  }
  
  // Dashboard requires basic dashboard access
  if (pathname.startsWith('/dashboard')) {
    return user.permissions.includes('dashboard.access');
  }
  
  // Profile routes are generally accessible to authenticated users
  if (pathname.startsWith('/profile')) {
    return true;
  }
  
  // Logout is accessible to all authenticated users
  if (pathname === '/auth/logout') {
    return true;
  }
  
  // For any other protected route, allow if user is authenticated
  return true;
}

// Function to check if token is expired
function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const buffer = 300; // 5 minutes buffer
  return now >= (expiresAt - buffer);
}

// Function to create session user from auth response
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
  const { url, locals, session, request } = context;
  const pathname = url.pathname;

  console.log(`🔍 Middleware processing: ${request.method} ${pathname}`);

  // Initialize locals with default values
  locals.isAuthenticated = false;
  locals.user = undefined;

  // Skip middleware for static assets and API routes
  if (pathname.startsWith('/_astro/') || 
      pathname.startsWith('/favicon') || 
      pathname.startsWith('/api/') ||
      pathname.includes('.')) {
    console.log(`⚡ Skipping middleware for static/API route: ${pathname}`);
    return next();
  }

  try {
    // Get user from session
    const sessionUser = await session?.get('user') as SessionUser | undefined;

    if (sessionUser) {
      // Check if token is expired
      if (isTokenExpired(sessionUser.expires_at)) {
        try {
          console.log('🔄 Token expired, attempting refresh...');
          
          // Attempt to refresh the token
          const refreshResponse = await authService.refreshToken({
            refresh_token: sessionUser.refresh_token
          });

          // Get updated permissions
          const permissions = await authService.getUserPermissions(refreshResponse.access_token);
          
          // Create updated user session
          const updatedUser = createSessionUser(refreshResponse, permissions.permissions);
          await session?.set('user', updatedUser);
          
          locals.user = updatedUser;
          locals.isAuthenticated = true;
          
          console.log('✅ Token refreshed successfully');
        } catch (error) {
          console.error('❌ Failed to refresh token:', error);
          
          // Clear invalid session
          await session?.destroy();
          locals.user = undefined;
          locals.isAuthenticated = false;
        }
      } else {
        // Token is valid
        locals.user = sessionUser;
        locals.isAuthenticated = true;
        console.log(`✅ Valid session found for user: ${sessionUser.email}`);
      }
    }

    // Route protection logic
    const isPublic = matchesRoutePattern(pathname, publicRoutes);
    const isAuthRoute = matchesRoutePattern(pathname, authRoutes);
    const isProtected = matchesRoutePattern(pathname, protectedRoutes);

    console.log(`🛣️  Route analysis for ${pathname}:`, { isPublic, isAuthRoute, isProtected, isAuthenticated: locals.isAuthenticated });

    // Handle authentication redirects for GET requests only
    if (request.method === 'GET') {
      if (isAuthRoute && locals.isAuthenticated) {
        // Already logged in, redirect to dashboard
        console.log(`🔀 Redirecting authenticated user from ${pathname} to /dashboard`);
        const redirectUrl = new URL('/dashboard', url.origin);
        return context.redirect(redirectUrl.toString(), 302);
      }

      if (isProtected && !locals.isAuthenticated) {
        // Need authentication, redirect to login
        console.log(`🔀 Redirecting unauthenticated user from ${pathname} to login`);
        const loginUrl = new URL('/auth/login', url.origin);
        loginUrl.searchParams.set('redirect', pathname);
        return context.redirect(loginUrl.toString(), 302);
      }

      // Check permissions for protected routes
      if (isProtected && locals.isAuthenticated && locals.user) {
        if (!hasRoutePermission(locals.user, pathname)) {
          console.log(`🔀 User lacks permission for ${pathname}, redirecting to /unauthorized`);
          const unauthorizedUrl = new URL('/unauthorized', url.origin);
          return context.redirect(unauthorizedUrl.toString(), 302);
        }
      }
    }

    // For POST requests (form submissions), just continue to allow actions to handle
    if (request.method === 'POST') {
      console.log(`📝 Allowing POST request to ${pathname} to proceed to actions`);
    }

    console.log(`✅ Middleware allowing access to ${pathname}`);
    return next();

  } catch (error) {
    console.error('❌ Middleware error:', error);
    
    // Clear session on error and continue
    try {
      await session?.destroy();
    } catch (destroyError) {
      console.error('❌ Failed to destroy session:', destroyError);
    }
    
    locals.user = undefined;
    locals.isAuthenticated = false;
    
    // For GET requests to protected routes, redirect to login on error
    if (request.method === 'GET' && matchesRoutePattern(pathname, protectedRoutes)) {
      console.log(`🔀 Redirecting to login due to middleware error on ${pathname}`);
      const loginUrl = new URL('/auth/login', url.origin);
      loginUrl.searchParams.set('error', 'session-error');
      return context.redirect(loginUrl.toString(), 302);
    }
    
    return next();
  }
});