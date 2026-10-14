/* ==========================================================================
   planchas.js · Lógica de la página de planchas
   Los datos viven en planchas-data.js (CATALOGO_PLANCHAS). Aquí no hay que tocar nada
   para agregar planchas.
   ========================================================================== */

const PAGINA_COTIZACION = 'index.html#cotizacion';
const CLAVE_COTIZAR = 'cotizarPlancha'; // la lee script.js del index

/* ---------- Utilidades ---------- */
const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Acepta: 3 | [3, '1/8″'] | { mm: 3, pulg: '1/8″', imagen: '...' }
function normalizarEspesor(e) {
    if (typeof e === 'number') return { mm: e };
    if (Array.isArray(e)) return { mm: e[0], pulg: e[1] };
    return e;
}

function etiquetaEspesor(esp) {
    return esp.pulg ? `${esp.mm} mm (${esp.pulg})` : `${esp.mm} mm`;
}

// Imagen de relleno (SVG) mientras no haya foto propia
function imagenRelleno(codigo) {
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>` +
        `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
        `<stop offset='0' stop-color='#dbe4ec'/><stop offset='.5' stop-color='#aebccb'/><stop offset='1' stop-color='#7d8fa3'/>` +
        `</linearGradient></defs>` +
        `<rect width='800' height='600' fill='#e2e8f0'/>` +
        `<polygon points='150,230 640,190 690,390 200,440' fill='url(#g)' stroke='#64748b' stroke-width='3'/>` +
        `<polygon points='200,440 690,390 690,415 200,465' fill='#64748b'/>` +
        `<text x='400' y='540' text-anchor='middle' font-family='Inter,Arial,sans-serif' font-size='28' ` +
        `font-weight='700' fill='#475569'>Imagen de plancha ${esc(codigo)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------- Construcción del catálogo ---------- */
function htmlFila(tipo, esp) {
    const thumb = esp.imagen
        ? `<img class="plancha-thumb" src="${esc(esp.imagen)}" alt="${esc(tipo.nombre)} de ${esc(esp.mm)} mm" loading="lazy">`
        : '';
    return `
        <li class="plancha-row">
            ${thumb}
            <div class="plancha-medida">
                <span class="plancha-mm">${esc(esp.mm)}<small>mm</small></span>
                ${esp.pulg ? `<span class="plancha-pulg">${esc(esp.pulg)}</span>` : ''}
            </div>
            <div class="plancha-info">
                <p class="plancha-tipo">${esc(tipo.nombre)}</p>
                <p class="plancha-sub">${esc(tipo.subtitulo)}</p>
            </div>
            <a href="${PAGINA_COTIZACION}" class="btn-primary btn-sm"
                data-cotizar data-tipo="${esc(tipo.id)}" data-mm="${esc(esp.mm)}"
                aria-label="Cotizar ${esc(tipo.nombre)} de ${esc(etiquetaEspesor(esp))}">
                Cotizar
            </a>
        </li>`;
}

function htmlSeccion(tipo, indice) {
    const fondo = indice % 2 === 0 ? 'section-light' : 'section-alt';
    const espesores = tipo.espesores.map(normalizarEspesor).sort((a, b) => a.mm - b.mm);
    const imagen = tipo.imagen || imagenRelleno(tipo.codigo);

    return `
    <section id="${esc(tipo.id)}" class="${fondo} scroll-mt-20" aria-labelledby="${esc(tipo.id)}-titulo">
        <div class="page-max-width">
            <p class="section-label text-xs font-bold text-steel-blue">${esc(tipo.codigo)}</p>
            <h2 id="${esc(tipo.id)}-titulo" class="title-section">${esc(tipo.nombre)}</h2>

            <div class="tipo-layout">
                <div class="tipo-ficha">
                    <img class="tipo-imagen" src="${esc(imagen)}" data-codigo="${esc(tipo.codigo)}"
                        alt="Plancha ${esc(tipo.subtitulo.toLowerCase())}" loading="lazy">
                    <h3 class="tipo-nombre"><i class="fa-solid ${esc(tipo.icono || 'fa-layer-group')} icon-small" aria-hidden="true"></i> ${esc(tipo.subtitulo)}</h3>
                    <p class="tipo-descripcion">${esc(tipo.descripcion)}</p>
                    <div class="chip-list">
                        ${(tipo.usos || []).map((u) => `<span class="chip">${esc(u)}</span>`).join('')}
                    </div>
                </div>

                <div>
                    <div class="lista-cabecera">
                        <h3 class="lista-titulo">Espesores disponibles</h3>
                        <span class="lista-cantidad">${espesores.length} opciones</span>
                    </div>
                    <ul class="plancha-lista">
                        ${espesores.map((esp) => htmlFila(tipo, esp)).join('')}
                    </ul>
                </div>
            </div>
        </div>
    </section>`;
}

function construirCatalogo() {
    const contenedor = document.getElementById('catalogo');
    contenedor.insertAdjacentHTML('afterbegin', CATALOGO_PLANCHAS.map(htmlSeccion).join(''));

    // Si una imagen falla, se muestra la de relleno
    contenedor.querySelectorAll('img.tipo-imagen').forEach((img) => {
        img.addEventListener('error', () => {
            img.src = imagenRelleno(img.dataset.codigo);
        }, { once: true });
    });

    // Chips del banner
    document.getElementById('chipsTipos').innerHTML = CATALOGO_PLANCHAS
        .map((t) => `<a class="chip chip-link" href="#${esc(t.id)}">${esc(t.codigo)} · ${esc(t.subtitulo)}</a>`)
        .join('');

    // Menú desplegable
    document.getElementById('menuSeccionesPanel').innerHTML = CATALOGO_PLANCHAS
        .map((t) => `<a class="menu-secciones-item" href="#${esc(t.id)}" data-seccion="${esc(t.id)}">
                        <span>${esc(t.nombre)}</span><small>${t.espesores.length} espesores</small>
                     </a>`)
        .join('');
}

/* ---------- Botón "Cotizar": guarda la plancha y deja que el enlace abra el index ---------- */
document.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-cotizar]');
    if (!boton) return;

    const tipo = CATALOGO_PLANCHAS.find((t) => t.id === boton.dataset.tipo);
    const esp = tipo?.espesores.map(normalizarEspesor).find((x) => String(x.mm) === boton.dataset.mm);
    if (!tipo || !esp) return;

    try {
        localStorage.setItem(CLAVE_COTIZAR, JSON.stringify({
            codigo: `${tipo.codigo}-${esp.mm}MM`,
            tipo: tipo.codigo,
            nombre: tipo.nombre,
            subtitulo: tipo.subtitulo,
            espesor: etiquetaEspesor(esp)
        }));
    } catch (err) {
        // Sin localStorage el enlace igual abre el formulario, solo que sin datos precargados
    }
    // No hay preventDefault: el <a href="index.html#cotizacion"> navega solo
});

/* ---------- Menú desplegable de secciones ---------- */
function iniciarMenu() {
    const btn = document.getElementById('menuSeccionesBtn');
    const panel = document.getElementById('menuSeccionesPanel');

    const abrir = (abierto) => {
        panel.hidden = !abierto;
        btn.setAttribute('aria-expanded', String(abierto));
    };

    btn.addEventListener('click', () => abrir(panel.hidden));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) abrir(false); });
    document.addEventListener('click', (e) => { if (!e.target.closest('#menuSecciones')) abrir(false); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.hidden) { abrir(false); btn.focus(); }
    });

    // Marca en el menú la sección que se está viendo
    const items = panel.querySelectorAll('[data-seccion]');
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            items.forEach((a) => {
                if (a.dataset.seccion === entrada.target.id) a.setAttribute('aria-current', 'true');
                else a.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('#catalogo > section').forEach((s) => observador.observe(s));
}

/* ---------- Modo claro / oscuro ---------- */
function iniciarTema() {
    const toggle = document.getElementById('temaToggle');
    const sol = document.getElementById('temaIconoSol');
    const luna = document.getElementById('temaIconoLuna');

    const actualizarIcono = () => {
        const oscuro = document.documentElement.classList.contains('dark');
        sol?.classList.toggle('hidden', oscuro);
        luna?.classList.toggle('hidden', !oscuro);
    };
    actualizarIcono();

    toggle?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('tema', document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro');
        actualizarIcono();
    });
}

/* ---------- Cursor personalizado ---------- */
function iniciarCursor() {
    const punto = document.getElementById('cursorDot');
    if (!punto || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });

    (function seguir() {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        punto.style.left = `${x}px`;
        punto.style.top = `${y}px`;
        requestAnimationFrame(seguir);
    })();

    const interactivos = 'a, button, input, textarea, select, label, [role="button"]';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(interactivos)) punto.classList.add('is-hover'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(interactivos)) punto.classList.remove('is-hover'); });
}

/* ---------- Fondo de estrellas (igual al del index) ---------- */
function iniciarEstrellas(canvas, densidad = 0.00018) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, estrellas = [];

    function ajustar() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
        const cantidad = Math.max(30, Math.floor(w * h * densidad));
        estrellas = Array.from({ length: cantidad }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 1.4 + 0.3,
            fase: Math.random() * Math.PI * 2,
            vel: 0.4 + Math.random() * 0.8,
            tono: Math.random()
        }));
    }

    function dibujar(t) {
        ctx.clearRect(0, 0, w, h);
        for (const s of estrellas) {
            const alfa = 0.25 + (0.5 + 0.5 * Math.sin(t * 0.001 * s.vel + s.fase)) * 0.65;
            ctx.beginPath();
            ctx.fillStyle = s.tono < 0.34 ? `rgba(176,188,199,${alfa})`
                : s.tono < 0.67 ? `rgba(255,255,255,${alfa})`
                : `rgba(120,175,225,${alfa})`;
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(dibujar);
    }

    ajustar();
    window.addEventListener('resize', ajustar);
    requestAnimationFrame(dibujar);
}

/* ---------- Arranque ---------- */
construirCatalogo();
iniciarMenu();
iniciarTema();
iniciarCursor();
iniciarEstrellas(document.getElementById('heroStars'), 0.00018);
iniciarEstrellas(document.getElementById('ctaStars'), 0.00012);
