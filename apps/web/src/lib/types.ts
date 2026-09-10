export type Role = "SUPER_ADMIN" | "CLINIC_ADMIN" | "DOCTOR";

export interface UserSession {
  email: string;
  role: Role;
  clinicId: string | null;
}

export interface Metrics {
  activeClinics: number;
  mrr: number;
  totalAppointments: number;
  todayAppointments: number;
  retentionRate: number;
  channels?: { name: string; count: number }[];
}

export interface Clinic {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  emergencyPhone?: string | null;
  contactPerson?: string | null;
  chairsCount: number;
  telegramBotToken?: string | null;
  metaPhoneNumberId?: string | null;
  metaWabaId?: string | null;
  metaAccessToken?: string | null;
  calendarId?: string | null;
  config?: any | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  specialty?: string | null;
  specialtyLabel?: string | null;
  calendarId?: string | null;
  slotDurationMin: number;
  isActive: boolean;
  availableDays: number[];
  workingHoursStart?: Date | string | null;
  workingHoursEnd?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Treatment {
  id: string;
  clinicId: string;
  name: string;
  specialty?: string | null;
  priceRange?: string | null;
  assignedDoctorId?: string | null;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  name: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
