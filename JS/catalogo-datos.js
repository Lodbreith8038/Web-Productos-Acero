/* ==========================================================
   CATALOGO-DATOS.JS  ·  AQUÍ SE EDITA TODO EL CONTENIDO DEL CATÁLOGO
   Productos de Acero E.I.R.L.  ·  Página: diseños.html

   Este es el ÚNICO archivo donde se cambian nombres y descripciones
   de las tarjetas. No hace falta tocar HTML, CSS ni catalogo-autocad.js.

   ────────────────────────────────────────────────────────────
   QUÉ HACER SEGÚN LO QUE NECESITES
   ────────────────────────────────────────────────────────────
   ▸ Cambiar un nombre o una descripción
       Busca la tarjeta (por su nombre o código) y edita nombre: / desc:

   ▸ Quitar una tarjeta
       Borra su línea completa  { cod: ..., },

   ▸ Añadir un diseño genérico (dibujo de muestra)
       Copia una línea de LAC, LAF, GALV o INOX y cambia los textos.
       dibujo: elige uno →  'plate'  'flange'  'bracket'  'holes'  'slots'  'perf'
       cod: el código que se muestra y viaja al formulario (ej. 'DWG-05').

   ▸ Añadir un DXF nuevo  (diseños del taller)
       1) Pon el .dxf en cualquier carpeta de tu PC.
       2) En la carpeta de este archivo ejecuta:   python dxf_a_catalogo.py mi_diseno.dxf
          (ver instrucciones en dxf_a_catalogo.py y en GUIA-CATALOGO.md)
       3) Se crea sola una ficha nueva más abajo, encima de la marca
          ">>> NUEVOS DISEÑOS <<<". Cambia su nombre: y desc:.
       archivo: debe ser EXACTAMENTE el nombre del DXF (con mayúsculas).

   ▸ Añadir una sección de material nueva (ej. aluminio)
       a) Aquí: crea  ALU: { acento: '#ef4444', disenos: [ ... ] },
       b) En diseños.html: copia un bloque <section> y cambia data-m="ALU".

   ▸ Cambiar el color de una sección:  acento: '#rrggbb'
   ────────────────────────────────────────────────────────────
   Los títulos, textos largos y chips de cada sección están en
   diseños.html (busca el comentario «TEXTOS EDITABLES»).
   ========================================================== */

window.CATALOGO = {

    /* ======================================================
       DISEÑOS DEL TALLER  (vienen de archivos DXF)
       archivo = nombre exacto del DXF · el dibujo está en disenos-dxf.js
       ====================================================== */
    TALLER: {
        acento: '#2f8fd8',
        disenos: [
        { cod: 'DXF-01', archivo: 'leon.dxf',           nombre: 'León en pose de ataque (par)',          desc: 'Dos leones para fachadas, portones y decoración.' },
        { cod: 'DXF-02', archivo: 'leonescucdo.dxf',    nombre: 'Escudo de león heráldico',             desc: 'Escudo con león para letreros y placas.' },
        { cod: 'DXF-03', archivo: 'mauroantojitos.dxf', nombre: 'Placa ovalada con volcán y letras',     desc: 'Letrero oval con marco, volcán y caligrafía para corte.' },
        { cod: 'DXF-04', archivo: 'LOGO_15_09_1_.dxf',  nombre: 'Logotipo Colca Lodge · spa',            desc: 'Logotipo con marco, letras y símbolo para fachada.' },
        { cod: 'DXF-05', archivo: 'METAL_WORK_1_.dxf',  nombre: 'Camión',             desc: 'Silueta detallada de camión para señalética y decoración.' },
        { cod: 'DXF-06', archivo: 'LETRAS_POCSI_.dxf',  nombre: 'Letras en gran formato', desc: 'Letras apiladas de gran tamaño para letreros corpóreos.' },
        /* >>> NUEVOS DISEÑOS <<<  (dxf_a_catalogo.py agrega las fichas nuevas justo encima de esta línea; no la borres) */
        ]
    },

    /* ======================================================
       PLANCHA LAC · laminada en caliente
       ====================================================== */
    LAC: {
        acento: '#f59e0b',
        disenos: [
        { cod: 'DWG-01', dibujo: 'plate',   nombre: 'Base de soporte',    desc: 'Base con perforaciones y ranuras para anclar equipos.' },
        { cod: 'DWG-02', dibujo: 'flange',  nombre: 'Brida circular',     desc: 'Brida con seis agujeros para uniones de tubería.' },
        { cod: 'DWG-03', dibujo: 'bracket', nombre: 'Escuadra reforzada', desc: 'Escuadra gruesa para soportes estructurales.' },
        { cod: 'DWG-04', dibujo: 'holes',   nombre: 'Placa de anclaje',   desc: 'Placa con agujeros para fijar columnas y bases.' },
        ]
    },

    /* ======================================================
       PLANCHA LAF · laminada en frío
       ====================================================== */
    LAF: {
        acento: '#38bdf8',
        disenos: [
        { cod: 'DWG-01', dibujo: 'perf',    nombre: 'Tapa perforada',   desc: 'Tapa con perforación fina para ventilación de gabinetes.' },
        { cod: 'DWG-02', dibujo: 'slots',   nombre: 'Panel ranurado',   desc: 'Panel con ranuras para paneles y cerramientos livianos.' },
        { cod: 'DWG-03', dibujo: 'plate',   nombre: 'Placa de montaje', desc: 'Placa de montaje de acabado liso y alta precisión.' },
        { cod: 'DWG-04', dibujo: 'bracket', nombre: 'Soporte en L',     desc: 'Soporte plegable en L para fijar piezas de detalle.' },
        ]
    },

    /* ======================================================
       ACERO GALVANIZADO
       ====================================================== */
    GALV: {
        acento: '#2dd4bf',
        disenos: [
        { cod: 'DWG-01', dibujo: 'slots',   nombre: 'Rejilla de ventilación', desc: 'Rejilla ranurada para ductos y salidas de aire.' },
        { cod: 'DWG-02', dibujo: 'plate',   nombre: 'Tapa de ducto',          desc: 'Tapa de cierre con protección anticorrosiva.' },
        { cod: 'DWG-03', dibujo: 'perf',    nombre: 'Panel perforado',        desc: 'Panel perforado para exteriores y cerramientos.' },
        { cod: 'DWG-04', dibujo: 'bracket', nombre: 'Escuadra de fijación',   desc: 'Escuadra para fijar techos, ductos y cerramientos.' },
        ]
    },

    /* ======================================================
       ACERO INOXIDABLE
       ====================================================== */
    INOX: {
        acento: '#a78bfa',
        disenos: [
        { cod: 'DWG-01', dibujo: 'perf',   nombre: 'Panel decorativo', desc: 'Panel calado para mobiliario y decoración.' },
        { cod: 'DWG-02', dibujo: 'holes',  nombre: 'Placa sanitaria',  desc: 'Placa perforada de acabado higiénico para industria alimentaria.' },
        { cod: 'DWG-03', dibujo: 'flange', nombre: 'Brida inox',       desc: 'Brida circular para tuberías de proceso.' },
        { cod: 'DWG-04', dibujo: 'slots',  nombre: 'Bandeja ranurada', desc: 'Bandeja con ranuras de drenaje, fácil de limpiar.' },
        ]
    },
};
