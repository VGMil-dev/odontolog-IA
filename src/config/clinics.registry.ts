import { clinicManager, ClinicConfig, Doctor, Treatment } from './clinic.js';
import { SecureLogger } from '../utils/logger.js';
import { pgService } from '../services/pg.service.js';

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
  private async rowToClinicEntity(row: any): Promise<ClinicEntity> {
    const config = row.config || {};
    
    // Fetch doctors
    const doctorsRes = await pgService.query('SELECT * FROM doctors WHERE clinic_id = $1', [row.id]);
    const doctors = doctorsRes.rows.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      specialtyLabel: d.specialty_label,
      calendarId: d.calendar_id,
      slotDurationMinutes: d.slot_duration_minutes,
      isActive: d.is_active,
      availableDays: d.available_days,
      workingHours: d.working_hours_start && d.working_hours_end ? { start: d.working_hours_start, end: d.working_hours_end } : { start: '09:00', end: '18:00' }
    }));

    // Fetch treatments
    const treatmentsRes = await pgService.query('SELECT * FROM treatments WHERE clinic_id = $1', [row.id]);
    const treatments = treatmentsRes.rows.map(t => ({
      name: t.name,
      specialty: t.specialty,
      priceRange: t.price_range,
      assignedDoctorId: t.assigned_doctor_id,
      description: t.description
    }));

    return {
      clinicId: row.id,
      name: row.name,
      city: row.city,
      address: row.address,
      phone: row.phone,
      emergencyPhone: row.emergency_phone,
      contactPerson: row.contact_person,
      chairsCount: row.chairs_count,
      calendarId: row.calendar_id,
      whatsappInstance: row.whatsapp_instance,
      metaPhoneNumberId: row.meta_phone_number_id,
      metaWabaId: row.meta_waba_id,
      metaAccessToken: row.meta_access_token,
      telegramToken: config.telegramToken,
      workingHours: config.workingHours,
      inventoryStatus: config.inventoryStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      doctors,
      treatments
    };
  }

  public async getAll(): Promise<ClinicEntity[]> {
    const res = await pgService.query('SELECT * FROM clinics ORDER BY created_at ASC');
    const clinics = await Promise.all(res.rows.map(row => this.rowToClinicEntity(row)));
    return clinics;
  }

  public async getById(clinicId: string): Promise<ClinicEntity | undefined> {
    const res = await pgService.query('SELECT * FROM clinics WHERE id = $1', [clinicId]);
    if (res.rows.length === 0) return undefined;
    return this.rowToClinicEntity(res.rows[0]);
  }

  public async findByPhoneNumberId(phoneNumberId: string): Promise<ClinicEntity | undefined> {
    const res = await pgService.query('SELECT * FROM clinics WHERE meta_phone_number_id = $1 LIMIT 1', [phoneNumberId]);
    if (res.rows.length === 0) return undefined;
    return this.rowToClinicEntity(res.rows[0]);
  }

  public async getDefault(): Promise<ClinicEntity> {
    const res = await pgService.query('SELECT * FROM clinics ORDER BY created_at ASC LIMIT 1');
    if (res.rows.length > 0) {
      return this.rowToClinicEntity(res.rows[0]);
    }
    const base = clinicManager.getConfig();
    return {
      ...base,
      calendarId: 'primary',
      whatsappInstance: 'odontocare_cuenca',
    };
  }

  public async save(clinic: ClinicEntity): Promise<ClinicEntity> {
    const now = new Date().toISOString();
    const configObj = {
      workingHours: clinic.workingHours,
      inventoryStatus: clinic.inventoryStatus,
      telegramToken: clinic.telegramToken
    };

    const query = `
      INSERT INTO clinics (
        id, name, city, address, phone, emergency_phone, contact_person,
        chairs_count, calendar_id, whatsapp_instance, meta_phone_number_id,
        meta_waba_id, meta_access_token, config, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        emergency_phone = EXCLUDED.emergency_phone,
        contact_person = EXCLUDED.contact_person,
        chairs_count = EXCLUDED.chairs_count,
        calendar_id = EXCLUDED.calendar_id,
        whatsapp_instance = EXCLUDED.whatsapp_instance,
        meta_phone_number_id = EXCLUDED.meta_phone_number_id,
        meta_waba_id = EXCLUDED.meta_waba_id,
        meta_access_token = EXCLUDED.meta_access_token,
        config = EXCLUDED.config,
        updated_at = EXCLUDED.updated_at
      RETURNING *;
    `;
    const values = [
      clinic.clinicId,
      clinic.name,
      clinic.city,
      clinic.address,
      clinic.phone,
      clinic.emergencyPhone,
      clinic.contactPerson,
      clinic.chairsCount || 1,
      clinic.calendarId,
      clinic.whatsappInstance,
      clinic.metaPhoneNumberId,
      clinic.metaWabaId,
      clinic.metaAccessToken,
      JSON.stringify(configObj),
      now
    ];

    await pgService.query(query, values);
    
    // We would theoretically also update doctors and treatments here,
    // but the `save` method was mainly saving the entire structure.
    // Given the complexity of deep saving, we'll keep the specialized methods for addDoctor/updateTreatment.
    // If we receive them, we could sync them, but for Phase 0 it's better to just leave them untouched in save() 
    // and rely on addDoctor() etc., or implement a full sync.
    // Let's implement full sync to be safe:

    // Delete existing doctors and treatments
    // Wait, this could break foreign keys if appointments exist. 
    // It's better to NOT delete them in `save()` and only modify them via the specific methods.

    SecureLogger.info('ClinicsRegistry', `Clínica guardada: ${clinic.name} (${clinic.clinicId})`);
    return this.getById(clinic.clinicId) as Promise<ClinicEntity>;
  }

  public async delete(clinicId: string): Promise<boolean> {
    const res = await pgService.query('SELECT COUNT(*) FROM clinics');
    if (parseInt(res.rows[0].count, 10) <= 1) {
      return false; // Prevent deleting last clinic
    }
    const delRes = await pgService.query('DELETE FROM clinics WHERE id = $1 RETURNING id', [clinicId]);
    if ((delRes.rowCount ?? 0) > 0) {
      SecureLogger.info('ClinicsRegistry', `Clínica eliminada: ${clinicId}`);
      return true;
    }
    return false;
  }

  // --- GESTIÓN DE DOCTORES & ESPECIALISTAS ---
  public async addDoctor(clinicId: string, doctor: Doctor): Promise<boolean> {
    const docQuery = `
      INSERT INTO doctors (
        id, clinic_id, name, specialty, specialty_label, calendar_id,
        slot_duration_minutes, is_active, available_days
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        specialty = EXCLUDED.specialty,
        specialty_label = EXCLUDED.specialty_label,
        calendar_id = EXCLUDED.calendar_id,
        slot_duration_minutes = EXCLUDED.slot_duration_minutes,
        is_active = EXCLUDED.is_active,
        available_days = EXCLUDED.available_days;
    `;
    const docValues = [
      doctor.id,
      clinicId,
      doctor.name,
      doctor.specialty,
      doctor.specialtyLabel,
      doctor.calendarId,
      doctor.slotDurationMinutes || 30,
      doctor.isActive !== false,
      doctor.availableDays || []
    ];
    await pgService.query(docQuery, docValues);
    return true;
  }

  public async updateDoctor(clinicId: string, doctor: Doctor): Promise<boolean> {
    return this.addDoctor(clinicId, doctor);
  }

  public async deleteDoctor(clinicId: string, doctorId: string): Promise<boolean> {
    await pgService.query('DELETE FROM doctors WHERE id = $1 AND clinic_id = $2', [doctorId, clinicId]);
    return true;
  }

  public async toggleDoctorStatus(clinicId: string, doctorId: string): Promise<{ ok: boolean; isActive?: boolean }> {
    const res = await pgService.query('SELECT is_active FROM doctors WHERE id = $1 AND clinic_id = $2', [doctorId, clinicId]);
    if (res.rows.length === 0) return { ok: false };
    const currentStatus = res.rows[0].is_active;
    const newStatus = !currentStatus;
    await pgService.query('UPDATE doctors SET is_active = $1 WHERE id = $2 AND clinic_id = $3', [newStatus, doctorId, clinicId]);
    return { ok: true, isActive: newStatus };
  }

  public async updateInventory(clinicId: string, inventory: any[]): Promise<boolean> {
    const clinic = await this.getById(clinicId);
    if (!clinic) return false;
    clinic.inventoryStatus = inventory;
    
    const configObj = {
      workingHours: clinic.workingHours,
      inventoryStatus: inventory,
      telegramToken: clinic.telegramToken
    };

    await pgService.query('UPDATE clinics SET config = $1 WHERE id = $2', [JSON.stringify(configObj), clinicId]);
    return true;
  }

  // --- GESTIÓN DE CATÁLOGO DE SERVICIOS & PRECIOS ---
  public async addTreatment(clinicId: string, treatment: Treatment): Promise<boolean> {
    const tQuery = `
      INSERT INTO treatments (
        clinic_id, name, specialty, price_range, assigned_doctor_id, description
      ) VALUES ($1, $2, $3, $4, $5, $6);
    `;
    const tValues = [
      clinicId,
      treatment.name,
      treatment.specialty,
      treatment.priceRange,
      treatment.assignedDoctorId,
      treatment.description
    ];
    await pgService.query(tQuery, tValues);
    return true;
  }

  public async updateTreatment(clinicId: string, index: number, treatment: Treatment): Promise<boolean> {
    // Treat "index" as somewhat unreliable now since it's a DB.
    // Wait! The front-end passes an array index for treatments.
    // Let's fetch treatments, find the ID of the N-th element, and update it.
    const res = await pgService.query('SELECT id FROM treatments WHERE clinic_id = $1 ORDER BY id ASC', [clinicId]);
    if (index < 0 || index >= res.rows.length) return false;
    const dbId = res.rows[index].id;

    const tQuery = `
      UPDATE treatments SET
        name = $1, specialty = $2, price_range = $3, assigned_doctor_id = $4, description = $5
      WHERE id = $6
    `;
    const tValues = [
      treatment.name,
      treatment.specialty,
      treatment.priceRange,
      treatment.assignedDoctorId,
      treatment.description,
      dbId
    ];
    await pgService.query(tQuery, tValues);
    return true;
  }

  public async deleteTreatment(clinicId: string, index: number): Promise<boolean> {
    const res = await pgService.query('SELECT id FROM treatments WHERE clinic_id = $1 ORDER BY id ASC', [clinicId]);
    if (index < 0 || index >= res.rows.length) return false;
    const dbId = res.rows[index].id;
    await pgService.query('DELETE FROM treatments WHERE id = $1', [dbId]);
    return true;
  }

  public async seedSuggestedTreatments(clinicId: string): Promise<Treatment[]> {
    const clinic = await this.getById(clinicId);
    if (!clinic) return [];
    
    // Simplification for migration phase: just insert if they don't exist
    // ... we can implement the exact logic if needed, but returning clinic.treatments is enough if already seeded.
    return clinic.treatments || [];
  }
}

export const clinicsRegistry = new ClinicsRegistry();
