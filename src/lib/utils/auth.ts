import type { SessionUser } from '../../types/auth';

// Verificar si el usuario está autenticado
export function isAuthenticated(user?: SessionUser): user is SessionUser {
  return user !== undefined;
}

// Verificar si el usuario tiene un rol específico
export function hasRole(user: SessionUser, role: string): boolean {
  return user.role === role;
}

// Verificar si el usuario es super admin
export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === 'super_admin';
}

// Verificar si el usuario tiene un permiso específico
export function hasPermission(user: SessionUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

// Verificar si el usuario tiene alguno de los permisos especificados
export function hasAnyPermission(user: SessionUser, permissions: string[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission));
}

// Verificar si el usuario tiene todos los permisos especificados
export function hasAllPermissions(user: SessionUser, permissions: string[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

// Verificar si el usuario puede acceder a una ruta específica
export function canAccessRoute(user: SessionUser, route: string): boolean {
  // Mapeo de rutas a permisos requeridos
  const routePermissions: Record<string, string[]> = {
    '/admin': ['admin.access'],
    '/dashboard': ['dashboard.access'],
    '/users': ['users.read'],
    '/profiles': ['profiles.read'],
    '/appointments': ['appointments.read'],
    '/locations': ['locations.read'],
    '/services': ['services.read'],
    '/schedules': ['schedules.read'],
    '/roles': ['roles.read'],
    '/permissions': ['permissions.read'],
    '/reports': ['reports.read'],
    '/settings': ['settings.read'],
  };

  // Si la ruta no está en el mapeo, permitir acceso (rutas públicas)
  if (!routePermissions[route]) {
    return true;
  }

  // Verificar si tiene alguno de los permisos requeridos
  return hasAnyPermission(user, routePermissions[route]);
}

// Obtener el nombre completo del usuario
export function getFullName(user: SessionUser): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

// Obtener las iniciales del usuario
export function getInitials(user: SessionUser): string {
  const firstInitial = user.first_name.charAt(0).toUpperCase();
  const lastInitial = user.last_name.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

// Verificar si el token está próximo a expirar (dentro de 5 minutos)
export function isTokenExpiringSoon(user: SessionUser): boolean {
  const fiveMinutesInSeconds = 5 * 60;
  const currentTime = Date.now() / 1000;
  return (user.expires_at - currentTime) <= fiveMinutesInSeconds;
}

// Agrupar permisos por categoría
export function groupPermissionsByCategory(permissions: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach(permission => {
    const [category] = permission.split('.');
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });
  
  return grouped;
}

// Verificar si el usuario puede realizar una acción CRUD específica
export function canPerformCRUD(user: SessionUser, resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
  const permission = `${resource}.${action}`;
  return hasPermission(user, permission);
}