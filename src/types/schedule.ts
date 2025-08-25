export interface ISchedule {
  id: string;
  doctorId: string;
  locationId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  isActive: boolean;
  breakTime?: {
    start: string; // "12:00"
    end: string;   // "14:00"
  };
  maxPatients?: number; // Límite de pacientes por día
  createdAt: Date;
  updatedAt: Date;
}