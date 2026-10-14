

//-- Acciones de formulario 
const cotizacionForm = document.getElementById('cotizacionForm');
const cotizacionMensaje = document.getElementById('cotizacionMensaje');
const cotArchivo = document.getElementById('cot-archivo');
const cotArchivoNombre = document.getElementById('cot-archivo-nombre');
const hiddenIframe = document.getElementById('hidden_iframe')
let formularioEnviado = false;
// 1. Mostrar el nombre del archivo seleccionado
cotArchivo?.addEventListener('change', () => {
    const file = cotArchivo.files?.[0];
    cotArchivoNombre.textContent = file ? `Archivo seleccionado: ${file.name}` : '';
});

const cotizacionCargando = document.getElementById('cotizacionCargando');
const cotizacionError = document.getElementById('cotizacionError');
const cotizacionBoton = cotizacionForm.querySelector('button[type="submit"]');
const TIEMPO_MAX_ENVIO = 90000; // si el servidor no responde, se libera el formulario
let temporizadorEnvio = null;

function bloquearEnvio() {
    formularioEnviado = true;
    cotizacionCargando.hidden = false;
    cotizacionForm.setAttribute('aria-busy', 'true');
    cotizacionBoton.disabled = true;
    temporizadorEnvio = setTimeout(() => {
        liberarEnvio();
        cotizacionError.classList.remove('hidden');
    }, TIEMPO_MAX_ENVIO);
}

function liberarEnvio() {
    formularioEnviado = false;
    clearTimeout(temporizadorEnvio);
    cotizacionCargando.hidden = true;
    cotizacionForm.removeAttribute('aria-busy');
    cotizacionBoton.disabled = false;
}

// Un único manejador: valida, bloquea y deja pasar solo el primer envío
cotizacionForm.addEventListener('submit', function (e) {
    // Si ya hay un envío en curso (clics repetidos o Enter), se ignora
    if (formularioEnviado) {
        e.preventDefault();
        return;
    }

    cotizacionMensaje.classList.add('hidden');
    cotizacionError.classList.add('hidden');

    const file = cotArchivo.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('El archivo es demasiado pesado. El tamaño máximo permitido es de 10 MB.');
            e.preventDefault();
            return;
        }
        const extensionesValidas = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png'];
        const nombreArchivo = file.name.toLowerCase();
        if (!extensionesValidas.some(ext => nombreArchivo.endsWith(ext))) {
            alert('Formato de archivo no válido. Solo se permiten archivos PDF, DWG, DXF, JPG o PNG.');
            e.preventDefault();
            return;
        }
    }

    // Se bloquea después de que el navegador toma los datos del formulario
    bloquearEnvio();
});

// El iframe oculto carga la respuesta cuando el envío terminó
hiddenIframe.addEventListener('load', function () {
    if (!formularioEnviado) return;
    liberarEnvio();
    cotizacionMensaje.classList.remove('hidden');
    cotizacionForm.reset();
    if (cotArchivoNombre) cotArchivoNombre.textContent = '';
    setTimeout(() => cotizacionMensaje.classList.add('hidden'), 5000);
});

// --- Cursor personalizado---
const cursorDot = document.getElementById('cursorDot');
if (cursorDot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;

    window.addEventListener('mousemove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
    });

    (function seguirCursor() {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        cursorDot.style.left = `${x}px`;
        cursorDot.style.top = `${y}px`;
        requestAnimationFrame(seguirCursor);
    })();

    const interactivos = 'a, button, input, textarea, select, label, [role="button"]';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactivos)) cursorDot.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactivos)) cursorDot.classList.remove('is-hover');
    });
}

// --- Fondo ---
function initStarfield(canvas, density = 0.00018) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];

    function resize() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
        const cantidad = Math.max(30, Math.floor(w * h * density));
        stars = Array.from({ length: cantidad }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.4 + 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.8,
            tono: Math.random()
        }));
    }

    function draw(t) {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            const parpadeo = 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
            const alfa = 0.25 + parpadeo * 0.65;
            let color;
            if (s.tono < 0.34) color = `rgba(176,188,199,${alfa})`;
            else if (s.tono < 0.67) color = `rgba(255,255,255,${alfa})`;
            else color = `rgba(120,175,225,${alfa})`;
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
}

initStarfield(document.getElementById('heroStars'), 0.00018);
initStarfield(document.getElementById('sedesStars'), 0.00012);

// --- Modo ---
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
    localStorage.setItem('tema', document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro');
    actualizarIconoTema();
});

// --- Galerías de imágenes ---

const imagenes =
    document.querySelectorAll(".imagen");

let posiciones = [
    0,
    1,
    2,
    3,
    4
];

function actualizarCarrusel() {

    imagenes.forEach((imagen, indice) => {

        imagen.className =
            "imagen pos" + posiciones[indice];

    });

}

function mover(direccion) {

    if (direccion === 1) {

        posiciones.unshift(
            posiciones.pop()
        );

    } else {

        posiciones.push(
            posiciones.shift()
        );

    }
    actualizarCarrusel();
}

// ============================================================
// ★ CONVERSIÓN 3 · CATÁLOGO → FORMULARIO DE COTIZACIÓN
// Recibe lo que guardó diseños.html (catalogo-autocad.js, sección 08):
//   cotizarCodigo · cotizarNombre · cotizarPNG · cotizarArchivo (solo DXF)
// y rellena el formulario. Las planchas (planchas.html) usan
// cargarPlanchaDelCatalogo(), más abajo.
// ============================================================
// --- Diseño del catálogo AutoCAD → formulario de cotización ---
function dataURLaBlob(dataURL) {
    const [cabecera, base64] = dataURL.split(',');
    const tipo = cabecera.match(/:(.*?);/)[1];
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return new Blob([bytes], { type: tipo });
}

function cargarDisenoDelCatalogo() {
    let codigo, nombre, png, archivoOriginal;
    try {
        codigo = localStorage.getItem('cotizarCodigo');
        nombre = localStorage.getItem('cotizarNombre');
        png = localStorage.getItem('cotizarPNG');
        archivoOriginal = localStorage.getItem('cotizarArchivo'); // solo diseños DXF del taller
    } catch (err) {
        return; // localStorage no disponible
    }
    if (!codigo || !nombre) return;

    const campoDetalles = document.getElementById('cot-detalles');
    if (campoDetalles) {
        // ✎ TEXTO QUE APARECE EN «Detalles del proyecto» al venir de un diseño
        campoDetalles.value =
            `Deseo cotizar el diseño del catálogo:\nCódigo: ${codigo}\nNombre: ${nombre}\n` +
            (archivoOriginal ? `Archivo original: ${archivoOriginal}\n` : '') +
            `\nMaterial, espesor, cantidad y otros detalles de mi requerimiento: `;
    }

    // PNG de la tarjeta → archivo real dentro del campo «Adjuntar plano o archivo»
    if (cotArchivo && png) {
        try {
            const blob = dataURLaBlob(png);
            if (blob.size === 0) throw new Error('El PNG llegó vacío');

            const nombreArchivo = codigo.replace(/\s/g, '').replace('·', '-') + '.png'; // ej: GALV-DWG-01.png
            const archivo = new File([blob], nombreArchivo, { type: 'image/png' });

            const dt = new DataTransfer();
            dt.items.add(archivo);
            cotArchivo.files = dt.files;

            cotArchivo.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (error) {
            console.error('No se pudo adjuntar el diseño:', error);
        }
    }

    localStorage.removeItem('cotizarCodigo');
    localStorage.removeItem('cotizarNombre');
    localStorage.removeItem('cotizarPNG');
    localStorage.removeItem('cotizarArchivo');
}

cargarDisenoDelCatalogo();

function cargarPlanchaDelCatalogo() {
    let datos;
    try {
        datos = JSON.parse(localStorage.getItem('cotizarPlancha') || 'null');
        localStorage.removeItem('cotizarPlancha');
    } catch (err) {
        return; // localStorage no disponible o dato dañado
    }
    if (!datos || !datos.nombre || !datos.espesor) return;

    const campoTipo = document.getElementById('cot-tipo');
    if (campoTipo) campoTipo.value = 'Planchas de acero';

    const campoDetalles = document.getElementById('cot-detalles');
    if (campoDetalles) {
        // ✎ TEXTO QUE APARECE EN «Detalles del proyecto» al venir de una plancha
        campoDetalles.value =
            `Deseo cotizar la siguiente plancha:\n` +
            `Producto: ${datos.nombre} (${datos.subtitulo})\n` +
            `Espesor: ${datos.espesor}\n` +
            `Código: ${datos.codigo}\n\n` +
            `Medidas, cantidad y otros detalles de mi requerimiento: `;
    }
}

cargarPlanchaDelCatalogo();


