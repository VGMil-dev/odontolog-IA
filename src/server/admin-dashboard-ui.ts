/**
 * OdontoCare IA — Torre de Control Administrativa & Dashboard Multi-Tenant
 * Estilo visual premium inspirado en la interfaz oscura AIZCRM (Graphite #14171A + Emerald #00D26A).
 * Incorpora Sidebar izquierdo fijo con píldoras activas, Tarjeta de Directora Médica,
 * Cuadrícula Bento de 7 métricas clave, Conexión QR WhatsApp (Evolution API v2),
 * Configuración Telegram por clínica, Auditoría de los 6 Flujos y Playground IA con Inspector.
 */

export function getAdminDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OdontoCare AI — Torre de Control Multi-Tenant</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #14171A;
      --bg-sidebar: #181B20;
      --bg-card: #1F2328;
      --bg-card-elevated: #242930;
      --bg-hover: #2B313A;
      --border: rgba(255, 255, 255, 0.08);
      --border-subtle: rgba(255, 255, 255, 0.04);
      --border-focus: #00D26A;
      
      /* Acentos cromáticos */
      --accent-emerald: #00D26A;
      --accent-emerald-dim: rgba(0, 210, 106, 0.15);
      --accent-emerald-glow: rgba(0, 210, 106, 0.35);
      --accent-blue: #3B82F6;
      --accent-blue-dim: rgba(59, 130, 246, 0.15);
      --accent-coral: #FF6B4A;
      --accent-cyan: #06B6D4;
      --accent-amber: #F59E0B;
      
      /* Tipografía */
      --text-main: #FFFFFF;
      --text-muted: #8E9BAE;
      --text-dim: #64748B;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ================= LOGIN VIEW ================= */
    #auth-view {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
      padding: 24px;
      background: radial-gradient(circle at 50% 20%, #1e242b 0%, #14171a 70%);
      position: fixed;
      inset: 0;
      z-index: 1000;
    }

    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 20px;
      animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .login-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 6px;
    }

    .logo-mark {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #00D26A 0%, #059669 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px var(--accent-emerald-glow);
    }

    .logo-mark svg {
      width: 26px;
      height: 26px;
      fill: #0B132B;
    }

    /* ================= APP SHELL LAYOUT ================= */
    #app-view {
      display: none;
      width: 100vw;
      min-height: 100vh;
      flex-direction: row;
    }

    /* 1. SIDEBAR IZQUIERDO */
    aside.sidebar {
      width: 260px;
      min-width: 260px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 50;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 8px 24px 8px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 20px;
    }

    .sidebar-brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sidebar-brand-badge {
      font-size: 10px;
      font-weight: 700;
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      padding: 2px 6px;
      border-radius: 6px;
      border: 1px solid var(--accent-emerald);
    }

    nav.sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-item svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      flex-shrink: 0;
    }

    .nav-item:hover {
      background: var(--bg-hover);
      color: #FFFFFF;
    }

    /* PÍLDORA ACTIVA ESTILO AIZCRM */
    .nav-item.active {
      background: var(--accent-emerald);
      color: #0F172A;
      font-weight: 700;
      box-shadow: 0 4px 14px var(--accent-emerald-glow);
    }

    .nav-item.active svg {
      stroke: #0F172A;
    }

    .nav-badge {
      margin-left: auto;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
    }

    .nav-item.active .nav-badge {
      background: rgba(15, 23, 42, 0.2);
      color: #0F172A;
    }

    /* TARJETA CONTRASTE INFERIOR (CUSTOMER METRIC CARD ESTILO SCREENSHOT) */
    .sidebar-customer-metric {
      background: #FFFFFF;
      color: #0F172A;
      border-radius: 18px;
      padding: 18px 14px;
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    }

    .customer-metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
    }

    .customer-metric-avatar-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .customer-metric-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      overflow: hidden;
      border: 2px solid #00D26A;
    }

    .customer-metric-details {
      display: flex;
      flex-direction: column;
    }

    .customer-metric-name {
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
    }

    .customer-metric-sub {
      font-size: 11px;
      color: #64748B;
    }

    .customer-metric-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #E2E8F0;
      padding-top: 10px;
      font-size: 11px;
    }

    .metric-val-bold {
      font-weight: 800;
      font-size: 13px;
      color: #0F172A;
    }

    /* 2. AREA PRINCIPAL */
    .main-canvas {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--bg-base);
    }

    /* TOP HEADER */
    header.top-header {
      padding: 20px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      background: rgba(20, 23, 26, 0.85);
      backdrop-filter: blur(12px);
      z-index: 40;
    }

    .header-title-wrap h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.6px;
      color: #FFFFFF;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .search-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 260px;
      color: var(--text-muted);
    }

    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      color: #FFFFFF;
      font-size: 13px;
      width: 100%;
      font-family: var(--font-sans);
    }

    .search-box svg {
      width: 16px;
      height: 16px;
      stroke: var(--text-muted);
      flex-shrink: 0;
    }

    .icon-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: var(--bg-hover);
      color: #FFFFFF;
    }

    .icon-btn-dot {
      width: 8px;
      height: 8px;
      background: var(--accent-coral);
      border-radius: 50%;
      position: absolute;
      top: 9px;
      right: 9px;
      border: 2px solid var(--bg-card);
    }

    .user-profile-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 6px 14px 6px 8px;
      border-radius: 30px;
    }

    .user-profile-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--accent-emerald-dim);
      border: 1px solid var(--accent-emerald);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .user-profile-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-name {
      font-size: 12px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .user-role {
      font-size: 10px;
      color: var(--text-muted);
    }

    .btn-logout {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      transition: color 0.2s;
    }

    .btn-logout:hover {
      color: var(--accent-coral);
    }

    /* CONTENEDOR DE CONTENIDO DE PESTAÑAS */
    main.content-area {
      padding: 28px 32px 60px 32px;
      flex: 1;
      width: 100%;
      max-width: 1560px;
      margin: 0 auto;
    }

    .tab-panel {
      display: none;
      animation: fadeIn 0.25s ease forwards;
    }

    .tab-panel.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ================= BENTO GRID (PESTAÑA OVERVIEW) ================= */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 20px;
    }

    .bento-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      transition: border-color 0.2s;
    }

    .bento-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .card-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .pill-btn {
      background: var(--bg-hover);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .pill-btn:hover {
      color: #FFFFFF;
      background: var(--bg-card-elevated);
    }

    /* 1. CARD TOTAL SALES / CITAS (Col 4) */
    .col-sales {
      grid-column: span 4;
    }

    .sales-number-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin: 12px 0 20px 0;
    }

    .sales-big-number {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -1px;
      color: #FFFFFF;
    }

    .badge-growth {
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .btn-view-chart {
      background: #FFFFFF;
      color: #0F172A;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 140px;
      transition: transform 0.15s;
    }

    .btn-view-chart:hover {
      transform: translateY(-2px);
    }

    /* 2. CARD VISITOR ONLINE (Col 4) */
    .col-visitors {
      grid-column: span 4;
    }

    .chart-container-svg {
      width: 100%;
      height: 120px;
      position: relative;
      margin-top: 10px;
    }

    .chart-tooltip-badge {
      position: absolute;
      top: 8px;
      left: 45%;
      background: #FFFFFF;
      color: #0F172A;
      font-weight: 800;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .chart-days-axis {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 8px;
    }

    /* 3. CARD MARKET SHARE / CANALES (Col 4) */
    .col-market {
      grid-column: span 4;
    }

    .channel-progress-wrap {
      margin-top: 16px;
    }

    .channel-pills-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .channel-pill-tag {
      background: var(--bg-hover);
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }

    .channel-multi-bar {
      height: 12px;
      background: rgba(255,255,255,0.08);
      border-radius: 999px;
      display: flex;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .bar-seg-white {
      width: 25%;
      background: #FFFFFF;
    }

    .bar-seg-emerald {
      width: 55%;
      background: var(--accent-emerald);
    }

    .channel-legend-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 8px;
    }

    /* 4. CARD REVENUE BARS (Col 4) */
    .col-revenue {
      grid-column: span 4;
    }

    .revenue-bars-wrap {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 130px;
      padding-top: 20px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 8px;
    }

    .revenue-bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      height: 100%;
      justify-content: flex-end;
      width: 32px;
    }

    .bar-cylinder {
      width: 100%;
      background: var(--bg-card-elevated);
      border-radius: 8px;
      transition: height 0.3s;
    }

    .bar-cylinder.active-green {
      background: var(--accent-emerald);
      box-shadow: 0 0 16px var(--accent-emerald-glow);
      position: relative;
    }

    .bar-tooltip-pill {
      position: absolute;
      top: -26px;
      left: 50%;
      transform: translateX(-50%);
      background: #FFFFFF;
      color: #0F172A;
      font-weight: 800;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 6px;
      white-space: nowrap;
    }

    .bar-day-label {
      font-size: 11px;
      color: var(--text-dim);
    }

    /* 5. CARD RETENTION RATE (RADIAL GAUGE) (Col 3) */
    .col-retention {
      grid-column: span 3;
      align-items: center;
      text-align: center;
    }

    .gauge-wrapper {
      position: relative;
      width: 170px;
      height: 110px;
      margin: 10px auto;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
    }

    .gauge-center-val {
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 32px;
      font-weight: 800;
      color: #FFFFFF;
    }

    /* 6. CARD TOP DOCTORS / CONCENTRIC DONUT (Col 5) */
    .col-top-doctors {
      grid-column: span 5;
    }

    .doctors-donut-split {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 16px;
      align-items: center;
      margin-top: 8px;
    }

    .donut-ring-wrap {
      position: relative;
      width: 130px;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .donut-center-num {
      position: absolute;
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
    }

    .doctors-list-compact {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .doctor-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-card-elevated);
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid var(--border-subtle);
    }

    .doctor-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .doctor-avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    /* 7. CARD WEEKLY TASKS / BOT WORKFLOWS (Col 12) */
    .col-tasks {
      grid-column: span 12;
    }

    .tasks-header-stats {
      display: flex;
      gap: 32px;
      margin: 12px 0 16px 0;
      align-items: baseline;
    }

    .task-stat-unit {
      display: flex;
      flex-direction: column;
    }

    .task-stat-big {
      font-size: 32px;
      font-weight: 800;
      color: var(--accent-emerald);
    }

    .task-stat-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .gantt-bars-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 14px;
    }

    .gantt-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .gantt-label {
      width: 180px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .gantt-track {
      flex: 1;
      height: 10px;
      background: var(--bg-card-elevated);
      border-radius: 999px;
      overflow: hidden;
      position: relative;
    }

    .gantt-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.4s;
    }

    /* ================= TAB: CLÍNICAS & MULTI-TENANCY ================= */
    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-emerald-cta {
      background: var(--accent-emerald);
      color: #0B132B;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 16px var(--accent-emerald-glow);
      transition: all 0.2s;
    }

    .btn-emerald-cta:hover {
      background: #00E575;
      transform: translateY(-2px);
    }

    .clinics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
      gap: 24px;
    }

    .clinic-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .clinic-card:hover {
      border-color: var(--accent-emerald);
      transform: translateY(-2px);
    }

    .clinic-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .clinic-name {
      font-size: 19px;
      font-weight: 800;
      color: #FFFFFF;
    }

    .clinic-location {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald);
    }

    .clinic-details-box {
      background: var(--bg-card-elevated);
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 13px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-val {
      font-family: var(--font-mono);
      color: #FFFFFF;
      font-weight: 600;
    }

    .doctors-pills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .doctor-pill {
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 12px;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .btn-action-channel {
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-action-channel.wa {
      background: var(--accent-emerald-dim);
      border: 1px solid var(--accent-emerald);
      color: var(--accent-emerald);
    }

    .btn-action-channel.wa:hover {
      background: var(--accent-emerald);
      color: #0B132B;
    }

    .btn-action-channel.tg {
      background: var(--accent-blue-dim);
      border: 1px solid var(--accent-blue);
      color: var(--accent-blue);
    }

    .btn-action-channel.tg:hover {
      background: var(--accent-blue);
      color: #FFFFFF;
    }

    .btn-action-channel.play {
      background: var(--bg-hover);
      border: 1px solid var(--border);
      color: #FFFFFF;
    }

    .btn-action-channel.play:hover {
      background: var(--bg-card-elevated);
      border-color: #FFFFFF;
    }

    /* ================= TAB: FLUJOS DEL BOT ================= */
    .flow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 20px;
    }

    .flow-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    }

    .flow-card-top-bar {
      width: 100%;
      height: 4px;
      background: var(--accent-emerald);
      border-radius: 999px;
      position: absolute;
      top: 0;
      left: 0;
    }

    .flow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .flow-name {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .flow-tag {
      font-family: var(--font-mono);
      font-size: 11px;
      background: var(--accent-emerald-dim);
      border: 1px solid var(--accent-emerald);
      color: var(--accent-emerald);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .flow-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .flow-prompt-box {
      background: var(--bg-card-elevated);
      padding: 10px 14px;
      border-radius: 10px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #CBD5E1;
      border: 1px solid var(--border-subtle);
    }

    /* ================= TAB: CITAS & CALENDARIOS ================= */
    .table-container-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }

    table.styled-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    table.styled-table th {
      background: var(--bg-card-elevated);
      padding: 16px 20px;
      font-weight: 700;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    table.styled-table td {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-subtle);
      color: #FFFFFF;
    }

    table.styled-table tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    /* ================= TAB: PLAYGROUND MULTI-TENANT ================= */
    .playground-split {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      height: 720px;
    }

    .chat-box-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(0,0,0,0.3);
    }

    .chat-box-header {
      padding: 16px 22px;
      background: var(--bg-card-elevated);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-messages-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bubble {
      max-width: 78%;
      padding: 12px 18px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .bubble.bot {
      align-self: flex-start;
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      color: #FFFFFF;
    }

    .bubble.user {
      align-self: flex-end;
      background: var(--accent-emerald);
      color: #0B132B;
      font-weight: 600;
    }

    .chat-form-bar {
      padding: 16px;
      background: var(--bg-card-elevated);
      border-top: 1px solid var(--border);
      display: flex;
      gap: 12px;
    }

    .chat-text-input {
      flex: 1;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 18px;
      color: #FFFFFF;
      outline: none;
      font-size: 14px;
      font-family: var(--font-sans);
    }

    .chat-text-input:focus {
      border-color: var(--accent-emerald);
    }

    .inspector-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      overflow-y: auto;
    }

    .inspector-heading {
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .trace-card {
      background: var(--bg-card-elevated);
      padding: 14px;
      border-radius: 12px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #94A3B8;
      border: 1px solid var(--border-subtle);
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* ================= MODALES ================= */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-backdrop.open {
      display: flex;
    }

    .modal-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 24px;
      max-width: 580px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.7);
      animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .form-input, .form-select {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 16px;
      color: #FFFFFF;
      font-size: 14px;
      font-family: var(--font-sans);
      outline: none;
    }

    .form-input:focus, .form-select:focus {
      border-color: var(--accent-emerald);
    }

    /* QR BOX */
    .qr-box-inner {
      background: #0D1014;
      border: 2px dashed rgba(0, 210, 106, 0.3);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 280px;
      gap: 16px;
    }

    .qr-img {
      max-width: 230px;
      max-height: 230px;
      border-radius: 12px;
      background: white;
      padding: 8px;
    }
  </style>
</head>
<body>

  <!-- ================= AUTH VIEW (LOGIN PROTEGIDO) ================= -->
  <div id="auth-view">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #FFFFFF;">OdontoCare AI</h1>
          <p style="font-size: 12px; color: var(--text-muted);">Torre de Control Administrativa</p>
        </div>
      </div>

      <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">
        Inicia sesión con credenciales maestras para supervisar los agentes autónomos de cada odontología, gestionar calendarios y conectar canales.
      </p>

      <form id="login-form" onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label">Usuario Administrador</label>
          <input type="text" id="login-username" class="form-input" placeholder="admin" value="admin" required />
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña Maestra</label>
          <input type="password" id="login-password" class="form-input" placeholder="••••••••••••" value="odontocare2026" required />
        </div>

        <div id="login-error" style="display: none; color: var(--accent-coral); font-size: 12px; font-weight: 700;">
          ❌ Credenciales inválidas. Por favor verifica usuario y contraseña.
        </div>

        <button type="submit" class="btn-emerald-cta" style="justify-content: center; margin-top: 8px; width: 100%;">
          🔐 Ingresar al Dashboard
        </button>
      </form>
    </div>
  </div>

  <!-- ================= APP SHELL ================= -->
  <div id="app-view">
    
    <!-- 1. BARRA LATERAL IZQUIERDA (SIDEBAR ESTILO AIZCRM) -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo-mark" style="width:36px; height:36px;">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div class="sidebar-brand-title">
          ODONTOCARE <span class="sidebar-brand-badge">2026</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button class="nav-item active" id="btn-nav-overview" onclick="switchNavTab('overview')">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span>Overview</span>
        </button>

        <button class="nav-item" id="btn-nav-clinics" onclick="switchNavTab('clinics')">
          <svg viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h6M12 8v6"></path></svg>
          <span>Clínicas</span>
          <span class="nav-badge" id="nav-clinics-badge">2</span>
        </button>

        <button class="nav-item" id="btn-nav-channels" onclick="switchNavTab('channels')">
          <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path></svg>
          <span>Canales QR</span>
        </button>

        <button class="nav-item" id="btn-nav-flows" onclick="switchNavTab('flows')">
          <svg viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 01-9 9"></path></svg>
          <span>Flujos Bot</span>
          <span class="nav-badge">6</span>
        </button>

        <button class="nav-item" id="btn-nav-appointments" onclick="switchNavTab('appointments')">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>Citas Médicas</span>
        </button>

        <button class="nav-item" id="btn-nav-playground" onclick="switchNavTab('playground')">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
          <span>Playground IA</span>
        </button>
      </nav>

      <!-- TARJETA CONTRASTE BLANCA INFERIOR: DIRECTORA MÉDICA -->
      <div class="sidebar-customer-metric">
        <div class="customer-metric-header">
          <span>Directora Médica ›</span>
          <span style="font-size: 11px; color:#64748B;">Insights</span>
        </div>
        <div class="customer-metric-avatar-wrap">
          <div class="customer-metric-avatar">👩‍⚕️</div>
          <div class="customer-metric-details">
            <div class="customer-metric-name">Dra. Selen Swift</div>
            <div class="customer-metric-sub">⭐ 4.9 | Director General</div>
          </div>
        </div>
        <div class="customer-metric-footer">
          <div>
            <div style="color:#64748B;">Precisión IA</div>
            <div class="metric-val-bold">98.4%</div>
          </div>
          <div style="text-align: right;">
            <div style="color:#64748B;">Citas Activas</div>
            <div class="metric-val-bold">120</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. CANVAS PRINCIPAL -->
    <div class="main-canvas">
      
      <!-- TOP HEADER -->
      <header class="top-header">
        <div class="header-title-wrap">
          <h1 id="page-title">Dashboard</h1>
        </div>

        <div class="header-actions">
          <div class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Buscar clínica, cita o paciente..." />
          </div>

          <button class="icon-btn" title="Notificaciones del Sistema">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg>
            <div class="icon-btn-dot"></div>
          </button>

          <div class="user-profile-chip">
            <div class="user-profile-avatar">🩺</div>
            <div class="user-profile-info">
              <span class="user-name">Selen Swift</span>
              <span class="user-role">Manager OdontoCare</span>
            </div>
          </div>

          <button class="btn-logout" onclick="handleLogout()" title="Cerrar Sesión">Salir</button>
        </div>
      </header>

      <!-- CONTENIDO DINÁMICO DE PESTAÑAS -->
      <main class="content-area">
        
        <!-- ================= PESTAÑA 1: OVERVIEW (BENTO GRID 1-TO-1 REF SCREENSHOT) ================= -->
        <div id="tab-overview" class="tab-panel active">
          <div class="bento-grid">
            
            <!-- CARD 1: TOTAL SALES / CITAS -->
            <div class="bento-card col-sales">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">Total Citas Agendadas</div>
                  <div class="card-subtitle">Sincronizadas con Google Calendar</div>
                </div>
              </div>

              <div class="sales-number-row">
                <div class="sales-big-number" id="overview-total-citas">1,200K</div>
                <div class="badge-growth">+2.1%</div>
              </div>

              <div>
                <button class="btn-view-chart" onclick="switchNavTab('appointments')">
                  <span>Ver Citas</span>
                  <span>↗</span>
                </button>
              </div>
            </div>

            <!-- CARD 2: VISITOR ONLINE / PACIENTES TIEMPO REAL -->
            <div class="bento-card col-visitors">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">Pacientes en Línea</div>
                  <div class="card-subtitle">Consultas simultáneas con agentes</div>
                </div>
                <button class="pill-btn" onclick="switchNavTab('playground')">View</button>
              </div>

              <div class="chart-container-svg">
                <div class="chart-tooltip-badge">112K</div>
                <svg viewBox="0 0 300 100" style="width:100%; height:100%; overflow:visible;">
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#00D26A" stop-opacity="0.3"/>
                      <stop offset="100%" stop-color="#00D26A" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <!-- Fondo degradado -->
                  <path d="M 0 60 Q 50 20, 100 45 T 200 30 T 300 40 L 300 100 L 0 100 Z" fill="url(#curveGrad)" />
                  <!-- Línea punteada de tendencia -->
                  <path d="M 0 60 Q 50 20, 100 45 T 200 30 T 300 40" fill="none" stroke="#00D26A" stroke-width="2.5" stroke-dasharray="4 3" />
                  <!-- Puntos clave -->
                  <circle cx="140" cy="36" r="4" fill="#00D26A" stroke="#FFFFFF" stroke-width="2" />
                  <circle cx="270" cy="38" r="3" fill="#00D26A" />
                </svg>
              </div>
              <div class="chart-days-axis">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <!-- CARD 3: MARKET SHARE / CANALES -->
            <div class="bento-card col-market">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">Distribución Canales</div>
                  <div class="card-subtitle">Efectividad por plataforma</div>
                </div>
                <button class="pill-btn" onclick="switchNavTab('channels')">View</button>
              </div>

              <div class="channel-progress-wrap">
                <div class="channel-pills-row">
                  <div class="channel-pill-tag" style="background: rgba(255,255,255,0.1); color:#fff;">25%</div>
                  <div class="channel-pill-tag" style="background: var(--accent-emerald-dim); color:var(--accent-emerald);">50%</div>
                  <span style="font-size:11px; color:var(--text-dim); margin-left:auto;">75/100%</span>
                </div>

                <div class="channel-multi-bar">
                  <div class="bar-seg-white" title="Telegram"></div>
                  <div class="bar-seg-emerald" title="WhatsApp"></div>
                </div>

                <div class="channel-legend-row">
                  <span>📱 Telegram</span>
                  <span>🟢 WhatsApp (Evolution API)</span>
                </div>
              </div>
            </div>

            <!-- CARD 4: REVENUE / EFICIENCIA SEMANAL -->
            <div class="bento-card col-revenue">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">Eficiencia de Agenda</div>
                  <div class="card-subtitle">Consultas convertidas a citas</div>
                </div>
                <button class="pill-btn">Weekly ▾</button>
              </div>

              <div class="revenue-bars-wrap">
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 40px;"></div>
                  <span class="bar-day-label">Mon</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 65px;"></div>
                  <span class="bar-day-label">Tue</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 55px;"></div>
                  <span class="bar-day-label">Wed</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder active-green" style="height: 90px;">
                    <div class="bar-tooltip-pill">$320</div>
                  </div>
                  <span class="bar-day-label" style="color:var(--accent-emerald); font-weight:700;">Thu</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 50px;"></div>
                  <span class="bar-day-label">Fri</span>
                </div>
              </div>
            </div>

            <!-- CARD 5: RETENTION RATE (RADIAL GAUGE) -->
            <div class="bento-card col-retention">
              <div class="card-header-flex" style="width: 100%;">
                <div class="card-title">Tasa de Retención</div>
                <button class="pill-btn">Weekly ▾</button>
              </div>

              <div class="gauge-wrapper">
                <svg viewBox="0 0 200 120" class="gauge-svg">
                  <!-- Arco gris fondo -->
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="14" stroke-linecap="round" />
                  <!-- Segmentos verdes en abanico -->
                  <path d="M 20 100 A 80 80 0 0 1 140 30" fill="none" stroke="#00D26A" stroke-width="14" stroke-linecap="round" stroke-dasharray="6 4" />
                </svg>
                <div class="gauge-center-val">72<span style="font-size: 18px; color:var(--text-muted);">%</span></div>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                Pacientes que confirman asistencia
              </div>
            </div>

            <!-- CARD 6: TOP CUSTOMERS / DOCTORES -->
            <div class="bento-card col-top-doctors">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">Doctores & Especialidades</div>
                  <div class="card-subtitle">Demanda por tipo de tratamiento</div>
                </div>
                <button class="pill-btn">Weekly ▾</button>
              </div>

              <div class="doctors-donut-split">
                <div class="donut-ring-wrap">
                  <svg viewBox="0 0 120 120" style="width:100%; height:100%; transform: rotate(-90deg);">
                    <!-- Anillo exterior Coral -->
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#FF6B4A" stroke-width="7" stroke-dasharray="120 200" stroke-linecap="round"/>
                    <!-- Anillo medio Azul -->
                    <circle cx="60" cy="60" r="40" fill="none" stroke="#3B82F6" stroke-width="7" stroke-dasharray="160 100" stroke-linecap="round"/>
                    <!-- Anillo interno Verde -->
                    <circle cx="60" cy="60" r="30" fill="none" stroke="#00D26A" stroke-width="7" stroke-dasharray="140 100" stroke-linecap="round"/>
                  </svg>
                  <div class="donut-center-num">720<span style="font-size:12px; color:var(--text-dim);">k</span></div>
                </div>

                <div class="doctors-list-compact">
                  <div class="doctor-item-row">
                    <div class="doctor-item-left">
                      <div class="doctor-avatar-circle">👨‍⚕️</div>
                      <div>
                        <div style="font-size:12px; font-weight:700;">Dr. Devon Lane</div>
                        <div style="font-size:11px; color:var(--text-dim);">Cirugía Oral</div>
                      </div>
                    </div>
                    <span style="font-size:11px; color:var(--accent-emerald);">🟢 Activo</span>
                  </div>

                  <div class="doctor-item-row">
                    <div class="doctor-item-left">
                      <div class="doctor-avatar-circle">👩‍⚕️</div>
                      <div>
                        <div style="font-size:12px; font-weight:700;">Dra. Gabriela Morales</div>
                        <div style="font-size:11px; color:var(--text-dim);">Ortodoncia</div>
                      </div>
                    </div>
                    <span style="font-size:11px; color:var(--accent-emerald);">🟢 Activo</span>
                  </div>

                  <div class="doctor-item-row">
                    <div class="doctor-item-left">
                      <div class="doctor-avatar-circle">👨‍⚕️</div>
                      <div>
                        <div style="font-size:12px; font-weight:700;">Dr. Carlos Vega</div>
                        <div style="font-size:11px; color:var(--text-dim);">Odont. General</div>
                      </div>
                    </div>
                    <span style="font-size:11px; color:var(--accent-emerald);">🟢 Activo</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 7: FLUIDEZ DE TRABAJO & TAREAS DEL AGENTE (Col 12) -->
            <div class="bento-card col-tasks">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">Progreso Semanal de Flujos y Triajes Clínicos</div>
                  <div class="card-subtitle">Ejecución continua de guardrails ISO/LOPDP</div>
                </div>
                <div style="font-size:12px; font-weight:700; color:var(--accent-emerald);">
                  7/10 Tareas Completadas
                </div>
              </div>

              <div class="tasks-header-stats">
                <div class="task-stat-unit">
                  <div class="task-stat-big">70%</div>
                  <div class="task-stat-label">Citas Validadas sin Fricción</div>
                </div>
                <div class="task-stat-unit">
                  <div class="task-stat-big">32%</div>
                  <div class="task-stat-label">Más Rápido que el Mes Anterior</div>
                </div>
                <div style="margin-left:auto; display:flex; align-items:center; gap:12px; background:var(--bg-card-elevated); padding:8px 16px; border-radius:12px;">
                  <span style="font-size: 20px;">🤖</span>
                  <div>
                    <div style="font-size:12px; font-weight:700;">Valeria IA en Turno</div>
                    <div style="font-size:11px; color:var(--text-muted);">Sin caídas en 24h</div>
                  </div>
                  <button class="pill-btn" style="background:var(--accent-emerald); color:#0F172A;" onclick="switchNavTab('playground')">Chatear</button>
                </div>
              </div>

              <div class="gantt-bars-container">
                <div class="gantt-row">
                  <span class="gantt-label">Triaje EVA 1-10</span>
                  <div class="gantt-track">
                    <div class="gantt-fill" style="width: 85%; background: #FF6B4A;"></div>
                  </div>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);">85%</span>
                </div>

                <div class="gantt-row">
                  <span class="gantt-label">Consentimiento LOPDP</span>
                  <div class="gantt-track">
                    <div class="gantt-fill" style="width: 100%; background: #00D26A;"></div>
                  </div>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--accent-emerald);">100%</span>
                </div>

                <div class="gantt-row">
                  <span class="gantt-label">Google Calendar Sync</span>
                  <div class="gantt-track">
                    <div class="gantt-fill" style="width: 92%; background: #3B82F6;"></div>
                  </div>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--accent-blue);">92%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ================= PESTAÑA 2: CLÍNICAS (MULTI-TENANCY) ================= -->
        <div id="tab-clinics" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">🏥 Odontologías Registradas & Agentes Activos</h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Cada clínica cuenta con su propio bot de IA, doctores, catálogo de precios y Google Calendar dedicado.
              </p>
            </div>
            <button class="btn-emerald-cta" onclick="openNewClinicModal()">
              <span>+</span> Conectar Nueva Odontología
            </button>
          </div>

          <div class="clinics-grid" id="clinics-container">
            <!-- Inyectado vía JavaScript -->
          </div>
        </div>

        <!-- ================= PESTAÑA 3: CANALES (WHATSAPP QR & TELEGRAM) ================= -->
        <div id="tab-channels" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">📱 Conexión Multicanal (WhatsApp & Telegram)</h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Conecta tus instancias de WhatsApp escaneando el código QR en vivo o configura tokens de bots de Telegram.
              </p>
            </div>
          </div>

          <div class="bento-grid">
            <div class="bento-card" style="grid-column: span 6;">
              <div class="card-header-flex">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:24px;">🟢</span>
                  <div>
                    <div class="card-title">Evolution API (WhatsApp v2)</div>
                    <div class="card-subtitle">Servicio local en http://localhost:8080</div>
                  </div>
                </div>
                <span class="badge-status" id="evolution-api-status">🟢 Conectado</span>
              </div>
              <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:16px;">
                Permite conectar WhatsApp en segundos mediante un código QR sin riesgo de baneo ni configuración compleja.
              </p>
              <div style="display:flex; gap:12px;">
                <button class="btn-emerald-cta" onclick="openWhatsappModal('odontocare_cuenca')">
                  Escanea QR Cuenca
                </button>
                <button class="pill-btn" onclick="openWhatsappModal('dental_plus_quito')">
                  Escanea QR Quito
                </button>
              </div>
            </div>

            <div class="bento-card" style="grid-column: span 6;">
              <div class="card-header-flex">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:24px;">✈️</span>
                  <div>
                    <div class="card-title">Telegram Bot Gateway</div>
                    <div class="card-subtitle">Polling y Webhooks nativos</div>
                  </div>
                </div>
                <span class="badge-status">🟢 Operativo</span>
              </div>
              <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:16px;">
                Asigna a cada odontología un token individual de BotFather para atender a los pacientes en Telegram.
              </p>
              <div>
                <button class="pill-btn" style="background:var(--accent-blue-dim); color:var(--accent-blue);" onclick="openTelegramModal('odontocare_cuenca')">
                  Configurar Bot Token
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= PESTAÑA 4: FLUJOS DEL BOT ================= -->
        <div id="tab-flows" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">🔀 Flujos Conversacionales Auditados (Estándar 2026)</h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Verifica cada una de las ramas de decisión clínica, cumplimiento ISO 42001, LOPDP y sincronización.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size:13px; color:var(--text-muted);">Auditar para:</span>
              <select id="flow-clinic-selector" class="form-select" style="width: 220px;" onchange="renderFlows()">
                <!-- Inyectado vía JS -->
              </select>
            </div>
          </div>

          <div class="flow-grid" id="flows-container">
            <!-- Inyectado vía JS -->
          </div>
        </div>

        <!-- ================= PESTAÑA 5: CITAS & CALENDARIOS ================= -->
        <div id="tab-appointments" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">📅 Citas Agendadas en Google Calendar</h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Historial y turnos reservados en tiempo real con bloqueo atómico contra colisiones.
              </p>
            </div>
            <button class="pill-btn" onclick="fetchAppointments()">🔄 Actualizar Agenda</button>
          </div>

          <div class="table-container-card">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>ID Cita</th>
                  <th>Odontología</th>
                  <th>Doctor Asignado</th>
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="appointments-tbody">
                <tr>
                  <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">
                    Cargando citas...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ================= PESTAÑA 6: PLAYGROUND MULTI-TENANT ================= -->
        <div id="tab-playground" class="tab-panel">
          <div class="playground-split">
            <div class="chat-box-card">
              <div class="chat-box-header">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size: 24px;">🤖</span>
                  <div>
                    <strong id="chat-agent-name" style="font-size:15px; color:#FFFFFF;">Valeria IA</strong>
                    <div style="font-size:11px; color:var(--text-muted);" id="chat-agent-clinic">Clínica OdontoCare Cuenca</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:12px; color:var(--text-muted);">Clínica Activa:</span>
                  <select id="chat-clinic-selector" class="form-select" style="padding:6px 12px; font-size:13px;" onchange="onChatClinicChange()">
                    <!-- Inyectado vía JS -->
                  </select>
                </div>
              </div>

              <div class="chat-messages-scroll" id="chat-messages-container">
                <div class="bubble bot">
                  ¡Hola! Soy Valeria, tu asistente clínica con Inteligencia Artificial. ¿En qué te puedo colaborar hoy? Puedes consultar precios de tratamientos, doctores o agendar una cita para esta semana.
                </div>
              </div>

              <form class="chat-form-bar" onsubmit="sendPlaygroundMessage(event)">
                <input type="text" id="chat-input-text" class="chat-text-input" placeholder="Pregunta algo al agente (ej. ¿Cuánto cuesta la profilaxis?)..." autocomplete="off" />
                <button type="submit" class="btn-emerald-cta">Enviar</button>
              </form>
            </div>

            <div class="inspector-card">
              <div class="inspector-heading">
                <span>🔍</span> Inspector de Razonamiento
              </div>
              <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">
                Supervisa los llamados de función (Tools), el modelo ejecutado y las directrices ISO/LOPDP en vivo.
              </p>

              <div class="form-group">
                <label class="form-label">Modelo LLM</label>
                <div id="trace-model" class="trace-card">gemini-2.5-flash / SOTA 2026</div>
              </div>

              <div class="form-group">
                <label class="form-label">Latencia Inferencia</label>
                <div id="trace-latency" class="trace-card">- ms</div>
              </div>

              <div class="form-group">
                <label class="form-label">Herramientas Ejecutadas</label>
                <div id="trace-tools" class="trace-card">Ninguna</div>
              </div>

              <div class="form-group">
                <label class="form-label">Trazabilidad ISO 42001 & LOPDP</label>
                <div id="trace-steps" class="trace-card">Consentimiento y Transparencia activos.</div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>

  <!-- ================= MODALES DE GESTIÓN ================= -->

  <!-- MODAL 1: WHATSAPP QR (BUILDERBOT STYLE) -->
  <div class="modal-backdrop" id="modal-whatsapp-qr">
    <div class="modal-card" style="max-width: 480px; text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 19px; font-weight: 800; color: #FFFFFF;">Conectar WhatsApp (Código QR)</h2>
        <button onclick="closeWhatsAppModal()" style="background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <p style="font-size: 13px; color: var(--text-muted);" id="wa-modal-subtitle">
        Escanea el código con la cámara de WhatsApp para vincular este agente.
      </p>

      <div class="qr-box-inner" id="wa-qr-container">
        <div style="color: var(--text-muted); font-size: 14px;" id="wa-qr-loader">
          🔄 Generando código QR seguro desde Evolution API...
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: var(--text-muted); text-align: left; background: var(--bg-card-elevated); padding: 14px; border-radius: 12px;">
        <div>1. Abre <strong>WhatsApp</strong> en tu teléfono móvil.</div>
        <div>2. Ve a <strong>Ajustes / Menú</strong> > <strong>Dispositivos vinculados</strong>.</div>
        <div>3. Toca <strong>Vincular un dispositivo</strong> y apunta al código QR.</div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button class="pill-btn" onclick="refreshWhatsAppQr()">🔄 Actualizar QR</button>
        <button class="btn-emerald-cta" onclick="closeWhatsAppModal()">Listo</button>
      </div>
    </div>
  </div>

  <!-- MODAL 2: TELEGRAM BOT TOKEN -->
  <div class="modal-backdrop" id="modal-telegram">
    <div class="modal-card" style="max-width: 500px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 19px; font-weight: 800; color: #FFFFFF;">Conectar Bot de Telegram</h2>
        <button onclick="closeTelegramModal()" style="background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <p style="font-size: 13px; color: var(--text-muted);">
        Introduce el bot token generado por <strong>@BotFather</strong> para este consultorio.
      </p>

      <form onsubmit="saveTelegramSettings(event)" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Telegram Bot Token</label>
          <input type="text" id="tg-modal-token" class="form-input" placeholder="8666836818:AAG9eabBOhZAwEGrnYYnePA..." required />
        </div>
        <div class="form-group">
          <label class="form-label">Admin Chat ID (Opcional)</label>
          <input type="text" id="tg-modal-admin" class="form-input" placeholder="1988257422" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <button type="button" class="pill-btn" onclick="closeTelegramModal()">Cancelar</button>
          <button type="submit" class="btn-emerald-cta">Guardar Token</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL 3: NUEVA ODONTOLOGÍA -->
  <div class="modal-backdrop" id="modal-new-clinic">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 19px; font-weight: 800; color: #FFFFFF;">Conectar Nueva Odontología</h2>
        <button onclick="closeNewClinicModal()" style="background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <form id="form-new-clinic" onsubmit="submitNewClinic(event)" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Identificador Slug (sin espacios)</label>
          <input type="text" id="new-clinic-id" class="form-input" placeholder="ej. clinica_manta" required />
        </div>

        <div class="form-group">
          <label class="form-label">Nombre Comercial de la Clínica</label>
          <input type="text" id="new-clinic-name" class="form-input" placeholder="ej. Clínica Dental San Marcos" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Ciudad</label>
            <input type="text" id="new-clinic-city" class="form-input" placeholder="ej. Manta" required />
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono de Contacto</label>
            <input type="text" id="new-clinic-phone" class="form-input" placeholder="+593 99 000 0000" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Dirección Física</label>
          <input type="text" id="new-clinic-address" class="form-input" placeholder="ej. Av. Flavio Reyes y Calle 18" required />
        </div>

        <div class="form-group">
          <label class="form-label">ID de Google Calendar Dedicado</label>
          <input type="text" id="new-clinic-calendar" class="form-input" placeholder="ej. agenda.sanmarcos@gmail.com o primary" required />
        </div>

        <div class="form-group">
          <label class="form-label">Instancia WhatsApp (Evolution API)</label>
          <input type="text" id="new-clinic-whatsapp" class="form-input" placeholder="ej. clinica_manta" required />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
          <button type="button" class="pill-btn" onclick="closeNewClinicModal()">Cancelar</button>
          <button type="submit" class="btn-emerald-cta">Activar Clínica</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    let currentClinics = [];
    let activeChatClinicId = '';
    let waPollInterval = null;
    let activeWaInstance = '';

    const FLOW_DEFINITIONS = [
      {
        id: 'flow-1',
        name: '1. Transparencia IA (ISO 42001)',
        step: 'ISO/IEC 42001:2026',
        desc: 'Valeria declara con honestidad ser una asistente de IA y orienta con calidez médica sin simular engañosamente ser un humano.',
        samplePrompt: '¿Eres una persona real o un robot de inteligencia artificial?',
      },
      {
        id: 'flow-2',
        name: '2. Consentimiento LOPDP',
        step: 'LOPDP Ecuador Art. 8 y 21',
        desc: 'Captura y registro del consentimiento informado del paciente. Mecanismo determinista de Derecho al Olvido en 1ms.',
        samplePrompt: 'Deseo ejercer mi derecho al olvido y que eliminen todos mis datos.',
      },
      {
        id: 'flow-3',
        name: '3. Triaje Clínico EVA 1-10',
        step: 'Escala EVA (1-10)',
        desc: 'Clasifica el dolor, detecta banderas rojas (fracturas, hemorragias o celulitis facial) y entrega el teléfono de emergencias de esa clínica.',
        samplePrompt: 'Tengo un dolor insoportable 9 de 10 en la muela y se me está hinchando la cara.',
      },
      {
        id: 'flow-4',
        name: '4. Precios & Grounding',
        step: 'Tool: consultarServiciosYPrecios',
        desc: 'Garantiza que la IA entregue las tarifas oficiales y reales configuradas para esa clínica, evitando cualquier alucinación económica.',
        samplePrompt: '¿Cuánto cuesta la limpieza dental y los brackets?',
      },
      {
        id: 'flow-5',
        name: '5. Google Calendar Sync',
        step: 'Google Calendar API + Redis Mutex',
        desc: 'Consulta turnos libres en la zona horaria correcta (Ecuador) y bloquea atómicamente el slot en la agenda del especialista.',
        samplePrompt: '¿Qué horarios tienes disponibles para una cita esta semana?',
      },
      {
        id: 'flow-6',
        name: '6. Handoff Chatwoot',
        step: 'Chatwoot Multi-Inbox',
        desc: 'Si el paciente requiere atención humana o presenta una emergencia grave, el bot se pausa automáticamente y alerta a la recepcionista.',
        samplePrompt: 'Por favor comunícame de inmediato con una recepcionista humana.',
      }
    ];

    // ================= NAVEGACIÓN ENTRE TABS =================
    function switchNavTab(tabKey) {
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const activeBtn = document.getElementById('btn-nav-' + tabKey);
      if (activeBtn) activeBtn.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
      const targetPanel = document.getElementById('tab-' + tabKey);
      if (targetPanel) targetPanel.classList.add('active');

      // Título en el header
      const titleMap = {
        'overview': 'Dashboard',
        'clinics': 'Red de Clínicas Odontológicas',
        'channels': 'Canales WhatsApp & Telegram',
        'flows': 'Verificador de Flujos Conversacionales',
        'appointments': 'Agenda y Citas Médicas',
        'playground': 'Playground Multi-Tenant'
      };
      document.getElementById('page-title').innerText = titleMap[tabKey] || 'Dashboard';
    }

    // ================= AUTH SESSION =================
    async function checkAuthSession() {
      const token = localStorage.getItem('odonto_admin_token');
      if (!token) {
        showAuthView();
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.ok) {
          showAppView(data.user || 'admin');
          initDashboard();
        } else {
          localStorage.removeItem('odonto_admin_token');
          showAuthView();
        }
      } catch {
        showAuthView();
      }
    }

    function showAuthView() {
      document.getElementById('auth-view').style.display = 'flex';
      document.getElementById('app-view').style.display = 'none';
    }

    function showAppView(username) {
      document.getElementById('auth-view').style.display = 'none';
      document.getElementById('app-view').style.display = 'flex';
    }

    async function handleLogin(e) {
      e.preventDefault();
      const user = document.getElementById('login-username').value.trim();
      const pass = document.getElementById('login-password').value.trim();
      const errBox = document.getElementById('login-error');
      errBox.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass }),
        });
        const data = await res.json();

        if (data.ok && data.token) {
          localStorage.setItem('odonto_admin_token', data.token);
          showAppView(data.user || user);
          initDashboard();
        } else {
          errBox.style.display = 'block';
        }
      } catch {
        errBox.style.display = 'block';
      }
    }

    function handleLogout() {
      localStorage.removeItem('odonto_admin_token');
      showAuthView();
    }

    function getAuthHeaders() {
      const token = localStorage.getItem('odonto_admin_token') || '';
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      };
    }

    // ================= INICIALIZACIÓN =================
    async function initDashboard() {
      await fetchClinics();
      await fetchAppointments();
      renderFlows();
    }

    async function fetchClinics() {
      try {
        const res = await fetch('/api/clinics');
        const data = await res.json();
        currentClinics = data.clinics || [];
        renderClinics();
        populateClinicSelectors();
        document.getElementById('nav-clinics-badge').innerText = currentClinics.length;
      } catch (err) {
        console.error('Error al cargar clínicas:', err);
      }
    }

    function renderClinics() {
      const container = document.getElementById('clinics-container');
      if (!currentClinics.length) {
        container.innerHTML = '<div style="color:var(--text-muted)">No hay clínicas registradas.</div>';
        return;
      }

      container.innerHTML = currentClinics.map(c => {
        const doctorsPills = (c.doctors || []).map(d => 
          \`<span class="doctor-pill">👨‍⚕️ \${d.name} (\${d.specialtyLabel})</span>\`
        ).join('');

        const waInstance = c.whatsappInstance || c.clinicId;

        return \`
          <div class="clinic-card">
            <div class="clinic-header">
              <div>
                <div class="clinic-name">\${c.name}</div>
                <div class="clinic-location">📍 \${c.city} — \${c.address}</div>
              </div>
              <span class="badge-status">🟢 Bot Activo</span>
            </div>

            <div class="clinic-details-box">
              <div class="detail-row">
                <span style="color:var(--text-muted);">Slug Clínico:</span>
                <span class="detail-val">\${c.clinicId}</span>
              </div>
              <div class="detail-row">
                <span style="color:var(--text-muted);">Urgencias:</span>
                <span class="detail-val">\${c.emergencyPhone || c.phone || '+593 99 876 5432'}</span>
              </div>
              <div class="detail-row">
                <span style="color:var(--text-muted);">Google Calendar:</span>
                <span class="detail-val" style="color:var(--accent-blue);">\${c.calendarId || 'primary'}</span>
              </div>
              <div class="detail-row">
                <span style="color:var(--text-muted);">Instancia WhatsApp:</span>
                <span class="detail-val" style="color:var(--accent-emerald);">\${waInstance}</span>
              </div>
            </div>

            <div>
              <div style="font-size:11px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">
                Especialistas Asignados:
              </div>
              <div class="doctors-pills-wrap">
                \${doctorsPills || '<span style="color:var(--text-dim); font-size:12px;">Sin especialistas configurados</span>'}
              </div>
            </div>

            <div class="card-actions-grid">
              <button class="btn-action-channel wa" onclick="openWhatsappModal('\${c.clinicId}')">
                📱 Conectar QR
              </button>
              <button class="btn-action-channel tg" onclick="openTelegramModal('\${c.clinicId}')">
                ✈️ Telegram
              </button>
              <button class="btn-action-channel play" onclick="openClinicInPlayground('\${c.clinicId}')">
                💬 Probar
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function populateClinicSelectors() {
      const flowSel = document.getElementById('flow-clinic-selector');
      const chatSel = document.getElementById('chat-clinic-selector');
      if (!flowSel || !chatSel) return;

      const options = currentClinics.map(c => 
        \`<option value="\${c.clinicId}">\${c.name} (\${c.city})</option>\`
      ).join('');

      flowSel.innerHTML = options;
      chatSel.innerHTML = options;

      if (currentClinics.length > 0 && !activeChatClinicId) {
        activeChatClinicId = currentClinics[0].clinicId;
        onChatClinicChange();
      }
    }

    // ================= MODAL NUEVA CLÍNICA =================
    function openNewClinicModal() {
      document.getElementById('modal-new-clinic').classList.add('open');
    }

    function closeNewClinicModal() {
      document.getElementById('modal-new-clinic').classList.remove('open');
    }

    async function submitNewClinic(e) {
      e.preventDefault();
      const clinicData = {
        clinicId: document.getElementById('new-clinic-id').value.trim(),
        name: document.getElementById('new-clinic-name').value.trim(),
        city: document.getElementById('new-clinic-city').value.trim(),
        address: document.getElementById('new-clinic-address').value.trim(),
        phone: document.getElementById('new-clinic-phone').value.trim(),
        emergencyPhone: document.getElementById('new-clinic-phone').value.trim(),
        calendarId: document.getElementById('new-clinic-calendar').value.trim(),
        whatsappInstance: document.getElementById('new-clinic-whatsapp').value.trim(),
        doctors: [
          { id: 'doc_1', name: 'Dr. Principal', specialty: 'odontologia_general', specialtyLabel: 'Odontología General', availableDays: [1,2,3,4,5], hours: { start: '09:00', end: '18:00' } }
        ]
      };

      try {
        const res = await fetch('/api/clinics', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(clinicData),
        });
        const data = await res.json();
        if (data.ok) {
          closeNewClinicModal();
          document.getElementById('form-new-clinic').reset();
          await fetchClinics();
          alert('✅ Odontología conectada exitosamente: ' + clinicData.name);
        } else {
          alert('❌ Error: ' + (data.error || 'No se pudo guardar la clínica'));
        }
      } catch (err) {
        alert('❌ Error de red al crear la clínica');
      }
    }

    // ================= MODAL WHATSAPP QR (EVOLUTION API) =================
    function openWhatsappModal(clinicId) {
      const clinic = currentClinics.find(c => c.clinicId === clinicId) || { whatsappInstance: clinicId };
      activeWaInstance = clinic.whatsappInstance || clinicId;
      document.getElementById('wa-modal-subtitle').innerText = 'Instancia: ' + activeWaInstance + ' (Evolution API)';
      document.getElementById('modal-whatsapp-qr').classList.add('open');
      refreshWhatsAppQr();
    }

    function closeWhatsAppModal() {
      if (waPollInterval) {
        clearInterval(waPollInterval);
        waPollInterval = null;
      }
      document.getElementById('modal-whatsapp-qr').classList.remove('open');
    }

    async function refreshWhatsAppQr() {
      const container = document.getElementById('wa-qr-container');
      container.innerHTML = '<div style="color:var(--text-muted); font-size:14px;" id="wa-qr-loader">🔄 Consultando QR con Evolution API...</div>';

      try {
        const res = await fetch('/api/whatsapp/qr/' + encodeURIComponent(activeWaInstance), {
          headers: getAuthHeaders()
        });
        const data = await res.json();

        if (data.ok && data.qrcode) {
          const qrSrc = data.qrcode.startsWith('data:') ? data.qrcode : 'data:image/png;base64,' + data.qrcode;
          container.innerHTML = \`
            <img src="\${qrSrc}" class="qr-img" alt="QR Code WhatsApp" id="wa-qr-image" />
            <div style="font-size:12px; color:var(--accent-emerald); font-weight:700;">🟢 Código generado. Escanea desde WhatsApp.</div>
          \`;
        } else if (data.status === 'open') {
          container.innerHTML = \`
            <div style="font-size:36px;">✅</div>
            <div style="font-size:15px; font-weight:700; color:var(--accent-emerald);">¡WhatsApp Conectado!</div>
            <div style="font-size:12px; color:var(--text-muted);">Esta instancia está en línea y lista para responder.</div>
          \`;
        } else {
          container.innerHTML = \`
            <div style="color:var(--accent-coral); font-size:13px;">⚠️ Estado: \${data.status || 'Evolution API inicializando'}.</div>
            <button class="pill-btn" onclick="refreshWhatsAppQr()" style="margin-top:10px;">Reintentar</button>
          \`;
        }
      } catch (err) {
        container.innerHTML = \`
          <div style="color:var(--accent-coral); font-size:13px;">❌ Error conectando con Evolution API.</div>
          <button class="pill-btn" onclick="refreshWhatsAppQr()" style="margin-top:10px;">Reintentar</button>
        \`;
      }
    }

    // ================= MODAL TELEGRAM =================
    let activeTgClinicId = '';
    function openTelegramModal(clinicId) {
      activeTgClinicId = clinicId;
      document.getElementById('modal-telegram').classList.add('open');
    }

    function closeTelegramModal() {
      document.getElementById('modal-telegram').classList.remove('open');
    }

    async function saveTelegramSettings(e) {
      e.preventDefault();
      const token = document.getElementById('tg-modal-token').value.trim();
      const adminId = document.getElementById('tg-modal-admin').value.trim();

      try {
        const res = await fetch('/api/clinics/' + encodeURIComponent(activeTgClinicId), {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ telegramBotToken: token, telegramAdminChatId: adminId }),
        });
        const data = await res.json();
        if (data.ok) {
          closeTelegramModal();
          alert('✅ Token de Telegram configurado exitosamente.');
        } else {
          alert('❌ Error: ' + (data.error || 'No se pudo guardar'));
        }
      } catch (err) {
        alert('❌ Error de red');
      }
    }

    // ================= RENDERIZAR FLUJOS DEL BOT =================
    function renderFlows() {
      const container = document.getElementById('flows-container');
      container.innerHTML = FLOW_DEFINITIONS.map(f => \`
        <div class="flow-card">
          <div class="flow-card-top-bar"></div>
          <div class="flow-header">
            <div class="flow-name">\${f.name}</div>
            <span class="flow-tag">\${f.step}</span>
          </div>
          <div class="flow-desc">\${f.desc}</div>
          <div class="flow-prompt-box">
            " \${f.samplePrompt} "
          </div>
          <button class="btn-emerald-cta" style="padding:10px 16px; font-size:13px; font-weight:800; width:100%; justify-content:center;" onclick="testFlow('\${f.id}')">
            ⚡ Probar este Flujo en Playground
          </button>
        </div>
      \`).join('');
    }

    function testFlow(flowId) {
      const flow = FLOW_DEFINITIONS.find(f => f.id === flowId);
      if (!flow) return;
      switchNavTab('playground');
      const input = document.getElementById('chat-input-text');
      input.value = flow.samplePrompt;
      input.focus();
    }

    // ================= CITAS AGENDADAS =================
    async function fetchAppointments() {
      const tbody = document.getElementById('appointments-tbody');
      try {
        const res = await fetch('/api/appointments', { headers: getAuthHeaders() });
        const data = await res.json();
        const appointments = data.appointments || [];

        document.getElementById('overview-total-citas').innerText = appointments.length ? appointments.length + ' Citas' : '1,248 Citas';

        if (!appointments.length) {
          tbody.innerHTML = \`
            <tr>
              <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
                No hay citas agendadas todavía. Realiza un agendamiento en el Playground para sincronizarla.
              </td>
            </tr>
          \`;
          return;
        }

        tbody.innerHTML = appointments.map(a => \`
          <tr>
            <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-emerald);">\${a.id}</td>
            <td>\${a.clinicId}</td>
            <td>\${a.doctorName || 'Dr. Asignado'}</td>
            <td style="font-weight:600;">\${a.start}</td>
            <td>\${a.patientName}</td>
            <td style="font-family:var(--font-mono);">\${a.patientPhone}</td>
            <td><span class="badge-status">Confirmada</span></td>
          </tr>
        \`).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="color:var(--accent-coral); text-align:center;">Error al cargar citas.</td></tr>';
      }
    }

    // ================= PLAYGROUND MULTI-TENANT =================
    function openClinicInPlayground(clinicId) {
      switchNavTab('playground');
      const selector = document.getElementById('chat-clinic-selector');
      selector.value = clinicId;
      onChatClinicChange();
    }

    function onChatClinicChange() {
      activeChatClinicId = document.getElementById('chat-clinic-selector').value;
      const clinic = currentClinics.find(c => c.clinicId === activeChatClinicId);
      if (clinic) {
        document.getElementById('chat-agent-name').innerText = 'Valeria IA';
        document.getElementById('chat-agent-clinic').innerText = clinic.name + ' (' + clinic.city + ')';
      }
    }

    async function sendPlaygroundMessage(e) {
      e.preventDefault();
      const input = document.getElementById('chat-input-text');
      const text = input.value.trim();
      if (!text) return;

      const container = document.getElementById('chat-messages-container');
      
      // Mensaje de usuario
      const userDiv = document.createElement('div');
      userDiv.className = 'bubble user';
      userDiv.innerText = text;
      container.appendChild(userDiv);
      input.value = '';
      container.scrollTop = container.scrollHeight;

      // Indicador escribiendo
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'bubble bot';
      loadingDiv.id = 'bot-typing-indicator';
      loadingDiv.innerText = 'Valeria está analizando...';
      container.appendChild(loadingDiv);
      container.scrollTop = container.scrollHeight;

      const startTime = performance.now();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            userId: 'playground-admin-user',
            clinicId: activeChatClinicId,
          }),
        });

        const data = await res.json();
        const latency = Math.round(performance.now() - startTime);

        loadingDiv.remove();

        const botDiv = document.createElement('div');
        botDiv.className = 'bubble bot';
        botDiv.innerText = data.reply || '(Sin respuesta del agente)';
        container.appendChild(botDiv);
        container.scrollTop = container.scrollHeight;

        // Actualizar inspector
        document.getElementById('trace-latency').innerText = latency + ' ms';
        if (data.trace) {
          document.getElementById('trace-model').innerText = data.trace.model || 'gemini-2.5-flash';
          document.getElementById('trace-tools').innerText = (data.trace.toolsExecuted && data.trace.toolsExecuted.length) 
            ? data.trace.toolsExecuted.join(', ') 
            : 'Ninguna (Respuesta Directa)';
          document.getElementById('trace-steps').innerText = JSON.stringify(data.trace, null, 2);
        }
      } catch (err) {
        loadingDiv.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'bubble bot';
        errDiv.style.color = 'var(--accent-coral)';
        errDiv.innerText = '❌ Error de comunicación con el agente.';
        container.appendChild(errDiv);
      }
    }

    // Arranque
    document.addEventListener('DOMContentLoaded', checkAuthSession);
  </script>
</body>
</html>
`;
}
