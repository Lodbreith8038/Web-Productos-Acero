/*
============================================================
CATÁLOGO DE DISEÑOS AUTOCAD — LÓGICA (catalogo-autocad.js)
Productos de Acero E.I.R.L.

⚠ AQUÍ NO SE ESCRIBEN NOMBRES NI DESCRIPCIONES.
   Los textos de las tarjetas se editan en  /JS/catalogo-datos.js
   Los dibujos de los DXF los genera dxf_a_catalogo.py en  /JS/disenos-dxf.js
   Orden de carga en diseños.html:  disenos-dxf.js → catalogo-datos.js → este archivo

MAPA DE ESTE ARCHIVO
  01. Utilidades SVG
  02. Dibujos genéricos de muestra (plate, flange, bracket, holes, slots, perf)
  03. Armado de las tarjetas  ← lee CATALOGO (catalogo-datos.js)
  04. Dibujo técnico del banner
  05. Cambio de tema
  06. Cursor personalizado
  07. Fondo de estrellas
  08. ★ CONVERSIÓN 2: tarjeta SVG → imagen PNG y envío al formulario

LAS 3 ZONAS DE CONVERSIÓN DE ARCHIVOS
  CONVERSIÓN 1  DXF → miniatura SVG   fuera de la página: dxf_a_catalogo.py
  CONVERSIÓN 2  SVG → PNG             sección 08 de este archivo (al pulsar «Cotizar»)
  CONVERSIÓN 3  PNG → archivo adjunto en index.html: script.js, cargarDisenoDelCatalogo()
============================================================
*/

/* ==========================================================
   01. UTILIDADES SVG
   Funciones pequeñas reutilizadas para construir los planos.
   ========================================================== */
const slot = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>`;
const dim = (x1, y, x2, t) => `<g class="d"><path d="M${x1} ${y}H${x2}M${x1} ${y - 4}V${y + 4}M${x2} ${y - 4}V${y + 4}" /><text x="${(x1 + x2) / 2}" y="${y - 5}" text-anchor="middle">${t}</text></g>`;

/* ==========================================================
   02. DIBUJOS GENÉRICOS DE MUESTRA
   Formas usadas por los diseños LAC / LAF / GALV / INOX.
   El nombre de cada forma (plate, flange…) se elige en catalogo-datos.js
   con  dibujo: 'plate'.  Solo se edita esto para crear una forma nueva.
   ========================================================== */
const P = {
    slots: () => `<rect x="30" y="30" width="180" height="100" rx="3"/>` + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => slot(48 + c * 40, 44 + r * 28, 28, 12)).join('')).join('') + dim(30, 146, 210, '450'),
    holes: () => `<rect x="30" y="25" width="180" height="105" rx="3"/>` + [0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => `<circle cx="${52 + c * 34}" cy="${50 + r * 28}" r="8"/>`).join('')).join('') + dim(30, 146, 210, '450'),
    flange: () => `<circle cx="120" cy="78" r="56"/><circle cx="120" cy="78" r="22"/>` + [0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `<circle cx="${120 + 39 * Math.cos(a)}" cy="${78 + 39 * Math.sin(a)}" r="5"/>` }).join('') + `<path class="c" d="M50 78H190M120 12V144"/>` + dim(64, 150, 176, 'Ø280'),
    bracket: () => `<path d="M40 30H200V60H110V130H40Z"/><circle cx="62" cy="52" r="7"/><circle cx="62" cy="108" r="7"/><circle cx="170" cy="45" r="6"/>${slot(130, 80, 50, 10)}` + dim(40, 146, 200, '400'),
    perf: () => `<rect x="30" y="25" width="180" height="105" rx="3"/>` + [0, 1, 2, 3, 4, 5].map(r => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => `<circle cx="${(r % 2 ? 50 : 44) + c * 17}" cy="${42 + r * 16}" r="4"/>`).join('')).join('') + dim(30, 146, 210, '450'),
    plate: () => `<path d="M30 28H210V100L170 132H30Z"/><circle cx="52" cy="50" r="7"/><circle cx="188" cy="50" r="7"/><circle cx="52" cy="110" r="7"/>${slot(84, 60, 76, 16)}${slot(84, 86, 76, 16)}` + dim(30, 148, 210, '450')
};

/* ==========================================================
   03. ARMADO DE LAS TARJETAS
   Cada <div class="diseno-grid" data-m="LAC"> del HTML se llena con
   las fichas de CATALOGO.LAC (catalogo-datos.js).
   · Ficha con  dibujo:  → se usa una forma de la sección 02
   · Ficha con  archivo: → se usa el dibujo del DXF (disenos-dxf.js)
   ========================================================== */
/* Miniatura: el estilo va dentro del SVG para que el PNG exportado conserve los colores */
function svg(contenido, c, grosor = 1.6) {
    return `<svg viewBox="0 0 240 160"><style>.s *{fill:none;stroke:${c};stroke-width:${grosor}}.s .c{stroke-dasharray:6 3 1 3;stroke-width:.8;opacity:.7}.s .d path{stroke:var(--cat-draw);stroke-width:.8;opacity:.6}.s .d text{fill:var(--cat-draw);stroke:none;font:600 9px Inter,sans-serif;opacity:.8}</style><g class="s">${contenido}</g></svg>`;
}

/* ---- PLANTILLA HTML DE UNA TARJETA (cambia aquí su estructura) ---- */
function tarjeta({ etiqueta, acento, cod, nombre, desc, dibujo, grosor, meta = '', archivo = '' }) {
    return `<article class="diseno-card" style="--ac:${acento}"${archivo ? ` data-archivo="${archivo}"` : ''}>
<div class="diseno-thumb">${svg(dibujo, acento, grosor)}</div>
<div class="diseno-info"><small class="diseno-codigo">${etiqueta} · ${cod}</small><h3 class="diseno-nombre">${nombre}</h3><p class="diseno-desc">${desc}</p>${meta ? `<p class="diseno-meta">${meta}</p>` : ''}
<a href="#cotizar" class="diseno-cotizar">Cotizar este diseño →</a></div></article>`;
}

/* ---- Convierte UNA ficha de catalogo-datos.js en HTML (o null si está mal escrita) ---- */
function fichaATarjeta(etiqueta, acento, f) {
    const base = { etiqueta, acento, cod: f.cod, nombre: f.nombre, desc: f.desc };
    if (f.archivo) {                                   // diseño DXF del taller
        const geo = (window.DXF_GEOMETRIA || {})[f.archivo];
        if (!geo) { console.warn(`[catálogo] Falta el dibujo de "${f.archivo}". Ejecuta: python dxf_a_catalogo.py ${f.archivo}`); return null; }
        return tarjeta({ ...base, dibujo: `<path d="${geo.d}"/>`, grosor: .8, meta: `Tamaño del dibujo: ${geo.medidas} · DXF`, archivo: f.archivo });
    }
    if (!P[f.dibujo]) { console.warn(`[catálogo] "${f.cod}": el dibujo "${f.dibujo}" no existe. Opciones: ${Object.keys(P).join(', ')}`); return null; }
    return tarjeta({ ...base, dibujo: P[f.dibujo]() });
}

document.querySelectorAll('.diseno-grid').forEach(g => {
    const m = g.dataset.m, seccion = (window.CATALOGO || {})[m];
    if (!seccion) { console.warn(`[catálogo] data-m="${m}" no existe en catalogo-datos.js`); return; }
    g.innerHTML = seccion.disenos.map(f => fichaATarjeta(m, seccion.acento, f)).filter(Boolean).join('');
});

/* ==========================================================
   04. DIBUJO TÉCNICO DEL BANNER
   Construye el plano decorativo de la portada.
   ========================================================== */
document.getElementById('heroSvg').innerHTML = `<defs><pattern id="gp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(120,190,255,.12)"/></pattern></defs><rect width="480" height="300" fill="url(#gp)"/><g fill="none" stroke="#66cdff" stroke-width="2"><rect x="50" y="50" width="380" height="190" rx="4"/>${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4, 5].map(c => `<rect x="${82 + c * 57}" y="${72 + r * 33}" width="38" height="16" rx="8"/>`).join('')).join('')}</g><g stroke="#cbd5e1" stroke-width="1" fill="none"><path d="M50 266H430M50 260V272M430 260V272"/></g><text x="240" y="260" text-anchor="middle" fill="#cbd5e1" font-family="Inter" font-size="12" font-weight="600">1500 mm</text>`;

/* ==========================================================
   05. CAMBIO DE TEMA
   Igual que index.html: clase "dark" en <html> y la clave
   "tema" en localStorage, así el tema se comparte entre páginas.
   ========================================================== */
const temaToggle = document.getElementById('temaToggle');
const temaIconoSol = document.getElementById('temaIconoSol');
const temaIconoLuna = document.getElementById('temaIconoLuna');

function actualizarIconoTema() {
    const esOscuro = document.documentElement.classList.contains('dark');
    temaIconoSol?.classList.toggle('hidden', esOscuro);
    temaIconoLuna?.classList.toggle('hidden', !esOscuro);
}
actualizarIconoTema();

temaToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tema', document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro'); } catch (e) { }
    actualizarIconoTema();
});

/* ==========================================================
   06. CURSOR PERSONALIZADO
   El bucle de animación solo corre mientras el punto se mueve.
   ========================================================== */
(function () {
    const punto = document.getElementById('cursorDot');
    if (!punto || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, activo = false;

    function seguir() {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        punto.style.left = `${x}px`;
        punto.style.top = `${y}px`;
        if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) { activo = false; return; }
        requestAnimationFrame(seguir);
    }

    window.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!activo) { activo = true; requestAnimationFrame(seguir); }
    }, { passive: true });

    const interactivos = 'a, button, input, textarea, select, label, [role="button"]';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(interactivos)) punto.classList.add('is-hover'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(interactivos)) punto.classList.remove('is-hover'); });
})();

/* ==========================================================
   07. FONDO DE ESTRELLAS
   Solo se anima mientras el canvas está visible en pantalla y
   queda quieto si el sistema pide menos movimiento.
   ========================================================== */
function initStarfield(canvas, density = 0.00018) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, stars = [], visible = true, corriendo = false;

    function resize() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
        const cantidad = Math.max(30, Math.floor(w * h * density));
        stars = Array.from({ length: cantidad }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 1.4 + 0.3, phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.8, tono: Math.random()
        }));
    }

    function draw(t) {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            const alfa = 0.25 + (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase)) * 0.65;
            ctx.beginPath();
            ctx.fillStyle = s.tono < 0.34 ? `rgba(176,188,199,${alfa})` : s.tono < 0.67 ? `rgba(255,255,255,${alfa})` : `rgba(120,175,225,${alfa})`;
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        if (visible && !sinMovimiento) requestAnimationFrame(draw); else corriendo = false;
    }

    function arrancar() { if (!corriendo) { corriendo = true; requestAnimationFrame(draw); } }

    resize();
    let pendiente;
    window.addEventListener('resize', () => { clearTimeout(pendiente); pendiente = setTimeout(() => { resize(); arrancar(); }, 150); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) arrancar(); }).observe(canvas);
    arrancar();
}
initStarfield(document.getElementById('heroStars'), 0.00018);
initStarfield(document.getElementById('ctaStars'), 0.00012);

/* ==========================================================
   08. ★ CONVERSIÓN 2 · TARJETA SVG → PNG → FORMULARIO
   Al pulsar «Cotizar este diseño»:
     1) svgAPng() convierte la miniatura de la tarjeta en una imagen PNG.
     2) Se guardan en localStorage:  cotizarCodigo, cotizarNombre,
        cotizarPNG y (solo DXF) cotizarArchivo.
     3) Se abre index.html#cotizacion, donde script.js
        (CONVERSIÓN 3, cargarDisenoDelCatalogo) adjunta el PNG.
   Si añades otro dato para el formulario, guárdalo aquí y léelo allá.
   ========================================================== */
function svgAPng(svgEl, escala = 4) {
    return new Promise((resolve, reject) => {
        const clon = svgEl.cloneNode(true);
        const ancho = 240 * escala, alto = 160 * escala;
        clon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clon.setAttribute('width', ancho);
        clon.setAttribute('height', alto);

        // Un SVG aislado no entiende var(--cat-draw): se reemplaza por un color fijo
        const texto = new XMLSerializer().serializeToString(clon).replace(/var\(--cat-draw\)/g, '#e2e8f0');

        const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml;charset=utf-8' }));
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = ancho; canvas.height = alto;
            const ctx = canvas.getContext('2d');

            // Fondo oscuro con cuadrícula (igual que el plano en pantalla)
            ctx.fillStyle = '#0b121a';
            ctx.fillRect(0, 0, ancho, alto);
            ctx.strokeStyle = 'rgba(120,190,255,.1)';
            ctx.lineWidth = 1;
            const paso = 16 * escala;
            ctx.beginPath();
            for (let x = 0; x <= ancho; x += paso) { ctx.moveTo(x, 0); ctx.lineTo(x, alto); }
            for (let y = 0; y <= alto; y += paso) { ctx.moveTo(0, y); ctx.lineTo(ancho, y); }
            ctx.stroke();

            ctx.drawImage(img, 0, 0, ancho, alto);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo convertir el SVG')); };
        img.src = url;
    });
}

document.addEventListener('click', async function (e) {
    const boton = e.target.closest('.diseno-cotizar');
    if (!boton) return;
    e.preventDefault();

    const tarjetaEl = boton.closest('.diseno-card');
    const codigo = tarjetaEl.querySelector('.diseno-codigo').textContent;
    const nombre = tarjetaEl.querySelector('.diseno-nombre').textContent;
    const archivo = tarjetaEl.dataset.archivo || '';

    try {
        localStorage.setItem('cotizarCodigo', codigo);
        localStorage.setItem('cotizarNombre', nombre);
        localStorage.removeItem('cotizarPNG');
        if (archivo) localStorage.setItem('cotizarArchivo', archivo); else localStorage.removeItem('cotizarArchivo');
        localStorage.setItem('cotizarPNG', await svgAPng(tarjetaEl.querySelector('.diseno-thumb svg')));
    } catch (err) {
        console.error(err); // si falla, igual se redirige sin imagen
    }

    window.location.href = 'index.html#cotizacion';
});
