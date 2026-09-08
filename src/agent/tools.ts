import { tool } from 'ai';
import { z } from 'zod';
import { calendarService } from '../services/calendar.service.js';
import { chatwootService } from '../services/chatwoot.service.js';
import { reminderService } from '../services/reminder.service.js';
import { redisService } from '../services/redis.service.js';
import { clinicManager } from '../config/clinic.js';
import { clinicsRegistry } from '../config/clinics.registry.js';
import { eventBus } from '../core/event-bus.js';
import { PrivacyService } from '../services/privacy.service.js';
import { SecureLogger } from '../utils/logger.js';

export function createOdontoTools(userId: string, clinicId?: string) {
  const getClinic = () => (clinicId ? clinicsRegistry.getById(clinicId) : null) || clinicsRegistry.getDefault();

  return {
    /**
     * 1. CONSULTA DE SERVICIOS Y TARIFAS OFICIALES
     * Grounding absoluto de precios para evitar cualquier alucinación económica.
     */
    consultarServiciosYPrecios: tool({
      description: 'Consulta los precios referenciales y la descripción técnica de los tratamientos dentales oficiales de la clínica.',
      parameters: z.object({
        terminoBusqueda: z.string().optional().describe('Término o procedimiento a buscar (ej. "limpieza", "brackets", "implante", "muela del juicio", "carillas", "evaluación").'),
        especialidad: z.enum([
          'ortodoncia',
          'cirugia_implantes',
          'odontologia_general',
          'odontopediatria',
          'todas',
        ]).optional().default('todas').describe('Especialidad odontológica por la cual filtrar los servicios.'),
      }),
      execute: async ({ terminoBusqueda, especialidad }) => {
        SecureLogger.info('Tool:consultarServiciosYPrecios', `Búsqueda: "${terminoBusqueda || 'todos'}" | Especialidad: ${especialidad}`);
        const config = getClinic();
        let treatments = config.treatments;

        if (especialidad && especialidad !== 'todas') {
          treatments = treatments.filter(t => t.specialty.toLowerCase() === especialidad.toLowerCase());
        }

        if (terminoBusqueda) {
          const q = terminoBusqueda.toLowerCase().trim();
          const filtered = treatments.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.specialty.toLowerCase().includes(q)
          );
          if (filtered.length > 0) {
            treatments = filtered;
          }
        }

        return {
          clinica: config.name,
          ciudad: config.city,
          moneda: 'USD (Dólares Americanos)',
          serviciosEncontrados: treatments.map(t => ({
            tratamiento: t.name,
            especialidad: t.specialty,
            precioReferencial: t.priceRange,
            detalleClinico: t.description,
          })),
          notaNormativa: 'Los precios son valores referenciales oficiales. El presupuesto clínico definitivo se entrega de manera personalizada tras la valoración presencial en el consultorio.',
        };
      },
    }),

    // Alias retrocompatible para mantener compatibilidad histórica
    consultarPreciosYTratamientos: tool({
      description: 'Alias de compatibilidad para consultar tratamientos y tarifas de la clínica.',
      parameters: z.object({
        termino: z.string().optional().describe('Palabra clave como limpieza, implante, brackets o carillas.'),
      }),
      execute: async ({ termino }) => {
        const config = getClinic();
        if (!termino) {
          return { tratamientos: config.treatments };
        }
        const filtered = config.treatments.filter(t => 
          t.name.toLowerCase().includes(termino.toLowerCase()) ||
          t.description.toLowerCase().includes(termino.toLowerCase())
        );
        return { tratamientos: filtered.length > 0 ? filtered : config.treatments };
      },
    }),

    /**
     * 2. DISPONIBILIDAD DE HORARIOS REALES
     * Consulta slots sincronizados con Google Calendar / Sistema de citas por doctor.
     */
    obtenerHorariosDisponibles: tool({
      description: 'Consulta los horarios y turnos libres reales del doctor especialista según la especialidad o fecha solicitada.',
      parameters: z.object({
        especialidad: z.enum([
          'ortodoncia',
          'cirugia_implantes',
          'odontologia_general',
          'odontopediatria',
        ]).describe('La especialidad dental requerida para el turno.'),
        fechaDeseada: z.string().optional().describe('Fecha tentativa solicitada por el paciente (ej. 2026-09-10, "mañana", "lunes").'),
        doctorId: z.string().optional().describe('ID específico del doctor si el paciente solicita atenderse con un médico en particular.'),
      }),
      execute: async ({ especialidad, fechaDeseada, doctorId }) => {
        SecureLogger.info('Tool:obtenerHorariosDisponibles', `Esp: ${especialidad} | Fecha: ${fechaDeseada || 'Próxima'} | Doc: ${doctorId || 'Auto'}`);
        const result = await calendarService.getAvailableSlots(especialidad, fechaDeseada, getClinic().clinicId);

        return {
          doctorAsignado: result.doctor.name,
          especialidad: result.doctor.specialtyLabel,
          duracionCitaMinutos: result.doctor.slotDurationMinutes,
          diasLaboralesDoctor: result.doctor.availableDays,
          horarioTrabajo: result.doctor.workingHours,
          turnosDisponibles: result.slots.map(s => ({
            idSlot: s.start,
            horarioVisible: s.display,
            fechaInicioIso: s.start,
            fechaFinIso: s.end,
          })),
          sugerenciaReserva: 'Presenta estas opciones al paciente en texto fluido sin asteriscos y consulta cuál le resulta más conveniente.',
        };
      },
    }),

    /**
     * 3. AGENDAMIENTO DETERMINISTA DE CITA
     * Bloqueo atómico con Redis, persistencia en Google Calendar y emisión al EventBus.
     */
    agendarCita: tool({
      description: 'Confirma y reserva formalmente un turno en la agenda del especialista odontológico.',
      parameters: z.object({
        especialidad: z.string().describe('Especialidad dental de la cita.'),
        horarioSeleccionadoIso: z.string().describe('Fecha y hora de inicio en formato ISO 8601 obtenida previamente de obtenerHorariosDisponibles.'),
        nombrePaciente: z.string().min(2).describe('Nombre y apellido completo del paciente.'),
        telefonoPaciente: z.string().optional().describe('Número telefónico o de WhatsApp del paciente.'),
        motivoConsulta: z.string().optional().describe('Motivo breve de consulta, molestia reportada o procedimiento.'),
        canal: z.enum(['whatsapp', 'telegram', 'web']).optional().default('whatsapp').describe('Canal de origen de la cita.'),
      }),
      execute: async ({ especialidad, horarioSeleccionadoIso, nombrePaciente, telefonoPaciente, motivoConsulta, canal }) => {
        SecureLogger.info('Tool:agendarCita', `Reservando para paciente protegido en ${horarioSeleccionadoIso} (${canal})`);

        // Bloqueo atómico anti-colisión en Redis (4 segundos)
        const lockKey = `slot_${horarioSeleccionadoIso}`;
        const lockAcquired = await redisService.acquireLock(lockKey, 4000);
        if (!lockAcquired) {
          return {
            success: false,
            message: 'Ese horario está siendo confirmado por otro paciente en este instante. Por favor solicita otra de las opciones disponibles.',
          };
        }

        try {
          const booking = await calendarService.bookAppointment({
            specialty: especialidad,
            startDateTime: horarioSeleccionadoIso,
            patientName: nombrePaciente,
            patientPhone: telefonoPaciente,
            notes: motivoConsulta,
            clinicId: getClinic().clinicId,
          });

          if (booking.success) {
            // 1. Registrar cita en recordatorios automáticos
            reminderService.registerAppointment({
              id: booking.appointmentId,
              userId,
              patientName: nombrePaciente,
              patientPhone: telefonoPaciente,
              doctorName: booking.doctorName,
              specialty: booking.specialty,
              appointmentTimeIso: horarioSeleccionadoIso,
              channel: canal || 'whatsapp',
              reminderSent: false,
            });

            // 2. Notificar al TypedEventBus para auditoría e integraciones
            eventBus.emit('appointment:booked', {
              appointmentId: booking.appointmentId,
              userId,
              channel: canal || 'whatsapp',
              patientName: nombrePaciente,
              patientPhone: telefonoPaciente,
              doctorName: booking.doctorName,
              specialty: booking.specialty,
              appointmentTimeIso: horarioSeleccionadoIso,
            });
          }

          const config = getClinic();
          return {
            success: booking.success,
            codigoCita: booking.appointmentId,
            fichaCita: {
              paciente: nombrePaciente,
              doctor: booking.doctorName,
              especialidad: booking.specialty,
              fechaYHora: booking.dateTime,
              direccion: config.address,
              telefonoContacto: telefonoPaciente || 'No especificado',
              indicacionesLlegada: 'Llegar 10 minutos antes. Si cuentas con radiografías previas, por favor tráelas a la cita.',
            },
            mensajeResumen: booking.message,
          };
        } finally {
          await redisService.releaseLock(lockKey);
        }
      },
    }),

    /**
     * 4. OBTENER PERFIL PROFESIONAL DEL DOCTOR
     * Provee credenciales académicas, especialidades y días de atención para evitar alucinaciones de staff.
     */
    obtenerPerfilDoctor: tool({
      description: 'Consulta los datos del doctor, credenciales académicas, especialidad, idiomas y horarios de atención.',
      parameters: z.object({
        especialidad: z.enum([
          'ortodoncia',
          'cirugia_implantes',
          'odontologia_general',
          'odontopediatria',
          'todas',
        ]).optional().describe('Especialidad a consultar.'),
        nombreODoctorId: z.string().optional().describe('Nombre del especialista o ID del doctor (ej. "Carlos", "Sofía", "doc_cirugia").'),
      }),
      execute: async ({ especialidad, nombreODoctorId }) => {
        SecureLogger.info('Tool:obtenerPerfilDoctor', `Esp: ${especialidad || 'Todas'} | Doc: ${nombreODoctorId || 'Cualquiera'}`);
        const config = getClinic();
        let docs = config.doctors;

        if (especialidad && especialidad !== 'todas') {
          docs = docs.filter(d => d.specialty.toLowerCase() === especialidad.toLowerCase());
        }

        if (nombreODoctorId) {
          const q = nombreODoctorId.toLowerCase();
          docs = docs.filter(d => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
        }

        return {
          doctores: docs.map(d => ({
            id: d.id,
            nombre: d.name,
            especialidad: d.specialtyLabel,
            duracionCitaMinutos: d.slotDurationMinutes,
            diasAtencion: d.availableDays,
            horarioTrabajo: d.workingHours,
            credenciales: (d as any).credentials || 'Especialista certificado por el Ministerio de Salud Pública y Colegio Odontológico del Azuay.',
            idiomas: (d as any).languages || ['Español', 'Inglés'],
          })),
        };
      },
    }),

    /**
     * 5. TRIAJE CLÍNICO DE SÍNTOMAS Y DOLOR (1-10)
     * Clasificación estandarizada y recomendaciones no farmacológicas seguras.
     */
    evaluarTriajeSintomas: tool({
      description: 'Clasifica los síntomas odontológicos, nivel de dolor (1-10) y determina la especialidad correspondiente y medidas de soporte inmediato.',
      parameters: z.object({
        nivelDolor: z.number().min(1).max(10).describe('Nivel de dolor reportado por el paciente en escala visual análoga de 1 a 10.'),
        sintomas: z.string().describe('Descripción de los síntomas (ej. "hinchazón en la cara", "diente roto por golpe", "sangrado de encías", "sensibilidad").'),
        tiempoEvolucion: z.string().optional().describe('Tiempo desde que iniciaron los síntomas (ej. "hace 2 horas", "desde ayer", "una semana").'),
        esMenorDeEdad: z.boolean().optional().default(false).describe('Indica si el paciente es un niño menor de 12 años para asignación pediátrica.'),
      }),
      execute: async ({ nivelDolor, sintomas, tiempoEvolucion, esMenorDeEdad }) => {
        SecureLogger.info('Tool:evaluarTriajeSintomas', `Dolor: ${nivelDolor}/10 | Síntomas: ${sintomas} | Niño: ${esMenorDeEdad}`);
        const lowerSintomas = sintomas.toLowerCase();

        // 1. Clasificación de severidad
        let clasificacion: 'LEVE' | 'MODERADO' | 'URGENCIA_SEVERA' = 'LEVE';
        if (nivelDolor >= 8) {
          clasificacion = 'URGENCIA_SEVERA';
        } else if (nivelDolor >= 4) {
          clasificacion = 'MODERADO';
        }

        // 2. Detección de banderas rojas clínicas (Red Flags)
        const banderasRojas: string[] = [];
        if (lowerSintomas.includes('respirar') || lowerSintomas.includes('tragar') || lowerSintomas.includes('ojo')) {
          banderasRojas.push('Posible compromiso de espacios faciales profundos (Celulitis / Angina de Ludwig). Requiere atención hospitalaria u odontológica inmediata.');
          clasificacion = 'URGENCIA_SEVERA';
        }
        if (lowerSintomas.includes('golpe') || lowerSintomas.includes('caída') || lowerSintomas.includes('trauma') || lowerSintomas.includes('avulsion') || lowerSintomas.includes('salió el diente')) {
          banderasRojas.push('Traumatismo dentoalveolar agudo. En caso de diente avulsionado completo, conservarlo en leche tibia o saliva y acudir dentro de los primeros 60 minutos.');
          clasificacion = 'URGENCIA_SEVERA';
        }
        if (lowerSintomas.includes('sangrado abundante') || lowerSintomas.includes('hemorragia')) {
          banderasRojas.push('Hemorragia activa oral que no cohíbe con presión local.');
          clasificacion = 'URGENCIA_SEVERA';
        }

        // 3. Recomendación de especialidad
        let especialidadSugerida = 'odontologia_general';
        let doctorRecomendado = 'Dra. Elena Vega';

        if (esMenorDeEdad) {
          especialidadSugerida = 'odontopediatria';
          doctorRecomendado = 'Dr. Mateo Palacios';
        } else if (
          lowerSintomas.includes('muela del juicio') ||
          lowerSintomas.includes('cordal') ||
          lowerSintomas.includes('cirugia') ||
          lowerSintomas.includes('implante') ||
          lowerSintomas.includes('extraccion compleja') ||
          banderasRojas.length > 0
        ) {
          especialidadSugerida = 'cirugia_implantes';
          doctorRecomendado = 'Dra. Sofía Mora';
        } else if (lowerSintomas.includes('bracket') || lowerSintomas.includes('freno') || lowerSintomas.includes('alambre') || lowerSintomas.includes('alineador')) {
          especialidadSugerida = 'ortodoncia';
          doctorRecomendado = 'Dr. Carlos Delgado';
        }

        // 4. Medidas de soporte inmediato no farmacológicas (PROHIBIDO RECETAR FÁRMACOS)
        const medidasSoporte: string[] = [
          'Colocar una compresa fría o hielo envuelto en un paño limpio sobre la mejilla externa durante 10 a 15 minutos para disminuir la inflamación.',
          'Mantener la cabeza elevada con dos almohadas para reducir la presión sanguínea en la zona oral.',
          'Evitar consumir alimentos excesivamente calientes, duros o masticar sobre la zona afectada.',
          'BAJO NINGUNA CIRCUNSTANCIA automedicarse con antibióticos o analgésicos sin previa valoración clínica presencial.',
        ];

        return {
          clasificacionSeveridad: clasificacion,
          nivelDolorRegistrado: `${nivelDolor}/10`,
          tiempoEvolucion: tiempoEvolucion || 'No especificado',
          especialidadSugerida,
          doctorRecomendado,
          banderasRojas,
          requiereEscalamientoUrgencia: clasificacion === 'URGENCIA_SEVERA',
          medidasSoporteNoFarmacologicas: medidasSoporte,
          orientacionParaElPaciente: clasificacion === 'URGENCIA_SEVERA'
            ? 'Indicar al paciente que se trata de una urgencia odontológica prioritaria y que debe llamar a la línea de emergencia de inmediato.'
            : 'Sugerir la reserva de una cita programada para el día más cercano posible.',
        };
      },
    }),

    /**
     * 6. ESCALAMIENTO DE URGENCIA MÉDICA Y HANDOFF
     * Pausa el bot, notifica a recepción por Chatwoot y despacha el canal telefónico de urgencia.
     */
    escalarUrgenciaMedica: tool({
      description: 'Activa una alerta de emergencia dental inmediata para el equipo médico cuando hay dolor severo (8-10) o traumatismo agudo.',
      parameters: z.object({
        nivelDolor: z.number().min(1).max(10).describe('Nivel de dolor reportado del 1 al 10.'),
        sintomas: z.string().describe('Descripción de síntomas (hinchazón difusa, hemorragia, golpe, fractura dental, fiebre).'),
        nombrePaciente: z.string().optional().describe('Nombre del paciente si está disponible.'),
        telefono: z.string().optional().describe('Teléfono o WhatsApp de contacto.'),
        canal: z.string().optional().default('whatsapp').describe('Canal por donde se reporta la urgencia.'),
      }),
      execute: async ({ nivelDolor, sintomas, nombrePaciente, telefono, canal }) => {
        SecureLogger.info('Tool:escalarUrgenciaMedica', `Nivel ${nivelDolor}/10 - ${sintomas} (Canal: ${canal})`);

        // 1. Notificar a Chatwoot y pausar bot
        await chatwootService.notifyEmergencyHandoff({
          userId,
          userName: nombrePaciente || 'Paciente Urgencia',
          userPhone: telefono,
          painLevel: nivelDolor,
          summary: sintomas,
        });

        // 2. Emitir evento al EventBus
        eventBus.emit('handoff:emergency', {
          userId,
          channel: canal || 'whatsapp',
          userName: nombrePaciente || 'Paciente Urgencia',
          userPhone: telefono,
          painLevel: nivelDolor,
          summary: sintomas,
        });

        const cfg = getClinic();
        return {
          alertaActivada: true,
          botPausadoParaHumano: true,
          lineaEmergenciaDirecta: cfg.emergencyPhone,
          direccionConsultorio: cfg.address,
          instruccionPaciente: `Hemos alertado con prioridad a nuestro equipo de recepción médica. Por favor llama de inmediato al ${cfg.emergencyPhone} o acércate a nuestra clínica en ${cfg.address}.`,
        };
      },
    }),

    /**
     * 7. GESTIÓN DE CONSENTIMIENTO INFORMADO (LOPDP ECUADOR / ISO 42001)
     * Registro formal y explícito del consentimiento y tratamiento de datos personales.
     */
    gestionarConsentimientoLOPDP: tool({
      description: 'Gestiona y verifica el consentimiento informado del paciente según la Ley Orgánica de Protección de Datos Personales (LOPDP Ecuador).',
      parameters: z.object({
        accion: z.enum([
          'consultar_estado',
          'registrar_consentimiento',
          'revocar_consentimiento',
        ]).describe('Acción de protección de datos a ejecutar.'),
        canal: z.enum(['whatsapp', 'telegram', 'web']).optional().default('whatsapp').describe('Canal de origen.'),
        nombrePaciente: z.string().optional().describe('Nombre del paciente si está disponible.'),
      }),
      execute: async ({ accion, canal, nombrePaciente: _nombrePaciente }) => {
        SecureLogger.info('Tool:gestionarConsentimientoLOPDP', `Acción: ${accion} | Usuario protegido`);

        if (accion === 'consultar_estado') {
          const consent = await PrivacyService.hasConsent(userId);
          return {
            tieneConsentimiento: consent,
            normativa: 'LOPDP Ecuador (Art. 8, 12, 15) & ISO/IEC 42001:2026',
            versionConsentimiento: PrivacyService.CONSENT_VERSION,
            mensaje: consent
              ? 'El paciente ya cuenta con consentimiento informado registrado para fines de coordinación clínica.'
              : 'El paciente aún no ha registrado su consentimiento explícito.',
          };
        }

        if (accion === 'registrar_consentimiento') {
          await PrivacyService.grantConsent(userId, canal);
          return {
            registradoExitoso: true,
            version: PrivacyService.CONSENT_VERSION,
            mensaje: 'Consentimiento informado registrado exitosamente para la gestión de turnos y atención odontológica.',
          };
        }

        if (accion === 'revocar_consentimiento') {
          const res = await PrivacyService.executeRightToErasure(userId);
          eventBus.emit('privacy:erasure_requested', { userId });
          return {
            registradoExitoso: res.success,
            mensaje: res.message,
          };
        }

        return { error: 'Acción no reconocida' };
      },
    }),
  };
}
