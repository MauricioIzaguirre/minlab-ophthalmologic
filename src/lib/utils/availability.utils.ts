// src/lib/utils/availability.utils.ts

import type { IWeekView } from "../../types";
import type { IDoctor } from "../../types/doctors";
import type { ILocation } from "../../types/location";
import type { ISchedule } from "../../types/schedule";


/**
 * Genera los datos para la vista semanal del calendario
 */
export function generateWeekView(
  schedules: (ISchedule & { doctor: IDoctor; location: ILocation })[],
  weekStart: Date
): IWeekView {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const days = [];
  
  // Generar datos para cada día de la semana
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Ajustar para que Monday = 1
    
    // Filtrar horarios para este día
    const daySchedules = schedules.filter(schedule => 
      schedule.isActive && schedule.dayOfWeek === adjustedDayOfWeek
    );
    
    days.push({
      date: currentDate,
      dayName: currentDate.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
      schedules: daySchedules
    });
  }
  
  return {
    weekStart,
    weekEnd,
    days
  };
}

/**
 * Obtiene la fecha de inicio de la semana para una fecha dada
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Monday sea el primer día
  return new Date(d.setDate(diff));
}

/**
 * Obtiene el número de semana del año
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Navega a la siguiente semana
 */
export function getNextWeek(currentWeekStart: Date): Date {
  const nextWeek = new Date(currentWeekStart);
  nextWeek.setDate(currentWeekStart.getDate() + 7);
  return nextWeek;
}

/**
 * Navega a la semana anterior
 */
export function getPreviousWeek(currentWeekStart: Date): Date {
  const prevWeek = new Date(currentWeekStart);
  prevWeek.setDate(currentWeekStart.getDate() - 7);
  return prevWeek;
}

/**
 * Verifica si una fecha está en la semana actual
 */
export function isCurrentWeek(weekStart: Date): boolean {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  return weekStart.getTime() === currentWeekStart.getTime();
}

/**
 * Filtra horarios por doctor
 */
export function filterSchedulesByDoctor(
  schedules: (ISchedule & { doctor: IDoctor; location: ILocation })[],
  doctorId: string
): (ISchedule & { doctor: IDoctor; location: ILocation })[] {
  if (!doctorId) return schedules;
  return schedules.filter(schedule => schedule.doctorId === doctorId);
}

/**
 * Filtra horarios por ubicación
 */
export function filterSchedulesByLocation(
  schedules: (ISchedule & { doctor: IDoctor; location: ILocation })[],
  locationId: string
): (ISchedule & { doctor: IDoctor; location: ILocation })[] {
  if (!locationId) return schedules;
  return schedules.filter(schedule => schedule.locationId === locationId);
}

/**
 * Filtra horarios por especialización
 */
export function filterSchedulesBySpecialization(
  schedules: (ISchedule & { doctor: IDoctor; location: ILocation })[],
  specialization: string
): (ISchedule & { doctor: IDoctor; location: ILocation })[] {
  if (!specialization) return schedules;
  return schedules.filter(schedule => schedule.doctor.specialization === specialization);
}

/**
 * Combina múltiples filtros
 */
export function applyFilters(
  schedules: (ISchedule & { doctor: IDoctor; location: ILocation })[],
  filters: {
    doctorId?: string;
    locationId?: string;
    specialization?: string;
    onlyActive?: boolean;
  }
): (ISchedule & { doctor: IDoctor; location: ILocation })[] {
  let filteredSchedules = schedules;
  
  if (filters.doctorId) {
    filteredSchedules = filterSchedulesByDoctor(filteredSchedules, filters.doctorId);
  }
  
  if (filters.locationId) {
    filteredSchedules = filterSchedulesByLocation(filteredSchedules, filters.locationId);
  }
  
  if (filters.specialization) {
    filteredSchedules = filterSchedulesBySpecialization(filteredSchedules, filters.specialization);
  }
  
  if (filters.onlyActive) {
    filteredSchedules = filteredSchedules.filter(schedule => 
      schedule.isActive && schedule.doctor.isActive
    );
  }
  
  return filteredSchedules;
}

/**
 * Detecta conflictos de horarios
 */
export function detectScheduleConflicts(
  schedules: ISchedule[]
): { hasConflicts: boolean; conflicts: ISchedule[][] } {
  const conflicts: ISchedule[][] = [];
  
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const schedule1 = schedules[i];
      const schedule2 = schedules[j];
      
      // Verificar si son el mismo día y se solapan
      if (schedule1.dayOfWeek === schedule2.dayOfWeek) {
        const start1 = timeToMinutes(schedule1.startTime);
        const end1 = timeToMinutes(schedule1.endTime);
        const start2 = timeToMinutes(schedule2.startTime);
        const end2 = timeToMinutes(schedule2.endTime);
        
        // Verificar solapamiento
        if ((start1 < end2) && (start2 < end1)) {
          // Buscar si ya existe un grupo de conflictos que incluya alguno de estos horarios
          let conflictGroup = conflicts.find(group => 
            group.includes(schedule1) || group.includes(schedule2)
          );
          
          if (conflictGroup) {
            if (!conflictGroup.includes(schedule1)) conflictGroup.push(schedule1);
            if (!conflictGroup.includes(schedule2)) conflictGroup.push(schedule2);
          } else {
            conflicts.push([schedule1, schedule2]);
          }
        }
      }
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

/**
 * Convierte tiempo string (HH:MM) a minutos
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos a tiempo string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calcula la duración entre dos horarios
 */
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Obtiene estadísticas de disponibilidad para una semana
 */
export function getWeekAvailabilityStats(weekView: IWeekView) {
  const totalSchedules = weekView.days.reduce((acc, day) => acc + day.schedules.length, 0);
  const activeSchedules = weekView.days.reduce((acc, day) => 
    acc + day.schedules.filter(s => s.isActive).length, 0
  );
  
  const doctorCount = new Set(
    weekView.days.flatMap(day => day.schedules.map(s => s.doctorId))
  ).size;
  
  const locationCount = new Set(
    weekView.days.flatMap(day => day.schedules.map(s => s.locationId))
  ).size;
  
  const specializationCount = new Set(
    weekView.days.flatMap(day => day.schedules.map(s => s.doctor.specialization))
  ).size;
  
  return {
    totalSchedules,
    activeSchedules,
    doctorCount,
    locationCount,
    specializationCount,
    utilization: totalSchedules > 0 ? (activeSchedules / totalSchedules) * 100 : 0
  };
}