// src/config/sidebar.ts - Configuración centralizada del sidebar de la aplicación

/**
 * Interfaz para definir elementos del sidebar
 */
export interface SidebarItem {
  /** Texto a mostrar */
  label: string;
  /** Ruta de navegación */
  href: string;
  /** SVG del icono (string completo del SVG) */
  icon: string;
  /** Permisos requeridos para mostrar este elemento (opcional) */
  permissions?: string[];
  /** Roles que pueden ver este elemento (opcional) */
  roles?: string[];
  /** Si está activo por defecto */
  active?: boolean;
  /** Elemento hijo (sub-navegación) */
  children?: SidebarItem[];
}

/**
 * Interfaz para definir grupos del sidebar
 */
export interface SidebarGroup {
  /** ID único del grupo */
  id: string;
  /** Título del grupo */
  title: string;
  /** Elementos del grupo */
  items: SidebarItem[];
  /** Permisos requeridos para mostrar todo el grupo */
  permissions?: string[];
  /** Roles que pueden ver todo el grupo */
  roles?: string[];
  /** Orden de visualización */
  order: number;
}

/**
 * Configuración del header del sidebar
 */
export interface SidebarHeader {
  /** Título de la aplicación */
  title: string;
  /** Versión */
  version: string;
  /** Ruta del logo/home */
  href: string;
  /** SVG del logo */
  logoIcon: string;
}

/**
 * Configuración del footer/perfil del sidebar
 */
export interface SidebarProfile {
  /** URL del avatar por defecto */
  defaultAvatarUrl: string;
  /** Ruta del perfil */
  profileHref: string;
  /** Ruta de logout */
  logoutHref: string;
}

/**
 * Iconos SVG reutilizables
 */
export const sidebarIcons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1"></rect>
    <rect width="7" height="5" x="14" y="3" rx="1"></rect>
    <rect width="7" height="9" x="14" y="12" rx="1"></rect>
    <rect width="7" height="5" x="3" y="16" rx="1"></rect>
  </svg>`,
  
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>`,
  
  calendarPlus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
    <path d="M8 14h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 18h.01"></path>
    <path d="M12 18h.01"></path>
    <path d="M16 18h.01"></path>
  </svg>`,
  
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>`,
  
  calendarCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M16 2v4"></path>
    <path d="M8 2v4"></path>
    <path d="M3 10h18"></path>
    <path d="m9 16 2 2 4-4"></path>
  </svg>`,
  
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>`,
  
  userCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <path d="m17 11 2 2 4-4"></path>
  </svg>`,
  
  stethoscope: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 2v20c-5.07-.5-9-4.79-9-10v-1.5a3.5 3.5 0 0 1 7 0V14a9 9 0 0 0 9 9m-13.76-7.32a2.5 2.5 0 0 1-1.48-4.32A2.5 2.5 0 0 1 6 9.5v1"></path>
    <path d="M15 2v6.5a3.5 3.5 0 0 0 7 0V8a2 2 0 1 1 4 0c0 5.21-3.93 9.5-9 10"></path>
  </svg>`,
  
  activity: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
  </svg>`,
  
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>`,
  
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>`,
  
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`,
  
  logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6"></path>
    <path d="m15 5-3 3-3-3"></path>
    <path d="m15 19-3-3-3 3"></path>
  </svg>`
};

/**
 * Configuración del header del sidebar
 */
export const sidebarHeader: SidebarHeader = {
  title: 'OptiCare',
  version: 'v1.0.0',
  href: '/dashboard',
  logoIcon: sidebarIcons.logo
};

/**
 * Configuración del perfil del sidebar
 */
export const sidebarProfile: SidebarProfile = {
  defaultAvatarUrl: 'https://github.com/hunvreus.png',
  profileHref: '/profile',
  logoutHref: '/auth/logout'
};

/**
 * Configuración de grupos del sidebar
 * Modifica estos grupos según las necesidades de tu aplicación
 */
export const sidebarGroups: SidebarGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    order: 1,
    permissions: ['dashboard.access'],
    items: [
      {
        label: 'Resumen General',
        href: '/dashboard',
        icon: sidebarIcons.dashboard,
        permissions: ['dashboard.access']
      }
    ]
  },
  
  {
    id: 'appointments',
    title: 'Citas',
    order: 2,
    permissions: ['appointments.read'],
    items: [
      {
        label: 'Todas las Citas',
        href: '/appointment',
        icon: sidebarIcons.calendar,
        permissions: ['appointments.read']
      },
      {
        label: 'Agendar Cita',
        href: '/appointment/new',
        icon: sidebarIcons.calendarPlus,
        permissions: ['appointments.create']
      },
      {
        label: 'Citas de Hoy',
        href: '/appointment/today',
        icon: sidebarIcons.clock,
        permissions: ['appointments.read']
      },
      {
        label: 'Calendario',
        href: '/appointment/calendar',
        icon: sidebarIcons.calendarCheck,
        permissions: ['appointments.read']
      }
    ]
  },
  
  {
    id: 'patients',
    title: 'Pacientes',
    order: 3,
    permissions: ['profiles.read'],
    items: [
      {
        label: 'Todos los Pacientes',
        href: '/patients',
        icon: sidebarIcons.users,
        permissions: ['profiles.read']
      },
      {
        label: 'Registrar Paciente',
        href: '/patients/new',
        icon: sidebarIcons.userCheck,
        permissions: ['profiles.create']
      }
    ]
  },
  
  {
    id: 'doctors',
    title: 'Doctores',
    order: 4,
    permissions: ['users.read'],
    items: [
      {
        label: 'Especialistas',
        href: '/doctors',
        icon: sidebarIcons.stethoscope,
        permissions: ['users.read']
      },
      {
        label: 'Disponibilidad',
        href: '/doctors/availability',
        icon: sidebarIcons.userCheck,
        permissions: ['schedules.read']
      }
    ]
  },
  
  {
    id: 'services',
    title: 'Servicios',
    order: 5,
    permissions: ['services.read'],
    items: [
      {
        label: 'Consulta General',
        href: '/services',
        icon: sidebarIcons.activity,
        permissions: ['services.read']
      }
    ]
  },
  
  {
    id: 'histories',
    title: 'Historiales',
    order: 6,
    permissions: ['profiles.read'],
    items: [
      {
        label: 'Historiales Médicos',
        href: '/histories',
        icon: sidebarIcons.stethoscope,
        permissions: ['profiles.read']
      }
    ]
  },
  
  {
    id: 'reports',
    title: 'Reportes',
    order: 7,
    permissions: ['reports.read'],
    items: [
      {
        label: 'Estadísticas',
        href: '/reports',
        icon: sidebarIcons.barChart,
        permissions: ['reports.read']
      },
      {
        label: 'Financieros',
        href: '/reports/financial',
        icon: sidebarIcons.dollarSign,
        permissions: ['reports.read']
      }
    ]
  },
  
  {
    id: 'settings',
    title: 'Configuración',
    order: 8,
    permissions: ['settings.read'],
    items: [
      {
        label: 'General',
        href: '/settings/general',
        icon: sidebarIcons.settings,
        permissions: ['settings.read']
      },
      {
        label: 'Usuarios',
        href: '/settings/users',
        icon: sidebarIcons.users,
        permissions: ['users.read', 'admin.access']
      }
    ]
  }
];

/**
 * Utilidades para trabajar con el sidebar
 */
export class SidebarUtils {
  /**
   * Filtra elementos del sidebar según los permisos del usuario
   */
  static filterItemsByPermissions(items: SidebarItem[], userPermissions: string[]): SidebarItem[] {
    return items.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true; // Sin restricciones
      }
      
      // El usuario debe tener al menos uno de los permisos requeridos
      return item.permissions.some(permission => userPermissions.includes(permission));
    });
  }

  /**
   * Filtra elementos del sidebar según el rol del usuario
   */
  static filterItemsByRole(items: SidebarItem[], userRole: string): SidebarItem[] {
    return items.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true; // Sin restricciones de rol
      }
      
      return item.roles.includes(userRole);
    });
  }

  /**
   * Filtra grupos del sidebar según los permisos del usuario
   */
  static filterGroupsByPermissions(groups: SidebarGroup[], userPermissions: string[]): SidebarGroup[] {
    return groups.filter(group => {
      // Verificar permisos del grupo
      if (group.permissions && group.permissions.length > 0) {
        const hasGroupPermission = group.permissions.some(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasGroupPermission) {
          return false;
        }
      }
      
      // Filtrar elementos del grupo
      const filteredItems = this.filterItemsByPermissions(group.items, userPermissions);
      
      // Solo mostrar el grupo si tiene elementos visibles
      return filteredItems.length > 0;
    }).map(group => ({
      ...group,
      items: this.filterItemsByPermissions(group.items, userPermissions)
    }));
  }

  /**
   * Obtiene elementos del sidebar filtrados para un usuario específico
   */
  static getSidebarForUser(userPermissions: string[], userRole: string): SidebarGroup[] {
    let filteredGroups = this.filterGroupsByPermissions(sidebarGroups, userPermissions);
    
    // Aplicar filtros adicionales por rol si es necesario
    filteredGroups = filteredGroups.map(group => ({
      ...group,
      items: this.filterItemsByRole(group.items, userRole)
    }));
    
    // Ordenar grupos por orden especificado
    return filteredGroups.sort((a, b) => a.order - b.order);
  }

  /**
   * Verifica si una ruta está activa
   */
  static isActiveRoute(currentPath: string, itemHref: string): boolean {
    if (itemHref === '/dashboard' && currentPath === '/dashboard') {
      return true;
    }
    
    if (itemHref !== '/dashboard' && currentPath.startsWith(itemHref)) {
      return true;
    }
    
    return currentPath === itemHref;
  }

  /**
   * Encuentra el elemento activo en el sidebar
   */
  static findActiveItem(groups: SidebarGroup[], currentPath: string): SidebarItem | null {
    for (const group of groups) {
      for (const item of group.items) {
        if (this.isActiveRoute(currentPath, item.href)) {
          return item;
        }
      }
    }
    return null;
  }
}

/**
 * Configuración completa del sidebar
 */
export const sidebarConfig = {
  header: sidebarHeader,
  profile: sidebarProfile,
  groups: sidebarGroups,
  icons: sidebarIcons,
  utils: SidebarUtils
};

/**
 * Exportar configuración por defecto
 */
export default sidebarConfig;