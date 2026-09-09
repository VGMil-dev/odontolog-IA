import { describe, it, expect } from 'vitest';
import { calendarService } from '../src/services/calendar.service.js';
import { clinicManager } from '../src/config/clinic.js';

describe('CalendarService - Multi-Doctor Dynamic Scheduling', () => {
  it('debe cargar la lista de doctores y especialidades correctamente', async () => {
    const config = clinicManager.getConfig();
    expect(config.doctors.length).toBeGreaterThan(0);
    
    const ortoDoc = clinicManager.getDoctorBySpecialty('ortodoncia');
    expect(ortoDoc).toBeDefined();
    expect(ortoDoc?.name).toContain('Carlos Delgado');
    expect(ortoDoc?.slotDurationMinutes).toBe(45);
  });

  it('debe generar slots de horarios disponibles dentro del rango laboral del doctor', async () => {
    const result = await calendarService.getAvailableSlots('ortodoncia');
    expect(result.doctor).toBeDefined();
    expect(result.doctor.specialty).toBe('ortodoncia');
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.slots.length).toBeLessThanOrEqual(3); // Máximo 3 opciones para no saturar

    const firstSlot = result.slots[0];
    expect(firstSlot.start).toBeDefined();
    expect(firstSlot.display).toContain('Carlos Delgado');
  });

  it('debe agendar una cita y registrarla sin permitir doble reserva (anti-colisión)', async () => {
    const slotsResult = await calendarService.getAvailableSlots('ortodoncia');
    const targetSlot = slotsResult.slots[0];

    const booking1 = await calendarService.bookAppointment({
      specialty: 'ortodoncia',
      startDateTime: targetSlot.start,
      patientName: 'Juan Pérez',
      patientPhone: '0991234567',
      notes: 'Valoración inicial de brackets',
    });

    expect(booking1.success).toBe(true);
    expect(booking1.appointmentId).toBeDefined();
    expect(booking1.patientName).toBe('Juan Pérez');

    // Intentar agendar exactamente el mismo horario con otro paciente
    const booking2 = await calendarService.bookAppointment({
      specialty: 'ortodoncia',
      startDateTime: targetSlot.start,
      patientName: 'María Gómez',
      patientPhone: '0997654321',
    });

    expect(booking2.success).toBe(false);
    expect(booking2.message).toContain('ya no se encuentra disponible');
  });
});
