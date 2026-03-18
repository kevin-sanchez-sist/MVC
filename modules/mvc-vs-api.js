/**
 * mvc-vs-api.js
 * Comparación interactiva: MVC Tradicional vs MVC en Web API
 * Tabla animada con highlight por fila al hacer hover/clic.
 * Exporta: init(container)
 */

export function init(container) {
  const rows = [
    {
      aspect: 'Vista',
      trad:   { text: 'Página HTML renderizada por el servidor (Razor, Blade, JSP…)', tag: 'HTML' },
      api:    { text: 'No existe vista gráfica — se retorna JSON o XML', tag: 'JSON' },
      delta:  'La presentación visual se desplaza al cliente.',
    },
    {
      aspect: 'Cliente',
      trad:   { text: 'Navegador web — recibe y muestra el HTML directamente', tag: 'Browser' },
      api:    { text: 'Cualquier cliente: app móvil, React/Angular, otro servicio', tag: 'Any' },
      delta:  'La API es agnóstica del cliente que la consume.',
    },
    {
      aspect: 'Respuesta del Controller',
      trad:   { text: 'Devuelve una View (archivo .cshtml, template, etc.)', tag: 'return View()' },
      api:    { text: 'Devuelve un código HTTP con datos serializados en JSON', tag: 'return Ok(data)' },
      delta:  'El Controller de una API nunca construye HTML.',
    },
    {
      aspect: 'Presentación',
      trad:   { text: 'Responsabilidad del servidor — genera el HTML final', tag: 'Server' },
      api:    { text: 'Responsabilidad del cliente — él decide cómo mostrar los datos', tag: 'Client' },
      delta:  'Separación total entre backend y frontend.',
    },
    {
      aspect: 'Acoplamiento',
      trad:   { text: 'Cliente y servidor acoplados — el servidor sabe cómo se ve la UI', tag: 'Acoplado' },
      api:    { text: 'Cliente y servidor desacoplados — se comunican por contrato HTTP', tag: 'Desacoplado' },
      delta:  'Permite que el frontend evolucione independientemente.',
    },
    {
      aspect: 'Protocolo / Estado',
      trad:   { text: 'HTTP con sesiones, cookies y estado en el servidor', tag: 'Stateful' },
      api:    { text: 'HTTP stateless (REST) — cada solicitud es independiente', tag: 'Stateless' },
      delta:  'REST no guarda estado entre solicitudes.',
    },
  ];

  container.innerHTML = `
    <style>
      #cmp-wrap { display: flex; flex-direction: column; gap: 20px; }

      /* ── Header columns ── */
      .cmp-header {
        display: grid;
        grid-template-columns: 160px 1fr 1fr;
        gap: 0;
      }
      .cmp-header-cell {
        padding: 10px 16px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px; letter-spacing: .08em;
        text-transform: uppercase; font-weight: 600;
        border: 1px solid var(--border-2);
        border-right: none;
      }
      .cmp-header-cell:last-child { border-right: 1px solid var(--border-2); }
      .cmp-header-cell.aspect { color: var(--text-3); background: var(--surface); }
      .cmp-header-cell.trad   { color: var(--accent-v); background: color-mix(in srgb, var(--accent-v) 6%, var(--surface)); }
      .cmp-header-cell.api    { color: var(--accent-c); background: color-mix(in srgb, var(--accent-c) 6%, var(--surface)); }

      /* ── Rows ── */
      .cmp-table { display: flex; flex-direction: column; gap: 0; }

      .cmp-row {
        display: grid;
        grid-template-columns: 160px 1fr 1fr;
        cursor: pointer;
        transition: background .15s;
        border-bottom: 1px solid var(--border);
      }
      .cmp-row:first-child { border-top: 1px solid var(--border); }
      .cmp-row:hover { background: var(--surface); }
      .cmp-row.active { background: var(--surface-2); }

      .cmp-cell {
        padding: 14px 16px;
        border-right: 1px solid var(--border);
        font-size: 13px; color: var(--text-2);
        line-height: 1.5; position: relative;
      }
      .cmp-cell:last-child { border-right: none; }
      .cmp-cell.aspect-cell {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px; color: var(--text-3);
        display: flex; align-items: flex-start;
        padding-top: 16px;
      }

      .cmp-tag {
        display: inline-block; margin-bottom: 6px;
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 2px 7px; border-radius: 3px;
        background: color-mix(in srgb, var(--tag-color) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--tag-color) 35%, transparent);
        color: var(--tag-color);
      }
      .trad-tag { --tag-color: var(--accent-v); }
      .api-tag  { --tag-color: var(--accent-c); }

      /* ── Delta / insight panel ── */
      .cmp-delta {
        grid-column: 1 / -1;
        max-height: 0; overflow: hidden;
        transition: max-height .3s ease, opacity .25s ease;
        opacity: 0;
      }
      .cmp-row.active .cmp-delta {
        max-height: 80px; opacity: 1;
      }
      .cmp-delta-inner {
        padding: 10px 16px 14px;
        display: flex; align-items: center; gap: 10px;
        border-top: 1px dashed var(--border-2);
      }
      .cmp-delta-icon {
        font-size: 16px; flex-shrink: 0;
      }
      .cmp-delta-text {
        font-size: 12px; color: var(--text-2);
        font-style: italic; line-height: 1.5;
      }

      /* ── Summary pills ── */
      .cmp-summary {
        display: flex; gap: 10px; flex-wrap: wrap;
      }
      .cmp-summary-pill {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 5px 12px; border-radius: 99px;
        border: 1px solid var(--border-2); color: var(--text-3);
        display: flex; align-items: center; gap: 6px;
      }
      .cmp-summary-pill .dot {
        width: 6px; height: 6px; border-radius: 50%;
      }

      .cmp-hint {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); text-align: center; letter-spacing: .05em;
      }
    </style>

    <div id="cmp-wrap">
      <div class="sim-title">
        <span class="sim-indicator"></span>
        Haz clic en una fila para ver el impacto del cambio
      </div>

      <div class="cmp-header">
        <div class="cmp-header-cell aspect">Aspecto</div>
        <div class="cmp-header-cell trad">MVC Tradicional</div>
        <div class="cmp-header-cell api">MVC en Web API</div>
      </div>

      <div class="cmp-table" id="cmp-table"></div>

      <div class="cmp-summary">
        <div class="cmp-summary-pill">
          <span class="dot" style="background:var(--accent-v)"></span>
          Tradicional: servidor renderiza la UI
        </div>
        <div class="cmp-summary-pill">
          <span class="dot" style="background:var(--accent-c)"></span>
          Web API: cliente construye la UI
        </div>
        <div class="cmp-summary-pill">
          <span class="dot" style="background:var(--accent-m)"></span>
          Model: igual en ambos casos
        </div>
      </div>

      <p class="cmp-hint">▲ clic en cada fila para ver la clave de la diferencia</p>
    </div>
  `;

  // ── Build rows ────────────────────────────────────────
  const table = container.querySelector('#cmp-table');

  rows.forEach((row, i) => {
    const el = document.createElement('div');
    el.className = 'cmp-row';
    el.innerHTML = `
      <div class="cmp-cell aspect-cell">${row.aspect}</div>
      <div class="cmp-cell">
        <div><span class="cmp-tag trad-tag">${row.trad.tag}</span></div>
        ${row.trad.text}
      </div>
      <div class="cmp-cell">
        <div><span class="cmp-tag api-tag">${row.api.tag}</span></div>
        ${row.api.text}
      </div>
      <div class="cmp-delta">
        <div class="cmp-delta-inner">
          <span class="cmp-delta-icon">💡</span>
          <span class="cmp-delta-text">${row.delta}</span>
        </div>
      </div>
    `;

    el.addEventListener('click', () => {
      const isActive = el.classList.contains('active');
      table.querySelectorAll('.cmp-row').forEach(r => r.classList.remove('active'));
      if (!isActive) el.classList.add('active');
    });

    table.appendChild(el);
  });
}