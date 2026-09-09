import { describe, it, expect } from 'vitest';
import { clinicsRegistry, ClinicEntity } from '../src/config/clinics.registry.js';
import { calendarService } from '../src/services/calendar.service.js';

describe('ClinicsRegistry - Multi-Tenant Architecture', () => {
  it('debe contener al menos la clínica principal y la clínica secundaria sembrada', async () => {
    const all = await clinicsRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);

    const cuenca = await clinicsRegistry.getById('odontocare_cuenca') || all[0];
    expect(cuenca).toBeDefined();
    expect(cuenca.city).toBe('Cuenca');

    const quito = await clinicsRegistry.getById('dental_plus_quito');
    expect(quito).toBeDefined();
    expect(quito?.city).toBe('Quito');
    expect(quito?.doctors.length).toBeGreaterThan(0);
    expect(quito?.calendarId).toBe('quito.dental.plus@gmail.com');
  });

  it('debe permitir crear y recuperar una nueva clínica odontológica con su propio calendario', async () => {
    const newClinic: ClinicEntity = {
      clinicId: 'dental_test_ambato',
      name: 'Clínica Dental Ambato Test',
      city: 'Ambato',
      address: 'Calle Cevallos y Montalvo',
      emergencyPhone: '+593 99 999 8888',
      calendarId: 'ambato.test.calendar@gmail.com',
      whatsappInstance: 'dental_ambato',
      workingHours: {
        weekdays: '09:00 - 18:00',
        saturday: '09:00 - 13:00',
        sunday: 'Cerrado',
      },
      doctors: [
        {
          id: 'doc_ambato_1',
          name: 'Dr. Patricio Estrella',
          specialty: 'odontologia_general',
          specialtyLabel: 'Odontología General',
          calendarId: 'patricio.ambato@gmail.com',
          slotDurationMinutes: 30,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          workingHours: '09:00 - 17:00',
        },
      ],
      treatments: [
        {
          name: 'Profilaxis Básica',
          specialty: 'odontologia_general',
          priceRange: '$30 USD',
          description: 'Limpieza dental simple',
        },
      ],
    };

    const saved = await clinicsRegistry.save(newClinic);
    expect(saved.clinicId).toBe('dental_test_ambato');

    const retrieved = await clinicsRegistry.getById('dental_test_ambato');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Clínica Dental Ambato Test');
    expect(retrieved?.calendarId).toBe('ambato.test.calendar@gmail.com');

    // Limpieza
    await clinicsRegistry.delete('dental_test_ambato');
    expect(await clinicsRegistry.getById('dental_test_ambato')).toBeUndefined();
  });

  it('debe generar turnos diferenciados para cada clínica con su respectivo doctor', async () => {
    const resultCuenca = await calendarService.getAvailableSlots('ortodoncia', undefined, 'odontocare_cuenca');
    expect(resultCuenca.clinic.name).toContain('OdontoCare');
    expect(resultCuenca.doctor.name).toContain('Carlos Delgado');

    const resultQuito = await calendarService.getAvailableSlots('ortodoncia', undefined, 'dental_plus_quito');
    expect(resultQuito.clinic.name).toContain('Quito');
    expect(resultQuito.doctor.name).toContain('Andrea Morales');
  });

  it('debe registrar y listar citas independientes por clínica', async () => {
    const slotsQuito = await calendarService.getAvailableSlots('ortodoncia', undefined, 'dental_plus_quito');
    const slot = slotsQuito.slots[0];

    const booking = await calendarService.bookAppointment({
      specialty: 'ortodoncia',
      startDateTime: slot.start,
      patientName: 'Paciente Quito Prueba',
      patientPhone: '0981112233',
      clinicId: 'dental_plus_quito',
    });

    expect(booking.success).toBe(true);
    expect(booking.doctorName).toContain('Andrea Morales');

    const appointmentsQuito = calendarService.getAllAppointments('dental_plus_quito');
    expect(appointmentsQuito.length).toBeGreaterThan(0);
    const last = appointmentsQuito[appointmentsQuito.length - 1];
    expect(last.clinicId).toBe('dental_plus_quito');
    expect(last.patientName).toBe('Paciente Quito Prueba');
  });
});
