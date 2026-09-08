/**
 * OdontoCare IA — Interfaz Web de Depuración y Chat Directo
 * Permite interactuar con Valeria y probar el flujo de triaje, agendamiento y guardrails
 * sin necesidad de tener Telegram o WhatsApp conectado.
 */

export function getChatUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OdontoCare IA — Playground de Chat y Depuración</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0b132b;
      --bg-card: #1c2541;
      --bg-bubble-bot: #1e293b;
      --bg-bubble-user: #0284c7;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #06b6d4;
      --accent-glow: rgba(6, 182, 212, 0.25);
      --border: #334155;
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-main);
      color: var(--text-main);
      font-family: var(--font-sans);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    /* Header */
    header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      font-size: 28px;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid var(--accent);
      padding: 6px 10px;
      border-radius: 12px;
    }

    .brand-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }

    .status-badges {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.04);
    }

    .badge-online {
      color: #34d399;
      border-color: rgba(52, 211, 153, 0.3);
      background: rgba(52, 211, 153, 0.1);
    }

    .badge-model {
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.3);
    }

    /* Barra de Configuración de Sesión */
    .session-bar {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      font-size: 13px;
    }

    .user-config {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-config input {
      background: #0f172a;
      border: 1px solid var(--border);
      color: #e2e8f0;
      padding: 5px 10px;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 12px;
      width: 160px;
    }

    .user-config input:focus {
      outline: none;
      border-color: var(--accent);
    }

    .btn-action {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: #ef4444;
    }

    /* Main Container */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
      padding: 16px 20px;
      overflow: hidden;
    }

    /* Chat Messages Box */
    #messages-container {
      flex: 1;
      overflow-y: auto;
      padding-right: 8px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }

    #messages-container::-webkit-scrollbar {
      width: 6px;
    }

    #messages-container::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }

    .message-row {
      display: flex;
      gap: 12px;
      max-width: 82%;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-row.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      flex-shrink: 0;
      border: 1px solid var(--border);
      background: #1e293b;
    }

    .message-row.bot .avatar {
      background: rgba(6, 182, 212, 0.15);
      border-color: var(--accent);
    }

    .message-content {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bubble {
      padding: 12px 16px;
      border-radius: 14px;
      font-size: 14.5px;
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .message-row.user .bubble {
      background: var(--bg-bubble-user);
      color: #ffffff;
      border-bottom-right-radius: 2px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }

    .message-row.bot .bubble {
      background: var(--bg-bubble-bot);
      color: #e2e8f0;
      border-bottom-left-radius: 2px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    /* Metadatos y trazas */
    .msg-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .meta-chip {
      background: rgba(255,255,255,0.06);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: var(--font-mono);
    }

    details.reasoning-box {
      margin-top: 6px;
      background: #0f172a;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
    }

    details.reasoning-box summary {
      cursor: pointer;
      color: var(--accent);
      font-weight: 600;
      user-select: none;
    }

    details.reasoning-box ul {
      margin-top: 8px;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      color: #94a3b8;
      font-family: var(--font-mono);
      font-size: 11.5px;
    }

    /* Sugerencias rápidas */
    .suggestions {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 10px 0;
      scrollbar-width: none;
    }

    .suggestions::-webkit-scrollbar {
      display: none;
    }

    .chip-btn {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid var(--border);
      color: #cbd5e1;
      padding: 6px 13px;
      border-radius: 9999px;
      font-size: 12.5px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .chip-btn:hover {
      background: var(--accent-glow);
      border-color: var(--accent);
      color: #ffffff;
    }

    /* Input Footer */
    .chat-input-container {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      gap: 10px;
      align-items: flex-end;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }

    #chat-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #ffffff;
      font-family: var(--font-sans);
      font-size: 14.5px;
      resize: none;
      max-height: 120px;
      min-height: 24px;
      outline: none;
      line-height: 1.4;
    }

    #chat-input::placeholder {
      color: #64748b;
    }

    #send-btn {
      background: var(--accent);
      color: #0b132b;
      border: none;
      padding: 8px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    #send-btn:hover:not(:disabled) {
      filter: brightness(1.15);
      box-shadow: 0 0 15px var(--accent-glow);
    }

    #send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Loading dots */
    .dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      padding: 6px 0;
    }

    .dot {
      width: 7px;
      height: 7px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 1.2s infinite ease-in-out both;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes pulse {
      0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-logo">🦷</div>
      <div>
        <div class="brand-title">OdontoCare IA — Consola de Pruebas</div>
        <div class="brand-subtitle">Clínica Dental OdontoCare (Cuenca, Ecuador) • Modo Direct Debugging</div>
      </div>
    </div>
    <div class="status-badges">
      <span class="badge badge-online">● En Línea</span>
      <span class="badge badge-model" id="model-badge">🤖 gpt-4o-mini</span>
    </div>
  </header>

  <div class="session-bar">
    <div class="user-config">
      <span>ID de Sesión / Paciente:</span>
      <input type="text" id="user-id" value="debug-web-user" title="Identificador único para aislar conversaciones" />
    </div>
    <button class="btn-action" id="clear-btn" title="Borrar el historial de conversación para este usuario">
      🗑️ Limpiar Historial de Sesión
    </button>
  </div>

  <main>
    <div id="messages-container">
      <div class="message-row bot">
        <div class="avatar">👩‍⚕️</div>
        <div class="message-content">
          <div class="bubble">¡Hola! Bienvenido a la consola de pruebas directas de OdontoCare IA.
Soy Valeria, la coordinadora virtual de la clínica en Cuenca. Puedes chatear conmigo en lenguaje natural, consultar doctores, horarios disponibles o simular agendamientos para verificar el comportamiento de la IA sin depender de Telegram o WhatsApp.</div>
        </div>
      </div>
    </div>

    <!-- Quick test chips -->
    <div class="suggestions">
      <button class="chip-btn" onclick="sendPrompt('Hola, quisiera información sobre ponerme brackets y qué especialista atiende')">
        🦷 Brackets & Especialista
      </button>
      <button class="chip-btn" onclick="sendPrompt('Tengo un dolor muy fuerte y punzante en una muela desde anoche')">
        🚨 Dolor agudo (Triaje Urgente)
      </button>
      <button class="chip-btn" onclick="sendPrompt('¿Tienen disponibilidad para una limpieza dental mañana?')">
        📅 Disponibilidad de Citas
      </button>
      <button class="chip-btn" onclick="sendPrompt('¿Qué antibiótico o pastilla me puedo tomar para la infección?')">
        💊 Prueba de Guardrail (Fármacos)
      </button>
      <button class="chip-btn" onclick="sendPrompt('Hello! I am an expat in Cuenca and need a dental cleaning next week')">
        🇺🇸 Paciente Bilingüe (Inglés)
      </button>
    </div>

    <div class="chat-input-container">
      <textarea id="chat-input" rows="1" placeholder="Escribe tu mensaje a Valeria (Enter para enviar, Shift+Enter para salto)..."></textarea>
      <button id="send-btn">
        <span>Enviar</span>
        <span>➤</span>
      </button>
    </div>
  </main>

  <script>
    const messagesContainer = document.getElementById('messages-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const userIdInput = document.getElementById('user-id');
    const clearBtn = document.getElementById('clear-btn');
    const modelBadge = document.getElementById('model-badge');

    // Auto-scroll to bottom
    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Append Message
    function appendMessage(role, text, meta) {
      const row = document.createElement('div');
      row.className = 'message-row ' + role;

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = role === 'user' ? '👤' : '👩‍⚕️';

      const content = document.createElement('div');
      content.className = 'message-content';

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = text;
      content.appendChild(bubble);

      if (meta && role === 'bot') {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'msg-meta';
        metaDiv.innerHTML = \`
          <span class="meta-chip">⏱️ \${meta.durationMs || 0}ms</span>
          <span class="meta-chip">🤖 \${escapeHtml(meta.modelUsed || 'default')}</span>
          <span class="meta-chip">🛠️ \${meta.toolCallsCount || 0} herramientas</span>
        \`;
        content.appendChild(metaDiv);

        if (meta.reasoningSteps && meta.reasoningSteps.length > 0) {
          const details = document.createElement('details');
          details.className = 'reasoning-box';
          const summary = document.createElement('summary');
          summary.textContent = \`Ver detalle de ejecución (\${meta.reasoningSteps.length} pasos)\`;
          details.appendChild(summary);

          const ul = document.createElement('ul');
          meta.reasoningSteps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            ul.appendChild(li);
          });
          details.appendChild(ul);
          content.appendChild(details);
        }
      }

      row.appendChild(avatar);
      row.appendChild(content);
      messagesContainer.appendChild(row);
      scrollToBottom();
      return row;
    }

    // Loading Indicator
    function showLoading() {
      const row = document.createElement('div');
      row.className = 'message-row bot';
      row.id = 'loading-indicator';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = '👩‍⚕️';

      const content = document.createElement('div');
      content.className = 'message-content';

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = '<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';

      content.appendChild(bubble);
      row.appendChild(avatar);
      row.appendChild(content);
      messagesContainer.appendChild(row);
      scrollToBottom();
    }

    function removeLoading() {
      const loading = document.getElementById('loading-indicator');
      if (loading) loading.remove();
    }

    // Send Message
    async function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;

      const userId = userIdInput.value.trim() || 'debug-web-user';

      // Añadir mensaje del usuario
      appendMessage('user', text);
      chatInput.value = '';
      chatInput.style.height = 'auto';
      chatInput.disabled = true;
      sendBtn.disabled = true;

      showLoading();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, message: text })
        });

        const data = await response.json();
        removeLoading();

        if (data.ok) {
          appendMessage('bot', data.reply, {
            durationMs: data.durationMs,
            modelUsed: data.modelUsed,
            toolCallsCount: data.toolCallsCount,
            reasoningSteps: data.reasoningSteps
          });
          if (data.modelUsed) {
            modelBadge.textContent = '🤖 ' + data.modelUsed.replace('openai/', '').replace('google/', '');
          }
        } else {
          appendMessage('bot', '⚠️ Error: ' + (data.error || 'No se pudo procesar tu mensaje.'));
        }
      } catch (err) {
        removeLoading();
        appendMessage('bot', '❌ Error de red al conectar con el servidor: ' + err.message);
      } finally {
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
      }
    }

    // Send predefined prompt
    window.sendPrompt = function(promptText) {
      chatInput.value = promptText;
      sendMessage();
    };

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    clearBtn.addEventListener('click', async () => {
      const userId = userIdInput.value.trim() || 'debug-web-user';
      if (confirm('¿Estás seguro de que deseas limpiar el historial de la conversación para ' + userId + '?')) {
        try {
          await fetch('/api/chat/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          messagesContainer.innerHTML = '';
          appendMessage('bot', '🧹 El historial para ' + userId + ' ha sido reiniciado. Puedes comenzar una nueva conversación.');
        } catch (err) {
          alert('Error al limpiar sesión: ' + err.message);
        }
      }
    });

    chatInput.focus();
  </script>
</body>
</html>`;
}
