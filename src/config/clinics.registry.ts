import fs from 'fs';
import path from 'path';
import { clinicManager, ClinicConfig, Doctor, Treatment } from './clinic.js';
import { SecureLogger } from '../utils/logger.js';

export interface ClinicEntity extends ClinicConfig {
  calendarId?: string;
  whatsappInstance?: string;
  metaPhoneNumberId?: string;
  metaWabaId?: string;
  metaAccessToken?: string;
  telegramToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ClinicsRegistry {
  private filePath: string;
  private clinics: Map<string, ClinicEntity> = new Map();

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'clinics.json');
    this.load();
  }

  public load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const list: ClinicEntity[] = JSON.parse(raw);
        this.clinics.clear();
        for (const clinic of list) {
          this.clinics.set(clinic.clinicId, clinic);
        }
        SecureLogger.info('ClinicsRegistry', `Cargadas ${this.clinics.size} clínicas desde ${this.filePath}`);
      } else {
        // Sembrar con la clínica base inicial
        const initial = clinicManager.getConfig();
        const baseClinic: ClinicEntity = {
          ...initial,
          calendarId: 'primary',
          whatsappInstance: 'odontocare_cuenca',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Sembrar una segunda clínica de demostración para el modelo multi-tenant
        const secondClinic: ClinicEntity = {
          clinicId: 'dental_plus_quito',
          name: 'Clínica Dental Plus Quito',
          city: 'Quito',
          address: 'Av. Amazonas y Naciones Unidas, Edificio Platinum Of. 402',
          emergencyPhone: '+593 99 876 5432',
          calendarId: 'quito.dental.plus@gmail.com',
          whatsappInstance: 'dental_plus_quito',
          workingHours: {
            weekdays: '08:30 - 19:30',
            saturday: '09:00 - 14:00',
            sunday: 'Urgencias 24/7',
          },
          doctors: [
            {
              id: 'doc_quito_orto',
              name: 'Dra. Andrea Morales',
              specialty: 'ortodoncia',
              specialtyLabel: 'Ortodoncia y Estética Dental',
              calendarId: 'andrea.morales.orto@gmail.com',
              slotDurationMinutes: 45,
              availableDays: ['monday', 'tuesday', 'thursday', 'friday'],
              workingHours: '09:00 - 18:00',
            },
            {
              id: 'doc_quito_cirugia',
              name: 'Dr. Francisco Romero',
              specialty: 'cirugia_implantes',
              specialtyLabel: 'Cirugía Oral e Implantología',
              calendarId: 'francisco.romero.cirugia@gmail.com',
              slotDurationMinutes: 60,
              availableDays: ['tuesday', 'wednesday', 'saturday'],
              workingHours: '10:00 - 17:00',
            },
          ],
          treatments: [
            {
              name: 'Brackets Metálicos o Autoligado',
              specialty: 'ortodoncia',
              priceRange: '$350 - $600 USD (Inicial + mensualidades de $35)',
              description: 'Corrección y alineación dental con aparatología fija de última generación.',
            },
            {
              name: 'Cirugía de Cordales Complejas',
              specialty: 'cirugia_implantes',
              priceRange: '$70 - $110 USD por pieza',
              description: 'Extracción quirúrgica atraumática con anestesia computarizada y sutura reabsorbible.',
            },
            {
              name: 'Implante Dental de Titanio Grado 5',
              specialty: 'cirugia_implantes',
              priceRange: '$550 - $750 USD',
              description: 'Rehabilitación fija biocompatible con integración ósea garantizada.',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.clinics.set(baseClinic.clinicId, baseClinic);
        this.clinics.set(secondClinic.clinicId, secondClinic);
        this.persist();
        SecureLogger.info('ClinicsRegistry', 'Sembradas clínicas iniciales en clinics.json');
      }
    } catch (err) {
      SecureLogger.warn('ClinicsRegistry', 'Error al cargar clinics.json, usando clínica en memoria:', err);
    }
  }

  public persist(): void {
    try {
      const list = Array.from(this.clinics.values());
      fs.writeFileSync(this.filePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      SecureLogger.error('ClinicsRegistry', 'Error al persistir clinics.json:', err);
    }
  }

  public getAll(): ClinicEntity[] {
    return Array.from(this.clinics.values());
  }

  public getById(clinicId: string): ClinicEntity | undefined {
    return this.clinics.get(clinicId);
  }

  public findByPhoneNumberId(phoneNumberId: string): ClinicEntity | undefined {
    for (const clinic of this.clinics.values()) {
      if (clinic.metaPhoneNumberId === phoneNumberId) {
        return clinic;
      }
    }
    return undefined;
  }

  public getDefault(): ClinicEntity {
    const first = this.clinics.values().next().value;
    if (first) return first;
    const base = clinicManager.getConfig();
    return {
      ...base,
      calendarId: 'primary',
      whatsappInstance: 'odontocare_cuenca',
    };
  }

  public save(clinic: ClinicEntity): ClinicEntity {
    const now = new Date().toISOString();
    const existing = this.clinics.get(clinic.clinicId);
    const updated: ClinicEntity = {
      ...clinic,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    this.clinics.set(updated.clinicId, updated);
    this.persist();
    SecureLogger.info('ClinicsRegistry', `Clínica guardada: ${updated.name} (${updated.clinicId})`);
    return updated;
  }

  public delete(clinicId: string): boolean {
    if (this.clinics.size <= 1) {
      // Prevenir borrar la última clínica
      return false;
    }
    const res = this.clinics.delete(clinicId);
    if (res) {
      this.persist();
      SecureLogger.info('ClinicsRegistry', `Clínica eliminada: ${clinicId}`);
    }
    return res;
  }

  // --- GESTIÓN DE DOCTORES & ESPECIALISTAS ---
  public addDoctor(clinicId: string, doctor: Doctor): boolean {
    const clinic = this.clinics.get(clinicId);
    if (!clinic) return false;
    if (!clinic.doctors) clinic.doctors = [];
    const existingIndex = clinic.doctors.findIndex(d => d.id === doctor.id);
    if (existingIndex >= 0) {
      clinic.doctors[existingIndex] = doctor;
    } else {
      clinic.doctors.push(doctor);
    }
    this.save(clinic);
    return true;
  }

  public updateDoctor(clinicId: string, doctor: Doctor): boolean {
    return this.addDoctor(clinicId, doctor);
  }

  public deleteDoctor(clinicId: string, doctorId: string): boolean {
    const clinic = this.clinics.get(clinicId);
    if (!clinic || !clinic.doctors) return false;
    clinic.doctors = clinic.doctors.filter(d => d.id !== doctorId);
    this.save(clinic);
    return true;
  }

  // --- GESTIÓN DE CATÁLOGO DE SERVICIOS & PRECIOS ---
  public addTreatment(clinicId: string, treatment: Treatment): boolean {
    const clinic = this.clinics.get(clinicId);
    if (!clinic) return false;
    if (!clinic.treatments) clinic.treatments = [];
    clinic.treatments.push(treatment);
    this.save(clinic);
    return true;
  }

  public updateTreatment(clinicId: string, index: number, treatment: Treatment): boolean {
    const clinic = this.clinics.get(clinicId);
    if (!clinic || !clinic.treatments || index < 0 || index >= clinic.treatments.length) return false;
    clinic.treatments[index] = treatment;
    this.save(clinic);
    return true;
  }

  public deleteTreatment(clinicId: string, index: number): boolean {
    const clinic = this.clinics.get(clinicId);
    if (!clinic || !clinic.treatments || index < 0 || index >= clinic.treatments.length) return false;
    clinic.treatments.splice(index, 1);
    this.save(clinic);
    return true;
  }

  public seedSuggestedTreatments(clinicId: string): Treatment[] {
    const clinic = this.clinics.get(clinicId);
    if (!clinic) return [];
    const suggested: Treatment[] = [
      {
        name: 'Limpieza Dental Profiláctica (Ultrasonido)',
        specialty: 'odontologia_general',
        priceRange: '$35 - $45 USD',
        description: 'Eliminación completa de sarro con ultrasonido, pulido dental y aplicación de flúor remineralizante.'
      },
      {
        name: 'Valoración de Ortodoncia & Estudio Diagnóstico',
        specialty: 'ortodoncia',
        priceRange: '$20 USD (gratuita al contratar tratamiento)',
        description: 'Estudio fotográfico digital y diagnóstico cefalométrico para brackets o alineadores invisibles.'
      },
      {
        name: 'Brackets Metálicos Convencionales o Autoligados',
        specialty: 'ortodoncia',
        priceRange: '$350 - $600 USD (Inicial + cuotas de $35)',
        description: 'Alineación y corrección oclusal completa con aparatología fija de última tecnología.'
      },
      {
        name: 'Cirugía de Cordales (Muelas del Juicio)',
        specialty: 'cirugia_implantes',
        priceRange: '$60 - $120 USD por pieza según complejidad',
        description: 'Extracción quirúrgica atraumática con anestesia local computarizada y sutura reabsorbible.'
      },
      {
        name: 'Implante Dental de Titanio Grado Médico',
        specialty: 'cirugia_implantes',
        priceRange: '$650 - $900 USD (incluye corona definitiva)',
        description: 'Rehabilitación fija de alta estética y biocompatibilidad ósea con garantía clínica.'
      },
      {
        name: 'Blanqueamiento Dental LED / Láser en Consultorio',
        specialty: 'odontologia_general',
        priceRange: '$120 - $180 USD',
        description: 'Aclaramiento dental seguro de 2 a 4 tonos en una sola sesión de 45 minutos.'
      },
      {
        name: 'Endodoncia Unirradicular o Multirradicular',
        specialty: 'endodoncia',
        priceRange: '$90 - $160 USD',
        description: 'Tratamiento de conductos con instrumentación rotatoria y obturación termoplastificada tridimensional.'
      },
      {
        name: 'Diseño de Sonrisa con Carillas de Resina de Alta Estética',
        specialty: 'odontologia_general',
        priceRange: '$50 - $90 USD por carilla',
        description: 'Modelado estético directo para armonizar forma, tamaño y color de la sonrisa.'
      }
    ];

    if (!clinic.treatments) clinic.treatments = [];
    for (const item of suggested) {
      if (!clinic.treatments.some(t => t.name.toLowerCase() === item.name.toLowerCase())) {
        clinic.treatments.push(item);
      }
    }
    this.save(clinic);
    return clinic.treatments;
  }
}

export const clinicsRegistry = new ClinicsRegistry();
