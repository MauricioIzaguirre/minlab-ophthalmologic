export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient'
} as const;

export const RESOURCES = {
  USERS: 'users',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  MEDICAL_RECORDS: 'medical_records',
  REPORTS: 'reports',
  SETTINGS: 'settings'
} as const;

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list'
} as const;

export function hasPermission(userPermissions: string[], resource: string, action: string): boolean {
  const permission = `${resource}:${action}`;
  const adminPermission = `*:*`;
  
  return userPermissions.includes(permission) || userPermissions.includes(adminPermission);
}

export function requirePermission(userPermissions: string[], resource: string, action: string): void {
  if (!hasPermission(userPermissions, resource, action)) {
    throw new Error('Insufficient permissions');
  }
}