import type { IAvailabilitySlot } from ".";

export type DoctorSpecialization = 
  | 'Oftalmología'
  | 'Cardiología'
  | 'Neurología'
  | 'Pediatría'
  | 'Dermatología'
  | 'Ginecología'
  | 'Traumatología'
  | 'Psiquiatría'
  | 'Medicina General'
  | 'Endocrinología';

export interface IDoctor {
  id: string;
  name: string;
  specialization: DoctorSpecialization;
  phone?: string;
  email?: string;
  isActive: boolean;
  avatar?: string;
  yearsOfExperience?: number;
  rating?: number;
  reviewsCount?: number;
  consultationPrice?: number;
  bio?: string;
  qualifications?: string[];
  languages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorAvailability {
  doctorId: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  slots: IAvailabilitySlot[];
}