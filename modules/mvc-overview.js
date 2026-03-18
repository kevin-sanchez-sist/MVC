/**
 * mvc-overview.js
 * Diagrama interactivo de capas MVC con toggle: Tradicional ↔ Web API
 * Muestra cómo la View se transforma en respuesta JSON en una API.
 * Exporta: init(container)
 */

export function init(container) {
  container.innerHTML = `
    <style>
      #mvc-wrap { display: flex; flex-direction: column; gap: 24px; }

      .mvc-mode-toggle {
        display: flex; gap: 0;
        border: 1px solid var(--border-2);
        border-radius: 4px; overflow: hidden;
        align-self: flex-start;
      }
      .mvc-mode-btn {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px;
        padding: 8px 18px; background: none; border: none;
        color: var(--text-3); cursor: pointer; letter-spacing: .05em;
        transition: all .2s; border-right: 1px solid var(--border-2);
      }
      .mvc-mode-btn:last-child { border-right: none; }
      .mvc-mode-btn.active { background: var(--surface-2); color: var(--text); }
      .mvc-mode-btn.active.trad { color: var(--accent-v); }
      .mvc-mode-btn.active.api  { color: var(--accent-c); }

      #mvc-stack { display: flex; flex-direction: column; gap: 0; user-select: none; }

      .mvc-layer {
        display: grid; grid-template-columns: 52px 1fr;
        cursor: pointer; transition: transform .18s ease;
      }
      .mvc-layer:hover { transform: translateX(5px); }

      .mvc-layer-letter {
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Serif Display', serif; font-size: 26px;
        border: 1px solid var(--layer-color); border-right: none;
        background: color-mix(in srgb, var(--layer-color) 8%, transparent);
        color: var(--layer-color); transition: background .2s;
      }
      .mvc-layer.open .mvc-layer-letter {
        background: color-mix(in srgb, var(--layer-color) 16%, transparent);
      }

      .mvc-layer-header {
        border: 1px solid var(--layer-color);
        border-left: 3px solid var(--layer-color);
        padding: 14px 18px;
        display: flex; align-items: center;
        justify-content: space-between; gap: 10px;
        transition: background .2s;
      }
      .mvc-layer.open .mvc-layer-header {
        background: color-mix(in srgb, var(--layer-color) 6%, transparent);
        border-bottom-color: transparent;
      }

      .mvc-layer-name {
        font-family: 'IBM Plex Mono', monospace; font-size: 12px;
        font-weight: 600; color: var(--layer-color); letter-spacing: .04em;
        display: flex; align-items: center; gap: 8px;
      }
      .mvc-layer-tagline { font-size: 12px; color: var(--text-2); }
      .mvc-layer-chevron {
        font-size: 10px; color: var(--layer-color);
        transition: transform .22s ease; flex-shrink: 0;
      }
      .mvc-layer.open .mvc-layer-chevron { transform: rotate(180deg); }

      .mvc-layer-detail {
        grid-column: 1 / -1;
        max-height: 0; overflow: hidden;
        transition: max-height .35s ease, opacity .25s ease;
        opacity: 0;
        border-left: 1px solid var(--layer-color);
        border-right: 1px solid var(--layer-color);
      }
      .mvc-layer.open .mvc-layer-detail {
        max-height: 260px; opacity: 1;
        border-bottom: 1px solid var(--layer-color);
      }
      .mvc-layer-detail-inner {
        padding: 18px 22px 22px;
        display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      }
      .mvc-detail-block .dlabel {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        letter-spacing: .1em; text-transform: uppercase;
        color: var(--layer-color); margin-bottom: 6px;
      }
      .mvc-detail-block p { font-size: 13px; color: var(--text-2); line-height: 1.6; }
      .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .chip {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 3px 9px;
        border: 1px solid color-mix(in srgb, var(--layer-color) 40%, transparent);
        color: var(--layer-color); border-radius: 3px;
        background: color-mix(in srgb, var(--layer-color) 6%, transparent);
      }

      .mvc-connector {
        display: flex; align-items: center;
        padding: 5px 0 5px 26px; position: relative;
      }
      .mvc-connector::before {
        content: ''; position: absolute; left: 25px; top: 0; bottom: 0;
        width: 1px;
        background: linear-gradient(to bottom, var(--from-color), var(--to-color));
      }
      .mvc-connector-label {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); padding-left: 16px;
        display: flex; align-items: center; gap: 6px;
      }

      .json-badge {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        padding: 2px 8px; border-radius: 3px;
        background: color-mix(in srgb, var(--accent-c) 15%, transparent);
        border: 1px solid var(--accent-c); color: var(--accent-c);
        display: none; animation: fadeInBadge .3s ease;
      }
      .api-mode .json-badge { display: inline-flex; }
      @keyframes fadeInBadge {
        from { opacity:0; transform: scale(.85); }
        to   { opacity:1; transform: scale(1); }
      }

      .api-note {
        display: none;
        background: color-mix(in srgb, var(--accent-c) 7%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent-c) 25%, transparent);
        border-left: 3px solid var(--accent-c);
        padding: 12px 16px; font-size: 13px;
        color: var(--text-2); line-height: 1.6;
        border-radius: 0 3px 3px 0;
        animation: fadeInBadge .3s ease;
      }
      .api-note strong { color: var(--accent-c); }
      .api-mode .api-note { display: block; }

      .mvc-hint {
        font-family: 'IBM Plex Mono', monospace; font-size: 10px;
        color: var(--text-3); text-align: center; letter-spacing: .06em;
      }
    </style>

    <div id="mvc-wrap">

      <div class="sim-title">
        <span class="sim-indicator"></span>
        Cambia de modo para ver cómo se transforma la arquitectura
      </div>

      <div class="mvc-mode-toggle">
        <button class="mvc-mode-btn trad active" data-mode="trad">MVC Tradicional</button>
        <button class="mvc-mode-btn api"         data-mode="api">Web API</button>
      </div>

      <div class="api-note">
        <strong>La Vista desaparece como interfaz gráfica.</strong>
        En una Web API el Controller no devuelve HTML — devuelve datos serializados en JSON.
        El cliente que consume la API es responsable de la presentación visual.
      </div>

      <div id="mvc-stack">

        <!-- VIEW -->
        <div class="mvc-layer" id="layer-v" style="--layer-color: var(--accent-v)">
          <div class="mvc-layer-letter">V</div>
          <div class="mvc-layer-header">
            <div>
              <div class="mvc-layer-name">
                View <span class="json-badge">→ JSON / XML</span>
              </div>
              <div class="mvc-layer-tagline" id="v-tagline">Interfaz de usuario — HTML renderizado por el servidor</div>
            </div>
            <span class="mvc-layer-chevron">▼</span>
          </div>
          <div class="mvc-layer-detail">
            <div class="mvc-layer-detail-inner" id="v-detail-inner">
              <div class="mvc-detail-block">
                <div class="dlabel">En MVC Tradicional</div>
                <p>Página HTML generada por el servidor. Contiene formularios, botones, listas — todo lo que el usuario ve e interactúa directamente.</p>
              </div>
              <div class="mvc-detail-block">
                <div class="dlabel">Motores de plantillas</div>
                <div class="chips">
                  <span class="chip">Razor Pages</span>
                  <span class="chip">Blade (Laravel)</span>
                  <span class="chip">Thymeleaf</span>
                  <span class="chip">JSP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Connector V→C -->
        <div class="mvc-connector" style="--from-color: var(--accent-v); --to-color: var(--accent-c)">
          <div class="mvc-connector-label" id="vc-label">
            <span>↓</span> El usuario interactúa → el Controller recibe la acción
          </div>
        </div>

        <!-- CONTROLLER -->
        <div class="mvc-layer" id="layer-c" style="--layer-color: var(--accent-c)">
          <div class="mvc-layer-letter">C</div>
          <div class="mvc-layer-header">
            <div>
              <div class="mvc-layer-name">Controller</div>
              <div class="mvc-layer-tagline" id="c-tagline">Intermediario — coordina Model y View</div>
            </div>
            <span class="mvc-layer-chevron">▼</span>
          </div>
          <div class="mvc-layer-detail">
            <div class="mvc-layer-detail-inner">
              <div class="mvc-detail-block">
                <div class="dlabel">Responsabilidad</div>
                <p id="c-resp">Recibe la acción del usuario, aplica lógica de control, consulta el Model y devuelve la View correspondiente.</p>
              </div>
              <div class="mvc-detail-block">
                <div class="dlabel">En .NET Web API</div>
                <div class="chips">
                  <span class="chip">[ApiController]</span>
                  <span class="chip">[Route]</span>
                  <span class="chip">Ok(data)</span>
                  <span class="chip">NotFound()</span>
                  <span class="chip">CreatedAtAction()</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Connector C→M -->
        <div class="mvc-connector" style="--from-color: var(--accent-c); --to-color: var(--accent-m)">
          <div class="mvc-connector-label">
            <span>↓</span> Controller consulta o modifica datos en el Model
          </div>
        </div>

        <!-- MODEL -->
        <div class="mvc-layer" id="layer-m" style="--layer-color: var(--accent-m)">
          <div class="mvc-layer-letter">M</div>
          <div class="mvc-layer-header">
            <div>
              <div class="mvc-layer-name">Model</div>
              <div class="mvc-layer-tagline">Datos, entidades y reglas de negocio</div>
            </div>
            <span class="mvc-layer-chevron">▼</span>
          </div>
          <div class="mvc-layer-detail">
            <div class="mvc-layer-detail-inner">
              <div class="mvc-detail-block">
                <div class="dlabel">Responsabilidad</div>
                <p>Representa las entidades del dominio y gestiona el acceso a los datos. <strong style="color:var(--accent-m)">Es igual en ambos modos</strong> — el Model no cambia entre MVC tradicional y Web API.</p>
              </div>
              <div class="mvc-detail-block">
                <div class="dlabel">En .NET</div>
                <div class="chips">
                  <span class="chip">Clases POCO</span>
                  <span class="chip">Entity Framework</span>
                  <span class="chip">DbContext</span>
                  <span class="chip">Data Annotations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <p class="mvc-hint">▲ clic en cada capa para expandir · alterna el modo arriba</p>
    </div>
  `;

  // ── Mode switching ────────────────────────────────────
  const apiContent = {
    vTagline: 'Representación de datos — JSON / XML (no hay pantalla)',
    vDetail:  `<div class="mvc-detail-block">
                 <div class="dlabel">En Web API</div>
                 <p>No existe interfaz gráfica. La "Vista" es el JSON que viaja en la respuesta HTTP — transforma el dato del Model en algo que el cliente puede consumir e interpretar.</p>
               </div>
               <div class="mvc-detail-block">
                 <div class="dlabel">Formato de respuesta</div>
                 <div class="chips">
                   <span class="chip">application/json</span>
                   <span class="chip">200 OK</span>
                   <span class="chip">201 Created</span>
                   <span class="chip">204 No Content</span>
                 </div>
               </div>`,
    vcLabel:  '<span>↓</span> Cliente HTTP envía solicitud → Controller la procesa y responde',
    cTagline: 'Núcleo de la API — recibe HTTP y retorna datos estructurados',
    cResp:    'Recibe solicitudes HTTP (GET/POST/PUT/DELETE), traduce la entrada, delega lógica a servicios y retorna un código de estado con datos JSON — sin devolver ninguna vista.',
  };

  const tradContent = {
    vTagline: 'Interfaz de usuario — HTML renderizado por el servidor',
    vDetail:  `<div class="mvc-detail-block">
                 <div class="dlabel">En MVC Tradicional</div>
                 <p>Página HTML generada por el servidor. Contiene formularios, botones, listas — todo lo que el usuario ve e interactúa directamente.</p>
               </div>
               <div class="mvc-detail-block">
                 <div class="dlabel">Motores de plantillas</div>
                 <div class="chips">
                   <span class="chip">Razor Pages</span>
                   <span class="chip">Blade (Laravel)</span>
                   <span class="chip">Thymeleaf</span>
                   <span class="chip">JSP</span>
                 </div>
               </div>`,
    vcLabel:  '<span>↓</span> El usuario interactúa → el Controller recibe la acción',
    cTagline: 'Intermediario — coordina Model y View',
    cResp:    'Recibe la acción del usuario, aplica lógica de control, consulta el Model y devuelve la View correspondiente.',
  };

  function applyMode(mode) {
    const c = mode === 'api' ? apiContent : tradContent;
    const wrap = container.querySelector('#mvc-wrap');

    container.querySelectorAll('.mvc-mode-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === mode)
    );
    wrap.classList.toggle('api-mode', mode === 'api');

    container.querySelector('#v-tagline').textContent       = c.vTagline;
    container.querySelector('#v-detail-inner').innerHTML    = c.vDetail;
    container.querySelector('#vc-label').innerHTML          = c.vcLabel;
    container.querySelector('#c-tagline').textContent       = c.cTagline;
    container.querySelector('#c-resp').textContent          = c.cResp;

    // close all expanded layers on switch
    container.querySelectorAll('.mvc-layer').forEach(l => l.classList.remove('open'));
  }

  container.querySelectorAll('.mvc-mode-btn').forEach(btn =>
    btn.addEventListener('click', () => applyMode(btn.dataset.mode))
  );

  // ── Layer expand / collapse ───────────────────────────
  container.querySelectorAll('.mvc-layer').forEach(layer => {
    layer.addEventListener('click', () => {
      const isOpen = layer.classList.contains('open');
      container.querySelectorAll('.mvc-layer').forEach(l => l.classList.remove('open'));
      if (!isOpen) layer.classList.add('open');
    });
  });
}