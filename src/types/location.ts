export interface ILocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  isActive: boolean;
  workingHours: {
    morning?: {
      start: string; // "08:00"
      end: string;   // "12:00"
    };
    afternoon?: {
      start: string; // "14:00"
      end: string;   // "18:00"
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

