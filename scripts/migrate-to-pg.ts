import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'evolution',
  password: 'evolution_secret_pass',
  database: 'odontocare_db',
});

// Simple password hashing using SHA-256 for testing (use bcrypt in production)
// Wait, maybe we should use bcrypt or what does auth.service.ts use? Let's check auth.service.ts later,
// but let's just use crypto.createHash for now or bcrypt if it's available.
// For now, let's create a cleartext hash or something similar, or check package.json for bcrypt.
// We don't have bcrypt installed in package.json. We can use native node crypto.

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function runMigration() {
  const clinicsFilePath = path.join(__dirname, '../clinics.json');
  if (!fs.existsSync(clinicsFilePath)) {
    console.error(`File not found: ${clinicsFilePath}`);
    return;
  }

  const data = fs.readFileSync(clinicsFilePath, 'utf8');
  const clinics = JSON.parse(data);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete existing data to allow re-runs
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM treatments');
    await client.query('DELETE FROM doctors');
    await client.query('DELETE FROM clinics');

    for (const clinic of clinics) {
      console.log(`Migrating clinic: ${clinic.name}`);
      
      const configObj = {
        workingHours: clinic.workingHours,
        inventoryStatus: clinic.inventoryStatus
      };

      const clinicQuery = `
        INSERT INTO clinics (
          id, name, city, address, phone, emergency_phone, contact_person,
          chairs_count, calendar_id, whatsapp_instance, meta_phone_number_id,
          meta_waba_id, meta_access_token, config, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id;
      `;
      const clinicValues = [
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
        clinic.createdAt || new Date().toISOString(),
        clinic.updatedAt || new Date().toISOString()
      ];

      await client.query(clinicQuery, clinicValues);

      // Doctors
      if (clinic.doctors && Array.isArray(clinic.doctors)) {
        for (const doc of clinic.doctors) {
          const docQuery = `
            INSERT INTO doctors (
              id, clinic_id, name, specialty, specialty_label, calendar_id,
              slot_duration_minutes, is_active, available_days
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
          `;
          const uniqueDocId = `${clinic.clinicId}_${doc.id}`;
          const docValues = [
            uniqueDocId,
            clinic.clinicId,
            doc.name,
            doc.specialty,
            doc.specialtyLabel,
            doc.calendarId,
            doc.slotDurationMinutes || 30,
            doc.isActive !== false,
            doc.availableDays || []
          ];
          await client.query(docQuery, docValues);
        }
      }

      // Treatments
      if (clinic.treatments && Array.isArray(clinic.treatments)) {
        for (const t of clinic.treatments) {
          const tQuery = `
            INSERT INTO treatments (
              clinic_id, name, specialty, price_range, assigned_doctor_id, description
            ) VALUES ($1, $2, $3, $4, $5, $6);
          `;
          const tValues = [
            clinic.clinicId,
            t.name,
            t.specialty,
            t.priceRange,
            t.assignedDoctorId ? `${clinic.clinicId}_${t.assignedDoctorId}` : null,
            t.description
          ];
          await client.query(tQuery, tValues);
        }
      }
    }

    // Create a default admin user
    const adminQuery = `
      INSERT INTO users (clinic_id, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
    `;
    // We'll assign the first clinic to admin or null
    await client.query(adminQuery, [null, 'admin@odontocare.ia', hashPassword('admin123'), 'admin']);
    
    // Create a default clinic user for testing
    await client.query(adminQuery, ['odontocare_cuenca', 'cuenca@odontocare.ia', hashPassword('clinic123'), 'clinic']);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
