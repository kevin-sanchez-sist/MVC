/**
 * layer-removal.js
 * La pieza final: integración y consecuencias de eliminar capas.
 *  Tab A — Flujo completo animado (request → response)
 *  Tab B — Simulación: ¿qué pasa si quitamos una capa?
 *  Tab C — Diagrama de dependencias (dirección única)
 * Exporta: init(container)
 */

export function init(container) {
  container.innerHTML = `
    <style>
      #lr-wrap { display: flex; flex-direction: column; gap: 24px; }

      /* ── Tabs ── */
      .lr-tabs {
        display: flex; gap: 0;
        border: 1px solid var(--border-2);
        border-radius: 4px; overflow: hidden;
        align-self: flex-start; flex-wrap: wrap;
      }
      .lr-tab {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        padding: 8px 16px; background: none; border: none;
        border-right: 1px solid var(--border-2);
        color: var(--text-3); cursor: pointer;
        letter-spacing: .04em; transition: all .2s;
      }
      .lr-tab:last-child { border-right: none; }
      .lr-tab.active { background: var(--surface-2); color: var(--text); }
      .lr-tab.active.flow { color: var(--accent-c); }
      .lr-tab.active.removal { color: var(--accent-r); }
      .lr-tab.active.deps { color: var(--accent-s); }

      .lr-panel { display: none; flex-direction: column; gap: 20px; }
      .lr-panel.active { display: flex; }

      /* ════════════════════════════════════════
         TAB A — FULL FLOW ANIMATION
      ════════════════════════════════════════ */

      /* Layer pipeline */
      .flow-pipeline {
        display: flex;
        flex-direction: column;
        gap: 0;
        position: relative;
      }

      .flow-layer {
        display: flex;
        align-items: stretch;
        position: relative;
        transition: all .3s;
      }

      /* Left spine */
      .flow-spine {
        width: 4px;
        background: var(--lc);
        flex-shrink: 0;
        position: relative;
        transition: background .3s;
      }

      /* Glow pulse on active */
      .flow-layer.active .flow-spine {
        box-shadow: 0 0 10px var(--lc), 0 0 20px color-mix(in srgb, var(--lc) 40%, transparent);
      }

      .flow-body {
        flex: 1;
        border: 1px solid var(--border);
        border-left: none;
        padding: 14px 18px;
        background: var(--surface);
        display: flex; align-items: center;
        justify-content: space-between; gap: 12px;
        transition: border-color .3s, background .3s;
      }
      .flow-layer.active .flow-body {
        border-color: var(--lc);
        background: color-mix(in srgb, var(--lc) 6%, var(--surface));
      }

      .flow-layer-left { display: flex; align-items: center; gap: 12px; }

      .flow-dot {
        width: 10px; height: 10px; border-radius: 50%;
        background: var(--border-2); border: 2px solid var(--border);
        flex-shrink: 0; transition: all .3s;
      }
      .flow-layer.active .flow-dot {
        background: var(--lc);
        border-color: var(--lc);
        box-shadow: 0 0 8px var(--lc);
        animation: dotPulse .8s ease infinite;
      }
      .flow-layer.done .flow-dot {
        background: var(--lc); border-color: var(--lc);
        animation: none;
      }
      @keyframes dotPulse {
        0%,100% { transform: scale(1); opacity:1; }
        50% { transform: scale(1.4); opacity:.7; }
      }

      .flow-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--lc);
        transition: color .3s;
      }
      .flow-name-inactive { color: var(--text-3) !important; }

      .flow-action {
        font-size: 12px; color: var(--text-2);
        opacity: 0; transition: opacity .3s;
        font-style: italic;
      }
      .flow-layer.active .flow-action,
      .flow-layer.done  .flow-action { opacity: 1; }

      .flow-status {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 2px 8px; border-radius: 99px;
        border: 1px solid transparent; transition: all .3s;
        flex-shrink: 0;
      }
      .flow-layer.active .flow-status {
        border-color: var(--lc); color: var(--lc);
        background: color-mix(in srgb, var(--lc) 10%, transparent);
      }
      .flow-layer.done .flow-status {
        border-color: var(--accent-v); color: var(--accent-v);
        background: color-mix(in srgb, var(--accent-v) 10%, transparent);
      }

      /* Animated packet traveling between layers */
      .flow-gap {
        position: relative;
        height: 28px;
        display: flex; align-items: center;
        padding-left: 22px;
      }
      .flow-gap-line {
        position: absolute; left: 3px; top: 0; bottom: 0;
        width: 2px; background: var(--border);
      }

      .flow-packet {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 2px 10px; border-radius: 99px;
        opacity: 0; transform: translateY(-6px);
        transition: opacity .25s, transform .25s;
        pointer-events: none; position: relative;
        border: 1px solid var(--pk-color);
        color: var(--pk-color);
        background: color-mix(in srgb, var(--pk-color) 10%, transparent);
      }
      .flow-packet.visible {
        opacity: 1; transform: translateY(0);
      }

      /* Return path banner */
      .flow-return {
        border: 1px dashed var(--border-2);
        border-radius: 3px; padding: 10px 16px;
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        color: var(--text-3);
        opacity: 0; transition: opacity .4s;
        display: flex; align-items: center; gap: 10px;
      }
      .flow-return.visible { opacity: 1; }
      .flow-return-arrow { font-size: 16px; color: var(--accent-v); }

      /* Controls */
      .flow-controls {
        display: flex; gap: 10px; align-items: center;
      }
      .flow-btn {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        padding: 10px 22px;
        border: 1px solid var(--accent-c);
        background: color-mix(in srgb, var(--accent-c) 10%, transparent);
        color: var(--accent-c); cursor: pointer;
        transition: all .15s; letter-spacing: .04em; border-radius: 3px;
      }
      .flow-btn:hover:not(:disabled) {
        background: color-mix(in srgb, var(--accent-c) 20%, transparent);
      }
      .flow-btn:disabled { opacity: .3; cursor: default; }

      .flow-log {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        color: var(--text-3); padding: 8px 14px;
        background: var(--bg); border: 1px solid var(--border); border-radius: 3px;
        transition: all .2s; flex: 1; min-width: 0;
      }
      .flow-log .ok { color: var(--accent-v); }
      .flow-log .hi { color: var(--accent-c); }

      /* ════════════════════════════════════════
         TAB B — LAYER REMOVAL SIMULATION
      ════════════════════════════════════════ */
      .removal-controls {
        display: flex; gap: 10px; flex-wrap: wrap;
      }
      .removal-btn {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        padding: 8px 16px; border-radius: 3px;
        border: 1px solid var(--rb-color);
        background: none; color: var(--rb-color); cursor: pointer;
        transition: all .2s; letter-spacing: .04em;
      }
      .removal-btn:hover {
        background: color-mix(in srgb, var(--rb-color) 12%, transparent);
      }
      .removal-btn.active {
        background: color-mix(in srgb, var(--rb-color) 18%, transparent);
      }
      .removal-btn.ok-btn { --rb-color: var(--accent-v); }
      .removal-btn.svc-btn { --rb-color: var(--accent-r); }
      .removal-btn.repo-btn { --rb-color: var(--accent-r); }
      .removal-btn.direct-btn { --rb-color: var(--accent-r); }

      /* Architecture visual */
      .arch-visual {
        display: flex; flex-direction: column; gap: 0;
        user-select: none;
      }

      .arch-row {
        display: flex; align-items: stretch; gap: 0;
        position: relative; transition: all .35s;
      }

      .arch-box {
        flex: 1; padding: 12px 16px;
        border: 1px solid var(--ab-color);
        background: color-mix(in srgb, var(--ab-color) 7%, var(--surface));
        display: flex; align-items: center; gap: 10px;
        transition: all .35s;
      }
      .arch-box-icon { font-size: 16px; flex-shrink: 0; }
      .arch-box-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--ab-color);
      }
      .arch-box-desc { font-size: 11px; color: var(--text-2); }

      /* Removed layer */
      .arch-row.removed .arch-box {
        border-color: var(--accent-r) !important;
        background: color-mix(in srgb, var(--accent-r) 5%, var(--surface)) !important;
        opacity: .4;
      }
      .arch-row.removed .arch-box-name { color: var(--accent-r) !important; }
      .arch-row.removed::after {
        content: '✕ ELIMINADO';
        position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--accent-r); letter-spacing: .1em;
      }

      /* Direct access bypass arrow */
      .arch-bypass {
        display: none;
        align-items: center;
        padding: 4px 0 4px 16px;
        gap: 8px;
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--accent-r);
        position: relative;
      }
      .arch-bypass::before {
        content: '';
        position: absolute; left: 15px; top: 0; bottom: 0;
        width: 1px;
        background: var(--accent-r);
        box-shadow: 0 0 6px var(--accent-r);
      }
      .arch-bypass.visible { display: flex; }

      .arch-arrow {
        padding: 3px 0 3px 16px;
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); position: relative;
      }
      .arch-arrow::before {
        content: ''; position: absolute;
        left: 15px; top: 0; bottom: 0; width: 1px;
        background: linear-gradient(to bottom, var(--ac-from), var(--ac-to));
      }
      .arch-arrow span { padding-left: 14px; }

      /* Consequence panel */
      .consequence-panel {
        border-left: 3px solid var(--cp-color, var(--border-2));
        padding: 14px 18px;
        background: color-mix(in srgb, var(--cp-color, var(--border-2)) 5%, var(--surface));
        transition: all .3s;
        border-radius: 0 3px 3px 0;
        min-height: 80px;
      }
      .consequence-title {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        font-weight: 600; margin-bottom: 10px;
        color: var(--cp-color, var(--text-3));
        display: flex; align-items: center; gap: 8px;
      }
      .consequence-list {
        display: flex; flex-direction: column; gap: 5px;
      }
      .consequence-item {
        font-size: 12px; color: var(--text-2);
        display: flex; align-items: flex-start; gap: 8px; line-height: 1.4;
      }
      .consequence-item .ci-icon { flex-shrink: 0; }

      /* ════════════════════════════════════════
         TAB C — DEPENDENCY DIAGRAM
      ════════════════════════════════════════ */
      .deps-diagram {
        display: flex; flex-direction: column; gap: 0;
      }

      .dep-row {
        display: flex; align-items: center; gap: 0;
      }

      .dep-box {
        padding: 12px 20px;
        border: 1px solid var(--db-color);
        background: color-mix(in srgb, var(--db-color) 7%, var(--surface));
        display: flex; flex-direction: column; gap: 3px;
        min-width: 160px; cursor: default;
        transition: background .2s;
      }
      .dep-box:hover {
        background: color-mix(in srgb, var(--db-color) 14%, var(--surface));
      }
      .dep-box-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--db-color);
      }
      .dep-box-desc { font-size: 11px; color: var(--text-2); }

      .dep-interface {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 4px 12px; border-radius: 99px;
        border: 1px dashed var(--di-color);
        color: var(--di-color); margin: 0 8px;
        white-space: nowrap; align-self: center;
        background: color-mix(in srgb, var(--di-color) 5%, transparent);
      }

      .dep-arrow {
        font-size: 18px; color: var(--text-3);
        flex-shrink: 0; margin: 0 4px;
      }

      .dep-gap {
        height: 16px;
        display: flex; align-items: center;
        padding-left: 80px;
        position: relative;
      }
      .dep-gap-line {
        position: absolute; left: 79px;
        top: 0; bottom: 0; width: 1px;
        background: linear-gradient(to bottom, var(--dg-from), var(--dg-to));
      }
      .dep-gap-label {
        font-family: 'IBM Plex Mono', monospace; font-size: 9px;
        color: var(--text-3); padding-left: 12px; letter-spacing: .06em;
      }

      .deps-rule {
        background: color-mix(in srgb, var(--accent-s) 7%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent-s) 22%, transparent);
        border-left: 3px solid var(--accent-s);
        padding: 12px 16px; font-size: 13px;
        color: var(--text-2); line-height: 1.6;
        border-radius: 0 3px 3px 0;
      }
      .deps-rule strong { color: var(--accent-s); }

      .deps-benefits {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      }
      .dep-benefit {
        border: 1px solid var(--border);
        border-top: 2px solid var(--db2-color);
        padding: 12px 14px;
        background: var(--surface);
        border-radius: 0 0 3px 3px;
      }
      .dep-benefit-title {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        font-weight: 600; color: var(--db2-color); margin-bottom: 4px;
      }
      .dep-benefit-desc { font-size: 12px; color: var(--text-2); line-height: 1.5; }

      .lr-hint {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); text-align: center; letter-spacing: .05em;
      }
    </style>

    <div id="lr-wrap">

      <div class="sim-title">
        <span class="sim-indicator"></span>
        La integración de todas las capas — flujo, dependencias y consecuencias
      </div>

      <!-- Tabs -->
      <div class="lr-tabs">
        <button class="lr-tab flow    active" data-tab="flow">▶ Flujo HTTP completo</button>
        <button class="lr-tab removal"        data-tab="removal">⚠ Eliminar capas</button>
        <button class="lr-tab deps"           data-tab="deps">→ Dependencias</button>
      </div>

      <!-- ══════════ TAB A: FULL FLOW ══════════ -->
      <div class="lr-panel active" id="lrtab-flow">

        <div class="flow-pipeline" id="flow-pipeline">

          <!-- CLIENT -->
          <div class="flow-layer" id="fl-client" style="--lc: var(--accent-v)">
            <div class="flow-spine"></div>
            <div class="flow-body">
              <div class="flow-layer-left">
                <div class="flow-dot"></div>
                <div>
                  <div class="flow-name">Cliente</div>
                  <div class="flow-action">Envía GET /api/productos</div>
                </div>
              </div>
              <div class="flow-status">inicio</div>
            </div>
          </div>

          <div class="flow-gap">
            <div class="flow-gap-line"></div>
            <div class="flow-packet" id="pk-0" style="--pk-color: var(--accent-c)">HTTP Request →</div>
          </div>

          <!-- CONTROLLER -->
          <div class="flow-layer" id="fl-ctrl" style="--lc: var(--accent-c)">
            <div class="flow-spine"></div>
            <div class="flow-body">
              <div class="flow-layer-left">
                <div class="flow-dot"></div>
                <div>
                  <div class="flow-name">Controller</div>
                  <div class="flow-action">Recibe solicitud · valida entrada · llama al Service</div>
                </div>
              </div>
              <div class="flow-status">procesando</div>
            </div>
          </div>

          <div class="flow-gap">
            <div class="flow-gap-line"></div>
            <div class="flow-packet" id="pk-1" style="--pk-color: var(--accent-s)">→ IProductoService</div>
          </div>

          <!-- SERVICE -->
          <div class="flow-layer" id="fl-svc" style="--lc: var(--accent-s)">
            <div class="flow-spine"></div>
            <div class="flow-body">
              <div class="flow-layer-left">
                <div class="flow-dot"></div>
                <div>
                  <div class="flow-name">Service</div>
                  <div class="flow-action">Aplica reglas de negocio · valida estado · llama al Repository</div>
                </div>
              </div>
              <div class="flow-status">procesando</div>
            </div>
          </div>

          <div class="flow-gap">
            <div class="flow-gap-line"></div>
            <div class="flow-packet" id="pk-2" style="--pk-color: var(--accent-r)">→ IProductoRepo</div>
          </div>

          <!-- REPOSITORY -->
          <div class="flow-layer" id="fl-repo" style="--lc: var(--accent-r)">
            <div class="flow-spine"></div>
            <div class="flow-body">
              <div class="flow-layer-left">
                <div class="flow-dot"></div>
                <div>
                  <div class="flow-name">Repository</div>
                  <div class="flow-action">Ejecuta consulta en la BD · retorna entidades</div>
                </div>
              </div>
              <div class="flow-status">procesando</div>
            </div>
          </div>

          <div class="flow-gap">
            <div class="flow-gap-line"></div>
            <div class="flow-packet" id="pk-3" style="--pk-color: var(--accent-m)">→ SELECT * FROM Productos</div>
          </div>

          <!-- DATABASE -->
          <div class="flow-layer" id="fl-db" style="--lc: var(--accent-m)">
            <div class="flow-spine"></div>
            <div class="flow-body">
              <div class="flow-layer-left">
                <div class="flow-dot"></div>
                <div>
                  <div class="flow-name">Base de datos</div>
                  <div class="flow-action">Retorna filas → Repository las mapea al Model</div>
                </div>
              </div>
              <div class="flow-status">consultada</div>
            </div>
          </div>

        </div>

        <!-- Return path -->
        <div class="flow-return" id="flow-return">
          <span class="flow-return-arrow">↑</span>
          <span>
            Camino de vuelta: <strong style="color:var(--accent-m)">BD</strong> →
            <strong style="color:var(--accent-r)">Repository</strong> →
            <strong style="color:var(--accent-s)">Service</strong> →
            <strong style="color:var(--accent-c)">Controller</strong> →
            <strong style="color:var(--accent-v)">Cliente</strong>
            <span style="color:var(--accent-v)"> · 200 OK + JSON</span>
          </span>
        </div>

        <!-- Controls -->
        <div class="flow-controls">
          <button class="flow-btn" id="flow-run-btn">▶ Simular petición</button>
          <div class="flow-log" id="flow-log">Listo · presiona Simular para ver el flujo</div>
        </div>

      </div>

      <!-- ══════════ TAB B: REMOVAL ══════════ -->
      <div class="lr-panel" id="lrtab-removal">

        <div class="removal-controls">
          <button class="removal-btn ok-btn"     data-mode="ok">✅ Arquitectura correcta</button>
          <button class="removal-btn svc-btn"    data-mode="nosvc">❌ Sin capa Service</button>
          <button class="removal-btn direct-btn" data-mode="direct">❌ Controller → Repository directo</button>
        </div>

        <!-- Architecture visual -->
        <div class="arch-visual" id="arch-visual">

          <div class="arch-row" id="arch-client" style="--ab-color: var(--accent-v)">
            <div class="arch-box">
              <span class="arch-box-icon">🖥</span>
              <div>
                <div class="arch-box-name">Cliente</div>
                <div class="arch-box-desc">HTTP Request</div>
              </div>
            </div>
          </div>

          <div class="arch-arrow" style="--ac-from: var(--accent-v); --ac-to: var(--accent-c)">
            <span id="arr-ctrl">↓ solicitud HTTP</span>
          </div>

          <div class="arch-row" id="arch-ctrl" style="--ab-color: var(--accent-c)">
            <div class="arch-box">
              <span class="arch-box-icon">⚙️</span>
              <div>
                <div class="arch-box-name">Controller</div>
                <div class="arch-box-desc" id="arch-ctrl-desc">Recibe, valida, delega al Service</div>
              </div>
            </div>
          </div>

          <div class="arch-arrow" id="arr-svc-wrap" style="--ac-from: var(--accent-c); --ac-to: var(--accent-s)">
            <span id="arr-svc">↓ llama IService</span>
          </div>

          <div class="arch-row" id="arch-svc" style="--ab-color: var(--accent-s)">
            <div class="arch-box">
              <span class="arch-box-icon">🔧</span>
              <div>
                <div class="arch-box-name">Service</div>
                <div class="arch-box-desc">Lógica de negocio · validaciones</div>
              </div>
            </div>
          </div>

          <!-- Bypass arrow (shown when controller goes direct to repo) -->
          <div class="arch-bypass" id="arch-bypass">
            <span style="padding-left:14px; color: var(--accent-r)">
              ⚠ Controller accede directo al Repository — saltando el Service
            </span>
          </div>

          <div class="arch-arrow" id="arr-repo-wrap" style="--ac-from: var(--accent-s); --ac-to: var(--accent-r)">
            <span>↓ llama IRepository</span>
          </div>

          <div class="arch-row" id="arch-repo" style="--ab-color: var(--accent-r)">
            <div class="arch-box">
              <span class="arch-box-icon">📦</span>
              <div>
                <div class="arch-box-name">Repository</div>
                <div class="arch-box-desc">Persistencia · acceso a BD</div>
              </div>
            </div>
          </div>

          <div class="arch-arrow" style="--ac-from: var(--accent-r); --ac-to: var(--accent-m)">
            <span>↓ SQL / EF Core</span>
          </div>

          <div class="arch-row" id="arch-db" style="--ab-color: var(--accent-m)">
            <div class="arch-box">
              <span class="arch-box-icon">🗄</span>
              <div>
                <div class="arch-box-name">Base de datos</div>
                <div class="arch-box-desc">SQL Server / PostgreSQL</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Consequence panel -->
        <div class="consequence-panel" id="consequence-panel"
             style="--cp-color: var(--accent-v)">
          <div class="consequence-title" id="cp-title">✅ Arquitectura correcta</div>
          <div class="consequence-list" id="cp-list">
            <div class="consequence-item"><span class="ci-icon">🟢</span>Cada capa tiene una única responsabilidad</div>
            <div class="consequence-item"><span class="ci-icon">🟢</span>Cambios en la BD solo afectan al Repository</div>
            <div class="consequence-item"><span class="ci-icon">🟢</span>Service reutilizable desde múltiples Controllers</div>
            <div class="consequence-item"><span class="ci-icon">🟢</span>Cada capa es testeable de forma aislada</div>
          </div>
        </div>

      </div>

      <!-- ══════════ TAB C: DEPENDENCIES ══════════ -->
      <div class="lr-panel" id="lrtab-deps">

        <div class="deps-rule">
          <strong>Regla de oro:</strong> las dependencias fluyen en <em>una sola dirección</em>,
          siempre de las capas externas hacia las internas.
          Ninguna capa interna conoce ni depende de una capa externa.
        </div>

        <div class="deps-diagram">

          <div class="dep-row">
            <div class="dep-box" style="--db-color: var(--accent-c)">
              <div class="dep-box-name">Controller</div>
              <div class="dep-box-desc">Capa de transporte</div>
            </div>
            <div class="dep-arrow">→</div>
            <div class="dep-interface" style="--di-color: var(--accent-s)">IProductoService</div>
            <div class="dep-arrow">→</div>
            <div class="dep-box" style="--db-color: var(--accent-s)">
              <div class="dep-box-name">Service</div>
              <div class="dep-box-desc">Capa de negocio</div>
            </div>
          </div>

          <div class="dep-gap" style="--dg-from: var(--accent-s); --dg-to: var(--accent-r)">
            <div class="dep-gap-line"></div>
            <div class="dep-gap-label">depende de →</div>
          </div>

          <div class="dep-row">
            <div class="dep-box" style="--db-color: var(--accent-s)">
              <div class="dep-box-name">Service</div>
              <div class="dep-box-desc">Capa de negocio</div>
            </div>
            <div class="dep-arrow">→</div>
            <div class="dep-interface" style="--di-color: var(--accent-r)">IProductoRepo</div>
            <div class="dep-arrow">→</div>
            <div class="dep-box" style="--db-color: var(--accent-r)">
              <div class="dep-box-name">Repository</div>
              <div class="dep-box-desc">Capa de datos</div>
            </div>
          </div>

          <div class="dep-gap" style="--dg-from: var(--accent-r); --dg-to: var(--accent-m)">
            <div class="dep-gap-line"></div>
            <div class="dep-gap-label">depende de →</div>
          </div>

          <div class="dep-row">
            <div class="dep-box" style="--db-color: var(--accent-r)">
              <div class="dep-box-name">Repository</div>
              <div class="dep-box-desc">Capa de datos</div>
            </div>
            <div class="dep-arrow">→</div>
            <div class="dep-interface" style="--di-color: var(--accent-m)">Clases POCO</div>
            <div class="dep-arrow">→</div>
            <div class="dep-box" style="--db-color: var(--accent-m)">
              <div class="dep-box-name">Model</div>
              <div class="dep-box-desc">Entidades del dominio</div>
            </div>
          </div>

        </div>

        <div class="deps-benefits">
          <div class="dep-benefit" style="--db2-color: var(--accent-v)">
            <div class="dep-benefit-title">Mantenibilidad</div>
            <div class="dep-benefit-desc">Un cambio en la BD solo afecta al Repository. La lógica de negocio no se toca.</div>
          </div>
          <div class="dep-benefit" style="--db2-color: var(--accent-s)">
            <div class="dep-benefit-title">Testabilidad</div>
            <div class="dep-benefit-desc">Cada capa se prueba de forma aislada usando mocks de sus interfaces.</div>
          </div>
          <div class="dep-benefit" style="--db2-color: var(--accent-c)">
            <div class="dep-benefit-title">Escalabilidad</div>
            <div class="dep-benefit-desc">El sistema crece sin que las capas se contaminen entre sí.</div>
          </div>
          <div class="dep-benefit" style="--db2-color: var(--accent-m)">
            <div class="dep-benefit-title">Reutilización</div>
            <div class="dep-benefit-desc">Un Service se invoca desde múltiples Controllers sin duplicar código.</div>
          </div>
          <div class="dep-benefit" style="--db2-color: var(--accent-r)">
            <div class="dep-benefit-title">Legibilidad</div>
            <div class="dep-benefit-desc">Cada clase es corta y enfocada. El código habla por sí solo.</div>
          </div>
          <div class="dep-benefit" style="--db2-color: var(--accent-v)">
            <div class="dep-benefit-title">Intercambiabilidad</div>
            <div class="dep-benefit-desc">Cambiar de EF a Dapper solo requiere una nueva implementación del Repository.</div>
          </div>
        </div>

        <p class="lr-hint">Las interfaces son el contrato — las implementaciones son intercambiables</p>
      </div>

    </div>
  `;

  // ════════════════════════════════════════
  // TAB SWITCHING
  // ════════════════════════════════════════
  container.querySelectorAll('.lr-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.lr-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.lr-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#lrtab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ════════════════════════════════════════
  // TAB A — FLOW ANIMATION
  // ════════════════════════════════════════
  const flowSteps = [
    { layer: 'fl-client', packet: null,   status: 'enviando', log: 'Cliente envía GET /api/productos…' },
    { layer: 'fl-ctrl',   packet: 'pk-0', status: 'recibido', log: 'Controller recibe solicitud · valida entrada…' },
    { layer: 'fl-svc',    packet: 'pk-1', status: 'en curso',  log: 'Service aplica reglas de negocio · llama al Repository…' },
    { layer: 'fl-repo',   packet: 'pk-2', status: 'en curso',  log: 'Repository ejecuta consulta en la base de datos…' },
    { layer: 'fl-db',     packet: 'pk-3', status: 'listo',    log: 'Base de datos retorna filas → Repository las mapea al Model' },
  ];

  let flowRunning = false;

  const flowBtn = container.querySelector('#flow-run-btn');
  const flowLog = container.querySelector('#flow-log');
  const flowReturn = container.querySelector('#flow-return');

  function resetFlow() {
    container.querySelectorAll('.flow-layer').forEach(l => {
      l.classList.remove('active', 'done');
    });
    container.querySelectorAll('.flow-packet').forEach(p => {
      p.classList.remove('visible');
    });
    flowReturn.classList.remove('visible');
    flowLog.innerHTML = 'Listo · presiona Simular para ver el flujo';
    flowBtn.disabled = false;
    flowRunning = false;
  }

  const delay = ms => new Promise(r => setTimeout(r, ms));

  flowBtn.addEventListener('click', async () => {
    if (flowRunning) return;
    flowRunning = true;
    flowBtn.disabled = true;

    // reset first
    container.querySelectorAll('.flow-layer').forEach(l => l.classList.remove('active','done'));
    container.querySelectorAll('.flow-packet').forEach(p => p.classList.remove('visible'));
    flowReturn.classList.remove('visible');

    for (let i = 0; i < flowSteps.length; i++) {
      const step = flowSteps[i];

      // mark previous as done
      if (i > 0) {
        container.querySelector(`#${flowSteps[i-1].layer}`).classList.remove('active');
        container.querySelector(`#${flowSteps[i-1].layer}`).classList.add('done');
      }

      // show packet traveling to this layer
      if (step.packet) {
        const pk = container.querySelector(`#${step.packet}`);
        pk.classList.add('visible');
        await delay(350);
        pk.classList.remove('visible');
      }

      // activate this layer
      const layer = container.querySelector(`#${step.layer}`);
      layer.classList.add('active');
      layer.querySelector('.flow-status').textContent = step.status;
      flowLog.innerHTML = `<span class="hi">▶</span> ${step.log}`;

      await delay(900);
    }

    // mark last as done
    const lastLayer = container.querySelector(`#${flowSteps[flowSteps.length-1].layer}`);
    lastLayer.classList.remove('active');
    lastLayer.classList.add('done');

    // show return path
    await delay(300);
    flowReturn.classList.add('visible');
    flowLog.innerHTML = `<span class="ok">✓</span> Respuesta construida · Controller devuelve <span class="ok">200 OK + JSON</span> al cliente`;

    await delay(4000);
    resetFlow();
  });

  // ════════════════════════════════════════
  // TAB B — REMOVAL SIMULATION
  // ════════════════════════════════════════
  const modes = {
    ok: {
      cpColor: 'var(--accent-v)',
      title: '✅ Arquitectura correcta',
      items: [
        { icon: '🟢', text: 'Cada capa tiene una única responsabilidad' },
        { icon: '🟢', text: 'Cambios en la BD solo afectan al Repository' },
        { icon: '🟢', text: 'Service reutilizable desde múltiples Controllers' },
        { icon: '🟢', text: 'Cada capa es testeable de forma aislada con mocks' },
      ],
      svcRemoved: false,
      bypass: false,
      ctrlDesc: 'Recibe, valida, delega al Service',
      arrSvc: '↓ llama IService',
    },
    nosvc: {
      cpColor: 'var(--accent-r)',
      title: '❌ Sin capa Service — lógica migra al Controller',
      items: [
        { icon: '🔴', text: 'Controller se sobrecarga con reglas de negocio' },
        { icon: '🔴', text: 'Misma regla debe repetirse en cada endpoint' },
        { icon: '🔴', text: 'Imposible probar lógica sin contexto HTTP' },
        { icon: '🔴', text: 'Viola SRP: el Controller tiene múltiples razones para cambiar' },
      ],
      svcRemoved: true,
      bypass: false,
      ctrlDesc: '⚠ Ahora contiene lógica de negocio + manejo HTTP',
      arrSvc: '↓ accede directo (sin Service)',
    },
    direct: {
      cpColor: 'var(--accent-r)',
      title: '❌ Controller accede directo al Repository',
      items: [
        { icon: '🔴', text: 'Lógica de negocio queda dispersa y sin centralizar' },
        { icon: '🔴', text: 'Cada endpoint reimplementa las mismas validaciones' },
        { icon: '🔴', text: 'Controller conoce detalles de persistencia que no le corresponden' },
        { icon: '🔴', text: 'Para probar cualquier lógica hay que simular la BD completa' },
      ],
      svcRemoved: false,
      bypass: true,
      ctrlDesc: '⚠ Accede directamente al Repository — saltando el Service',
      arrSvc: '',
    },
  };

  let currentMode = 'ok';

  function applyMode(mode) {
    const m = modes[mode];
    currentMode = mode;

    container.querySelectorAll('.removal-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === mode)
    );

    // Service row
    const svcRow = container.querySelector('#arch-svc');
    const svcArrow = container.querySelector('#arr-svc-wrap');
    const bypass = container.querySelector('#arch-bypass');

    svcRow.classList.toggle('removed', m.svcRemoved);

    // Controller description
    container.querySelector('#arch-ctrl-desc').textContent = m.ctrlDesc;

    if (m.bypass) {
      bypass.classList.add('visible');
      svcArrow.style.display = 'none';
      svcRow.style.opacity = '.35';
    } else {
      bypass.classList.remove('visible');
      svcArrow.style.display = '';
      svcRow.style.opacity = '';
      container.querySelector('#arr-svc').textContent = m.arrSvc;
    }

    // Consequence panel
    const cp = container.querySelector('#consequence-panel');
    cp.style.setProperty('--cp-color', m.cpColor);
    container.querySelector('#cp-title').textContent = m.title;

    const list = container.querySelector('#cp-list');
    list.innerHTML = m.items.map(i =>
      `<div class="consequence-item"><span class="ci-icon">${i.icon}</span>${i.text}</div>`
    ).join('');
  }

  // default
  applyMode('ok');

  container.querySelectorAll('.removal-btn').forEach(btn => {
    btn.addEventListener('click', () => applyMode(btn.dataset.mode));
  });
}