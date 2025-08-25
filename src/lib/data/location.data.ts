import type { ILocation } from "../../types/location";

export const seedLocations: ILocation[] = [
  {
    id: 'loc-001',
    name: 'Hospital Central',
    address: 'Av. Principal 123',
    phone: '+1234567800',
    city: 'Ciudad Principal',
    isActive: true,
    workingHours: {
      morning: {
        start: '07:00',
        end: '12:00'
      },
      afternoon: {
        start: '14:00',
        end: '19:00'
      }
    },
    createdAt: new Date('2015-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'loc-002',
    name: 'Clínica Norte',
    address: 'Calle Norte 456',
    phone: '+1234567801',
    city: 'Ciudad Norte',
    isActive: true,
    workingHours: {
      morning: {
        start: '08:00',
        end: '13:00'
      },
      afternoon: {
        start: '15:00',
        end: '18:00'
      }
    },
    createdAt: new Date('2018-05-15'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'loc-003',
    name: 'Centro Médico Sur',
    address: 'Av. Sur 789',
    phone: '+1234567802',
    city: 'Ciudad Sur',
    isActive: true,
    workingHours: {
      morning: {
        start: '09:00',
        end: '12:30'
      },
      afternoon: {
        start: '14:30',
        end: '17:30'
      }
    },
    createdAt: new Date('2020-03-10'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'loc-004',
    name: 'Hospital Especializado',
    address: 'Plaza Central 321',
    phone: '+1234567803',
    city: 'Ciudad Principal',
    isActive: true,
    workingHours: {
      morning: {
        start: '06:00',
        end: '12:00'
      },
      afternoon: {
        start: '13:00',
        end: '20:00'
      }
    },
    createdAt: new Date('2016-08-22'),
    updatedAt: new Date('2025-01-01')
  }
];