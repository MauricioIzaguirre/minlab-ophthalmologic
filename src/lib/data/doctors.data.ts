import type { DoctorSpecialization, IDoctor, IDoctorAvailability } from "../../types/doctors";


// Data semilla de doctores
export const doctorsSeed: IDoctor[] = [
  {
    id: "dr-001",
    name: "Dr. María González",
    specialization: "Oftalmología",
    phone: "+1 (555) 123-4567",
    email: "maria.gonzalez@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 15,
    rating: 4.8,
    reviewsCount: 156,
    consultationPrice: 150,
    bio: "Especialista en cirugía refractiva y tratamiento de cataratas con más de 15 años de experiencia.",
    qualifications: [
      "Médico Cirujano - Universidad Nacional",
      "Especialización en Oftalmología - Hospital Universitario",
      "Fellowship en Cirugía Refractiva - Instituto de Oftalmología"
    ],
    languages: ["Español", "Inglés"],
    createdAt: new Date("2020-01-15"),
    updatedAt: new Date("2024-08-20")
  },
  {
    id: "dr-002",
    name: "Dr. Carlos Rodríguez",
    specialization: "Cardiología",
    phone: "+1 (555) 234-5678",
    email: "carlos.rodriguez@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 12,
    rating: 4.9,
    reviewsCount: 203,
    consultationPrice: 180,
    bio: "Cardiólogo intervencionista especializado en procedimientos mínimamente invasivos.",
    qualifications: [
      "Médico Cirujano - Universidad de los Andes",
      "Especialización en Cardiología - Hospital Central",
      "Subespecialización en Cardiología Intervencionista"
    ],
    languages: ["Español", "Inglés", "Francés"],
    createdAt: new Date("2019-03-10"),
    updatedAt: new Date("2024-08-18")
  },
  {
    id: "dr-003",
    name: "Dra. Ana Martínez",
    specialization: "Pediatría",
    phone: "+1 (555) 345-6789",
    email: "ana.martinez@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1594824475302-a2cedb4c6e75?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 8,
    rating: 4.7,
    reviewsCount: 128,
    consultationPrice: 120,
    bio: "Pediatra especializada en desarrollo infantil y medicina preventiva.",
    qualifications: [
      "Médico Cirujano - Universidad Pontificia",
      "Especialización en Pediatría - Hospital Infantil",
      "Diplomado en Desarrollo Infantil"
    ],
    languages: ["Español", "Inglés"],
    createdAt: new Date("2021-06-20"),
    updatedAt: new Date("2024-08-19")
  },
  {
    id: "dr-004",
    name: "Dr. Luis Fernando Pérez",
    specialization: "Neurología",
    phone: "+1 (555) 456-7890",
    email: "luis.perez@opticare.com",
    isActive: false,
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 20,
    rating: 4.9,
    reviewsCount: 245,
    consultationPrice: 200,
    bio: "Neurólogo con amplia experiencia en trastornos neurológicos complejos.",
    qualifications: [
      "Médico Cirujano - Universidad Nacional",
      "Especialización en Neurología - Instituto Neurológico",
      "Fellowship en Epilepsia - Mayo Clinic"
    ],
    languages: ["Español", "Inglés"],
    createdAt: new Date("2018-09-05"),
    updatedAt: new Date("2024-07-15")
  },
  {
    id: "dr-005",
    name: "Dra. Carmen Silva",
    specialization: "Dermatología",
    phone: "+1 (555) 567-8901",
    email: "carmen.silva@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 10,
    rating: 4.6,
    reviewsCount: 89,
    consultationPrice: 140,
    bio: "Dermatóloga especializada en dermatología estética y oncología cutánea.",
    qualifications: [
      "Médico Cirujano - Universidad del Rosario",
      "Especialización en Dermatología - Hospital San Juan",
      "Fellowship en Dermatología Estética"
    ],
    languages: ["Español", "Inglés", "Portugués"],
    createdAt: new Date("2020-11-12"),
    updatedAt: new Date("2024-08-21")
  },
  {
    id: "dr-006",
    name: "Dr. Roberto Vásquez",
    specialization: "Traumatología",
    phone: "+1 (555) 678-9012",
    email: "roberto.vasquez@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 18,
    rating: 4.8,
    reviewsCount: 167,
    consultationPrice: 170,
    bio: "Traumatólogo especializado en cirugía de columna y artroscopia.",
    qualifications: [
      "Médico Cirujano - Universidad Javeriana",
      "Especialización en Traumatología - Hospital Militar",
      "Fellowship en Cirugía de Columna"
    ],
    languages: ["Español", "Inglés"],
    createdAt: new Date("2019-08-30"),
    updatedAt: new Date("2024-08-17")
  },
  {
    id: "dr-007",
    name: "Dra. Patricia Morales",
    specialization: "Ginecología",
    phone: "+1 (555) 789-0123",
    email: "patricia.morales@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 14,
    rating: 4.9,
    reviewsCount: 198,
    consultationPrice: 160,
    bio: "Ginecóloga obstetra especializada en medicina materno-fetal.",
    qualifications: [
      "Médico Cirujano - Universidad del Valle",
      "Especialización en Ginecología y Obstetricia",
      "Subespecialización en Medicina Materno-Fetal"
    ],
    languages: ["Español", "Inglés"],
    createdAt: new Date("2020-02-14"),
    updatedAt: new Date("2024-08-22")
  },
  {
    id: "dr-008",
    name: "Dr. Andrés Castillo",
    specialization: "Psiquiatría",
    phone: "+1 (555) 890-1234",
    email: "andres.castillo@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 11,
    rating: 4.7,
    reviewsCount: 134,
    consultationPrice: 180,
    bio: "Psiquiatra especializado en trastornos del estado de ánimo y ansiedad.",
    qualifications: [
      "Médico Cirujano - Universidad Nacional",
      "Especialización en Psiquiatría - Hospital Mental",
      "Maestría en Psicofarmacología"
    ],
    languages: ["Español", "Inglés"],
    createdAt: new Date("2021-04-08"),
    updatedAt: new Date("2024-08-16")
  },
  {
    id: "dr-009",
    name: "Dra. Isabel Herrera",
    specialization: "Endocrinología",
    phone: "+1 (555) 901-2345",
    email: "isabel.herrera@opticare.com",
    isActive: true,
    avatar: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 9,
    rating: 4.6,
    reviewsCount: 76,
    consultationPrice: 155,
    bio: "Endocrinóloga especializada en diabetes y trastornos hormonales.",
    qualifications: [
      "Médico Cirujano - Universidad del Bosque",
      "Especialización en Endocrinología - Hospital Universitario",
      "Certificación en Educación en Diabetes"
    ],
    languages: ["Español", "Inglés", "Italiano"],
    createdAt: new Date("2021-09-25"),
    updatedAt: new Date("2024-08-20")
  },
  {
    id: "dr-010",
    name: "Dr. Miguel Ángel Torres",
    specialization: "Medicina General",
    phone: "+1 (555) 012-3456",
    email: "miguel.torres@opticare.com",
    isActive: false,
    avatar: "https://images.unsplash.com/photo-1609902114029-e9b6e0a6d8c4?w=400&h=400&fit=crop&crop=face",
    yearsOfExperience: 6,
    rating: 4.4,
    reviewsCount: 52,
    consultationPrice: 100,
    bio: "Médico general con enfoque en medicina preventiva y atención primaria.",
    qualifications: [
      "Médico Cirujano - Universidad Libre",
      "Diplomado en Medicina Preventiva",
      "Certificación en Atención Primaria"
    ],
    languages: ["Español"],
    createdAt: new Date("2022-01-10"),
    updatedAt: new Date("2024-07-28")
  }
];

// Funciones de utilidad para obtener información de los doctores

/**
 * Obtiene el número de doctores activos
 */
export function getActiveDocatorsCount(): number {
  return doctorsSeed.filter(doctor => doctor.isActive).length;
}

/**
 * Obtiene todas las especializaciones únicas disponibles
 */
export function getSpecializations(): DoctorSpecialization[] {
  const specializations = new Set(doctorsSeed.map(doctor => doctor.specialization));
  return Array.from(specializations).sort();
}

/**
 * Obtiene doctores filtrados por especialización
 */
export function getDoctorsBySpecialization(specialization: DoctorSpecialization): IDoctor[] {
  return doctorsSeed.filter(doctor => 
    doctor.specialization === specialization && doctor.isActive
  );
}

/**
 * Obtiene un doctor por su ID
 */
export function getDoctorById(id: string): IDoctor | undefined {
  return doctorsSeed.find(doctor => doctor.id === id);
}

/**
 * Obtiene doctores activos
 */
export function getActiveDoctors(): IDoctor[] {
  return doctorsSeed.filter(doctor => doctor.isActive);
}

/**
 * Obtiene doctores inactivos
 */
export function getInactiveDoctors(): IDoctor[] {
  return doctorsSeed.filter(doctor => !doctor.isActive);
}

/**
 * Busca doctores por nombre o especialización
 */
export function searchDoctors(query: string): IDoctor[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return getActiveDoctors();
  }
  
  return doctorsSeed.filter(doctor => 
    doctor.isActive && (
      doctor.name.toLowerCase().includes(searchTerm) ||
      doctor.specialization.toLowerCase().includes(searchTerm) ||
      doctor.bio?.toLowerCase().includes(searchTerm)
    )
  );
}

/**
 * Obtiene doctores ordenados por rating (de mayor a menor)
 */
export function getDoctorsByRating(): IDoctor[] {
  return getActiveDoctors().sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

/**
 * Obtiene doctores ordenados por años de experiencia
 */
export function getDoctorsByExperience(): IDoctor[] {
  return getActiveDoctors().sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
}

/**
 * Obtiene doctores ordenados por precio de consulta (de menor a mayor)
 */
export function getDoctorsByPrice(): IDoctor[] {
  return getActiveDoctors().sort((a, b) => (a.consultationPrice || 0) - (b.consultationPrice || 0));
}

/**
 * Obtiene estadísticas generales de los doctores
 */
export function getDoctorsStats() {
  const activeDoctors = getActiveDoctors();
  const totalDoctors = doctorsSeed.length;
  
  const avgRating = activeDoctors.reduce((sum, doctor) => sum + (doctor.rating || 0), 0) / activeDoctors.length;
  const avgExperience = activeDoctors.reduce((sum, doctor) => sum + (doctor.yearsOfExperience || 0), 0) / activeDoctors.length;
  const avgPrice = activeDoctors.reduce((sum, doctor) => sum + (doctor.consultationPrice || 0), 0) / activeDoctors.length;
  
  const specializationCounts = getSpecializations().map(spec => ({
    specialization: spec,
    count: getDoctorsBySpecialization(spec).length
  }));
  
  return {
    totalDoctors,
    activeDoctors: activeDoctors.length,
    inactiveDoctors: getInactiveDoctors().length,
    specializations: getSpecializations().length,
    avgRating: Math.round(avgRating * 10) / 10,
    avgExperience: Math.round(avgExperience),
    avgPrice: Math.round(avgPrice),
    specializationCounts
  };
}
