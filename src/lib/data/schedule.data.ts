import type { ISchedule } from "../../types/schedule";
import { seedDoctors } from "./doctors.data";
import { seedLocations } from "./location.data";

export const seedSchedules: ISchedule[] = [
  // Dr. María González - Oftalmología
  {
    id: 'sch-001',
    doctorId: 'dr-001',
    locationId: 'loc-001',
    dayOfWeek: 1, // Lunes
    startTime: '08:00',
    endTime: '16:00',
    isActive: true,
    breakTime: {
      start: '12:00',
      end: '13:00'
    },
    maxPatients: 20,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'sch-002',
    doctorId: 'dr-001',
    locationId: 'loc-001',
    dayOfWeek: 3, // Miércoles
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakTime: {
      start: '13:00',
      end: '14:00'
    },
    maxPatients: 18,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'sch-003',
    doctorId: 'dr-001',
    locationId: 'loc-002',
    dayOfWeek: 5, // Viernes
    startTime: '10:00',
    endTime: '15:00',
    isActive: true,
    breakTime: {
      start: '12:30',
      end: '13:30'
    },
    maxPatients: 15,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  
  // Dr. Carlos Rodríguez - Cardiología
  {
    id: 'sch-004',
    doctorId: 'dr-002',
    locationId: 'loc-001',
    dayOfWeek: 2, // Martes
    startTime: '07:00',
    endTime: '15:00',
    isActive: true,
    breakTime: {
      start: '11:00',
      end: '12:00'
    },
    maxPatients: 16,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'sch-005',
    doctorId: 'dr-002',
    locationId: 'loc-004',
    dayOfWeek: 4, // Jueves
    startTime: '08:00',
    endTime: '16:00',
    isActive: true,
    breakTime: {
      start: '12:00',
      end: '13:00'
    },
    maxPatients: 20,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  
  // Dra. Ana Martínez - Pediatría
  {
    id: 'sch-006',
    doctorId: 'dr-003',
    locationId: 'loc-002',
    dayOfWeek: 1, // Lunes
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakTime: {
      start: '13:00',
      end: '14:00'
    },
    maxPatients: 25,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'sch-007',
    doctorId: 'dr-003',
    locationId: 'loc-003',
    dayOfWeek: 3, // Miércoles
    startTime: '10:00',
    endTime: '16:00',
    isActive: true,
    breakTime: {
      start: '12:30',
      end: '13:30'
    },
    maxPatients: 20,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  
  // Dr. Roberto Silva - Neurología
  {
    id: 'sch-008',
    doctorId: 'dr-004',
    locationId: 'loc-001',
    dayOfWeek: 2, // Martes
    startTime: '08:00',
    endTime: '14:00',
    isActive: true,
    breakTime: {
      start: '11:00',
      end: '12:00'
    },
    maxPatients: 12,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'sch-009',
    doctorId: 'dr-004',
    locationId: 'loc-004',
    dayOfWeek: 5, // Viernes
    startTime: '09:00',
    endTime: '15:00',
    isActive: true,
    breakTime: {
      start: '12:00',
      end: '13:00'
    },
    maxPatients: 14,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  
  // Dra. Laura Hernández - Ginecología
  {
    id: 'sch-010',
    doctorId: 'dr-005',
    locationId: 'loc-003',
    dayOfWeek: 1, // Lunes
    startTime: '08:00',
    endTime: '16:00',
    isActive: true,
    breakTime: {
      start: '12:00',
      end: '13:00'
    },
    maxPatients: 18,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'sch-011',
    doctorId: 'dr-005',
    locationId: 'loc-002',
    dayOfWeek: 4, // Jueves
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
    breakTime: {
      start: '13:00',
      end: '14:00'
    },
    maxPatients: 20,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

// Utilidades para obtener datos combinados
export const getScheduleWithDetails = () => {
  return seedSchedules.map(schedule => ({
    ...schedule,
    doctor: seedDoctors.find(d => d.id === schedule.doctorId)!,
    location: seedLocations.find(l => l.id === schedule.locationId)!
  }));
};

export const getDoctorSchedules = (doctorId: string) => {
  return getScheduleWithDetails().filter(s => s.doctorId === doctorId);
};

export const getLocationSchedules = (locationId: string) => {
  return getScheduleWithDetails().filter(s => s.locationId === locationId);
};