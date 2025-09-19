// src/config/routes.ts - Configuración centralizada de rutas de la aplicación

/**
 * Configuración de rutas de la aplicación
 * Esta configuración permite modificar fácilmente las rutas y sus comportamientos
 */

export interface RouteConfig {
  /** Rutas que no requieren autenticación */
  public: string[];
  /** Rutas relacionadas con autenticación (redirigir si ya está logueado) */
  auth: string[];
  /** Rutas que requieren autenticación */
  protected: string[];
  /** Rutas que requieren permisos específicos */
  restricted: Record<string, string[]>;
}

/**
 * Configuración principal de rutas
 * Modifica estas rutas según las necesidades de tu aplicación
 */
export const routeConfig: RouteConfig = {
  // Rutas públicas que no requieren autenticación
  public: [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/unauthorized',
    '/api',
    '/legal/terms',
    '/legal/privacy',
  ],

  // Rutas de autenticación (redirigir si ya está logueado)
  auth: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],

  // Rutas que requieren autenticación básica
  protected: [
    '/dashboard',
    '/appointment',
    '/doctors',
    '/auth/logout',
    '/services',
    '/patients',
    '/histories',
    '/reports',
    '/settings',
    '/profile',
  ],

  // Rutas que requieren permisos específicos
  restricted: {
    // Rutas administrativas
    '/settings/users': ['users.read', 'admin.access'],
    '/settings/roles': ['roles.read', 'admin.access'],
    '/settings/permissions': ['permissions.read', 'admin.access'],
    
    // Gestión de usuarios
    '/users': ['users.read'],
    '/users/create': ['users.create'],
    '/users/edit': ['users.update'],
    '/users/delete': ['users.delete'],
    
    // Gestión de citas
    '/appointment': ['appointments.read'],
    '/appointment/new': ['appointments.create'],
    '/appointment/edit': ['appointments.update'],
    '/appointment/delete': ['appointments.delete'],
    '/appointment/confirm': ['appointments.confirm'],
    '/appointment/cancel': ['appointments.cancel'],
    '/appointment/reschedule': ['appointments.reschedule'],
    '/appointment/check-in': ['appointments.check_in'],
    
    // Gestión de doctores
    '/doctors': ['users.read'],
    '/doctors/schedules': ['schedules.read'],
    '/doctors/availability': ['schedules.read'],
    
    // Gestión de servicios
    '/services': ['services.read'],
    '/services/create': ['services.create'],
    '/services/edit': ['services.update'],
    '/services/delete': ['services.delete'],
    
    // Gestión de pacientes
    '/patients': ['profiles.read'],
    '/patients/new': ['profiles.create'],
    '/patients/edit': ['profiles.update'],
    '/patients/delete': ['profiles.delete'],
    
    // Historiales médicos
    '/histories': ['profiles.read'],
    '/histories/create': ['profiles.create'],
    '/histories/edit': ['profiles.update'],
    
    // Reportes
    '/reports': ['reports.read'],
    '/reports/create': ['reports.create'],
    '/reports/financial': ['reports.read'],
    
    // Configuración general
    '/settings': ['settings.read'],
    '/settings/general': ['settings.read'],
    '/settings/update': ['settings.update'],
  }
};

/**
 * Utilidades para trabajar con rutas
 */
export class RouteUtils {
  /**
   * Verifica si una ruta coincide con algún patrón
   */
  static matchesRoutePattern(pathname: string, routes: string[]): boolean {
    return routes.some(route => {
      if (route === pathname) return true;
      
      // Manejar rutas API y comodines
      if (route.endsWith('*')) {
        return pathname.startsWith(route.slice(0, -1));
      }
      
      if (route.includes('/api')) {
        return pathname.startsWith(route);
      }
      
      return pathname.startsWith(route);
    });
  }

  /**
   * Verifica si una ruta es pública
   */
  static isPublicRoute(pathname: string): boolean {
    return this.matchesRoutePattern(pathname, routeConfig.public);
  }

  /**
   * Verifica si una ruta es de autenticación
   */
  static isAuthRoute(pathname: string): boolean {
    return this.matchesRoutePattern(pathname, routeConfig.auth);
  }

  /**
   * Verifica si una ruta está protegida
   */
  static isProtectedRoute(pathname: string): boolean {
    return this.matchesRoutePattern(pathname, routeConfig.protected);
  }

  /**
   * Obtiene los permisos requeridos para una ruta específica
   */
  static getRequiredPermissions(pathname: string): string[] {
    // Buscar coincidencia exacta primero
    if (routeConfig.restricted[pathname]) {
      return routeConfig.restricted[pathname];
    }

    // Buscar coincidencias de patrón (más específicas primero)
    const sortedRoutes = Object.keys(routeConfig.restricted)
      .sort((a, b) => b.length - a.length);

    for (const route of sortedRoutes) {
      if (pathname.startsWith(route)) {
        return routeConfig.restricted[route];
      }
    }

    return [];
  }

  /**
   * Verifica si una ruta requiere permisos específicos
   */
  static isRestrictedRoute(pathname: string): boolean {
    return this.getRequiredPermissions(pathname).length > 0;
  }

  /**
   * Obtiene la ruta de redirección después del login
   */
  static getDefaultRedirectAfterLogin(userRole: string): string {
    const roleRedirects: Record<string, string> = {
      super_admin: '/dashboard',
      admin: '/dashboard',
      doctor: '/dashboard',
      nurse: '/dashboard',
      receptionist: '/appointment',
      patient: '/dashboard',
      coordinator: '/appointment',
      technician: '/appointment',
    };

    return roleRedirects[userRole] || '/dashboard';
  }

  /**
   * Verifica si el usuario tiene acceso a una ruta específica
   */
  static canAccessRoute(userPermissions: string[], pathname: string): boolean {
    const requiredPermissions = this.getRequiredPermissions(pathname);
    
    if (requiredPermissions.length === 0) {
      return true; // No se requieren permisos específicos
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Obtiene rutas de navegación disponibles para un usuario
   */
  static getAvailableRoutes(userPermissions: string[]): string[] {
    const allRoutes = [
      ...routeConfig.protected,
      ...Object.keys(routeConfig.restricted)
    ];

    return allRoutes.filter(route => 
      this.canAccessRoute(userPermissions, route)
    );
  }
}

/**
 * Configuración de redirecciones
 */
export const redirectConfig = {
  /** Ruta por defecto después del login exitoso */
  defaultLoginRedirect: '/dashboard',
  
  /** Ruta por defecto después del logout */
  defaultLogoutRedirect: '/auth/login?message=logged-out',
  
  /** Ruta para usuarios no autorizados */
  unauthorizedRedirect: '/unauthorized',
  
  /** Ruta para errores de sesión */
  sessionErrorRedirect: '/auth/login?message=session-error',
};

/**
 * Exportar configuración por defecto
 */
export default routeConfig;