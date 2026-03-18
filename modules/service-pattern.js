/**
 * service-pattern.js
 * Visualiza el Patrón de Servicios:
 *  - Responsabilidades por capa (SRP)
 *  - Comparación: lógica en Controller vs lógica en Service
 * Exporta: init(container)
 */

export function init(container) {
  container.innerHTML = `
    <style>
      #svc-wrap { display: flex; flex-direction: column; gap: 28px; }

      /* ── Tab toggle ── */
      .svc-tabs {
        display: flex; gap: 0;
        border: 1px solid var(--border-2);
        border-radius: 4px; overflow: hidden;
        align-self: flex-start;
      }
      .svc-tab {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        padding: 8px 18px; background: none; border: none;
        border-right: 1px solid var(--border-2);
        color: var(--text-3); cursor: pointer;
        letter-spacing: .05em; transition: all .2s;
      }
      .svc-tab:last-child { border-right: none; }
      .svc-tab.active { background: var(--surface-2); color: var(--text); }
      .svc-tab.active.srp  { color: var(--accent-s); }
      .svc-tab.active.bad  { color: var(--accent-r); }

      /* ── Panel visibility ── */
      .svc-panel { display: none; }
      .svc-panel.active { display: flex; flex-direction: column; gap: 20px; }

      /* ════════════════════════════
         PANEL A — SRP / Capas
      ════════════════════════════ */
      .srp-layers {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .srp-layer {
        display: grid;
        grid-template-columns: 48px 1fr;
        cursor: pointer;
        transition: transform .15s;
        --lc: var(--accent-s);
      }
      .srp-layer:hover { transform: translateX(4px); }

      .srp-letter {
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Serif Display', serif; font-size: 18px;
        border: 1px solid var(--lc); border-right: none;
        color: var(--lc);
        background: color-mix(in srgb, var(--lc) 8%, transparent);
        transition: background .2s;
      }
      .srp-layer.open .srp-letter {
        background: color-mix(in srgb, var(--lc) 16%, transparent);
      }

      .srp-header {
        border: 1px solid var(--lc);
        border-left: 3px solid var(--lc);
        padding: 12px 16px;
        display: flex; align-items: center;
        justify-content: space-between;
        transition: background .2s;
      }
      .srp-layer.open .srp-header {
        background: color-mix(in srgb, var(--lc) 5%, transparent);
        border-bottom-color: transparent;
      }

      .srp-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--lc);
      }
      .srp-reason {
        font-size: 12px; color: var(--text-2); margin-top: 2px;
      }
      .srp-chevron {
        font-size: 10px; color: var(--lc);
        transition: transform .2s; flex-shrink: 0;
      }
      .srp-layer.open .srp-chevron { transform: rotate(180deg); }

      .srp-detail {
        grid-column: 1 / -1;
        max-height: 0; overflow: hidden;
        opacity: 0;
        transition: max-height .3s ease, opacity .25s;
        border-left: 1px solid var(--lc);
        border-right: 1px solid var(--lc);
      }
      .srp-layer.open .srp-detail {
        max-height: 200px; opacity: 1;
        border-bottom: 1px solid var(--lc);
      }
      .srp-detail-inner {
        padding: 14px 20px 18px;
        display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
      }
      .srp-block .srp-dlabel {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--lc); margin-bottom: 5px;
      }
      .srp-block p { font-size: 13px; color: var(--text-2); line-height: 1.5; }
      .srp-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
      .srp-chip {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 2px 8px; border-radius: 3px;
        border: 1px solid color-mix(in srgb, var(--lc) 35%, transparent);
        color: var(--lc);
        background: color-mix(in srgb, var(--lc) 6%, transparent);
      }

      .srp-connector {
        display: flex; align-items: center;
        padding: 4px 0 4px 24px; position: relative;
      }
      .srp-connector::before {
        content: ''; position: absolute; left: 23px;
        top: 0; bottom: 0; width: 1px;
        background: linear-gradient(to bottom, var(--fc), var(--tc));
      }
      .srp-connector-label {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); padding-left: 14px;
      }

      /* ════════════════════════════
         PANEL B — Fat Controller
      ════════════════════════════ */
      .fat-compare {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .fat-col {
        display: flex; flex-direction: column; gap: 0;
        border: 1px solid var(--col-border);
        border-radius: 3px; overflow: hidden;
      }
      .fat-col.bad  { --col-border: var(--accent-r); }
      .fat-col.good { --col-border: var(--accent-v); }

      .fat-col-header {
        padding: 10px 14px;
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        font-weight: 600; letter-spacing: .05em;
        background: color-mix(in srgb, var(--col-border) 10%, var(--surface));
        color: var(--col-border);
        display: flex; align-items: center; gap: 8px;
      }

      /* Code block */
      .fat-code {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        line-height: 1.7; padding: 14px 16px;
        background: var(--bg); color: var(--text-2);
        flex: 1;
        white-space: pre;
        overflow-x: auto;
      }
      .fat-code .kw   { color: var(--accent-s); }   /* keywords */
      .fat-code .type { color: var(--accent-v); }   /* types    */
      .fat-code .str  { color: var(--accent-m); }   /* strings  */
      .fat-code .cmt  { color: var(--text-3); font-style: italic; }
      .fat-code .bad-line  { background: color-mix(in srgb, var(--accent-r) 12%, transparent); border-left: 2px solid var(--accent-r); padding-left: 4px; display: block; margin: 0 -16px; padding: 0 14px; }
      .fat-code .good-line { background: color-mix(in srgb, var(--accent-v) 8%, transparent);  border-left: 2px solid var(--accent-v); padding-left: 4px; display: block; margin: 0 -16px; padding: 0 14px; }

      /* Problems list */
      .fat-problems {
        border-top: 1px solid var(--col-border);
        padding: 12px 14px;
        display: flex; flex-direction: column; gap: 6px;
      }
      .fat-problem {
        font-size: 12px; color: var(--text-2);
        display: flex; align-items: flex-start; gap: 7px;
      }
      .fat-problem .icon { flex-shrink: 0; font-size: 12px; }

      /* SRP reminder */
      .srp-reminder {
        background: color-mix(in srgb, var(--accent-s) 7%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent-s) 25%, transparent);
        border-left: 3px solid var(--accent-s);
        padding: 12px 16px; font-size: 13px;
        color: var(--text-2); line-height: 1.6;
        border-radius: 0 3px 3px 0;
      }
      .srp-reminder strong { color: var(--accent-s); }

      .svc-hint {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); text-align: center; letter-spacing: .05em;
      }
    </style>

    <div id="svc-wrap">

      <div class="sim-title">
        <span class="sim-indicator"></span>
        Explora las responsabilidades de cada capa y por qué importa separarlas
      </div>

      <!-- Tabs -->
      <div class="svc-tabs">
        <button class="svc-tab srp active" data-tab="srp">Responsabilidades (SRP)</button>
        <button class="svc-tab bad"        data-tab="bad">Lógica en el Controller ❌</button>
      </div>

      <!-- ══ Panel A: SRP ══ -->
      <div class="svc-panel active" id="tab-srp">

        <div class="srp-reminder">
          <strong>SRP — Principio de Responsabilidad Única:</strong>
          cada capa debe tener <em>una sola razón para cambiar</em>.
          Controller → HTTP &nbsp;·&nbsp; Service → negocio &nbsp;·&nbsp; Repository → datos.
        </div>

        <div class="srp-layers">

          <!-- Controller -->
          <div class="srp-layer" style="--lc: var(--accent-c)">
            <div class="srp-letter">C</div>
            <div class="srp-header">
              <div>
                <div class="srp-name">Controller</div>
                <div class="srp-reason">Razón de cambio: transporte HTTP</div>
              </div>
              <span class="srp-chevron">▼</span>
            </div>
            <div class="srp-detail">
              <div class="srp-detail-inner">
                <div class="srp-block">
                  <div class="srp-dlabel">Su única responsabilidad</div>
                  <p>Recibir la solicitud HTTP, validar el formato de entrada, invocar el Service correcto y devolver la respuesta HTTP apropiada.</p>
                </div>
                <div class="srp-block">
                  <div class="srp-dlabel">Lo que NO debe hacer</div>
                  <div class="srp-chips">
                    <span class="srp-chip">Validar reglas de negocio</span>
                    <span class="srp-chip">Acceder directamente a BD</span>
                    <span class="srp-chip">Calcular resultados</span>
                    <span class="srp-chip">Controlar flujo de estados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector C→S -->
          <div class="srp-connector" style="--fc: var(--accent-c); --tc: var(--accent-s)">
            <div class="srp-connector-label">↓ delega intención de negocio al Service</div>
          </div>

          <!-- Service -->
          <div class="srp-layer" style="--lc: var(--accent-s)">
            <div class="srp-letter">S</div>
            <div class="srp-header">
              <div>
                <div class="srp-name">Service</div>
                <div class="srp-reason">Razón de cambio: reglas y flujo de negocio</div>
              </div>
              <span class="srp-chevron">▼</span>
            </div>
            <div class="srp-detail">
              <div class="srp-detail-inner">
                <div class="srp-block">
                  <div class="srp-dlabel">Su única responsabilidad</div>
                  <p>Orquestar la lógica de negocio: aplicar reglas, coordinar validaciones, interactuar con repositorios y definir el flujo correcto de cada operación.</p>
                </div>
                <div class="srp-block">
                  <div class="srp-dlabel">Ventaja de usar interfaz</div>
                  <div class="srp-chips">
                    <span class="srp-chip">Desacoplamiento</span>
                    <span class="srp-chip">Fácil de testear (mock)</span>
                    <span class="srp-chip">Intercambiable</span>
                    <span class="srp-chip">IProductoService</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector S→R -->
          <div class="srp-connector" style="--fc: var(--accent-s); --tc: var(--accent-r)">
            <div class="srp-connector-label">↓ accede a datos a través del Repository</div>
          </div>

          <!-- Repository -->
          <div class="srp-layer" style="--lc: var(--accent-r)">
            <div class="srp-letter">R</div>
            <div class="srp-header">
              <div>
                <div class="srp-name">Repository</div>
                <div class="srp-reason">Razón de cambio: tecnología de persistencia</div>
              </div>
              <span class="srp-chevron">▼</span>
            </div>
            <div class="srp-detail">
              <div class="srp-detail-inner">
                <div class="srp-block">
                  <div class="srp-dlabel">Su única responsabilidad</div>
                  <p>Persistencia y recuperación de datos. Expone métodos de alto nivel como <code>obtenerPorId</code>, <code>guardar</code>, <code>eliminar</code> sin exponer detalles técnicos.</p>
                </div>
                <div class="srp-block">
                  <div class="srp-dlabel">Lo que NO debe hacer</div>
                  <div class="srp-chips">
                    <span class="srp-chip">Aplicar reglas de negocio</span>
                    <span class="srp-chip">Validar estados</span>
                    <span class="srp-chip">Calcular lógica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <p class="svc-hint">▲ clic en cada capa para expandir</p>
      </div>

      <!-- ══ Panel B: Fat Controller ══ -->
      <div class="svc-panel" id="tab-bad">

        <div class="fat-compare">

          <!-- BAD -->
          <div class="fat-col bad">
            <div class="fat-col-header">❌ Lógica en el Controller</div>
            <div class="fat-code"><span class="kw">public</span> <span class="type">IActionResult</span> Crear(
  <span class="type">ProductoDto</span> dto) {

<span class="bad-line">  <span class="cmt">// ❌ regla de negocio aquí</span></span>
<span class="bad-line">  <span class="kw">if</span> (dto.Precio &lt;= 0)</span>
<span class="bad-line">    <span class="kw">return</span> BadRequest(<span class="str">"Precio inválido"</span>);</span>

<span class="bad-line">  <span class="cmt">// ❌ acceso directo a BD</span></span>
<span class="bad-line">  _db.Productos.Add(dto);</span>
<span class="bad-line">  _db.SaveChanges();</span>

  <span class="kw">return</span> Ok();
}</div>
            <div class="fat-problems">
              <div class="fat-problem"><span class="icon">🔴</span>Regla duplicada si hay otro endpoint</div>
              <div class="fat-problem"><span class="icon">🔴</span>Difícil de testear sin contexto HTTP</div>
              <div class="fat-problem"><span class="icon">🔴</span>Acoplado al ORM — no se puede cambiar BD</div>
              <div class="fat-problem"><span class="icon">🔴</span>Viola SRP: múltiples razones para cambiar</div>
            </div>
          </div>

          <!-- GOOD -->
          <div class="fat-col good">
            <div class="fat-col-header">✅ Con capa Service</div>
            <div class="fat-code"><span class="kw">public</span> <span class="type">IActionResult</span> Crear(
  <span class="type">ProductoDto</span> dto) {

<span class="good-line">  <span class="cmt">// ✅ delega al Service</span></span>
<span class="good-line">  <span class="kw">var</span> resultado =</span>
<span class="good-line">    _productoService.Crear(dto);</span>

  <span class="kw">return</span> Ok(resultado);
}

<span class="cmt">// Lógica vive en ProductoService:</span>
<span class="cmt">// valida, aplica reglas, llama repo</span></div>
            <div class="fat-problems">
              <div class="fat-problem"><span class="icon">🟢</span>Controller limpio — solo transporte HTTP</div>
              <div class="fat-problem"><span class="icon">🟢</span>Service reutilizable desde cualquier endpoint</div>
              <div class="fat-problem"><span class="icon">🟢</span>Testeable con mock de IProductoService</div>
              <div class="fat-problem"><span class="icon">🟢</span>Cada clase tiene una sola razón para cambiar</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  `;

  // ── Tabs ──────────────────────────────────────────────
  container.querySelectorAll('.svc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.svc-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.svc-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ── SRP layer expand ──────────────────────────────────
  container.querySelectorAll('.srp-layer').forEach(layer => {
    layer.addEventListener('click', () => {
      const isOpen = layer.classList.contains('open');
      container.querySelectorAll('.srp-layer').forEach(l => l.classList.remove('open'));
      if (!isOpen) layer.classList.add('open');
    });
  });
}