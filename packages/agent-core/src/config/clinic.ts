// @ts-nocheck
import fs from 'fs';
import path from 'path';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialtyLabel?: string;
  calendarId: string;
  slotDurationMinutes?: number;
  appointmentDurationMinutes?: number;
  availableDays: string[] | number[];
  workingHours: string | { start: string; end: string };
  isActive?: boolean;
  photoUrl?: string;
}

export interface Treatment {
  name: string;
  specialty: string;
  priceRange: string;
  description: string;
  assignedDoctorId?: string;
}

export interface InventoryItem {
  item: string;
  level: 'optimal' | 'low' | 'critical';
  updatedAt: string;
}

export interface ClinicConfig {
  clinicId: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  emergencyPhone: string;
  contactPerson?: string;
  chairsCount?: number;
  inventoryStatus?: InventoryItem[];
  workingHours?: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  doctors: Doctor[];
  treatments: Treatment[];
  calendarId?: string;
  whatsappInstance?: string;
  metaPhoneNumberId?: string;
  metaWabaId?: string;
  metaAccessToken?: string;
}

class ClinicManager {
  private config!: ClinicConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.resolve(process.cwd(), 'clinic.config.json');
    this.loadConfig();
  }

  public loadConfig(): ClinicConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Archivo no encontrado: ${this.configPath}`);
      }
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(raw);
      return this.config;
    } catch (err) {
      console.error('⚠️ Error al cargar clinic.config.json, usando configuración por defecto:', err);
      this.config = {
        clinicId: 'default_clinic',
        name: 'Clínica OdontoCare',
        city: 'Cuenca',
        address: 'Cuenca, Ecuador',
        emergencyPhone: '+593 98 000 0000',
        workingHours: {
          weekdays: '09:00 - 19:00',
          saturday: '09:00 - 13:00',
          sunday: 'Urgencias'
        },
        doctors: [],
        treatments: []
      };
      return this.config;
    }
  }

  public getConfig(): ClinicConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config;
  }

  public getDoctorBySpecialty(specialty: string): Doctor | undefined {
    return this.config.doctors.find(d => 
      d.specialty.toLowerCase() === specialty.toLowerCase() ||
      d.specialty.includes(specialty.toLowerCase())
    );
  }

  public reload(): { success: boolean; doctorCount: number } {
    const cfg = this.loadConfig();
    return { success: true, doctorCount: cfg.doctors.length };
  }
}

export const clinicManager = new ClinicManager();
