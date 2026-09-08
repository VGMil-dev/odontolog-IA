/**
 * OdontoCare IA — Torre de Control Administrativa & Suite SaaS Multi-Tenant (Estándar 2026)
 * Diseño profesional oscuro (Graphite #14171A + Emerald #00D26A), sin datos mockeados (100% métricas reales),
 * separación multi-tenant estricta (privacidad LOPDP B2B), Mini-Dashboard de clínica (Workspace de Secretaria),
 * alternador de turno para doctores en vivo, semáforo de insumos críticos, flujos en pantalla dividida,
 * iconografía SVG limpia sin emojis, y diseño 100% responsive.
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
      --accent-coral-dim: rgba(255, 107, 74, 0.15);
      --accent-cyan: #06B6D4;
      --accent-amber: #F59E0B;
      --accent-amber-dim: rgba(245, 158, 11, 0.15);
      
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

    /* Iconos SVG Base */
    .icon-svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
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
      fill: none;
      stroke: #0B132B;
      stroke-width: 2.2;
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
      transition: transform 0.3s ease;
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

    /* TARJETA DE CONTRASTE INFERIOR (DIRECTORA MÉDICA) */
    .sidebar-customer-metric {
      background: #FFFFFF;
      color: #0F172A;
      border-radius: 18px;
      padding: 16px 14px;
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
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: 0.02em;
    }

    .customer-metric-avatar-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .customer-metric-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #00D26A;
      border: 2px solid #00D26A;
      flex-shrink: 0;
    }

    .customer-metric-avatar svg {
      width: 20px;
      height: 20px;
      stroke: #00D26A;
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
      display: flex;
      align-items: center;
      gap: 4px;
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

    /* 2. CANVAS PRINCIPAL */
    .main-canvas {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background: var(--bg-base);
    }

    /* TOP HEADER */
    header.top-header {
      padding: 16px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      background: rgba(20, 23, 26, 0.9);
      backdrop-filter: blur(12px);
      z-index: 40;
    }

    .header-title-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .mobile-menu-toggle {
      display: none;
      background: transparent;
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      padding: 6px;
    }

    .header-title-wrap h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .search-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 240px;
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
      width: 38px;
      height: 38px;
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
      width: 7px;
      height: 7px;
      background: var(--accent-coral);
      border-radius: 50%;
      position: absolute;
      top: 8px;
      right: 8px;
      border: 2px solid var(--bg-card);
    }

    .user-profile-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 5px 12px 5px 8px;
      border-radius: 30px;
    }

    .user-profile-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--accent-emerald-dim);
      border: 1px solid var(--accent-emerald);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-emerald);
    }

    .user-profile-avatar svg {
      width: 16px;
      height: 16px;
      stroke: var(--accent-emerald);
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

    /* CONTENIDO DINÁMICO */
    main.content-area {
      padding: 24px 28px;
      flex: 1;
      overflow-y: auto;
    }

    .tab-panel {
      display: none;
      animation: tabFade 0.25s ease-out;
    }

    .tab-panel.active {
      display: block;
    }

    @keyframes tabFade {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ================= BENTO GRID OVERVIEW ================= */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 18px;
    }

    .bento-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }

    .col-sales { grid-column: span 4; }
    .col-visitors { grid-column: span 5; }
    .col-market { grid-column: span 3; }
    .col-revenue { grid-column: span 4; }
    .col-retention { grid-column: span 3; }
    .col-top-doctors { grid-column: span 5; }
    .col-tasks { grid-column: span 12; }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .sales-number-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin: 16px 0 20px 0;
    }

    .sales-big-number {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -1.5px;
      color: #FFFFFF;
      font-family: var(--font-mono);
    }

    .badge-growth {
      font-size: 12px;
      font-weight: 700;
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      padding: 3px 8px;
      border-radius: 8px;
      border: 1px solid rgba(0, 210, 106, 0.3);
    }

    .btn-view-chart {
      background: var(--bg-hover);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }

    .btn-view-chart:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .pill-btn {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .pill-btn:hover {
      background: var(--bg-hover);
      color: #FFFFFF;
      border-color: rgba(255,255,255,0.2);
    }

    .chart-container-svg {
      height: 95px;
      width: 100%;
      position: relative;
      margin-top: 8px;
    }

    .chart-tooltip-badge {
      position: absolute;
      top: 0;
      right: 14px;
      background: var(--accent-emerald);
      color: #0F172A;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      font-family: var(--font-mono);
    }

    .chart-days-axis {
      display: flex;
      justify-content: space-between;
      color: var(--text-dim);
      font-size: 11px;
      margin-top: 10px;
      font-weight: 600;
    }

    .channel-progress-wrap {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 6px;
    }

    .channel-pills-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .channel-pill-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: var(--font-mono);
    }

    .channel-multi-bar {
      height: 12px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      display: flex;
      overflow: hidden;
    }

    .bar-seg-white {
      background: #FFFFFF;
      width: 100%;
      transition: width 0.4s ease;
    }

    .bar-seg-emerald {
      background: var(--accent-emerald);
      width: 0%;
      transition: width 0.4s ease;
    }

    .channel-legend-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .channel-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .revenue-bars-wrap {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 110px;
      padding-top: 10px;
    }

    .revenue-bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .bar-cylinder {
      width: 22px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px 8px 4px 4px;
      position: relative;
      transition: all 0.3s;
    }

    .bar-cylinder.active-green {
      background: var(--accent-emerald);
      box-shadow: 0 4px 14px var(--accent-emerald-glow);
    }

    .bar-tooltip-pill {
      position: absolute;
      top: -26px;
      left: 50%;
      transform: translateX(-50%);
      background: #FFFFFF;
      color: #0F172A;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      white-space: nowrap;
    }

    .bar-day-label {
      font-size: 11px;
      color: var(--text-dim);
      font-weight: 600;
    }

    .gauge-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px 0;
    }

    .gauge-svg {
      width: 170px;
      height: 100px;
    }

    .gauge-center-val {
      position: absolute;
      bottom: 6px;
      font-size: 32px;
      font-weight: 800;
      font-family: var(--font-mono);
      color: #FFFFFF;
    }

    .doctors-donut-split {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 6px;
    }

    .donut-ring-wrap {
      width: 100px;
      height: 100px;
      position: relative;
      flex-shrink: 0;
    }

    .donut-center-num {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      font-family: var(--font-mono);
      color: #FFFFFF;
    }

    .doctors-list-compact {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .doctor-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid var(--border-subtle);
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
      background: var(--bg-card-elevated);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-emerald);
      border: 1px solid var(--border);
    }

    .tasks-header-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
      flex-wrap: wrap;
    }

    .task-stat-unit {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .task-stat-big {
      font-size: 24px;
      font-weight: 800;
      font-family: var(--font-mono);
      color: #FFFFFF;
    }

    .task-stat-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .gantt-bars-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      color: var(--text-main);
    }

    .gantt-track {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
    }

    .gantt-fill {
      height: 100%;
      border-radius: 4px;
    }

    /* ================= DIRECTORIO DE CLÍNICAS (B2B PRIVACY) ================= */
    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-emerald-cta {
      background: var(--accent-emerald);
      color: #0F172A;
      font-weight: 700;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 16px var(--accent-emerald-glow);
    }

    .btn-emerald-cta:hover {
      background: #00bf60;
      transform: translateY(-1px);
    }

    .clinics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .clinic-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }

    .clinic-card:hover {
      border-color: rgba(0, 210, 106, 0.3);
      transform: translateY(-2px);
    }

    .clinic-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .clinic-name {
      font-size: 17px;
      font-weight: 800;
      color: #FFFFFF;
    }

    .clinic-location {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .badge-status {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .clinic-details-box {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
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

    .card-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: auto;
    }

    .btn-action-channel {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-action-channel:hover {
      background: var(--bg-hover);
      color: #FFFFFF;
    }

    .btn-action-primary {
      grid-column: span 2;
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald);
      font-weight: 700;
      padding: 11px 14px;
    }

    .btn-action-primary:hover {
      background: var(--accent-emerald);
      color: #0F172A;
    }

    /* ================= MINI DASHBOARD DE CLÍNICA (WORKSPACE SECRETARIA) ================= */
    .workspace-header-bar {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px 24px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .workspace-title-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .workspace-back-btn {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .workspace-back-btn:hover {
      background: var(--bg-hover);
      color: #FFFFFF;
    }

    .workspace-metrics-kpi {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 22px;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .kpi-label {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .kpi-val {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      font-family: var(--font-mono);
    }

    /* DOCTORES EN TURNO */
    .doctors-shift-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-top: 14px;
    }

    .doctor-shift-card {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s;
    }

    .doctor-shift-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .doctor-shift-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--bg-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-emerald);
      border: 2px solid var(--border);
      flex-shrink: 0;
    }

    .doctor-shift-avatar svg {
      width: 22px;
      height: 22px;
    }

    .btn-toggle-shift {
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      transition: all 0.2s;
    }

    .btn-toggle-shift.active {
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      border: 1px solid var(--accent-emerald);
    }

    .btn-toggle-shift.active:hover {
      background: var(--accent-coral-dim);
      color: var(--accent-coral);
      border-color: var(--accent-coral);
    }

    .btn-toggle-shift.absent {
      background: var(--accent-coral-dim);
      color: var(--accent-coral);
      border: 1px solid var(--accent-coral);
    }

    .btn-toggle-shift.absent:hover {
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      border-color: var(--accent-emerald);
    }

    /* SEMÁFORO DE INSUMOS */
    .inventory-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 14px;
    }

    .inventory-card {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .inventory-status-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .inventory-status-pill.optimo {
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
    }

    .inventory-status-pill.bajo {
      background: var(--accent-amber-dim);
      color: var(--accent-amber);
    }

    .inventory-status-pill.critico {
      background: var(--accent-coral-dim);
      color: var(--accent-coral);
    }

    /* BITÁCORA TRASPARENCIA Y EVA */
    .transparency-log-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 280px;
      overflow-y: auto;
      margin-top: 14px;
    }

    .transparency-item {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .eva-badge {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: var(--font-mono);
    }

    .eva-mild { background: var(--accent-emerald-dim); color: var(--accent-emerald); }
    .eva-moderate { background: var(--accent-amber-dim); color: var(--accent-amber); }
    .eva-severe { background: var(--accent-coral-dim); color: var(--accent-coral); }

    /* ================= FLUJOS DEL BOT (SPLIT SCREEN) ================= */
    .flows-split-screen {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: start;
    }

    .flow-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.2);
    }

    .flow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .flow-name {
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .flow-tag {
      font-size: 11px;
      font-family: var(--font-mono);
      background: var(--accent-blue-dim);
      color: var(--accent-blue);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .flow-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .flow-prompt-box {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 12px;
      color: #FFFFFF;
      font-family: var(--font-sans);
      font-style: italic;
    }

    /* ================= PLAYGROUND & CHAT ================= */
    .playground-split {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 20px;
      height: calc(100vh - 140px);
    }

    .chat-box-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-box-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card-elevated);
    }

    .chat-messages-scroll {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .bubble {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.5;
    }

    .bubble.bot {
      background: var(--bg-card-elevated);
      color: #FFFFFF;
      border: 1px solid var(--border);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .bubble.user {
      background: var(--accent-emerald);
      color: #0F172A;
      font-weight: 600;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .chat-form-bar {
      padding: 14px 18px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 10px;
      background: var(--bg-card-elevated);
    }

    .chat-text-input {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      color: #FFFFFF;
      font-size: 13px;
      outline: none;
      font-family: var(--font-sans);
    }

    .chat-text-input:focus {
      border-color: var(--accent-emerald);
    }

    .inspector-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow-y: auto;
    }

    .inspector-heading {
      font-size: 15px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .trace-card {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 12px;
      font-family: var(--font-mono);
      color: var(--accent-emerald);
      word-break: break-all;
    }

    /* ================= TABLAS ESTILIZADAS ================= */
    .table-container-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      overflow-x: auto;
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }

    .styled-table th {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .styled-table td {
      padding: 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-main);
    }

    .styled-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .badge-specialty {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .badge-specialty.general { background: var(--accent-emerald-dim); color: var(--accent-emerald); }
    .badge-specialty.ortodoncia { background: var(--accent-blue-dim); color: var(--accent-blue); }
    .badge-specialty.cirugia { background: var(--accent-coral-dim); color: var(--accent-coral); }
    .badge-specialty.endodoncia { background: var(--accent-amber-dim); color: var(--accent-amber); }
    .badge-specialty.pediatria { background: rgba(147, 51, 234, 0.15); color: #C084FC; }

    .day-chip {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(255,255,255,0.06);
      color: var(--text-dim);
    }
    .day-chip.active {
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
    }

    .catalog-clinic-pill {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .catalog-clinic-pill.active {
      background: var(--accent-emerald);
      color: #0F172A;
      border-color: var(--accent-emerald);
    }

    .suggested-pill-btn {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggested-pill-btn:hover {
      background: var(--accent-emerald-dim);
      color: var(--accent-emerald);
      border-color: var(--accent-emerald);
    }

    /* ================= MODALES ================= */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 2000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-backdrop.open,
    .modal-backdrop.active {
      display: flex;
    }

    .modal-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 28px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 90vh;
      overflow-y: auto;
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
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .form-input, .form-select {
      background: var(--bg-card-elevated);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 9px 12px;
      color: #FFFFFF;
      font-size: 13px;
      outline: none;
      font-family: var(--font-sans);
    }

    .form-input:focus, .form-select:focus {
      border-color: var(--accent-emerald);
    }

    /* ================= RESPONSIVE DESIGN (MOBILE-FIRST) ================= */
    @media (max-width: 1024px) {
      .bento-grid {
        grid-template-columns: repeat(6, 1fr);
      }
      .col-sales { grid-column: span 3; }
      .col-visitors { grid-column: span 3; }
      .col-market { grid-column: span 3; }
      .col-revenue { grid-column: span 3; }
      .col-retention { grid-column: span 3; }
      .col-top-doctors { grid-column: span 3; }
      .col-tasks { grid-column: span 6; }
      
      .flows-split-screen {
        grid-template-columns: 1fr;
      }
      .playground-split {
        grid-template-columns: 1fr;
        height: auto;
      }
      .inventory-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .workspace-metrics-kpi {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }
      aside.sidebar {
        width: 100%;
        min-width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid var(--border);
        padding: 16px;
      }
      .sidebar-customer-metric {
        display: none;
      }
      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 6px;
      }
      .nav-item {
        white-space: nowrap;
        padding: 8px 12px;
        font-size: 13px;
      }
      .bento-grid {
        grid-template-columns: 1fr;
      }
      .col-sales, .col-visitors, .col-market, .col-revenue, .col-retention, .col-top-doctors, .col-tasks {
        grid-column: span 1;
      }
      .clinics-grid {
        grid-template-columns: 1fr;
      }
      .inventory-grid {
        grid-template-columns: 1fr;
      }
      .workspace-metrics-kpi {
        grid-template-columns: 1fr 1fr;
      }
      header.top-header {
        padding: 12px 16px;
      }
      .search-box {
        display: none;
      }
      main.content-area {
        padding: 16px;
      }
    }
  </style>
</head>
<body>

  <!-- ================= VISTA DE LOGIN ================= -->
  <div id="auth-view">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24"><path d="M12 2C7 2 4 5 4 9c0 3 1.5 6.5 3 10 1 2.5 2.5 3 5 3s4-.5 5-3c1.5-3.5 3-7 3-10 0-4-3-7-8-7z"/></svg>
        </div>
        <div>
          <h1 style="font-size: 19px; font-weight: 800; letter-spacing: -0.5px;">ODONTOCARE AI</h1>
          <div style="font-size: 11px; color: var(--accent-emerald); font-weight: 700;">TORRE DE CONTROL B2B</div>
        </div>
      </div>

      <div>
        <h2 style="font-size: 16px; font-weight: 700; color: #FFFFFF;">Acceso Administrativo</h2>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          Ingresa credenciales de superadmin para supervisar clínicas y agentes en tiempo real.
        </p>
      </div>

      <form id="login-form" onsubmit="handleLogin(event)" style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label class="form-label">Usuario Superadmin</label>
          <input type="text" id="login-username" class="form-input" value="admin" required />
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input type="password" id="login-password" class="form-input" value="odontocare2026" required />
        </div>

        <div id="login-error" style="display:none; color: var(--accent-coral); font-size: 12px; background: var(--accent-coral-dim); padding: 8px 12px; border-radius: 8px;">
          Credenciales incorrectas. Verifica usuario y clave.
        </div>

        <button type="submit" class="btn-emerald-cta" style="width: 100%; justify-content: center; margin-top: 6px;">
          Entrar a Torre de Control
        </button>
      </form>
    </div>
  </div>

  <!-- ================= APP SHELL PRINCIPAL ================= -->
  <div id="app-view">
    
    <!-- SIDEBAR IZQUIERDO -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo-mark" style="width:34px; height:34px;">
          <svg viewBox="0 0 24 24"><path d="M12 2C7 2 4 5 4 9c0 3 1.5 6.5 3 10 1 2.5 2.5 3 5 3s4-.5 5-3c1.5-3.5 3-7 3-10 0-4-3-7-8-7z"/></svg>
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

        <button class="nav-item" id="btn-nav-workspace" onclick="switchNavTab('clinic-workspace')" style="display:none;">
          <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>Workspace Sede</span>
        </button>

        <button class="nav-item" id="btn-nav-catalog" onclick="switchNavTab('catalog')">
          <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <span>Precios & Doctores</span>
        </button>

        <button class="nav-item" id="btn-nav-channels" onclick="switchNavTab('channels')">
          <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path></svg>
          <span>Canales Meta/TG</span>
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

      <!-- TARJETA INFERIOR: DIRECTORA MÉDICA -->
      <div class="sidebar-customer-metric">
        <div class="customer-metric-header">
          <span>Directora Médica</span>
          <span style="font-size: 11px; color:#64748B;">Supervisión</span>
        </div>
        <div class="customer-metric-avatar-wrap">
          <div class="customer-metric-avatar">
            <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 11v6M9 14h6"/></svg>
          </div>
          <div class="customer-metric-details">
            <div class="customer-metric-name">Dra. Selen Swift</div>
            <div class="customer-metric-sub">Director Clínico General</div>
          </div>
        </div>
        <div class="customer-metric-footer">
          <div>
            <div style="color:#64748B;">Precisión IA</div>
            <div class="metric-val-bold">100% Grounded</div>
          </div>
          <div style="text-align: right;">
            <div style="color:#64748B;">Canal Activo</div>
            <div class="metric-val-bold" style="color:var(--accent-emerald);">Telegram Live</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- CANVAS PRINCIPAL -->
    <div class="main-canvas">
      
      <!-- TOP HEADER -->
      <header class="top-header">
        <div class="header-title-wrap">
          <h1 id="page-title">Dashboard</h1>
        </div>

        <div class="header-actions">
          <div class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Buscar clínica o servicio..." />
          </div>

          <button class="icon-btn" title="Notificaciones del Sistema">
            <svg viewBox="0 0 24 24" class="icon-svg"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg>
            <div class="icon-btn-dot"></div>
          </button>

          <div class="user-profile-chip">
            <div class="user-profile-avatar">
              <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/></svg>
            </div>
            <div class="user-profile-info">
              <span class="user-name">Selen Swift</span>
              <span class="user-role">Superadmin</span>
            </div>
          </div>

          <button class="btn-logout" onclick="handleLogout()" title="Cerrar Sesión">Salir</button>
        </div>
      </header>

      <!-- CONTENIDO DINÁMICO DE PESTAÑAS -->
      <main class="content-area">
        
        <!-- ================= PESTAÑA 1: OVERVIEW (100% MÉTRICAS REALES) ================= -->
        <div id="tab-overview" class="tab-panel active">
          <div class="bento-grid">
            
            <!-- CARD 1: CITAS REALES -->
            <div class="bento-card col-sales">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">
                    <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Total Citas Agendadas
                  </div>
                  <div class="card-subtitle">Google Calendar sincronizado en vivo</div>
                </div>
              </div>

              <div class="sales-number-row">
                <div class="sales-big-number" id="overview-total-citas">0</div>
                <div class="badge-growth" id="overview-citas-status">Live Sync</div>
              </div>

              <div>
                <button class="btn-view-chart" onclick="switchNavTab('appointments')">
                  <span>Ver Agenda de Citas</span>
                  <svg viewBox="0 0 24 24" class="icon-svg" style="width:14px; height:14px;"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </button>
              </div>
            </div>

            <!-- CARD 2: SESIONES / PACIENTES REALES -->
            <div class="bento-card col-visitors">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">
                    <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-blue)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Pacientes en Línea
                  </div>
                  <div class="card-subtitle">Sesiones activas atendidas por Valeria IA</div>
                </div>
                <button class="pill-btn" onclick="switchNavTab('playground')">Ver Chat</button>
              </div>

              <div class="chart-container-svg">
                <div class="chart-tooltip-badge" id="overview-patients-badge">0 Activas</div>
                <svg viewBox="0 0 300 100" style="width:100%; height:100%; overflow:visible;">
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#00D26A" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="#00D26A" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M 0 80 Q 75 75, 150 70 T 300 65 L 300 100 L 0 100 Z" fill="url(#curveGrad)" />
                  <path d="M 0 80 Q 75 75, 150 70 T 300 65" fill="none" stroke="#00D26A" stroke-width="2" stroke-dasharray="4 3" />
                  <circle cx="280" cy="65" r="4" fill="#00D26A" stroke="#FFFFFF" stroke-width="2" />
                </svg>
              </div>
              <div class="chart-days-axis">
                <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
              </div>
            </div>

            <!-- CARD 3: CANALES (100% TELEGRAM ACTUAL) -->
            <div class="bento-card col-market">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">
                    <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-cyan)"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Distribución Canales
                  </div>
                  <div class="card-subtitle">Tráfico real por plataforma</div>
                </div>
                <button class="pill-btn" onclick="switchNavTab('channels')">Config</button>
              </div>

              <div class="channel-progress-wrap">
                <div class="channel-pills-row">
                  <div class="channel-pill-tag" style="background: rgba(255,255,255,0.15); color:#fff;" id="overview-channel-tg-pill">TG: 100%</div>
                  <div class="channel-pill-tag" style="background: var(--accent-emerald-dim); color:var(--accent-emerald);" id="overview-channel-wa-pill">WA: 0%</div>
                </div>

                <div class="channel-multi-bar">
                  <div class="bar-seg-white" id="overview-bar-telegram" style="width: 100%;" title="Telegram"></div>
                  <div class="bar-seg-emerald" id="overview-bar-whatsapp" style="width: 0%;" title="Meta WhatsApp"></div>
                </div>

                <div class="channel-legend-row">
                  <div class="channel-legend-item">
                    <span class="dot-indicator" style="background:#FFFFFF;"></span>
                    <span>Telegram Gateway (100% activo)</span>
                  </div>
                  <div class="channel-legend-item">
                    <span class="dot-indicator" style="background:var(--accent-emerald);"></span>
                    <span>Meta WhatsApp Cloud API (Standby)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 4: EFICIENCIA DE AGENDA -->
            <div class="bento-card col-revenue">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">
                    <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Eficiencia de Agenda
                  </div>
                  <div class="card-subtitle">Conversión consultas a agendamiento</div>
                </div>
                <button class="pill-btn">Tiempo Real</button>
              </div>

              <div class="revenue-bars-wrap">
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 25px;"></div>
                  <span class="bar-day-label">Lun</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 35px;"></div>
                  <span class="bar-day-label">Mar</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 30px;"></div>
                  <span class="bar-day-label">Mié</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder active-green" style="height: 60px;">
                    <div class="bar-tooltip-pill" id="overview-conversion-rate">0% conv.</div>
                  </div>
                  <span class="bar-day-label" style="color:var(--accent-emerald); font-weight:700;">Hoy</span>
                </div>
                <div class="revenue-bar-col">
                  <div class="bar-cylinder" style="height: 20px;"></div>
                  <span class="bar-day-label">Vie</span>
                </div>
              </div>
            </div>

            <!-- CARD 5: RETENCIÓN -->
            <div class="bento-card col-retention">
              <div class="card-header-flex">
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-coral)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  Tasa Retención
                </div>
                <button class="pill-btn">Semanal</button>
              </div>

              <div class="gauge-wrapper">
                <svg viewBox="0 0 200 120" class="gauge-svg">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="12" stroke-linecap="round" />
                  <path id="gauge-retention-arc" d="M 20 100 A 80 80 0 0 1 60 45" fill="none" stroke="#00D26A" stroke-width="12" stroke-linecap="round" />
                </svg>
                <div class="gauge-center-val" id="overview-retention-rate">0<span style="font-size: 16px; color:var(--text-muted);">%</span></div>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); text-align:center;">
                Confirmaciones de citas sobre consultas
              </div>
            </div>

            <!-- CARD 6: ESPECIALIDADES MÉDICAS ACTIVAS -->
            <div class="bento-card col-top-doctors">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">
                    <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-blue)"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 11v6M9 14h6"/></svg>
                    Doctores & Especialidades
                  </div>
                  <div class="card-subtitle">Especialistas registrados en clínicas</div>
                </div>
                <button class="pill-btn" onclick="switchNavTab('catalog')">Gestionar</button>
              </div>

              <div class="doctors-donut-split">
                <div class="donut-ring-wrap">
                  <svg viewBox="0 0 120 120" style="width:100%; height:100%; transform: rotate(-90deg);">
                    <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#00D26A" stroke-width="8" stroke-dasharray="140 280" stroke-linecap="round"/>
                    <circle cx="60" cy="60" r="33" fill="none" stroke="#3B82F6" stroke-width="6" stroke-dasharray="90 280" stroke-linecap="round"/>
                  </svg>
                  <div class="donut-center-num" id="overview-doctors-count">3</div>
                </div>

                <div class="doctors-list-compact" id="overview-doctors-compact-list">
                  <div class="doctor-item-row">
                    <div class="doctor-item-left">
                      <div class="doctor-avatar-circle">
                        <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/></svg>
                      </div>
                      <div>
                        <div style="font-size:12px; font-weight:700;">Dr. Carlos Vega</div>
                        <div style="font-size:11px; color:var(--text-dim);">Odontología General</div>
                      </div>
                    </div>
                    <span class="badge-status">Activo</span>
                  </div>

                  <div class="doctor-item-row">
                    <div class="doctor-item-left">
                      <div class="doctor-avatar-circle">
                        <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/></svg>
                      </div>
                      <div>
                        <div style="font-size:12px; font-weight:700;">Dra. Gabriela Morales</div>
                        <div style="font-size:11px; color:var(--text-dim);">Ortodoncia</div>
                      </div>
                    </div>
                    <span class="badge-status">Activo</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARD 7: TAREAS DEL SISTEMA & GUARDRAILS -->
            <div class="bento-card col-tasks">
              <div class="card-header-flex">
                <div>
                  <div class="card-title">
                    <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Seguridad Clínica & Guardrails ISO/LOPDP
                  </div>
                  <div class="card-subtitle">Validaciones deterministas activas en Valeria IA</div>
                </div>
                <div style="font-size:12px; font-weight:700; color:var(--accent-emerald);">
                  100% Cobertura
                </div>
              </div>

              <div class="gantt-bars-container">
                <div class="gantt-row">
                  <span class="gantt-label">Triaje EVA 1-10</span>
                  <div class="gantt-track">
                    <div class="gantt-fill" style="width: 100%; background: #FF6B4A;"></div>
                  </div>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--accent-coral);">Activo</span>
                </div>

                <div class="gantt-row">
                  <span class="gantt-label">Consentimiento LOPDP</span>
                  <div class="gantt-track">
                    <div class="gantt-fill" style="width: 100%; background: #00D26A;"></div>
                  </div>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--accent-emerald);">Activo</span>
                </div>

                <div class="gantt-row">
                  <span class="gantt-label">Google Calendar Live Sync</span>
                  <div class="gantt-track">
                    <div class="gantt-fill" style="width: 100%; background: #3B82F6;"></div>
                  </div>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--accent-blue);">Activo</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ================= PESTAÑA 2: DIRECTORIO DE CLÍNICAS (B2B PRIVACY) ================= -->
        <div id="tab-clinics" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h6M12 8v6"></path></svg>
                Directorio B2B de Odontologías Registradas
              </h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Vista de alto nivel para superadministrador. Los calendarios, pacientes y turnos están aislados por sede para estricto cumplimiento LOPDP.
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

        <!-- ================= PESTAÑA NUEVA: WORKSPACE MINI-DASHBOARD DE CLÍNICA ================= -->
        <div id="tab-clinic-workspace" class="tab-panel">
          
          <!-- BARRA SUPERIOR DEL WORKSPACE -->
          <div class="workspace-header-bar">
            <div class="workspace-title-left">
              <button id="btn-back-to-clinics" class="workspace-back-btn" onclick="switchNavTab('clinics')">
                <svg viewBox="0 0 24 24" class="icon-svg"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Directorio de Clínicas
              </button>
              <div>
                <h2 id="workspace-clinic-name" style="font-size:20px; font-weight:800; color:#FFFFFF;">Clínica OdontoCare Cuenca</h2>
                <div id="workspace-clinic-sub" style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Sede Cuenca • Contacto: Recepción Central
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:10px;">
              <span class="badge-status" id="workspace-ai-status">
                <span class="status-dot"></span> Valeria IA Conectada
              </span>
              <button class="pill-btn" onclick="openClinicInPlayground(activeWorkspaceClinicId)">
                <svg viewBox="0 0 24 24" class="icon-svg"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Probar Bot
              </button>
            </div>
          </div>

          <!-- 4 KPIS OPERATIVOS DE LA SEDE -->
          <div class="workspace-metrics-kpi">
            <div class="kpi-card">
              <div class="kpi-label">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M6 19v2M18 19v2M5 11l1-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2l1 6M4 15h16a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1zM9 15v4M15 15v4"/></svg>
                Capacidad Sillones Dentales
              </div>
              <div class="kpi-val" id="ws-kpi-chairs">3 Sillones</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-blue)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Citas Programadas Hoy
              </div>
              <div class="kpi-val" id="ws-kpi-today-citas">0 Citas</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-cyan)"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/></svg>
                Especialistas en Turno
              </div>
              <div class="kpi-val" id="ws-kpi-active-docs">2 / 2</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-amber)"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                Insumos Críticos
              </div>
              <div class="kpi-val" id="ws-kpi-inventory">Operativo</div>
            </div>
          </div>

          <!-- SECCIÓN 1: DOCTORES EN TURNO HOY (MODUS OPERANDI CON ALTERNADOR AUSENTE/ACTIVO) -->
          <div class="bento-card" style="margin-bottom: 22px;">
            <div class="card-header-flex">
              <div>
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 11v6M9 14h6"/></svg>
                  Doctores en Turno Hoy (Control Operativo de Agenda)
                </div>
                <div class="card-subtitle">
                  Al marcar ausente a un doctor, Valeria IA no ofrecerá sus horarios para agendamiento inmediatamente.
                </div>
              </div>
              <button class="pill-btn" onclick="openDoctorModal()">
                <span>+</span> Agregar Especialista
              </button>
            </div>

            <div class="doctors-shift-grid" id="ws-doctors-shift-grid">
              <!-- Inyectado vía JS -->
            </div>
          </div>

          <!-- SECCIÓN 2: SEMÁFORO DE INSUMOS CRÍTICOS (MINI INVENTARIO OPERATIVO) -->
          <div class="bento-card" style="margin-bottom: 22px;">
            <div class="card-header-flex">
              <div>
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-amber)"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  Semáforo de Insumos Críticos en Consultorio
                </div>
                <div class="card-subtitle">
                  Monitoreo preventivo para no sobreagendar procedimientos complejos sin material clínico suficiente.
                </div>
              </div>
            </div>

            <div class="inventory-grid" id="ws-inventory-grid">
              <!-- Inyectado vía JS -->
            </div>
          </div>

          <!-- SECCIÓN 3: AGENDA DE CITAS DE LA SEDE -->
          <div class="bento-card" style="margin-bottom: 22px;">
            <div class="card-header-flex">
              <div>
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-blue)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Agenda de Citas del Día
                </div>
                <div class="card-subtitle">Turnos reservados con validación atómica y Google Calendar</div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="pill-btn" onclick="filterWorkspaceAppointments('today')">Hoy</button>
                <button class="pill-btn" onclick="filterWorkspaceAppointments('all')">Todas</button>
              </div>
            </div>

            <div style="overflow-x: auto;">
              <table class="styled-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Teléfono</th>
                    <th>Tratamiento</th>
                    <th>Doctor Asignado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody id="ws-appointments-tbody">
                  <!-- Inyectado vía JS -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECCIÓN 4: BITÁCORA DE TRANSPARENCIA IA (TRIAJE & HISTORIAL) -->
          <div class="bento-card">
            <div class="card-header-flex">
              <div>
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-cyan)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Bitácora de Transparencia IA (Triaje Clínico & Escala EVA)
                </div>
                <div class="card-subtitle">Trazabilidad de síntomas y consentimiento informado de pacientes recientes</div>
              </div>
            </div>

            <div class="transparency-log-list" id="ws-transparency-list">
              <!-- Inyectado vía JS -->
            </div>
          </div>

        </div>

        <!-- ================= PESTAÑA CATÁLOGO: PRECIOS & DOCTORES ================= -->
        <div id="tab-catalog" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                Gestión de Precios, Servicios & Doctores
              </h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Administra el equipo médico, asigna especialistas a tratamientos y define tarifas oficiales en USD para cada odontología.
              </p>
            </div>
          </div>

          <!-- BARRA DE SELECCIÓN DE CLÍNICA -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              Seleccionar Sede Odontológica:
            </div>
            <div id="catalog-clinics-bar" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <!-- Inyectado vía JavaScript -->
            </div>
          </div>

          <!-- SECCIÓN 1: DOCTORES & ESPECIALISTAS -->
          <div class="bento-card" style="margin-bottom: 24px;">
            <div class="card-header-flex" style="margin-bottom: 16px;">
              <div>
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 11v6M9 14h6"/></svg>
                  Equipo de Doctores & Especialistas
                </div>
                <div class="card-subtitle">Horarios, turnos y sincronización con Google Calendar</div>
              </div>
              <button class="btn-emerald-cta" onclick="openDoctorModal()">
                <span>+</span> Agregar Doctor
              </button>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                    <th style="padding: 10px 12px;">Doctor</th>
                    <th style="padding: 10px 12px;">Especialidad</th>
                    <th style="padding: 10px 12px;">Horario</th>
                    <th style="padding: 10px 12px;">Días Laborales</th>
                    <th style="padding: 10px 12px;">Duración</th>
                    <th style="padding: 10px 12px;">Google Calendar ID</th>
                    <th style="padding: 10px 12px; text-align: right;">Acciones</th>
                  </tr>
                </thead>
                <tbody id="catalog-doctors-tbody">
                  <!-- Inyectado vía JS -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECCIÓN 2: CATÁLOGO DE SERVICIOS & PRECIOS OFICIALES -->
          <div class="bento-card">
            <div class="card-header-flex" style="margin-bottom: 16px;">
              <div>
                <div class="card-title">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M12 2C7 2 4 5 4 9c0 3 1.5 6.5 3 10 1 2.5 2.5 3 5 3s4-.5 5-3c1.5-3.5 3-7 3-10 0-4-3-7-8-7z"/></svg>
                  Catálogo de Procedimientos & Tarifas Oficiales (Grounding IA)
                </div>
                <div class="card-subtitle">Valeria IA consulta estas tarifas para evitar alucinaciones económicas</div>
              </div>
              <div style="display: flex; gap: 10px;">
                <button class="pill-btn" style="background: rgba(0, 210, 106, 0.15); color: var(--accent-emerald); border-color: rgba(0, 210, 106, 0.3);" onclick="seedSuggestedTreatments()">
                  Cargar Sugeridos
                </button>
                <button class="btn-emerald-cta" onclick="openTreatmentModal()">
                  <span>+</span> Nuevo Tratamiento
                </button>
              </div>
            </div>

            <!-- FILTRO Y BÚSQUEDA EN TIEMPO REAL -->
            <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; align-items: center;">
              <div class="search-box" style="width: 300px;">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="treatment-search-input" placeholder="Buscar procedimiento, especialidad..." oninput="filterTreatments()" />
              </div>

              <select id="treatment-specialty-filter" onchange="filterTreatments()" class="form-input" style="width: 220px; padding: 7px 12px; font-size: 12px;">
                <option value="all">Todas las Especialidades</option>
                <option value="odontologia_general">Odontología General</option>
                <option value="ortodoncia">Ortodoncia</option>
                <option value="cirugia_implantes">Cirugía & Implantes</option>
                <option value="endodoncia">Endodoncia</option>
                <option value="odontopediatria">Odontopediatría</option>
              </select>

              <div id="treatments-count-badge" style="font-size: 12px; color: var(--text-muted); margin-left: auto;">
                0 tratamientos registrados
              </div>
            </div>

            <!-- PLANTILLAS RÁPIDAS SUGERIDAS -->
            <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase;">Agregar Rápido:</span>
              <button class="suggested-pill-btn" onclick="applyQuickSuggestion('Limpieza Dental Ultrasonido', 'odontologia_general', '$35 - $45 USD', 'Profilaxis completa con cavitrón ultrasónico y pulido dental.')">+ Limpieza ($35-$45)</button>
              <button class="suggested-pill-btn" onclick="applyQuickSuggestion('Brackets Metálicos Convencionales', 'ortodoncia', '$350 - $550 USD', 'Alineación dental integral con brackets de acero de alta precisión.')">+ Brackets ($350-$550)</button>
              <button class="suggested-pill-btn" onclick="applyQuickSuggestion('Cirugía de Cordales (Terceros Molares)', 'cirugia_implantes', '$70 - $120 USD', 'Extracción quirúrgica atraumática con sutura reabsorbible.')">+ Cordales ($70-$120)</button>
              <button class="suggested-pill-btn" onclick="applyQuickSuggestion('Blanqueamiento Dental LED', 'odontologia_general', '$120 - $180 USD', 'Aclaramiento dental seguro en consultorio de hasta 3 tonos.')">+ Blanqueamiento ($120-$180)</button>
              <button class="suggested-pill-btn" onclick="applyQuickSuggestion('Implante de Titanio Grado Médico', 'cirugia_implantes', '$700 - $950 USD', 'Fijación de raíz artificial de titanio con corona estética.')">+ Implante ($700-$950)</button>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                    <th style="padding: 10px 12px;">Procedimiento</th>
                    <th style="padding: 10px 12px;">Especialidad</th>
                    <th style="padding: 10px 12px;">Rango de Precio Oficial</th>
                    <th style="padding: 10px 12px;">Doctor Asignado</th>
                    <th style="padding: 10px 12px;">Explicación Médica IA</th>
                    <th style="padding: 10px 12px; text-align: right;">Acciones</th>
                  </tr>
                </thead>
                <tbody id="catalog-treatments-tbody">
                  <!-- Inyectado vía JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ================= PESTAÑA 3: CANALES (WHATSAPP & TELEGRAM) ================= -->
        <div id="tab-channels" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path></svg>
                Conexión Multicanal (Meta WhatsApp Cloud API & Telegram)
              </h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Conexión directa con la infraestructura oficial de Meta y tokens dedicados de Telegram para cada sede.
              </p>
            </div>
          </div>

          <div class="bento-grid">
            <div class="bento-card" style="grid-column: span 6;">
              <div class="card-header-flex">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-emerald-dim); display:flex; align-items:center; justify-content:center; color:var(--accent-emerald);">
                    <svg viewBox="0 0 24 24" class="icon-svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div class="card-title">Meta WhatsApp Cloud API (Oficial)</div>
                    <div class="card-subtitle">Graph API v21.0 — 0% Riesgo de Baneo</div>
                  </div>
                </div>
                <span class="badge-status">100% Oficial</span>
              </div>
              <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:16px;">
                Conexión directa con la infraestructura de Meta Business. Admite números móviles y fijos del consultorio, 1,000 conversaciones mensuales gratuitas y protección total contra suspensiones.
              </p>
              <div style="display:flex; gap:12px;">
                <button class="btn-emerald-cta" onclick="openWhatsappModal('odontocare_cuenca')">
                  Configurar Meta Cuenca
                </button>
                <button class="pill-btn" onclick="openWhatsappModal('dental_plus_quito')">
                  Configurar Meta Quito
                </button>
              </div>
            </div>

            <div class="bento-card" style="grid-column: span 6;">
              <div class="card-header-flex">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-blue-dim); display:flex; align-items:center; justify-content:center; color:var(--accent-blue);">
                    <svg viewBox="0 0 24 24" class="icon-svg"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                  <div>
                    <div class="card-title">Telegram Bot Gateway</div>
                    <div class="card-subtitle">Polling y Webhooks nativos</div>
                  </div>
                </div>
                <span class="badge-status">Operativo</span>
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

        <!-- ================= PESTAÑA 4: FLUJOS DEL BOT (SPLIT-SCREEN) ================= -->
        <div id="tab-flows" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 01-9 9"></path></svg>
                Flujos Conversacionales Auditados & Inspector en Pantalla Dividida
              </h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Selecciona cualquier flujo a la izquierda para probarlo en el simulador interactivo de la derecha en tiempo real.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size:13px; color:var(--text-muted);">Auditar para:</span>
              <select id="flow-clinic-selector" class="form-select" style="width: 220px;" onchange="renderFlows()">
                <!-- Inyectado vía JS -->
              </select>
            </div>
          </div>

          <!-- SPLIT SCREEN: IZQUIERDA FLUJOS / DERECHA TESTER -->
          <div class="flows-split-screen">
            <!-- COLUMNA IZQUIERDA: TARJETAS DE FLUJO -->
            <div id="flows-container" style="display:flex; flex-direction:column; gap:14px;">
              <!-- Inyectado vía JS -->
            </div>

            <!-- COLUMNA DERECHA: CHAT EN VIVO E INSPECTOR -->
            <div style="display:flex; flex-direction:column; gap:16px; position:sticky; top:80px;">
              <div class="chat-box-card" style="height: 440px;">
                <div class="chat-box-header">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:var(--accent-emerald-dim); display:flex; align-items:center; justify-content:center; color:var(--accent-emerald);">
                      <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/></svg>
                    </div>
                    <div>
                      <strong style="font-size:14px; color:#FFFFFF;">Simulador de Flujos Valeria IA</strong>
                      <div style="font-size:11px; color:var(--text-muted);" id="flows-chat-clinic-label">Sede Activa</div>
                    </div>
                  </div>
                </div>

                <div class="chat-messages-scroll" id="flows-chat-messages">
                  <div class="bubble bot">
                    Haz clic en "Probar este Flujo" en cualquiera de los flujos clínicos de la izquierda para verificar el comportamiento de Valeria IA y sus guardrails normativos.
                  </div>
                </div>

                <form class="chat-form-bar" onsubmit="sendFlowsChatMessage(event)">
                  <input type="text" id="flows-chat-input" class="chat-text-input" placeholder="Escribe o ejecuta un flujo..." autocomplete="off" />
                  <button type="submit" class="btn-emerald-cta" style="padding:9px 14px;">Enviar</button>
                </form>
              </div>

              <!-- INSPECTOR DE INFERENCIA -->
              <div class="inspector-card">
                <div class="inspector-heading">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Inspector de Razonamiento del Flujo
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                  <div class="form-group">
                    <label class="form-label">Modelo</label>
                    <div id="flows-trace-model" class="trace-card">gemini-2.5-flash</div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Latencia</label>
                    <div id="flows-trace-latency" class="trace-card">- ms</div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Herramientas Ejecutadas</label>
                  <div id="flows-trace-tools" class="trace-card">Ninguna</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= PESTAÑA 5: CITAS & CALENDARIOS ================= -->
        <div id="tab-appointments" class="tab-panel">
          <div class="section-header-flex">
            <div>
              <h2 class="section-title">
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Citas Agendadas en Google Calendar
              </h2>
              <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">
                Historial y turnos reservados en tiempo real con bloqueo atómico contra colisiones.
              </p>
            </div>
            <button class="pill-btn" onclick="fetchAppointments()">Actualizar Agenda</button>
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
                  <div style="width:32px; height:32px; border-radius:50%; background:var(--accent-emerald-dim); display:flex; align-items:center; justify-content:center; color:var(--accent-emerald);">
                    <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/></svg>
                  </div>
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
                <svg viewBox="0 0 24 24" class="icon-svg" style="color:var(--accent-emerald)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Inspector de Razonamiento
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

  <!-- MODAL 1: META WHATSAPP CLOUD API OFICIAL -->
  <div class="modal-backdrop" id="modal-whatsapp-qr">
    <div class="modal-card" style="max-width: 520px; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; background: rgba(0, 210, 106, 0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-emerald);">
            <svg viewBox="0 0 24 24" class="icon-svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h2 style="font-size: 18px; font-weight: 800; color: #FFFFFF;">Meta WhatsApp Cloud API</h2>
            <div style="font-size: 11px; color: var(--accent-emerald); font-weight: 700;">Conexión Oficial Meta — 0% Riesgo de Baneo</div>
          </div>
        </div>
        <button onclick="closeWhatsAppModal()" style="background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;" id="wa-modal-subtitle">
        Configura los identificadores oficiales de Meta Developers para este consultorio.
      </p>

      <form id="form-meta-whatsapp" onsubmit="saveMetaWhatsAppSettings(event)" style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
        <div class="form-group">
          <label class="form-label">Phone Number ID (Meta Graph API)</label>
          <input type="text" id="meta-phone-number-id" class="form-input" placeholder="ej. 109827364512345" required />
          <span style="font-size: 11px; color: var(--text-dim);">Encuéntralo en developers.facebook.com > WhatsApp > API Setup</span>
        </div>

        <div class="form-group">
          <label class="form-label">WhatsApp Business Account ID (WABA ID)</label>
          <input type="text" id="meta-waba-id" class="form-input" placeholder="ej. 987654321012345" required />
        </div>

        <div class="form-group">
          <label class="form-label">Token de Acceso Permanente (System User Token)</label>
          <input type="password" id="meta-access-token" class="form-input" placeholder="EAAG... (Token permanente de Meta Business)" required />
        </div>

        <div style="background: var(--bg-card-elevated); border: 1px solid var(--border); border-radius: 12px; padding: 12px; font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px;">
          <div style="color: #FFFFFF; font-weight: 700;">Webhook URL para Meta Developers:</div>
          <code style="background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 6px; color: var(--accent-emerald); font-family: var(--font-mono); font-size: 11px;">https://tu-dominio.com/webhooks/whatsapp</code>
          <div style="font-size: 11px; color: var(--text-dim);">Verify Token configurado en el servidor para suscripción automática.</div>
        </div>

        <div id="meta-status-message" style="display:none; font-size:12px; padding:8px 12px; border-radius:8px;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
          <button type="button" class="pill-btn" onclick="testMetaWhatsAppPing()">Ping de Prueba</button>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="pill-btn" onclick="closeWhatsAppModal()">Cerrar</button>
            <button type="submit" class="btn-emerald-cta">Guardar Credenciales</button>
          </div>
        </div>
      </form>
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
          <label class="form-label">Phone Number ID de Meta WhatsApp (Opcional)</label>
          <input type="text" id="new-clinic-whatsapp" class="form-input" placeholder="ej. 109827364512345" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
          <button type="button" class="pill-btn" onclick="closeNewClinicModal()">Cancelar</button>
          <button type="submit" class="btn-emerald-cta">Activar Clínica</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL 4: GESTIÓN DE DOCTOR -->
  <div class="modal-backdrop" id="modal-doctor">
    <div class="modal-card" style="max-width: 540px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; background: rgba(0, 210, 106, 0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-emerald);">
            <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 11v6M9 14h6"/></svg>
          </div>
          <h2 style="font-size: 19px; font-weight: 800; color: #FFFFFF;" id="modal-doctor-title">Agregar Doctor / Especialista</h2>
        </div>
        <button onclick="closeDoctorModal()" style="background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <form id="form-doctor" onsubmit="saveDoctorSettings(event)" style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
        <input type="hidden" id="doc-edit-id" value="" />
        
        <div class="form-group">
          <label class="form-label">Nombre Completo del Doctor</label>
          <input type="text" id="doc-name" class="form-input" placeholder="ej. Dra. Pamela Alvear" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Especialidad Principal</label>
            <select id="doc-specialty" class="form-input" required>
              <option value="odontologia_general">Odontología General</option>
              <option value="ortodoncia">Ortodoncia</option>
              <option value="cirugia_implantes">Cirugía & Implantes</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="odontopediatria">Odontopediatría</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Duración de Cita (Minutos)</label>
            <input type="number" id="doc-duration" class="form-input" min="15" max="180" step="5" value="45" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Hora Inicio Atención</label>
            <input type="time" id="doc-start-hour" class="form-input" value="08:30" required />
          </div>
          <div class="form-group">
            <label class="form-label">Hora Fin Atención</label>
            <input type="time" id="doc-end-hour" class="form-input" value="17:30" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Días Laborales Disponibles</label>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px;">
            <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#FFF; cursor:pointer;"><input type="checkbox" id="doc-day-1" value="1" checked /> Lun</label>
            <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#FFF; cursor:pointer;"><input type="checkbox" id="doc-day-2" value="2" checked /> Mar</label>
            <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#FFF; cursor:pointer;"><input type="checkbox" id="doc-day-3" value="3" checked /> Mié</label>
            <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#FFF; cursor:pointer;"><input type="checkbox" id="doc-day-4" value="4" checked /> Jue</label>
            <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#FFF; cursor:pointer;"><input type="checkbox" id="doc-day-5" value="5" checked /> Vie</label>
            <label style="display:flex; align-items:center; gap:4px; font-size:12px; color:#FFF; cursor:pointer;"><input type="checkbox" id="doc-day-6" value="6" /> Sáb</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Google Calendar ID (o Correo Sincronizado)</label>
          <input type="text" id="doc-calendar-id" class="form-input" placeholder="ej. dra.alvear@odontocare.com o primary" required />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
          <button type="button" class="pill-btn" onclick="closeDoctorModal()">Cancelar</button>
          <button type="submit" class="btn-emerald-cta">Guardar Doctor</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL 5: GESTIÓN DE TRATAMIENTO -->
  <div class="modal-backdrop" id="modal-treatment">
    <div class="modal-card" style="max-width: 540px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; background: rgba(0, 210, 106, 0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent-emerald);">
            <svg viewBox="0 0 24 24" class="icon-svg"><path d="M12 2C7 2 4 5 4 9c0 3 1.5 6.5 3 10 1 2.5 2.5 3 5 3s4-.5 5-3c1.5-3.5 3-7 3-10 0-4-3-7-8-7z"/></svg>
          </div>
          <h2 style="font-size: 19px; font-weight: 800; color: #FFFFFF;" id="modal-treatment-title">Nuevo Tratamiento & Tarifa</h2>
        </div>
        <button onclick="closeTreatmentModal()" style="background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <form id="form-treatment" onsubmit="saveTreatmentSettings(event)" style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
        <input type="hidden" id="treatment-edit-index" value="-1" />
        
        <div class="form-group">
          <label class="form-label">Nombre del Procedimiento</label>
          <input type="text" id="treatment-name" class="form-input" placeholder="ej. Limpieza Dental Profiláctica (Ultrasonido)" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label class="form-label">Especialidad</label>
            <select id="treatment-specialty" class="form-input" required>
              <option value="odontologia_general">Odontología General</option>
              <option value="ortodoncia">Ortodoncia</option>
              <option value="cirugia_implantes">Cirugía & Implantes</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="odontopediatria">Odontopediatría</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Rango de Precio Oficial (USD)</label>
            <input type="text" id="treatment-price" class="form-input" placeholder="ej. $35 - $45 USD" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Doctor o Especialista Preferente</label>
          <select id="treatment-doctor-select" class="form-input">
            <option value="">Cualquier especialista disponible</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Explicación Médica para la IA (Grounding)</label>
          <textarea id="treatment-desc" class="form-input" rows="3" placeholder="Describe brevemente en qué consiste el procedimiento para que Valeria IA oriente con precisión médica al paciente." required style="resize:vertical;"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
          <button type="button" class="pill-btn" onclick="closeTreatmentModal()">Cancelar</button>
          <button type="submit" class="btn-emerald-cta">Guardar Tratamiento</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    let currentClinics = [];
    let activeChatClinicId = '';
    let activeWorkspaceClinicId = '';
    let activeCatalogClinicId = '';
    let currentDoctorsList = [];
    let currentTreatmentsList = [];
    let currentWorkspaceData = null;

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

      const titleMap = {
        'overview': 'Dashboard',
        'clinics': 'Red de Clínicas Odontológicas',
        'clinic-workspace': 'Workspace de Consultorio',
        'catalog': 'Precios & Doctores',
        'channels': 'Canales WhatsApp & Telegram',
        'flows': 'Verificador de Flujos Conversacionales',
        'appointments': 'Agenda y Citas Médicas',
        'playground': 'Playground Multi-Tenant'
      };
      document.getElementById('page-title').innerText = titleMap[tabKey] || 'Dashboard';

      if (tabKey === 'catalog') {
        renderCatalogView();
      } else if (tabKey === 'flows') {
        renderFlows();
      } else if (tabKey === 'overview') {
        fetchRealMetrics();
      }
    }

    // ================= CARGA DE MÉTRICAS REALES (0 MOCK DATA) =================
    async function fetchRealMetrics() {
      try {
        const res = await fetch('/api/metrics/real', { headers: getAuthHeaders() });
        const data = await res.json();
        const m = data.metrics || data;
        
        // 1. Total Citas
        const totalCitasEl = document.getElementById('overview-total-citas');
        if (totalCitasEl) {
          totalCitasEl.innerText = (m.totalAppointments || 0) + ' Citas';
        }

        // 2. Pacientes / Sesiones
        const patientsBadge = document.getElementById('overview-patients-badge');
        if (patientsBadge) {
          const count = m.totalPatients || 0;
          patientsBadge.innerText = count === 1 ? '1 Sesión Activa' : count + ' Sesiones';
        }

        // 3. Canales
        const tgPct = m.channels?.telegramPercent ?? m.channels?.telegram ?? 100;
        const waPct = m.channels?.whatsappPercent ?? m.channels?.whatsapp ?? 0;
        
        const tgPill = document.getElementById('overview-channel-tg-pill');
        const waPill = document.getElementById('overview-channel-wa-pill');
        const tgBar = document.getElementById('overview-bar-telegram');
        const waBar = document.getElementById('overview-bar-whatsapp');

        if (tgPill) tgPill.innerText = 'TG: ' + tgPct + '%';
        if (waPill) waPill.innerText = 'WA: ' + waPct + '%';
        if (tgBar) tgBar.style.width = tgPct + '%';
        if (waBar) waBar.style.width = waPct + '%';

        // 4. Eficiencia
        const convEl = document.getElementById('overview-conversion-rate');
        if (convEl) convEl.innerText = (m.conversionRate || 0) + '% conv.';

        // 5. Retención
        const retEl = document.getElementById('overview-retention-rate');
        if (retEl) retEl.innerHTML = (m.retentionRate || 0) + '<span style="font-size: 16px; color:var(--text-muted);">%</span>';

      } catch (err) {
        console.error('Error fetching real metrics:', err);
      }
    }

    // ================= INGRESO A WORKSPACE DE CLÍNICA =================
    async function enterClinicWorkspace(clinicId) {
      activeWorkspaceClinicId = clinicId;
      const wsNavBtn = document.getElementById('btn-nav-workspace');
      if (wsNavBtn) wsNavBtn.style.display = 'flex';
      
      switchNavTab('clinic-workspace');
      await loadClinicWorkspace(clinicId);
    }

    async function loadClinicWorkspace(clinicId) {
      try {
        const res = await fetch('/api/clinics/' + encodeURIComponent(clinicId) + '/dashboard', {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        currentWorkspaceData = data;

        const clinic = data.clinic;
        document.getElementById('workspace-clinic-name').innerText = clinic.name;
        document.getElementById('workspace-clinic-sub').innerText = 
          clinic.city + ' • ' + (clinic.address || 'Sede Central') + ' • Contacto: ' + (clinic.contactPerson || 'Administración') + ' (' + (clinic.phone || clinic.emergencyPhone) + ')';
        
        // KPIs
        document.getElementById('ws-kpi-chairs').innerText = (data.chairsCount || 3) + ' Sillones';
        document.getElementById('ws-kpi-today-citas').innerText = (data.todayAppointments ? data.todayAppointments.length : 0) + ' Citas';
        
        const activeDocsCount = (data.doctors || []).filter(d => d.isActive !== false).length;
        document.getElementById('ws-kpi-active-docs').innerText = activeDocsCount + ' / ' + (data.doctors || []).length;

        // Semáforo KPI
        const inv = normalizeInventory(data.inventoryStatus || (clinic && clinic.inventoryStatus));
        const isCritical = Object.values(inv).includes('critico');
        const isLow = Object.values(inv).includes('bajo');
        const kpiInv = document.getElementById('ws-kpi-inventory');
        if (isCritical) {
          kpiInv.innerText = 'Crítico';
          kpiInv.style.color = 'var(--accent-coral)';
        } else if (isLow) {
          kpiInv.innerText = 'Bajo';
          kpiInv.style.color = 'var(--accent-amber)';
        } else {
          kpiInv.innerText = 'Óptimo';
          kpiInv.style.color = 'var(--accent-emerald)';
        }

        renderWorkspaceDoctors(data.doctors || []);
        renderWorkspaceInventory(inv);
        renderWorkspaceAppointments(data.todayAppointments || []);
        renderWorkspaceTransparency(data.recentConversations || []);

      } catch (err) {
        console.error('Error cargando workspace de clínica:', err);
      }
    }

    function renderWorkspaceDoctors(doctors) {
      const container = document.getElementById('ws-doctors-shift-grid');
      if (!doctors || doctors.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted)">No hay doctores registrados en esta sede.</div>';
        return;
      }

      container.innerHTML = doctors.map(doc => {
        const isActive = doc.isActive !== false;
        const hours = (doc.workingHours?.start || '08:30') + ' - ' + (doc.workingHours?.end || '17:30');
        const specLabel = (doc.specialty || 'General').replace('_', ' ');

        return \`
          <div class="doctor-shift-card">
            <div class="doctor-shift-header">
              <div class="doctor-shift-avatar">
                <svg viewBox="0 0 24 24" class="icon-svg"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0114 0v2"/><path d="M12 11v6M9 14h6"/></svg>
              </div>
              <div style="flex:1;">
                <div style="font-size:14px; font-weight:700; color:#FFF;">\${doc.name}</div>
                <div style="font-size:11px; color:var(--text-dim); text-transform:capitalize;">\${specLabel}</div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Turno: \${hours}</div>
              </div>
            </div>

            <button class="btn-toggle-shift \${isActive ? 'active' : 'absent'}" onclick="toggleDoctorShift('\${doc.id}')">
              \${isActive 
                ? '<svg viewBox="0 0 24 24" class="icon-svg" style="width:14px; height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Activo en Turno' 
                : '<svg viewBox="0 0 24 24" class="icon-svg" style="width:14px; height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Marcar Presente (Ausente)'}
            </button>
          </div>
        \`;
      }).join('');
    }

    async function toggleDoctorShift(doctorId) {
      if (!activeWorkspaceClinicId) return;
      try {
        const res = await fetch('/api/clinics/' + encodeURIComponent(activeWorkspaceClinicId) + '/doctors/' + encodeURIComponent(doctorId) + '/toggle-status', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.ok) {
          await loadClinicWorkspace(activeWorkspaceClinicId);
        } else {
          alert('No se pudo cambiar el estado del doctor.');
        }
      } catch (err) {
        alert('Error de conexión al alternar turno del especialista.');
      }
    }

    function normalizeInventory(rawInv) {
      const result = { anesthetics: 'optimo', needles: 'optimo', resins: 'optimo', sterilizedKits: 'optimo' };
      if (!rawInv) return result;
      if (Array.isArray(rawInv)) {
        rawInv.forEach(item => {
          const name = (item.item || '').toLowerCase();
          let key = '';
          if (name.includes('anest')) key = 'anesthetics';
          else if (name.includes('aguja') || name.includes('needle')) key = 'needles';
          else if (name.includes('resin')) key = 'resins';
          else if (name.includes('kit') || name.includes('esteril') || name.includes('estéril')) key = 'sterilizedKits';

          if (key) {
            const lvl = (item.level || '').toLowerCase();
            result[key] = (lvl === 'critical' || lvl === 'critico') ? 'critico' : (lvl === 'low' || lvl === 'bajo') ? 'bajo' : 'optimo';
          }
        });
      } else if (typeof rawInv === 'object') {
        Object.entries(rawInv).forEach(([k, v]) => {
          const val = String(v).toLowerCase();
          result[k] = (val === 'critical' || val === 'critico') ? 'critico' : (val === 'low' || val === 'bajo') ? 'bajo' : 'optimo';
        });
      }
      return result;
    }

    function renderWorkspaceInventory(rawInv) {
      const inv = normalizeInventory(rawInv);
      const container = document.getElementById('ws-inventory-grid');
      const items = [
        { key: 'anesthetics', label: 'Anestesia Dental (Mepivacaína/Lidocaína)' },
        { key: 'needles', label: 'Agujas Quirúrgicas Desechables' },
        { key: 'resins', label: 'Resinas Compuestas Estéticas' },
        { key: 'sterilizedKits', label: 'Kits de Instrumental Estéril' }
      ];

      container.innerHTML = items.map(item => {
        const status = inv[item.key] || 'optimo';
        const labels = { optimo: 'Óptimo', bajo: 'Stock Bajo', critico: 'Crítico' };

        return \`
          <div class="inventory-card">
            <div style="font-size:12px; font-weight:700; color:#FFF; line-height:1.3;">\${item.label}</div>
            <span class="inventory-status-pill \${status}">\${labels[status]}</span>
            <div style="display:flex; gap:6px; margin-top:auto;">
              <button class="pill-btn" style="padding:3px 8px; font-size:10px;" onclick="setInventoryStatus('\${item.key}', 'optimo')">Óptimo</button>
              <button class="pill-btn" style="padding:3px 8px; font-size:10px;" onclick="setInventoryStatus('\${item.key}', 'bajo')">Bajo</button>
              <button class="pill-btn" style="padding:3px 8px; font-size:10px;" onclick="setInventoryStatus('\${item.key}', 'critico')">Crítico</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    async function setInventoryStatus(itemKey, status) {
      if (!activeWorkspaceClinicId) return;
      try {
        const payload = { [itemKey]: status };
        const res = await fetch('/api/clinics/' + encodeURIComponent(activeWorkspaceClinicId) + '/inventory', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          await loadClinicWorkspace(activeWorkspaceClinicId);
        }
      } catch (err) {
        console.error('Error al actualizar inventario:', err);
      }
    }

    function renderWorkspaceAppointments(appointments) {
      const tbody = document.getElementById('ws-appointments-tbody');
      if (!appointments || appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No hay citas agendadas para el día de hoy en esta sede.</td></tr>';
        return;
      }

      tbody.innerHTML = appointments.map(a => \`
        <tr>
          <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-emerald);">\${a.start || '--:--'}</td>
          <td style="font-weight:700; color:#FFF;">\${a.patientName}</td>
          <td style="font-family:var(--font-mono); color:var(--text-muted);">\${a.patientPhone}</td>
          <td>\${a.treatment || 'Consulta General'}</td>
          <td>\${a.doctorName || 'Dr. Asignado'}</td>
          <td><span class="badge-status">Confirmada</span></td>
        </tr>
      \`).join('');
    }

    function filterWorkspaceAppointments(filter) {
      if (!currentWorkspaceData) return;
      renderWorkspaceAppointments(currentWorkspaceData.todayAppointments || []);
    }

    function renderWorkspaceTransparency(conversations) {
      const container = document.getElementById('ws-transparency-list');
      if (!conversations || conversations.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:12px;">Sin registros recientes de triaje en esta sede.</div>';
        return;
      }

      container.innerHTML = conversations.map(c => {
        const painScore = c.painScore || 0;
        let painClass = 'eva-mild';
        if (painScore >= 7) painClass = 'eva-severe';
        else if (painScore >= 4) painClass = 'eva-moderate';

        return \`
          <div class="transparency-item">
            <div>
              <div style="font-weight:700; color:#FFF;">\${c.patientId}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">\${c.lastMessage}</div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="eva-badge \${painClass}">EVA \${painScore}/10</span>
              <span style="font-size:11px; color:var(--text-dim); font-family:var(--font-mono);">\${c.timestamp}</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    // ================= SUITE DE PRECIOS & DOCTORES =================
    async function renderCatalogView() {
      if (!currentClinics || currentClinics.length === 0) {
        await fetchClinics();
      }
      if (!activeCatalogClinicId && currentClinics.length > 0) {
        activeCatalogClinicId = currentClinics[0].clinicId;
      }
      renderCatalogClinicPills();
      await fetchCatalogDoctors();
      await fetchCatalogTreatments();
    }

    function renderCatalogClinicPills() {
      const container = document.getElementById('catalog-clinics-bar');
      if (!container) return;
      container.innerHTML = currentClinics.map(c => \`
        <button class="catalog-clinic-pill \${c.clinicId === activeCatalogClinicId ? 'active' : ''}" onclick="selectCatalogClinic('\${c.clinicId}')">
          <svg viewBox="0 0 24 24" class="icon-svg" style="width:14px; height:14px;"><path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h6M12 8v6"></path></svg>
          \${c.name} (\${c.city})
        </button>
      \`).join('');
    }

    async function selectCatalogClinic(clinicId) {
      activeCatalogClinicId = clinicId;
      renderCatalogClinicPills();
      await fetchCatalogDoctors();
      await fetchCatalogTreatments();
    }

    async function fetchCatalogDoctors() {
      const tbody = document.getElementById('catalog-doctors-tbody');
      if (!tbody) return;
      if (!activeCatalogClinicId) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:16px;">Selecciona una clínica.</td></tr>';
        return;
      }
      try {
        const res = await fetch('/api/clinics/' + activeCatalogClinicId + '/doctors', {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        currentDoctorsList = data.doctors || [];
        renderCatalogDoctors();
        updateTreatmentDoctorDropdown();
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--accent-coral); padding:16px;">Error al cargar doctores.</td></tr>';
      }
    }

    function renderCatalogDoctors() {
      const tbody = document.getElementById('catalog-doctors-tbody');
      if (!tbody) return;
      if (currentDoctorsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">No hay doctores registrados para esta sede. Agrega uno con el botón superior.</td></tr>';
        return;
      }

      const dayNames = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };
      const specialtyClassMap = {
        'odontologia_general': 'general',
        'ortodoncia': 'ortodoncia',
        'cirugia_implantes': 'cirugia',
        'endodoncia': 'endodoncia',
        'odontopediatria': 'pediatria'
      };

      tbody.innerHTML = currentDoctorsList.map(doc => {
        const sClass = specialtyClassMap[doc.specialty] || 'general';
        const daysHtml = [1,2,3,4,5,6].map(d => {
          const isAct = doc.availableDays && doc.availableDays.includes(d);
          return \`<span class="day-chip \${isAct ? 'active' : ''}">\${dayNames[d]}</span>\`;
        }).join(' ');

        return \`
          <tr class="table-data-row">
            <td style="padding: 12px; font-weight: 700; color: #FFF;">\${doc.name}</td>
            <td style="padding: 12px;">
              <span class="badge-specialty \${sClass}">\${(doc.specialty || '').replace('_', ' ')}</span>
            </td>
            <td style="padding: 12px; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">
              \${doc.workingHours?.start || '08:30'} - \${doc.workingHours?.end || '17:30'}
            </td>
            <td style="padding: 12px;">\${daysHtml}</td>
            <td style="padding: 12px; font-family: var(--font-mono); color: var(--accent-emerald);">
              \${doc.appointmentDurationMinutes || 45} min
            </td>
            <td style="padding: 12px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              \${doc.calendarId || 'primary'}
            </td>
            <td style="padding: 12px; text-align: right; white-space: nowrap;">
              <button class="pill-btn" onclick="openDoctorModal('\${doc.id}')" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;">Editar</button>
              <button class="pill-btn" onclick="deleteDoctor('\${doc.id}')" style="padding: 4px 8px; font-size: 11px; color: var(--accent-coral);">Eliminar</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function openDoctorModal(doctorId) {
      const modal = document.getElementById('modal-doctor');
      const title = document.getElementById('modal-doctor-title');
      const editIdInput = document.getElementById('doc-edit-id');

      if (doctorId) {
        const doc = currentDoctorsList.find(d => d.id === doctorId);
        if (!doc) return;
        title.innerText = 'Editar Doctor: ' + doc.name;
        editIdInput.value = doc.id;
        document.getElementById('doc-name').value = doc.name;
        document.getElementById('doc-specialty').value = doc.specialty;
        document.getElementById('doc-duration').value = doc.appointmentDurationMinutes || 45;
        document.getElementById('doc-start-hour').value = doc.workingHours?.start || '08:30';
        document.getElementById('doc-end-hour').value = doc.workingHours?.end || '17:30';
        document.getElementById('doc-calendar-id').value = doc.calendarId || '';
        
        for (let i = 1; i <= 6; i++) {
          const cb = document.getElementById('doc-day-' + i);
          if (cb) cb.checked = doc.availableDays ? doc.availableDays.includes(i) : true;
        }
      } else {
        title.innerText = 'Agregar Doctor / Especialista';
        editIdInput.value = '';
        document.getElementById('form-doctor').reset();
        document.getElementById('doc-duration').value = '45';
        document.getElementById('doc-start-hour').value = '08:30';
        document.getElementById('doc-end-hour').value = '17:30';
        for (let i = 1; i <= 5; i++) {
          const cb = document.getElementById('doc-day-' + i);
          if (cb) cb.checked = true;
        }
        const sCb = document.getElementById('doc-day-6');
        if (sCb) sCb.checked = false;
      }
      modal.classList.add('open');
      modal.classList.add('active');
    }

    function closeDoctorModal() {
      const modal = document.getElementById('modal-doctor');
      modal.classList.remove('open');
      modal.classList.remove('active');
    }

    async function saveDoctorSettings(e) {
      e.preventDefault();
      const editId = document.getElementById('doc-edit-id').value.trim();
      const name = document.getElementById('doc-name').value.trim();
      const specialty = document.getElementById('doc-specialty').value;
      const duration = parseInt(document.getElementById('doc-duration').value, 10) || 45;
      const startHour = document.getElementById('doc-start-hour').value;
      const endHour = document.getElementById('doc-end-hour').value;
      const calendarId = document.getElementById('doc-calendar-id').value.trim();

      const days = [];
      for (let i = 1; i <= 6; i++) {
        const cb = document.getElementById('doc-day-' + i);
        if (cb && cb.checked) days.push(i);
      }

      const id = editId || ('doc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5));

      const doctorPayload = {
        id,
        name,
        specialty,
        workingHours: { start: startHour, end: endHour },
        availableDays: days.length > 0 ? days : [1, 2, 3, 4, 5],
        appointmentDurationMinutes: duration,
        calendarId: calendarId || 'primary'
      };

      const targetClinic = activeCatalogClinicId || activeWorkspaceClinicId || (currentClinics[0] ? currentClinics[0].clinicId : 'odontocare_cuenca');

      try {
        const res = await fetch('/api/clinics/' + targetClinic + '/doctors', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(doctorPayload)
        });
        const data = await res.json();
        if (data.ok) {
          closeDoctorModal();
          await fetchCatalogDoctors();
          if (activeWorkspaceClinicId) await loadClinicWorkspace(activeWorkspaceClinicId);
        } else {
          alert('Error al guardar doctor: ' + (data.error || 'Desconocido'));
        }
      } catch (err) {
        alert('Error de conexión al guardar doctor.');
      }
    }

    async function deleteDoctor(doctorId) {
      if (!confirm('¿Estás seguro de eliminar este doctor de la clínica?')) return;
      try {
        const res = await fetch('/api/clinics/' + activeCatalogClinicId + '/doctors/' + doctorId, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.ok) {
          await fetchCatalogDoctors();
        } else {
          alert('No se pudo eliminar el doctor.');
        }
      } catch (err) {
        alert('Error de conexión al eliminar doctor.');
      }
    }

    // --- TRATAMIENTOS & PRECIOS ---
    async function fetchCatalogTreatments() {
      const tbody = document.getElementById('catalog-treatments-tbody');
      if (!tbody) return;
      if (!activeCatalogClinicId) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">Selecciona una clínica.</td></tr>';
        return;
      }
      try {
        const res = await fetch('/api/clinics/' + activeCatalogClinicId + '/treatments', {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        currentTreatmentsList = data.treatments || [];
        filterTreatments();
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--accent-coral); padding:16px;">Error al cargar tratamientos.</td></tr>';
      }
    }

    function filterTreatments() {
      const searchVal = (document.getElementById('treatment-search-input')?.value || '').toLowerCase().trim();
      const specFilter = document.getElementById('treatment-specialty-filter')?.value || 'all';

      let filtered = currentTreatmentsList.map((item, idx) => ({ ...item, _originalIndex: idx })).filter(item => {
        const matchesSearch = !searchVal || 
          item.name.toLowerCase().includes(searchVal) ||
          (item.description && item.description.toLowerCase().includes(searchVal)) ||
          item.priceRange.toLowerCase().includes(searchVal);
        const matchesSpec = specFilter === 'all' || item.specialty === specFilter;
        return matchesSearch && matchesSpec;
      });

      renderCatalogTreatments(filtered);
      const countBadge = document.getElementById('treatments-count-badge');
      if (countBadge) {
        countBadge.innerText = currentTreatmentsList.length + ' tratamientos registrados (' + filtered.length + ' mostrados)';
      }
    }

    function renderCatalogTreatments(list) {
      const tbody = document.getElementById('catalog-treatments-tbody');
      if (!tbody) return;

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">No se encontraron procedimientos con los filtros actuales.</td></tr>';
        return;
      }

      const specialtyClassMap = {
        'odontologia_general': 'general',
        'ortodoncia': 'ortodoncia',
        'cirugia_implantes': 'cirugia',
        'endodoncia': 'endodoncia',
        'odontopediatria': 'pediatria'
      };

      tbody.innerHTML = list.map(item => {
        const sClass = specialtyClassMap[item.specialty] || 'general';
        const assignedDoc = item.assignedDoctorId 
          ? (currentDoctorsList.find(d => d.id === item.assignedDoctorId)?.name || 'Especialista (' + item.assignedDoctorId + ')')
          : 'Cualquier especialista disponible';

        return \`
          <tr class="table-data-row">
            <td style="padding: 12px; font-weight: 700; color: #FFF;">\${item.name}</td>
            <td style="padding: 12px;">
              <span class="badge-specialty \${sClass}">\${(item.specialty || 'general').replace('_', ' ')}</span>
            </td>
            <td style="padding: 12px; font-weight: 800; color: var(--accent-emerald); font-family: var(--font-mono);">
              \${item.priceRange}
            </td>
            <td style="padding: 12px; font-size: 12px; color: var(--text-muted);">
              \${assignedDoc === 'Cualquier especialista disponible' ? '<span style="color:var(--text-dim);">' + assignedDoc + '</span>' : '<strong>' + assignedDoc + '</strong>'}
            </td>
            <td style="padding: 12px; font-size: 12px; color: var(--text-muted); max-width: 280px; line-height: 1.4;">
              \${item.description || 'Sin descripción médica configurada.'}
            </td>
            <td style="padding: 12px; text-align: right; white-space: nowrap;">
              <button class="pill-btn" onclick="openTreatmentModal(\${item._originalIndex})" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;">Editar</button>
              <button class="pill-btn" onclick="deleteTreatment(\${item._originalIndex})" style="padding: 4px 8px; font-size: 11px; color: var(--accent-coral);">Eliminar</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function updateTreatmentDoctorDropdown() {
      const select = document.getElementById('treatment-doctor-select');
      if (!select) return;
      let html = '<option value="">Cualquier especialista disponible</option>';
      currentDoctorsList.forEach(d => {
        html += \`<option value="\${d.id}">\${d.name} (\${d.specialty.replace('_', ' ')})</option>\`;
      });
      select.innerHTML = html;
    }

    function openTreatmentModal(index) {
      updateTreatmentDoctorDropdown();
      const modal = document.getElementById('modal-treatment');
      const title = document.getElementById('modal-treatment-title');
      const editIndexInput = document.getElementById('treatment-edit-index');

      if (typeof index === 'number' && index >= 0 && index < currentTreatmentsList.length) {
        const item = currentTreatmentsList[index];
        title.innerText = 'Editar Tratamiento: ' + item.name;
        editIndexInput.value = index;
        document.getElementById('treatment-name').value = item.name;
        document.getElementById('treatment-specialty').value = item.specialty || 'odontologia_general';
        document.getElementById('treatment-price').value = item.priceRange;
        document.getElementById('treatment-doctor-select').value = item.assignedDoctorId || '';
        document.getElementById('treatment-desc').value = item.description || '';
      } else {
        title.innerText = 'Nuevo Tratamiento & Tarifa';
        editIndexInput.value = '-1';
        document.getElementById('form-treatment').reset();
      }
      modal.classList.add('open');
      modal.classList.add('active');
    }

    function closeTreatmentModal() {
      const modal = document.getElementById('modal-treatment');
      modal.classList.remove('open');
      modal.classList.remove('active');
    }

    async function saveTreatmentSettings(e) {
      e.preventDefault();
      const editIndex = parseInt(document.getElementById('treatment-edit-index').value, 10);
      const name = document.getElementById('treatment-name').value.trim();
      const specialty = document.getElementById('treatment-specialty').value;
      const priceRange = document.getElementById('treatment-price').value.trim();
      const assignedDoctorId = document.getElementById('treatment-doctor-select').value || undefined;
      const description = document.getElementById('treatment-desc').value.trim();

      const payload = { name, specialty, priceRange, assignedDoctorId, description };

      try {
        let res;
        if (editIndex >= 0) {
          res = await fetch('/api/clinics/' + activeCatalogClinicId + '/treatments/' + editIndex, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/api/clinics/' + activeCatalogClinicId + '/treatments', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          });
        }
        const data = await res.json();
        if (data.ok) {
          closeTreatmentModal();
          await fetchCatalogTreatments();
        } else {
          alert('Error al guardar tratamiento: ' + (data.error || 'Desconocido'));
        }
      } catch (err) {
        alert('Error de conexión al guardar tratamiento.');
      }
    }

    async function deleteTreatment(index) {
      if (!confirm('¿Estás seguro de eliminar este procedimiento del catálogo?')) return;
      try {
        const res = await fetch('/api/clinics/' + activeCatalogClinicId + '/treatments/' + index, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.ok) {
          await fetchCatalogTreatments();
        } else {
          alert('No se pudo eliminar el tratamiento.');
        }
      } catch (err) {
        alert('Error de conexión al eliminar tratamiento.');
      }
    }

    async function seedSuggestedTreatments() {
      if (!confirm('¿Deseas precargar el catálogo con tratamientos sugeridos de alta demanda (Limpieza, Brackets, Cordales, Implantes, Blanqueamiento)?')) return;
      try {
        const res = await fetch('/api/clinics/' + activeCatalogClinicId + '/treatments/seed-suggested', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.ok) {
          await fetchCatalogTreatments();
        }
      } catch (err) {
        alert('Error al precargar catálogo sugerido.');
      }
    }

    function applyQuickSuggestion(name, specialty, price, desc) {
      openTreatmentModal(-1);
      document.getElementById('treatment-name').value = name;
      document.getElementById('treatment-specialty').value = specialty;
      document.getElementById('treatment-price').value = price;
      document.getElementById('treatment-desc').value = desc;
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
      await fetchRealMetrics();
      renderFlows();
    }

    async function fetchClinics() {
      try {
        const res = await fetch('/api/clinics');
        const data = await res.json();
        currentClinics = data.clinics || [];
        renderClinics();
        populateClinicSelectors();
        const badge = document.getElementById('nav-clinics-badge');
        if (badge) badge.innerText = currentClinics.length;
      } catch (err) {
        console.error('Error al cargar clínicas:', err);
      }
    }

    function renderClinics() {
      const container = document.getElementById('clinics-container');
      if (!container) return;
      if (!currentClinics.length) {
        container.innerHTML = '<div style="color:var(--text-muted)">No hay clínicas registradas.</div>';
        return;
      }

      container.innerHTML = currentClinics.map(c => {
        const chairs = c.chairsCount || 3;
        const contact = c.contactPerson || 'Administración';
        const phone = c.phone || c.emergencyPhone || '+593 99 876 5432';

        return \`
          <div class="clinic-card">
            <div class="clinic-header">
              <div>
                <div class="clinic-name">\${c.name}</div>
                <div class="clinic-location">
                  <svg viewBox="0 0 24 24" class="icon-svg" style="width:13px; height:13px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  \${c.city} — \${c.address || 'Sede Central'}
                </div>
              </div>
              <span class="badge-status">
                <span class="status-dot"></span> Bot Activo
              </span>
            </div>

            <div class="clinic-details-box">
              <div class="detail-row">
                <span style="color:var(--text-muted);">Contacto Sede:</span>
                <span class="detail-val">\${contact} (\${phone})</span>
              </div>
              <div class="detail-row">
                <span style="color:var(--text-muted);">Capacidad Operativa:</span>
                <span class="detail-val" style="color:var(--accent-emerald);">\${chairs} Sillones Dentales</span>
              </div>
              <div class="detail-row">
                <span style="color:var(--text-muted);">Canales Activos:</span>
                <span class="detail-val">Telegram Live • \${c.metaPhoneNumberId ? 'Meta WABA Oficial' : 'Meta WABA Standby'}</span>
              </div>
              <div class="detail-row">
                <span style="color:var(--text-muted);">Privacidad Pacientes:</span>
                <span class="detail-val" style="color:var(--accent-blue);">Aislado LOPDP</span>
              </div>
            </div>

            <div class="card-actions-grid">
              <button class="btn-action-channel btn-action-primary" onclick="enterClinicWorkspace('\${c.clinicId}')">
                <svg viewBox="0 0 24 24" class="icon-svg" style="width:15px; height:15px;"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Ingresar a Clínica
              </button>
              <button class="btn-action-channel wa" onclick="openWhatsappModal('\${c.clinicId}')">
                Meta WhatsApp
              </button>
              <button class="btn-action-channel tg" onclick="openTelegramModal('\${c.clinicId}')">
                Telegram
              </button>
              <button class="btn-action-channel play" onclick="openClinicInPlayground('\${c.clinicId}')">
                Probar Chat
              </button>
              <button class="btn-action-channel" onclick="goToClinicCatalog('\${c.clinicId}')">
                Precios & Doctores
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function goToClinicCatalog(clinicId) {
      activeCatalogClinicId = clinicId;
      switchNavTab('catalog');
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
      document.getElementById('modal-new-clinic').classList.add('active');
    }

    function closeNewClinicModal() {
      document.getElementById('modal-new-clinic').classList.remove('open');
      document.getElementById('modal-new-clinic').classList.remove('active');
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
        metaPhoneNumberId: document.getElementById('new-clinic-whatsapp').value.trim() || undefined,
        whatsappInstance: document.getElementById('new-clinic-whatsapp').value.trim() || undefined,
        chairsCount: 3,
        doctors: [
          { id: 'doc_1', name: 'Dr. Principal', specialty: 'odontologia_general', specialtyLabel: 'Odontología General', availableDays: [1,2,3,4,5], hours: { start: '09:00', end: '18:00' }, isActive: true }
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
        } else {
          alert('Error: ' + (data.error || 'No se pudo guardar la clínica'));
        }
      } catch (err) {
        alert('Error de red al crear la clínica');
      }
    }

    // ================= MODAL WHATSAPP (META CLOUD API OFICIAL) =================
    let activeMetaClinicId = '';

    function openWhatsappModal(clinicId) {
      activeMetaClinicId = clinicId;
      const clinic = currentClinics.find(c => c.clinicId === clinicId);
      document.getElementById('wa-modal-subtitle').innerText = 'Clínica: ' + (clinic ? clinic.name : clinicId);
      document.getElementById('meta-phone-number-id').value = clinic?.metaPhoneNumberId || '';
      document.getElementById('meta-waba-id').value = clinic?.metaWabaId || '';
      document.getElementById('meta-access-token').value = clinic?.metaAccessToken || '';
      
      const statusDiv = document.getElementById('meta-status-message');
      if (statusDiv) statusDiv.style.display = 'none';

      document.getElementById('modal-whatsapp-qr').classList.add('open');
      document.getElementById('modal-whatsapp-qr').classList.add('active');
    }

    function closeWhatsAppModal() {
      document.getElementById('modal-whatsapp-qr').classList.remove('open');
      document.getElementById('modal-whatsapp-qr').classList.remove('active');
    }

    async function saveMetaWhatsAppSettings(e) {
      e.preventDefault();
      const statusDiv = document.getElementById('meta-status-message');
      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(0, 210, 106, 0.1)';
        statusDiv.style.color = 'var(--accent-emerald)';
        statusDiv.innerText = 'Guardando credenciales oficiales de Meta...';
      }

      const metaPhoneNumberId = document.getElementById('meta-phone-number-id').value.trim();
      const metaWabaId = document.getElementById('meta-waba-id').value.trim();
      const metaAccessToken = document.getElementById('meta-access-token').value.trim();

      try {
        const res = await fetch('/api/clinics/' + encodeURIComponent(activeMetaClinicId) + '/meta-whatsapp', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ metaPhoneNumberId, metaWabaId, metaAccessToken })
        });
        const data = await res.json();
        if (data.ok) {
          if (statusDiv) statusDiv.innerText = '¡Credenciales de Meta WhatsApp Cloud guardadas con éxito!';
          await fetchClinics();
          setTimeout(() => { closeWhatsAppModal(); }, 1200);
        } else {
          if (statusDiv) {
            statusDiv.style.background = 'rgba(255, 107, 74, 0.1)';
            statusDiv.style.color = 'var(--accent-coral)';
            statusDiv.innerText = 'Error: ' + (data.error || 'No se pudo guardar');
          }
        }
      } catch (err) {
        if (statusDiv) {
          statusDiv.style.background = 'rgba(255, 107, 74, 0.1)';
          statusDiv.style.color = 'var(--accent-coral)';
          statusDiv.innerText = 'Error de red al conectar con el servidor';
        }
      }
    }

    async function testMetaWhatsAppPing() {
      const statusDiv = document.getElementById('meta-status-message');
      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(59, 130, 246, 0.1)';
        statusDiv.style.color = 'var(--accent-blue)';
        statusDiv.innerText = 'Enviando ping de prueba a Meta Graph API...';
      }

      try {
        const res = await fetch('/api/clinics/' + encodeURIComponent(activeMetaClinicId) + '/meta-whatsapp/test', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({})
        });
        const data = await res.json();
        if (data.ok) {
          if (statusDiv) {
            statusDiv.style.background = 'rgba(0, 210, 106, 0.1)';
            statusDiv.style.color = 'var(--accent-emerald)';
            statusDiv.innerText = 'Mensaje de prueba enviado con éxito vía Meta Cloud API al ' + data.targetPhone;
          }
        } else {
          if (statusDiv) {
            statusDiv.style.background = 'rgba(255, 107, 74, 0.1)';
            statusDiv.style.color = 'var(--accent-coral)';
            statusDiv.innerText = 'Modo simulación activo o token pendiente de verificación.';
          }
        }
      } catch (err) {
        if (statusDiv) {
          statusDiv.style.background = 'rgba(255, 107, 74, 0.1)';
          statusDiv.style.color = 'var(--accent-coral)';
          statusDiv.innerText = 'Error de conexión';
        }
      }
    }

    // ================= MODAL TELEGRAM =================
    let activeTgClinicId = '';
    function openTelegramModal(clinicId) {
      activeTgClinicId = clinicId;
      document.getElementById('modal-telegram').classList.add('open');
      document.getElementById('modal-telegram').classList.add('active');
    }

    function closeTelegramModal() {
      document.getElementById('modal-telegram').classList.remove('open');
      document.getElementById('modal-telegram').classList.remove('active');
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
          alert('Token de Telegram configurado exitosamente.');
        } else {
          alert('Error: ' + (data.error || 'No se pudo guardar'));
        }
      } catch (err) {
        alert('Error de red');
      }
    }

    // ================= FLUJOS CONVERSACIONALES (SPLIT SCREEN) =================
    function renderFlows() {
      const container = document.getElementById('flows-container');
      if (!container) return;
      container.innerHTML = FLOW_DEFINITIONS.map(f => \`
        <div class="flow-card">
          <div class="flow-header">
            <div class="flow-name">\${f.name}</div>
            <span class="flow-tag">\${f.step}</span>
          </div>
          <div class="flow-desc">\${f.desc}</div>
          <div class="flow-prompt-box">
            "\${f.samplePrompt}"
          </div>
          <button class="btn-emerald-cta" style="padding:8px 14px; font-size:12px; font-weight:700; width:100%; justify-content:center;" onclick="testFlow('\${f.id}')">
            Probar este Flujo
          </button>
        </div>
      \`).join('');

      const flowSel = document.getElementById('flow-clinic-selector');
      const clinicLabel = document.getElementById('flows-chat-clinic-label');
      if (flowSel && clinicLabel) {
        clinicLabel.innerText = flowSel.options[flowSel.selectedIndex]?.text || 'Clínica Activa';
      }
    }

    function testFlow(flowId) {
      const flow = FLOW_DEFINITIONS.find(f => f.id === flowId);
      if (!flow) return;

      // Inyectar en chat de la columna derecha de Flujos
      const flowInput = document.getElementById('flows-chat-input');
      if (flowInput) {
        flowInput.value = flow.samplePrompt;
        triggerFlowDirectSend(flow.samplePrompt);
      }

      // También mantener sincronizado con tab playground para compatibilidad
      const playInput = document.getElementById('chat-input-text');
      if (playInput) playInput.value = flow.samplePrompt;
    }

    async function triggerFlowDirectSend(text) {
      const flowSel = document.getElementById('flow-clinic-selector');
      const clinicId = flowSel ? flowSel.value : activeChatClinicId;
      const messagesContainer = document.getElementById('flows-chat-messages');

      const userDiv = document.createElement('div');
      userDiv.className = 'bubble user';
      userDiv.innerText = text;
      messagesContainer.appendChild(userDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'bubble bot';
      loadingDiv.innerText = 'Valeria está analizando el flujo...';
      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      const startTime = performance.now();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, userId: 'flow-test-user', clinicId })
        });
        const data = await res.json();
        const latency = Math.round(performance.now() - startTime);

        loadingDiv.remove();

        const botDiv = document.createElement('div');
        botDiv.className = 'bubble bot';
        botDiv.innerText = data.reply || '(Sin respuesta del agente)';
        messagesContainer.appendChild(botDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        document.getElementById('flows-trace-latency').innerText = latency + ' ms';
        if (data.trace) {
          document.getElementById('flows-trace-model').innerText = data.trace.model || 'gemini-2.5-flash';
          document.getElementById('flows-trace-tools').innerText = (data.trace.toolsExecuted && data.trace.toolsExecuted.length)
            ? data.trace.toolsExecuted.join(', ')
            : 'Ninguna (Respuesta Directa)';
        }
      } catch (err) {
        loadingDiv.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'bubble bot';
        errDiv.style.color = 'var(--accent-coral)';
        errDiv.innerText = 'Error de comunicación con el agente.';
        messagesContainer.appendChild(errDiv);
      }
    }

    function sendFlowsChatMessage(e) {
      e.preventDefault();
      const input = document.getElementById('flows-chat-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      triggerFlowDirectSend(text);
    }

    // ================= CITAS AGENDADAS =================
    async function fetchAppointments() {
      const tbody = document.getElementById('appointments-tbody');
      try {
        const res = await fetch('/api/appointments', { headers: getAuthHeaders() });
        const data = await res.json();
        const appointments = data.appointments || [];

        const totalCitasEl = document.getElementById('overview-total-citas');
        if (totalCitasEl) {
          totalCitasEl.innerText = appointments.length + ' Citas';
        }

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
      
      const userDiv = document.createElement('div');
      userDiv.className = 'bubble user';
      userDiv.innerText = text;
      container.appendChild(userDiv);
      input.value = '';
      container.scrollTop = container.scrollHeight;

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
        errDiv.innerText = 'Error de comunicación con el agente.';
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
