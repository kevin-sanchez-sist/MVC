/**
 * repo-pattern.js
 * Visualiza el Patrón Repository:
 *  - Abstracción de persistencia (interfaz vs implementación)
 *  - Simulación: swap InMemory → SQL Server sin cambiar el Service
 * Exporta: init(container)
 */

export function init(container) {
  container.innerHTML = `
    <style>
      #repo-wrap { display: flex; flex-direction: column; gap: 28px; }

      /* ── Tabs ── */
      .repo-tabs {
        display: flex; gap: 0;
        border: 1px solid var(--border-2);
        border-radius: 4px; overflow: hidden;
        align-self: flex-start;
      }
      .repo-tab {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        padding: 8px 18px; background: none; border: none;
        border-right: 1px solid var(--border-2);
        color: var(--text-3); cursor: pointer;
        letter-spacing: .05em; transition: all .2s;
      }
      .repo-tab:last-child { border-right: none; }
      .repo-tab.active { background: var(--surface-2); color: var(--text); }
      .repo-tab.active.abs  { color: var(--accent-r); }
      .repo-tab.active.swap { color: var(--accent-m); }

      .repo-panel { display: none; flex-direction: column; gap: 20px; }
      .repo-panel.active { display: flex; }

      /* ════════════════════════════
         PANEL A — Abstraction
      ════════════════════════════ */
      .abs-diagram {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      /* Interface row */
      .abs-interface {
        border: 1px solid var(--accent-r);
        border-left: 3px solid var(--accent-r);
        padding: 14px 18px;
        background: color-mix(in srgb, var(--accent-r) 5%, var(--surface));
        display: flex; align-items: flex-start;
        gap: 14px;
      }
      .abs-interface-badge {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 3px 8px; border-radius: 3px;
        border: 1px solid var(--accent-r); color: var(--accent-r);
        background: color-mix(in srgb, var(--accent-r) 10%, transparent);
        white-space: nowrap; flex-shrink: 0; margin-top: 2px;
      }
      .abs-interface-body .iname {
        font-family: 'IBM Plex Mono', monospace; font-size: 13px;
        font-weight: 600; color: var(--accent-r); margin-bottom: 8px;
      }
      .abs-interface-body .imethods {
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .abs-method {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        padding: 3px 10px; border-radius: 3px;
        border: 1px solid color-mix(in srgb, var(--accent-r) 30%, transparent);
        color: var(--text-2);
        background: color-mix(in srgb, var(--accent-r) 5%, transparent);
      }

      /* Arrow */
      .abs-arrow {
        padding: 6px 0 6px 28px;
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); position: relative;
      }
      .abs-arrow::before {
        content: ''; position: absolute;
        left: 27px; top: 0; bottom: 0; width: 1px;
        background: linear-gradient(to bottom, var(--accent-r), var(--accent-m));
      }
      .abs-arrow span { padding-left: 14px; }

      /* Implementations row */
      .abs-impls {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding-top: 4px;
      }
      .abs-impl {
        border: 1px solid var(--impl-color);
        border-top: 3px solid var(--impl-color);
        padding: 14px 16px;
        background: color-mix(in srgb, var(--impl-color) 4%, var(--surface));
        border-radius: 0 0 3px 3px;
      }
      .abs-impl-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        font-weight: 600; color: var(--impl-color); margin-bottom: 4px;
      }
      .abs-impl-desc {
        font-size: 12px; color: var(--text-2); line-height: 1.5;
        margin-bottom: 10px;
      }
      .abs-impl-use {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--impl-color);
        padding: 4px 8px;
        background: color-mix(in srgb, var(--impl-color) 8%, transparent);
        border-radius: 3px; display: inline-block;
      }

      /* Note banner */
      .abs-note {
        background: color-mix(in srgb, var(--accent-r) 7%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent-r) 22%, transparent);
        border-left: 3px solid var(--accent-r);
        padding: 12px 16px; font-size: 13px;
        color: var(--text-2); line-height: 1.6;
        border-radius: 0 3px 3px 0;
      }
      .abs-note strong { color: var(--accent-r); }

      /* ════════════════════════════
         PANEL B — Swap simulation
      ════════════════════════════ */
      .swap-area {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Stack visual */
      .swap-stack {
        display: flex;
        flex-direction: column;
        gap: 0;
        align-items: stretch;
      }

      .swap-box {
        border: 1px solid var(--box-color);
        border-left: 3px solid var(--box-color);
        padding: 12px 16px;
        background: color-mix(in srgb, var(--box-color) 6%, var(--surface));
        display: flex; align-items: center; justify-content: space-between;
      }
      .swap-box-left {
        display: flex; align-items: center; gap: 10px;
      }
      .swap-box-icon { font-size: 18px; }
      .swap-box-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--box-color);
      }
      .swap-box-desc { font-size: 12px; color: var(--text-2); }
      .swap-box-tag {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 2px 8px; border-radius: 99px;
        border: 1px solid color-mix(in srgb, var(--box-color) 40%, transparent);
        color: var(--box-color);
      }

      .swap-connector {
        height: 24px; width: 1px;
        background: var(--border-2);
        margin-left: 27px;
      }

      /* The swappable implementation box */
      .swap-impl-row {
        display: flex; gap: 12px;
      }
      .swap-impl-box {
        flex: 1; border: 2px solid var(--impl-c);
        border-left: 4px solid var(--impl-c);
        padding: 12px 16px;
        background: color-mix(in srgb, var(--impl-c) 8%, var(--surface));
        transition: all .4s ease;
        border-radius: 0 3px 3px 0;
      }
      .swap-impl-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--impl-c); margin-bottom: 4px;
      }
      .swap-impl-detail {
        font-size: 12px; color: var(--text-2); line-height: 1.5;
      }

      /* Swap button */
      .swap-btn {
        align-self: flex-start;
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        padding: 10px 20px;
        border: 1px solid var(--accent-m);
        background: color-mix(in srgb, var(--accent-m) 10%, transparent);
        color: var(--accent-m); cursor: pointer;
        transition: all .15s; letter-spacing: .04em;
        border-radius: 3px;
      }
      .swap-btn:hover {
        background: color-mix(in srgb, var(--accent-m) 20%, transparent);
      }

      /* Swap log */
      .swap-log {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 3px; padding: 12px 16px;
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        color: var(--text-3); line-height: 1.8;
        min-height: 54px;
        transition: all .2s;
      }
      .swap-log .ok  { color: var(--accent-v); }
      .swap-log .hi  { color: var(--accent-m); }

      .repo-hint {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); text-align: center; letter-spacing: .05em;
      }
    </style>

    <div id="repo-wrap">

      <div class="sim-title">
        <span class="sim-indicator"></span>
        Explora cómo el repositorio abstrae la persistencia
      </div>

      <!-- Tabs -->
      <div class="repo-tabs">
        <button class="repo-tab abs active" data-tab="abs">Interfaz vs Implementación</button>
        <button class="repo-tab swap"       data-tab="swap">Cambio de almacenamiento ↔</button>
      </div>

      <!-- ══ Panel A: Abstraction ══ -->
      <div class="repo-panel active" id="rtab-abs">

        <div class="abs-note">
          <strong>Abstraer la persistencia</strong> significa que el resto del sistema usa
          métodos de alto nivel como <code>obtenerPorId()</code> o <code>guardar()</code>
          sin saber si hay SQL, un ORM o datos en memoria detrás.
        </div>

        <div class="abs-diagram">

          <!-- Interface -->
          <div class="abs-interface">
            <div class="abs-interface-badge">interface</div>
            <div class="abs-interface-body">
              <div class="iname">IProductoRepository</div>
              <div class="imethods">
                <span class="abs-method">obtenerPorId(id)</span>
                <span class="abs-method">obtenerTodos()</span>
                <span class="abs-method">guardar(producto)</span>
                <span class="abs-method">actualizar(producto)</span>
                <span class="abs-method">eliminar(id)</span>
              </div>
            </div>
          </div>

          <!-- Arrow down -->
          <div class="abs-arrow">
            <span>↓ múltiples implementaciones del mismo contrato</span>
          </div>

          <!-- Implementations -->
          <div class="abs-impls">
            <div class="abs-impl" style="--impl-color: var(--accent-v)">
              <div class="abs-impl-name">ProductoRepositoryInMemory</div>
              <div class="abs-impl-desc">
                Guarda datos en una lista en memoria. Ideal para pruebas unitarias o prototipos — sin base de datos real.
              </div>
              <span class="abs-impl-use">🧪 Pruebas / desarrollo</span>
            </div>
            <div class="abs-impl" style="--impl-color: var(--accent-m)">
              <div class="abs-impl-name">ProductoRepositoryEF</div>
              <div class="abs-impl-desc">
                Persiste datos con Entity Framework Core en SQL Server. Listo para producción.
              </div>
              <span class="abs-impl-use">🚀 Producción</span>
            </div>
          </div>

        </div>

        <p class="repo-hint">El Service siempre usa IProductoRepository — no le importa cuál implementación está activa</p>
      </div>

      <!-- ══ Panel B: Swap ══ -->
      <div class="repo-panel" id="rtab-swap">

        <div class="swap-area">

          <!-- Fixed layers -->
          <div class="swap-stack">
            <div class="swap-box" style="--box-color: var(--accent-c)">
              <div class="swap-box-left">
                <span class="swap-box-icon">⚙️</span>
                <div>
                  <div class="swap-box-name">Controller</div>
                  <div class="swap-box-desc">No cambia nada</div>
                </div>
              </div>
              <span class="swap-box-tag">sin cambios</span>
            </div>
            <div class="swap-connector"></div>
            <div class="swap-box" style="--box-color: var(--accent-s)">
              <div class="swap-box-left">
                <span class="swap-box-icon">🔧</span>
                <div>
                  <div class="swap-box-name">ProductoService</div>
                  <div class="swap-box-desc">Llama a IProductoRepository — no sabe qué implementación hay</div>
                </div>
              </div>
              <span class="swap-box-tag">sin cambios</span>
            </div>
            <div class="swap-connector"></div>
          </div>

          <!-- Swappable implementation -->
          <div class="swap-impl-box" id="swap-impl-box"
               style="--impl-c: var(--accent-v)">
            <div class="swap-impl-name" id="swap-impl-name">
              ProductoRepositoryInMemory
            </div>
            <div class="swap-impl-detail" id="swap-impl-detail">
              Lista en memoria · sin BD · para pruebas
            </div>
          </div>

          <!-- Button -->
          <button class="swap-btn" id="swap-btn">
            ⇄ Cambiar implementación
          </button>

          <!-- Log -->
          <div class="swap-log" id="swap-log">
            <span class="hi">// Program.cs — inyección de dependencias</span><br>
            builder.Services.AddScoped&lt;<span class="ok">IProductoRepository</span>,
              <span id="swap-log-impl" style="color:var(--accent-v)">ProductoRepositoryInMemory</span>&gt;();
          </div>

        </div>

        <p class="repo-hint">El Service no necesita cambios — solo se sustituye la implementación en el contenedor DI</p>
      </div>

    </div>
  `;

  // ── Tabs ──────────────────────────────────────────────
  container.querySelectorAll('.repo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.repo-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.repo-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector(`#rtab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ── Swap simulation ───────────────────────────────────
  let isInMemory = true;

  const implBox  = container.querySelector('#swap-impl-box');
  const implName = container.querySelector('#swap-impl-name');
  const implDet  = container.querySelector('#swap-impl-detail');
  const logImpl  = container.querySelector('#swap-log-impl');
  const swapBtn  = container.querySelector('#swap-btn');

  swapBtn.addEventListener('click', () => {
    isInMemory = !isInMemory;

    if (isInMemory) {
      implBox.style.setProperty('--impl-c', 'var(--accent-v)');
      implName.textContent = 'ProductoRepositoryInMemory';
      implDet.textContent  = 'Lista en memoria · sin BD · para pruebas';
      logImpl.style.color  = 'var(--accent-v)';
      logImpl.textContent  = 'ProductoRepositoryInMemory';
    } else {
      implBox.style.setProperty('--impl-c', 'var(--accent-m)');
      implName.textContent = 'ProductoRepositoryEF';
      implDet.textContent  = 'Entity Framework Core · SQL Server · producción';
      logImpl.style.color  = 'var(--accent-m)';
      logImpl.textContent  = 'ProductoRepositoryEF';
    }

    // brief visual pulse on the impl box
    implBox.style.transform = 'scale(1.01)';
    setTimeout(() => { implBox.style.transform = 'scale(1)'; }, 200);
  });
}