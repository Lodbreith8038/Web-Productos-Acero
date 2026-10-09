/*
============================================================
CATÁLOGO DE DISEÑOS AUTOCAD — JAVASCRIPT
Productos de Acero E.I.R.L.

01. Utilidades SVG
02. Biblioteca de dibujos
03. Datos del catálogo
04. Generación de tarjetas
05. Dibujo técnico del hero
06. Cambio de tema
============================================================
*/

/* ==========================================================
   01. UTILIDADES SVG
   Funciones pequeñas reutilizadas para construir los planos.
   ========================================================== */
const N = 'http://www.w3.org/2000/svg';
const slot = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>`;
const dim = (x1, y, x2, t) => `<g class="d"><path d="M${x1} ${y}H${x2}M${x1} ${y - 4}V${y + 4}M${x2} ${y - 4}V${y + 4}" /><text x="${(x1 + x2) / 2}" y="${y - 5}" text-anchor="middle">${t}</text></g>`;
/* ==========================================================
   02. BIBLIOTECA DE DIBUJOS
   Cada función representa una geometría reutilizable para
   las miniaturas del catálogo.
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
   03. DATOS DEL CATÁLOGO
   names = nombres visibles.
   kinds = dibujo que corresponde a cada diseño.
   desc  = descripción mostrada en las tarjetas.
   ========================================================== */
const names = {
   LAC: ['Base de soporte', 'Brida circular', 'Escuadra reforzada', 'Placa de anclaje'],
   LAF: ['Tapa perforada', 'Panel ranurado', 'Placa de montaje', 'Soporte en L'],
   GALV: ['Rejilla de ventilación', 'Tapa de ducto', 'Panel perforado', 'Escuadra de fijación'],
   INOX: ['Panel decorativo', 'Placa sanitaria', 'Brida inox', 'Bandeja ranurada']
};
const kinds = {
   LAC: ['plate', 'flange', 'bracket', 'holes'],
   LAF: ['perf', 'slots', 'plate', 'bracket'],
   GALV: ['slots', 'plate', 'perf', 'bracket'],
   INOX: ['perf', 'holes', 'flange', 'slots']
};
const desc = {
   LAC: 'Plancha gruesa para uso estructural.',
   LAF: 'Acabado liso, alta precisión.',
   GALV: 'Protección anticorrosiva para exteriores.',
   INOX: 'Acabado higiénico y duradero.'
};
/* ==========================================================
   04. GENERACIÓN DE TARJETAS
   Cada .grid indica el material mediante data-m y su acento
   mediante data-c. Aquí se crean las tarjetas automáticamente.
   ========================================================== */
function svg(k, c) {
   return `<svg viewBox="0 0 240 160"><style>.s 
   *{fill:none;stroke:${c};stroke-width:1.6}.s .c
   {stroke-dasharray:6 3 1 3;stroke-width:.8;opacity:.7}.s .d 
   path{stroke:var(--draw);stroke-width:.8;opacity:.6}.s .d 
   text{fill:var(--draw);stroke:none;font:600 9px Inter,sans-serif;opacity:.8}
   </style><g class="s">${P[k]()}</g></svg>`
}
document.querySelectorAll('.grid').forEach(g => {
   const m = g.dataset.m, c = g.dataset.c; g.style.setProperty
      ('--ac', c);
   g.innerHTML = names[m].map((n, i) => `<article class="card" 
 style="--ac:${c}">
 <div class="thumb">${svg(kinds[m][i], c)}</div><div class="info"><small>${m} · 
 DWG-${String(i + 1).padStart(2, '0')}</small><h3>${n}</h3><p>${desc[m]}</p>
 <a href="#cotizar">Cotizar este diseño →</a></div></article>`).join('')
});
/* ==========================================================
   05. DIBUJO TÉCNICO DEL HERO
   Construye el plano decorativo de la portada.
   ========================================================== */
document.getElementById('heroSvg').innerHTML = `<defs><pattern id="gp" width="20" height="20" patternUnits="userSpaceOnUse">
   <path d="M20 0H0V20" fill="none" stroke="rgba(120,190,255,.12)"/>
   </pattern></defs><rect width="480" height="300" fill="url(#gp)"/><g fill="none" stroke="#66cdff" stroke-width="2">
   <rect x="50" y="50" width="380" height="190" rx="4"/>
   ${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4, 5].map(c => `<rect x="${82 + c * 57}" y="${72 + r * 33}
      " width="38" height="16" rx="8"/>`).join('')).join('')}</g><g stroke="#cbd5e1" stroke-width="1" fill="none"><path d="M50 266H430M50 260V272M430 260V272"/></g><text x="240" y="260" text-anchor="middle" fill="#cbd5e1" font-family="Inter" font-size="12" font-weight="600">1500 mm</text>`;
/* ==========================================================
   06. CAMBIO DE TEMA
   El botón #tg alterna entre claro y oscuro. El CSS responde
   al atributo data-theme del elemento <html>.
   ========================================================== */
const tg = document.getElementById('tg'),
   r = document.documentElement;
tg.onclick = () => { const d = r.dataset.theme === 'dark' || (!r.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches); r.dataset.theme = d ? 'light' : 'dark'; tg.textContent = d ? '☀' : '☾' };
/* ==========================================================
   07. ENVIAR DISEÑO AL FORMULARIO PRINCIPAL
   Convierte el SVG de la tarjeta a PNG y lo guarda para
   adjuntarlo en el formulario de cotización.
   ========================================================== */
function svgAPng(svgEl, escala = 4) {
   return new Promise((resolve, reject) => {
      const clon = svgEl.cloneNode(true);
      const ancho = 240 * escala, alto = 160 * escala;
      clon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clon.setAttribute('width', ancho);
      clon.setAttribute('height', alto);

      // Un SVG aislado no entiende var(--draw): se reemplaza por un color fijo
      const colorCotas = '#e2e8f0';
      const texto = new XMLSerializer().serializeToString(clon)
         .replace(/var\(--draw\)/g, colorCotas);

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
         for (let x = 0; x <= ancho; x += paso) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke(); }
         for (let y = 0; y <= alto; y += paso) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke(); }

         ctx.drawImage(img, 0, 0, ancho, alto);
         URL.revokeObjectURL(url);
         resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo convertir el SVG')); };
      img.src = url;
   });
}

document.addEventListener('click', async function (e) {
   const boton = e.target.closest('.card a');
   if (!boton) return;
   e.preventDefault();

   const tarjeta = boton.closest('.card');
   const codigo = tarjeta.querySelector('small').textContent;
   const nombre = tarjeta.querySelector('h3').textContent;

   localStorage.setItem('cotizarCodigo', codigo);
   localStorage.setItem('cotizarNombre', nombre);
   localStorage.removeItem('cotizarPNG');

   try {
      const png = await svgAPng(tarjeta.querySelector('.thumb svg'));
      localStorage.setItem('cotizarPNG', png);
   } catch (err) {
      console.error(err); // si falla, igual se redirige sin imagen
   }

   window.location.href = 'index.html#cotizacion';
});
