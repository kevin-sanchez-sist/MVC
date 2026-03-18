/**
 * http-flow.js
 * Animación del flujo HTTP: Cliente → Servidor (REST API).
 * Exporta: init(container)
 */

export function init(container) {
  container.innerHTML = `
    <style>
      #http-sim {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }

      /* ── Method selector ── */
      .method-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .method-btn {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        padding: 6px 14px;
        border: 1px solid var(--border-2);
        background: none;
        color: var(--text-2);
        cursor: pointer;
        transition: all .15s;
        letter-spacing: .05em;
        border-radius: 3px;
      }
      .method-btn:hover { border-color: var(--btn-color); color: var(--btn-color); }
      .method-btn.active {
        background: color-mix(in srgb, var(--btn-color) 15%, transparent);
        border-color: var(--btn-color);
        color: var(--btn-color);
      }

      /* ── Arena ── */
      .http-arena {
        position: relative;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      /* Nodes */
      .http-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        z-index: 2;
        flex-shrink: 0;
      }
      .http-node-box {
        width: 90px; height: 64px;
        border: 1px solid var(--node-color);
        background: color-mix(in srgb, var(--node-color) 8%, var(--surface));
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 4px;
        position: relative;
      }
      .http-node-icon { font-size: 22px; }
      .http-node-label {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 9px;
        letter-spacing: .1em;
        color: var(--node-color);
        text-transform: uppercase;
      }
      .http-node-sublabel {
        font-size: 10px;
        color: var(--text-3);
        text-align: center;
        max-width: 90px;
        font-family: 'IBM Plex Mono', monospace;
      }

      /* Track */
      .http-track {
        flex: 1;
        position: relative;
        height: 2px;
        background: var(--border);
      }
      .http-track-label {
        position: absolute;
        top: -22px;
        left: 0; right: 0;
        text-align: center;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        color: var(--text-3);
        white-space: nowrap;
      }

      /* Packet */
      .http-packet {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        z-index: 5;
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 3px;
      }
      .http-packet.visible { display: flex; }
      .http-packet-bubble {
        background: var(--packet-color, var(--accent-c));
        color: #fff;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        padding: 4px 10px;
        border-radius: 3px;
        white-space: nowrap;
        box-shadow: 0 0 12px color-mix(in srgb, var(--packet-color, var(--accent-c)) 60%, transparent);
      }
      .http-packet-tail {
        font-size: 9px;
        color: var(--text-3);
        font-family: 'IBM Plex Mono', monospace;
      }

      /* ── Status log ── */
      .http-log {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 3px;
        padding: 14px 18px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .http-log-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--text-3);
        transition: background .2s;
      }
      .http-log-dot.active { background: var(--accent-c); box-shadow: 0 0 8px var(--accent-c); }
      .http-log-dot.success { background: var(--accent-v); box-shadow: 0 0 8px var(--accent-v); }
      .http-log-dot.error   { background: var(--accent-r); box-shadow: 0 0 8px var(--accent-r); }
      .http-log-text { color: var(--text-2); }
      .http-log-code {
        margin-left: auto;
        padding: 2px 8px;
        font-size: 11px;
        border: 1px solid var(--border-2);
        color: var(--text-3);
        transition: all .2s;
      }
      .http-log-code.ok  { border-color: var(--accent-v); color: var(--accent-v); }
      .http-log-code.err { border-color: var(--accent-r); color: var(--accent-r); }

      /* ── Send button ── */
      .http-send-btn {
        align-self: flex-start;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        padding: 10px 22px;
        border: 1px solid var(--accent-c);
        background: color-mix(in srgb, var(--accent-c) 10%, transparent);
        color: var(--accent-c);
        cursor: pointer;
        transition: all .15s;
        letter-spacing: .05em;
      }
      .http-send-btn:hover:not(:disabled) {
        background: color-mix(in srgb, var(--accent-c) 20%, transparent);
      }
      .http-send-btn:disabled { opacity: .4; cursor: default; }

      /* Method colors */
      .m-get    { --btn-color: var(--accent-v); }
      .m-post   { --btn-color: var(--accent-c); }
      .m-put    { --btn-color: var(--accent-s); }
      .m-delete { --btn-color: var(--accent-r); }
    </style>

    <div id="http-sim">

      <div class="sim-title">
        <span class="sim-indicator"></span>
        Selecciona un método HTTP y envía la solicitud
      </div>

      <!-- Method selector -->
      <div class="method-selector">
        <button class="method-btn m-get active"   data-method="GET"    data-color="var(--accent-v)">GET</button>
        <button class="method-btn m-post"          data-method="POST"   data-color="var(--accent-c)">POST</button>
        <button class="method-btn m-put"           data-method="PUT"    data-color="var(--accent-s)">PUT</button>
        <button class="method-btn m-delete"        data-method="DELETE" data-color="var(--accent-r)">DELETE</button>
      </div>

      <!-- Arena -->
      <div class="http-arena">

        <!-- Client node -->
        <div class="http-node" style="--node-color: var(--accent-v)">
          <div class="http-node-box">
            <div class="http-node-icon">🖥</div>
            <div class="http-node-label">Cliente</div>
          </div>
          <div class="http-node-sublabel">Navegador / App</div>
        </div>

        <!-- Request track -->
        <div class="http-track" id="track-request">
          <div class="http-track-label" id="track-req-label">── solicitud ──▶</div>
          <div class="http-packet" id="packet-req">
            <div class="http-packet-bubble" id="packet-req-text">GET /api/productos</div>
            <div class="http-packet-tail">HTTP/1.1</div>
          </div>
        </div>

        <!-- Server node -->
        <div class="http-node" style="--node-color: var(--accent-c)">
          <div class="http-node-box">
            <div class="http-node-icon">⚙️</div>
            <div class="http-node-label">Servidor</div>
          </div>
          <div class="http-node-sublabel">.NET Web API</div>
        </div>

        <!-- Response track -->
        <div class="http-track" id="track-response">
          <div class="http-track-label">◀── respuesta ──</div>
          <div class="http-packet" id="packet-res">
            <div class="http-packet-bubble" id="packet-res-text" style="--packet-color: var(--accent-v)">200 OK · JSON</div>
            <div class="http-packet-tail">application/json</div>
          </div>
        </div>

        <!-- DB node -->
        <div class="http-node" style="--node-color: var(--accent-m)">
          <div class="http-node-box">
            <div class="http-node-icon">🗄</div>
            <div class="http-node-label">Base de datos</div>
          </div>
          <div class="http-node-sublabel">SQL / EF Core</div>
        </div>

      </div>

      <!-- Log -->
      <div class="http-log">
        <div class="http-log-dot" id="log-dot"></div>
        <div class="http-log-text" id="log-text">Listo para enviar. Selecciona un método y presiona Enviar.</div>
        <div class="http-log-code" id="log-code">—</div>
      </div>

      <!-- Send button -->
      <button class="http-send-btn" id="http-send-btn">▶ Enviar solicitud</button>

    </div>
  `;

  // ── State ──────────────────────────────────────────────
  const methodConfig = {
    GET:    { color: 'var(--accent-v)', endpoint: '/api/productos',    body: '200 OK · JSON[]',    desc: 'Leyendo datos desde la base de datos…',  status: '200', ok: true  },
    POST:   { color: 'var(--accent-c)', endpoint: '/api/productos',    body: '201 Created · JSON', desc: 'Insertando nuevo registro en la BD…',    status: '201', ok: true  },
    PUT:    { color: 'var(--accent-s)', endpoint: '/api/productos/42', body: '200 OK · JSON',      desc: 'Actualizando registro id=42 en la BD…',  status: '200', ok: true  },
    DELETE: { color: 'var(--accent-r)', endpoint: '/api/productos/42', body: '204 No Content',     desc: 'Eliminando registro id=42 de la BD…',    status: '204', ok: true  },
  };

  let currentMethod = 'GET';
  let running = false;

  const sendBtn   = container.querySelector('#http-send-btn');
  const logDot    = container.querySelector('#log-dot');
  const logText   = container.querySelector('#log-text');
  const logCode   = container.querySelector('#log-code');
  const packetReq = container.querySelector('#packet-req');
  const packetRes = container.querySelector('#packet-res');
  const packetReqText = container.querySelector('#packet-req-text');
  const packetResText = container.querySelector('#packet-res-text');

  // ── Method buttons ─────────────────────────────────────
  container.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (running) return;
      container.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMethod = btn.dataset.method;
      reset();
    });
  });

  function reset() {
    packetReq.classList.remove('visible');
    packetRes.classList.remove('visible');
    packetReq.style.transition = '';
    packetRes.style.transition = '';
    packetReq.style.left = '0%';
    packetRes.style.left = '100%';
    logDot.className = 'http-log-dot';
    logCode.className = 'http-log-code';
    logCode.textContent = '—';
    logText.textContent = 'Listo. Selecciona un método y presiona Enviar.';
    sendBtn.disabled = false;
  }

  // ── Animation sequence ─────────────────────────────────
  sendBtn.addEventListener('click', async () => {
    if (running) return;
    running = true;
    sendBtn.disabled = true;

    const cfg = methodConfig[currentMethod];
    packetReqText.textContent = `${currentMethod} ${cfg.endpoint}`;
    packetReqText.style.setProperty('--packet-color', cfg.color);
    packetResText.style.setProperty('--packet-color', 'var(--accent-v)');

    // Step 1: show request packet, animate left→right
    await step_log('active', `Enviando ${currentMethod} ${cfg.endpoint}…`, '—', '');
    packetReq.classList.add('visible');
    packetReq.style.left = '0%';
    await tick();
    packetReq.style.transition = 'left .7s ease-in-out';
    packetReq.style.left = '100%';
    await delay(750);

    // Step 2: server processing
    await step_log('active', cfg.desc, '…', '');
    await delay(700);

    // Step 3: response packet, animate right→left
    packetResText.textContent = cfg.body;
    packetRes.classList.add('visible');
    packetRes.style.left = '100%';
    await tick();
    packetRes.style.transition = 'left .7s ease-in-out';
    packetRes.style.left = '0%';
    await delay(750);

    // Step 4: done
    logDot.className = 'http-log-dot success';
    logText.textContent = `Respuesta recibida: ${cfg.body}`;
    logCode.textContent = cfg.status;
    logCode.className = 'http-log-code ok';

    running = false;
    setTimeout(reset, 3000);
  });

  function step_log(dotClass, text, code, codeClass) {
    logDot.className = `http-log-dot ${dotClass}`;
    logText.textContent = text;
    logCode.textContent = code;
    logCode.className = `http-log-code ${codeClass}`;
    return Promise.resolve();
  }
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const tick  = ()  => new Promise(r => requestAnimationFrame(r));
}
