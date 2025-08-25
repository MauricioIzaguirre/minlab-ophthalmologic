import type { DoctorSpecialization, IDoctor } from "./doctors";
import type { ILocation } from "./location";
import type { ISchedule } from "./schedule";

export interface IAvailabilitySlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  patientName?: string;
  appointmentType?: string;
}

// Filtros y utilidades
export interface IAvailabilityFilters {
  doctorId?: string;
  locationId?: string;
  specialization?: DoctorSpecialization;
  dateFrom?: string;
  dateTo?: string;
  onlyAvailable?: boolean;
}

export interface IWeekView {
  weekStart: Date;
  weekEnd: Date;
  days: {
    date: Date;
    dayName: string;
    schedules: (ISchedule & { 
      doctor: IDoctor; 
      location: ILocation; 
    })[];
  }[];
}
