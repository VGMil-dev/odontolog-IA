export function getAdminDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OdontoCare AI — Dashboard SaaS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  <style>
    :root {
      /* Beige Design System */
      --color-bg-primary: #FDFBF7;
      --color-surface: #FFFFFF;
      --radius-card: 12px;
      --shadow-card: 0 1px 3px rgba(44,42,41,0.06);
      --color-text-primary: #2C2A29;
      --color-text-secondary: #6B6866;
      --color-accent: #C4A484;
      --color-accent-hover: #B09275;
      --color-border: #E8E6E1;
      --font-family: 'Inter', system-ui, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--color-bg-primary);
      color: var(--color-text-primary);
      font-family: var(--font-family);
      min-height: 100vh;
      display: flex;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Auth View */
    #auth-view {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
      background-color: var(--color-bg-primary);
      position: fixed;
      inset: 0;
      z-index: 1000;
    }

    .login-card {
      background: var(--color-surface);
      border-radius: var(--radius-card);
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: var(--shadow-card), 0 10px 20px rgba(0,0,0,0.05);
      text-align: center;
    }

    .login-card h2 {
      margin-bottom: 24px;
      color: var(--color-text-primary);
    }

    .form-group {
      margin-bottom: 16px;
      text-align: left;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: var(--color-text-primary);
    }

    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-family: var(--font-family);
      font-size: 14px;
      outline: none;
      background-color: var(--color-surface);
    }

    .btn-primary {
      background-color: var(--color-accent);
      color: var(--color-surface);
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      width: 100%;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary:hover {
      background-color: var(--color-accent-hover);
    }

    /* App Layout */
    #app-view {
      display: none;
      width: 100vw;
      height: 100vh;
      flex-direction: row;
    }

    .sidebar {
      width: 260px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
    }

    .sidebar-header {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 32px;
      padding-left: 8px;
      color: var(--color-text-primary);
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nav-item {
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--color-text-secondary);
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
    }

    .nav-item.active {
      background: var(--color-accent);
      color: var(--color-surface);
    }

    .sidebar-footer {
      padding-top: 24px;
      border-top: 1px solid var(--color-border);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      padding: 0 8px;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
    }

    .user-role {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }

    .btn-logout {
      margin-top: 16px;
      margin-left: 8px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      padding: 0;
    }

    .btn-logout:hover {
      color: var(--color-text-primary);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--color-bg-primary);
      overflow-y: auto;
    }

    .header {
      height: 72px;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header-title {
      font-size: 20px;
      font-weight: 600;
    }

    .impersonation-banner {
      display: none;
      background: var(--color-accent);
      color: var(--color-surface);
      padding: 10px 32px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
    }
    
    .impersonation-banner button {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: none;
      border-radius: 6px;
      padding: 6px 14px;
      margin-left: 16px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .impersonation-banner button:hover {
      opacity: 0.9;
    }

    .content-area {
      padding: 32px;
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .view-panel {
      display: none;
    }

    .view-panel.active {
      display: block;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Dashboard Cards */
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .card {
      background: var(--color-surface);
      border-radius: var(--radius-card);
      padding: 24px;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }

    .card-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .card-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    /* Tables */
    .table-container {
      background: var(--color-surface);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 16px 24px;
      text-align: left;
      border-bottom: 1px solid var(--color-border);
    }

    th {
      background: #F9F8F6;
      font-weight: 600;
      font-size: 12px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      font-size: 14px;
      color: var(--color-text-primary);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .btn-action {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      color: var(--color-text-primary);
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: var(--color-bg-primary);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
      
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #EDF7ED;
      color: #2E7D32;
    }

    /* Module B & C Specific Styles */
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }
    
    .calendar-day {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 12px;
      min-height: 100px;
      background: var(--color-surface);
    }
    
    .calendar-day-header {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
      text-align: right;
    }
    
    .appointment-chip {
      background: var(--color-accent);
      color: var(--color-surface);
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 6px;
      margin-bottom: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .timeline {
      position: relative;
      padding-left: 24px;
      border-left: 2px solid var(--color-border);
      margin-left: 12px;
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 24px;
    }
    
    .timeline-dot {
      position: absolute;
      left: -31px;
      top: 0;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--color-surface);
      border: 2px solid var(--color-accent);
    }
    
    .odontogram-grid {
      display: grid;
      grid-template-columns: repeat(16, 1fr);
      gap: 4px;
      margin-bottom: 24px;
      overflow-x: auto;
    }
    
    .tooth {
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 8px 4px;
      text-align: center;
      cursor: pointer;
      background: var(--color-surface);
      transition: border-color 0.2s;
    }
    
    .tooth:hover {
      border-color: var(--color-accent);
    }
    
    .tooth-number {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    
    .tooth-icon {
      width: 24px;
      height: 24px;
      border: 2px solid var(--color-border);
      border-radius: 50%;
      margin: 0 auto;
    }
    
    .heatmap-row {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    
    .heatmap-cell {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background: #E8E6E1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: rgba(0,0,0,0.5);
    }
    
    .heatmap-cell[data-intensity="1"] { background: #E1D4C7; }
    .heatmap-cell[data-intensity="2"] { background: #D1BBA5; }
    .heatmap-cell[data-intensity="3"] { background: #C4A484; color: #FFF; }
    .heatmap-cell[data-intensity="4"] { background: #A88665; color: #FFF; }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      #app-view {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid var(--color-border);
        padding: 16px;
      }
      .content-area {
        padding: 16px;
      }
      .header {
        padding: 0 16px;
      }
      .calendar-grid {
        grid-template-columns: 1fr;
      }
      .odontogram-grid {
        grid-template-columns: repeat(8, 1fr);
      }
    }
  </style>
</head>
<body>

  <!-- Auth View -->
  <div id="auth-view">
    <div class="login-card">
      <h2>OdontoCare IA</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: 24px; font-size: 14px;">Ingreso al Portal Administrativo</p>
      <div class="form-group">
        <label>Rol de Prueba</label>
        <select id="role-select">
          <option value="SUPER_ADMIN">Súper Admin (SaaS Global)</option>
          <option value="CLINIC_ADMIN">Admin de Clínica (Tenant)</option>
          <option value="DOCTOR">Doctor</option>
        </select>
      </div>
      <button class="btn-primary" onclick="app.login()">Ingresar</button>
    </div>
  </div>

  <!-- App View -->
  <div id="app-view">
    <aside class="sidebar">
      <div class="sidebar-header">OdontoCare IA</div>
      <div class="nav-menu" id="nav-menu">
        <!-- Dynamic Nav Items populated by JS -->
      </div>
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-name" id="current-user-name">Usuario</span>
          <span class="user-role" id="current-user-role">Rol</span>
        </div>
        <button class="btn-logout" onclick="app.logout()">Cerrar Sesión</button>
      </div>
    </aside>

    <div class="main-content">
      <div class="impersonation-banner" id="impersonation-banner">
        Modo Impersonación: Administrando <strong><span id="impersonated-clinic-name"></span></strong>
        <button onclick="app.stopImpersonation()">Finalizar Sesión</button>
      </div>
      
      <header class="header">
        <div class="header-title" id="header-title">Dashboard</div>
      </header>

      <div class="content-area">
        
        <!-- =========================
             MODULE A: SÚPER ADMIN
             ========================= -->
        
        <!-- View 1: Global Dashboard -->
        <div id="view-global-dashboard" class="view-panel">
          <div class="dashboard-cards">
            <div class="card">
              <div class="card-title">Clínicas Activas</div>
              <div class="card-value">124</div>
            </div>
            <div class="card">
              <div class="card-title">MRR (Mensual)</div>
              <div class="card-value">$15,400</div>
            </div>
            <div class="card">
              <div class="card-title">Doctores Activos</div>
              <div class="card-value">458</div>
            </div>
          </div>
          
          <div class="card">
            <h3 style="margin-bottom: 24px; font-size: 16px; font-weight: 600; color: var(--color-text-primary);">Crecimiento de Ingresos</h3>
            <div id="revenue-chart"></div>
          </div>
        </div>

        <!-- View 2: Clinics Directory -->
        <div id="view-clinics" class="view-panel">
          <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Directorio de Clínicas</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre de Clínica</th>
                  <th>Plan Actual</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="clinics-table-body">
                <!-- Rendered dynamically -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- View 3: Plans & Subscriptions -->
        <div id="view-plans" class="view-panel">
          <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Suscripciones y Pricing</h2>
          <div class="dashboard-cards">
            <div class="card">
              <h3 style="margin-bottom: 12px; font-size: 18px;">Plan Básico</h3>
              <div class="card-value" style="font-size: 24px; color: var(--color-text-primary);">$49 <span style="font-size: 14px; font-weight: 400; color: var(--color-text-secondary);">/ mes</span></div>
              <p style="margin-top: 12px; font-size: 14px; color: var(--color-text-secondary); line-height: 1.5;">Ideal para consultorios individuales. Gestión básica de citas y expedientes.</p>
            </div>
            <div class="card" style="border: 2px solid var(--color-accent); position: relative;">
              <div style="position: absolute; top: -12px; right: 24px; background: var(--color-accent); color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Popular</div>
              <h3 style="margin-bottom: 12px; font-size: 18px;">Plan Profesional</h3>
              <div class="card-value" style="font-size: 24px; color: var(--color-text-primary);">$99 <span style="font-size: 14px; font-weight: 400; color: var(--color-text-secondary);">/ mes</span></div>
              <p style="margin-top: 12px; font-size: 14px; color: var(--color-text-secondary); line-height: 1.5;">Para clínicas con múltiples doctores. Incluye roles y analíticas avanzadas.</p>
            </div>
            <div class="card">
              <h3 style="margin-bottom: 12px; font-size: 18px;">Plan Enterprise</h3>
              <div class="card-value" style="font-size: 24px; color: var(--color-text-primary);">A Medida</div>
              <p style="margin-top: 12px; font-size: 14px; color: var(--color-text-secondary); line-height: 1.5;">Para redes de clínicas y hospitales. API, integraciones y soporte prioritario.</p>
            </div>
          </div>
        </div>

        <!-- =========================
             MODULE B: CLINIC ADMIN
             ========================= -->
             
        <!-- Operative Dashboard -->
        <div id="view-clinic-dashboard" class="view-panel">
          <div class="dashboard-cards">
            <div class="card">
              <div class="card-title">Citas de Hoy</div>
              <div class="card-value">42</div>
              <div style="font-size: 12px; color: #2E7D32; margin-top: 8px; font-weight: 500;">+5 desde ayer</div>
            </div>
            <div class="card">
              <div class="card-title">Tasa de No-Show</div>
              <div class="card-value">12%</div>
              <div style="font-size: 12px; color: #D32F2F; margin-top: 8px; font-weight: 500;">Promedio mensual 10%</div>
            </div>
            <div class="card">
              <div class="card-title">Ingresos del Día</div>
              <div class="card-value">$1,250</div>
            </div>
          </div>
          <div class="card">
            <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">Mapa de Calor (Horarios Concurridos)</h3>
            <div class="heatmap-row">
              <div class="heatmap-cell" data-intensity="1">8a</div>
              <div class="heatmap-cell" data-intensity="2">9a</div>
              <div class="heatmap-cell" data-intensity="4">10a</div>
              <div class="heatmap-cell" data-intensity="3">11a</div>
              <div class="heatmap-cell" data-intensity="1">12p</div>
              <div class="heatmap-cell" data-intensity="0">1p</div>
              <div class="heatmap-cell" data-intensity="0">2p</div>
              <div class="heatmap-cell" data-intensity="2">3p</div>
              <div class="heatmap-cell" data-intensity="3">4p</div>
            </div>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin-top: 12px;">El color más oscuro indica mayor volumen histórico de citas.</p>
          </div>
        </div>

        <!-- Centralized Interactive Agenda -->
        <div id="view-clinic-agenda" class="view-panel">
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px; align-items: center; flex-wrap: wrap; gap: 16px;">
            <h2 style="font-size: 24px; font-weight: 600;">Agenda Centralizada</h2>
            <div>
              <select style="padding: 10px 16px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-family: var(--font-family); outline: none;">
                <option>Todos los Doctores</option>
                <option>Dra. María González</option>
                <option>Dr. Juan Pérez</option>
              </select>
            </div>
          </div>
          <div class="calendar-grid">
            <div class="calendar-day"><div class="calendar-day-header">Lun 12</div><div class="appointment-chip">09:00 - Consulta G.</div><div class="appointment-chip">10:30 - Limpieza</div></div>
            <div class="calendar-day"><div class="calendar-day-header">Mar 13</div><div class="appointment-chip">11:00 - Ortodoncia</div></div>
            <div class="calendar-day"><div class="calendar-day-header">Mie 14</div><div class="appointment-chip">14:00 - Endodoncia</div><div class="appointment-chip">15:00 - Revisión</div></div>
            <div class="calendar-day"><div class="calendar-day-header">Jue 15</div><div class="appointment-chip">09:00 - Consulta G.</div></div>
            <div class="calendar-day"><div class="calendar-day-header">Vie 16</div><div class="appointment-chip" style="background:#E8E6E1; color:var(--color-text-primary);">Disponible</div></div>
            <div class="calendar-day"><div class="calendar-day-header">Sab 17</div></div>
            <div class="calendar-day"><div class="calendar-day-header">Dom 18</div></div>
          </div>
        </div>

        <!-- CRM / Quick Record -->
        <div id="view-clinic-crm" class="view-panel">
          <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Directorio de Pacientes (CRM)</h2>
          <div style="margin-bottom: 24px;">
            <input type="text" placeholder="Buscar por DNI o Teléfono..." style="width: 100%; max-width: 400px; padding: 12px 16px; border: 1px solid var(--color-border); border-radius: 8px; font-family: var(--font-family); outline: none;">
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Contacto</th>
                  <th>Última Visita</th>
                  <th>Alertas Médicas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Carlos López</td>
                  <td>+52 555 123 4567</td>
                  <td>Hace 2 meses</td>
                  <td><span class="badge" style="background:#FFF3E0; color:#E65100;">Alérgico a Penicilina</span></td>
                  <td><button class="btn-action">Ver Historial</button></td>
                </tr>
                <tr>
                  <td>Ana Martínez</td>
                  <td>+52 555 987 6543</td>
                  <td>Hace 1 año</td>
                  <td><span class="badge" style="background:#E8F5E9; color:#2E7D32;">Ninguna</span></td>
                  <td><button class="btn-action">Ver Historial</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Medical Availability -->
        <div id="view-clinic-availability" class="view-panel">
          <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Disponibilidad Médica</h2>
          <div class="card">
            <h3 style="margin-bottom: 20px; font-size: 16px; font-weight: 600;">Dra. María González - Horarios</h3>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 16px; align-items: center; border-bottom: 1px solid var(--color-border); padding-bottom: 16px; margin-bottom: 16px;">
              <div style="font-weight: 500; color: var(--color-text-secondary);">Lunes a Viernes</div>
              <div style="color: var(--color-text-primary);">09:00 AM - 14:00 PM <span style="color:var(--color-border); margin:0 8px;">|</span> 16:00 PM - 19:00 PM</div>
            </div>
            <button class="btn-primary" style="width: auto; font-size: 14px; padding: 10px 16px;">Editar Horarios</button>
          </div>
        </div>

        <!-- Billing & Payments -->
        <div id="view-clinic-billing" class="view-panel">
          <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Facturación y Cobranza</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Paciente</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 500;">#ORD-001</td>
                  <td>Carlos López</td>
                  <td style="font-weight: 600;">$150.00</td>
                  <td><span class="badge" style="background:#FFF3E0; color:#E65100;">Pago Parcial</span></td>
                  <td><button class="btn-action">Registrar Pago</button></td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">#ORD-002</td>
                  <td>Ana Martínez</td>
                  <td style="font-weight: 600;">$80.00</td>
                  <td><span class="badge" style="background:#FFEBEE; color:#C62828;">Pendiente</span></td>
                  <td><button class="btn-action">Registrar Pago</button></td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">#ORD-003</td>
                  <td>Luis Gómez</td>
                  <td style="font-weight: 600;">$200.00</td>
                  <td><span class="badge" style="background:#E8F5E9; color:#2E7D32;">Pagado</span></td>
                  <td><button class="btn-action">Ver Recibo</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- =========================
             MODULE C: DOCTOR
             ========================= -->
             
        <!-- Daily Specialist Agenda -->
        <div id="view-doctor-agenda" class="view-panel">
          <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Mi Agenda Diaria</h2>
          <div class="card" style="max-width: 600px;">
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div style="font-weight: 600; color: var(--color-text-primary);">09:00 AM - Carlos López</div>
                <div style="font-size: 14px; color: var(--color-text-secondary); margin-top: 6px;">Consulta General - Cubículo 1</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div style="font-weight: 600; color: var(--color-text-primary);">10:30 AM - Ana Martínez</div>
                <div style="font-size: 14px; color: var(--color-text-secondary); margin-top: 6px;">Limpieza Dental - Cubículo 2</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot" style="border-color: #E8E6E1;"></div>
                <div style="font-weight: 600; color: var(--color-text-secondary);">12:00 PM - Bloqueo</div>
                <div style="font-size: 14px; color: var(--color-text-secondary); margin-top: 6px;">Almuerzo</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactive Odontogram and History -->
        <div id="view-doctor-odontogram" class="view-panel">
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px; align-items: center; flex-wrap: wrap; gap: 16px;">
            <h2 style="font-size: 24px; font-weight: 600;">Historia Clínica y Odontograma</h2>
            <div style="font-weight: 600; padding: 8px 16px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px;">Paciente: Carlos López</div>
          </div>
          
          <div class="card" style="margin-bottom: 24px;">
            <h3 style="margin-bottom: 20px; font-size: 16px; font-weight: 600;">Odontograma (Arcada Superior)</h3>
            <div class="odontogram-grid">
              <div class="tooth"><div class="tooth-number">18</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">17</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">16</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">15</div><div class="tooth-icon" style="background:#FFEBEE; border-color:#C62828;"></div></div>
              <div class="tooth"><div class="tooth-number">14</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">13</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">12</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">11</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">21</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">22</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">23</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">24</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">25</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">26</div><div class="tooth-icon" style="background:#E8F5E9; border-color:#2E7D32;"></div></div>
              <div class="tooth"><div class="tooth-number">27</div><div class="tooth-icon"></div></div>
              <div class="tooth"><div class="tooth-number">28</div><div class="tooth-icon"></div></div>
            </div>
            <p style="font-size: 13px; color: var(--color-text-secondary);">Selecciona una pieza para agregar hallazgos o tratamientos.</p>
          </div>

          <div class="card">
            <h3 style="margin-bottom: 16px; font-size: 16px; font-weight: 600;">Notas Clínicas de la Sesión</h3>
            <textarea style="width: 100%; height: 140px; padding: 16px; border: 1px solid var(--color-border); border-radius: 8px; font-family: var(--font-family); font-size: 14px; outline: none; resize: vertical;" placeholder="Escribe aquí las observaciones, diagnóstico y plan de tratamiento..."></textarea>
            <div style="margin-top: 20px; text-align: right;">
              <button class="btn-primary" style="width: auto; padding: 10px 24px;">Guardar Evolución</button>
            </div>
          </div>
        </div>
        
        <!-- =========================
             PLACEHOLDER FOR OTHER ROLES
             ========================= -->
        <div id="view-placeholder" class="view-panel">
          <h2 style="margin-bottom: 16px; font-size: 24px; font-weight: 600;">Módulo en Construcción</h2>
          <div class="card">
            <p style="color: var(--color-text-secondary); font-size: 15px; line-height: 1.6;">
              Esta vista corresponde a una responsabilidad específica del rol actual (<span id="placeholder-role-name" style="font-weight: 600;"></span>). 
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>

  <script>
    /**
     * Frontend Application Logic - OdontoCare IA
     * Handles role-based access, view routing, and module A features.
     */
    const app = {
      role: null,
      isImpersonating: false,
      impersonatedClinic: null,
      chartInstance: null,

      init() {
        this.renderClinics();
      },

      login() {
        const roleSelect = document.getElementById('role-select');
        this.role = roleSelect.value;
        
        document.getElementById('auth-view').style.display = 'none';
        document.getElementById('app-view').style.display = 'flex';
        
        this.setupRoleEnvironment();
      },

      logout() {
        this.role = null;
        this.stopImpersonation();
        document.getElementById('auth-view').style.display = 'flex';
        document.getElementById('app-view').style.display = 'none';
      },

      setupRoleEnvironment() {
        const roleNames = {
          'SUPER_ADMIN': 'Súper Administrador',
          'CLINIC_ADMIN': 'Admin de Clínica',
          'DOCTOR': 'Doctor / Especialista'
        };
        
        document.getElementById('current-user-role').innerText = roleNames[this.role];
        document.getElementById('current-user-name').innerText = 'Juan Pérez';
        document.getElementById('placeholder-role-name').innerText = roleNames[this.role];

        this.renderSidebar();
      },

      renderSidebar() {
        const navMenu = document.getElementById('nav-menu');
        navMenu.innerHTML = '';

        let items = [];

        // Role-based Views Logic (Single Responsibility routing)
        if (this.role === 'SUPER_ADMIN') {
          items = [
            { id: 'global-dashboard', label: 'Dashboard Global', view: 'view-global-dashboard' },
            { id: 'clinics', label: 'Directorio de Clínicas', view: 'view-clinics' },
            { id: 'plans', label: 'Planes y Pricing', view: 'view-plans' }
          ];
        } else if (this.role === 'CLINIC_ADMIN') {
          items = [
            { id: 'clinic-dashboard', label: 'Resumen Operativo', view: 'view-clinic-dashboard' },
            { id: 'clinic-agenda', label: 'Agenda Centralizada', view: 'view-clinic-agenda' },
            { id: 'clinic-crm', label: 'Directorio CRM', view: 'view-clinic-crm' },
            { id: 'clinic-availability', label: 'Disponibilidad Médica', view: 'view-clinic-availability' },
            { id: 'clinic-billing', label: 'Facturación y Cobranza', view: 'view-clinic-billing' }
          ];
        } else if (this.role === 'DOCTOR') {
          items = [
            { id: 'doctor-agenda', label: 'Mi Agenda Diaria', view: 'view-doctor-agenda' },
            { id: 'doctor-odontogram', label: 'Odontograma e Historia', view: 'view-doctor-odontogram' }
          ];
        }

        items.forEach((item, index) => {
          const div = document.createElement('div');
          div.className = 'nav-item' + (index === 0 ? ' active' : '');
          div.innerText = item.label;
          div.onclick = () => this.navigate(item, div);
          navMenu.appendChild(div);
        });

        if (items.length > 0) {
          this.navigate(items[0], navMenu.firstChild);
        }
      },

      navigate(item, element) {
        // Menu activation
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (element) element.classList.add('active');

        // Header update
        document.getElementById('header-title').innerText = item.label;

        // View switching
        document.querySelectorAll('.view-panel').forEach(el => el.classList.remove('active'));
        const targetView = document.getElementById(item.view);
        if (targetView) {
          targetView.classList.add('active');
        } else {
          document.getElementById('view-placeholder').classList.add('active');
        }

        // Lazy load chart for Global Dashboard
        if (item.view === 'view-global-dashboard') {
          setTimeout(() => this.renderChart(), 100);
        }
      },

      renderChart() {
        if (this.chartInstance) return; // Prevent re-rendering

        const options = {
          series: [{
            name: 'MRR (USD)',
            data: [4500, 5200, 6800, 8400, 10500, 12200, 15400]
          }],
          chart: {
            type: 'area',
            height: 320,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false }
          },
          colors: ['#C4A484'],
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              opacityTo: 0.05,
              stops: [0, 90, 100]
            }
          },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth', width: 3 },
          xaxis: {
            categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: {
            labels: {
              formatter: (value) => "$" + value
            }
          },
          grid: {
            borderColor: '#E8E6E1',
            strokeDashArray: 4,
          }
        };

        const chartEl = document.querySelector("#revenue-chart");
        if (chartEl) {
          chartEl.innerHTML = '';
          this.chartInstance = new ApexCharts(chartEl, options);
          this.chartInstance.render();
        }
      },

      renderClinics() {
        const clinics = [
          { id: 1, name: 'Dental Care Center', plan: 'Profesional', status: 'Activo' },
          { id: 2, name: 'Sonrisas Perfectas', plan: 'Básico', status: 'Activo' },
          { id: 3, name: 'Clínica Odontológica Sur', plan: 'Enterprise', status: 'Activo' },
          { id: 4, name: 'Dra. María González', plan: 'Básico', status: 'Activo' }
        ];

        const tbody = document.getElementById('clinics-table-body');
        tbody.innerHTML = '';

        clinics.forEach(clinic => {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td><strong>\${clinic.name}</strong></td>
            <td>\${clinic.plan}</td>
            <td><span class="badge">\${clinic.status}</span></td>
            <td>
              <button class="btn-action" onclick="app.impersonate('\${clinic.name}')">Ingresar a Clínica</button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
      },

      impersonate(clinicName) {
        this.isImpersonating = true;
        this.impersonatedClinic = clinicName;
        
        document.getElementById('impersonation-banner').style.display = 'block';
        document.getElementById('impersonated-clinic-name').innerText = clinicName;
        
        // Impersonate behavior: Act as a CLINIC_ADMIN
        this.role = 'CLINIC_ADMIN';
        this.setupRoleEnvironment();
      },

      stopImpersonation() {
        if (!this.isImpersonating) return;
        
        this.isImpersonating = false;
        this.impersonatedClinic = null;
        
        document.getElementById('impersonation-banner').style.display = 'none';
        
        // Revert to SUPER_ADMIN
        this.role = 'SUPER_ADMIN';
        this.setupRoleEnvironment();
      }
    };

    // Initialize application when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      app.init();
    });
  </script>
</body>
</html>`;
}
