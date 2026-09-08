import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('OdontoCare AI — Dashboard UI & Multi-Tenant E2E Evaluation', () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');

  test.beforeAll(async () => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('E2E Flow: Login -> Bento Overview -> Clinics Multi-Tenant -> WhatsApp QR -> New Clinic -> Flows -> Playground', async ({ page }) => {
    // 1. Navegar a /dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/OdontoCare AI/i);

    // Verificar pantalla de Login
    const authView = page.locator('#auth-view');
    await expect(authView).toBeVisible();
    await expect(page.locator('#login-username')).toHaveValue('admin');
    await expect(page.locator('#login-password')).toHaveValue('odontocare2026');

    // Captura 1: Pantalla de Login
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-screen.png'), fullPage: true });

    // Enviar Login
    await page.locator('#login-form button[type="submit"]').click();

    // 2. Verificar que se cargue la Torre de Control (#app-view)
    const appView = page.locator('#app-view');
    await expect(appView).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#page-title')).toHaveText('Dashboard');

    // Verificar Sidebar y tarjeta de Directora Médica
    await expect(page.locator('.sidebar-brand-title')).toContainText('ODONTOCARE');
    await expect(page.locator('.sidebar-customer-metric')).toBeVisible();
    await expect(page.locator('.customer-metric-name')).toHaveText('Dra. Selen Swift');

    // Verificar Bento Grid (Overview)
    await expect(page.locator('.col-sales')).toBeVisible();
    await expect(page.locator('#overview-total-citas')).toBeVisible();
    await expect(page.locator('.col-visitors')).toBeVisible();
    await expect(page.locator('.col-market')).toBeVisible();
    await expect(page.locator('.col-revenue')).toBeVisible();
    await expect(page.locator('.col-retention')).toBeVisible();
    await expect(page.locator('.col-top-doctors')).toBeVisible();
    await expect(page.locator('.col-tasks')).toBeVisible();

    // Captura 2: Bento Grid Overview
    await page.screenshot({ path: path.join(screenshotsDir, '02-dashboard-overview-bento.png'), fullPage: true });

    // 3. Pestaña de Clínicas
    await page.locator('#btn-nav-clinics').click();
    await expect(page.locator('#tab-clinics')).toBeVisible();
    await expect(page.locator('.clinic-card').first()).toBeVisible({ timeout: 10000 });
    
    // Captura 3: Grid de Clínicas Multi-Tenant
    await page.screenshot({ path: path.join(screenshotsDir, '03-clinics-grid.png'), fullPage: true });

    // 4. Modal Conectar WhatsApp (Meta Cloud API Oficial)
    await page.locator('.btn-action-channel.wa').first().click();
    const modalWa = page.locator('#modal-whatsapp-qr');
    await expect(modalWa).toBeVisible();
    await expect(modalWa.locator('#meta-phone-number-id')).toBeVisible();
    await expect(modalWa.locator('#meta-waba-id')).toBeVisible();
    await expect(modalWa.locator('#meta-access-token')).toBeVisible();
    
    // Esperar 500ms para renderizado suave
    await page.waitForTimeout(500);

    // Captura 4: Modal Meta WhatsApp Cloud API Oficial
    await page.screenshot({ path: path.join(screenshotsDir, '04-whatsapp-qr-modal.png') });
    await page.locator('#modal-whatsapp-qr button', { hasText: 'Cerrar' }).click();
    await expect(modalWa).not.toBeVisible();

    // 5. Crear Nueva Odontología
    await page.locator('button', { hasText: '+ Conectar Nueva Odontología' }).click();
    const modalNew = page.locator('#modal-new-clinic');
    await expect(modalNew).toBeVisible();

    const timestamp = Date.now().toString().slice(-4);
    const uniqueSlug = `dental_manta_${timestamp}`;

    await page.locator('#new-clinic-id').fill(uniqueSlug);
    await page.locator('#new-clinic-name').fill(`Clínica Dental Pacífico Manta ${timestamp}`);
    await page.locator('#new-clinic-city').fill('Manta');
    await page.locator('#new-clinic-phone').fill('+593 99 876 5432');
    await page.locator('#new-clinic-address').fill('Av. Flavio Reyes y Calle 18');
    await page.locator('#new-clinic-calendar').fill('agenda.manta@gmail.com');
    await page.locator('#new-clinic-whatsapp').fill(uniqueSlug);

    // Captura 5: Modal Nueva Odontología
    await page.screenshot({ path: path.join(screenshotsDir, '05-new-clinic-modal.png') });

    // Enviar creación
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.locator('#modal-new-clinic button[type="submit"]').click();
    await expect(modalNew).not.toBeVisible({ timeout: 10000 });

    // Verificar que la nueva clínica aparezca en la lista
    await expect(page.locator('.clinic-name', { hasText: `Clínica Dental Pacífico Manta ${timestamp}` })).toBeVisible({ timeout: 10000 });

    // Captura 6: Clínicas actualizadas
    await page.screenshot({ path: path.join(screenshotsDir, '06-clinics-updated.png'), fullPage: true });

    // 6. Pestaña de Flujos del Bot
    await page.locator('#btn-nav-flows').click();
    await expect(page.locator('#tab-flows')).toBeVisible();
    await expect(page.locator('.flow-card')).toHaveCount(6);

    // Captura 7: Flujos Conversacionales Auditados
    await page.screenshot({ path: path.join(screenshotsDir, '07-bot-flows-visualizer.png'), fullPage: true });

    // 7. Pestaña de Citas
    await page.locator('#btn-nav-appointments').click();
    await expect(page.locator('#tab-appointments')).toBeVisible();

    // Captura 8: Tabla de Citas
    await page.screenshot({ path: path.join(screenshotsDir, '08-appointments-table.png'), fullPage: true });

    // 8. Pestaña Playground Multi-Tenant
    await page.locator('#btn-nav-playground').click();
    await expect(page.locator('#tab-playground')).toBeVisible();
    await expect(page.locator('.chat-messages-scroll')).toBeVisible();

    // Enviar consulta de prueba al agente
    const chatInput = page.locator('#chat-input-text');
    await chatInput.fill('Hola, ¿qué doctores atienden y cuánto cuesta la limpieza dental?');
    await page.locator('.chat-form-bar button[type="submit"]').click();

    // Esperar respuesta de Valeria IA (hasta 20s para llamada real de modelo)
    await expect(page.locator('.bubble.bot').nth(1)).toBeVisible({ timeout: 25000 });

    // Verificar que el Inspector de Inferencia tenga métricas
    await expect(page.locator('#trace-latency')).not.toHaveText('- ms');

    // Captura 9: Playground con Chat e Inspector de Razonamiento
    await page.screenshot({ path: path.join(screenshotsDir, '09-playground-chat-inspector.png'), fullPage: true });
  });
});
