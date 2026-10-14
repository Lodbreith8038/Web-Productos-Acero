# Guía rápida · Catálogo de diseños (diseños.html)

## ¿Qué archivo toco?

| Quiero… | Archivo |
|---|---|
| Cambiar el **nombre o descripción** de una tarjeta | `JS/catalogo-datos.js` |
| Quitar una tarjeta | `JS/catalogo-datos.js` (borrar su línea) |
| Cambiar el **color** de una sección | `JS/catalogo-datos.js` → `acento` |
| Cambiar título, texto largo o chips de una sección | `diseños.html` (comentario «TEXTOS EDITABLES») |
| Cambiar el **estilo** de las tarjetas | `CSS/catalogo-autocad.css` |
| Cambiar el **mensaje** que llega al formulario | `JS/script.js` (comentarios ✎ TEXTO QUE APARECE…) |
| Añadir un **DXF nuevo** | ver abajo |

`JS/disenos-dxf.js` es **automático**: no se edita a mano.

## Añadir un DXF nuevo (2 pasos)

1. En la carpeta `JS/` ejecuta (necesitas Python 3 y `pip install numpy`):
   ```
   python dxf_a_catalogo.py C:\ruta\mi_diseno.dxf
   ```
   Puedes pasar varios a la vez: `python dxf_a_catalogo.py *.dxf`
2. Abre `JS/catalogo-datos.js`: encima de la marca `>>> NUEVOS DISEÑOS <<<` habrá una ficha nueva.
   Cambia su `nombre:` y `desc:`. Listo.

Si el DXF ya estaba registrado, solo se actualiza su dibujo (no se duplica la ficha).

## Añadir un diseño genérico (sin DXF)

En `catalogo-datos.js`, copia una línea de LAC/LAF/GALV/INOX y cambia los textos.
`dibujo:` puede ser `plate`, `flange`, `bracket`, `holes`, `slots` o `perf`.

## Añadir una sección de material nueva

1. `catalogo-datos.js`: `ALU: { acento: '#ef4444', disenos: [ ... ] },`
2. `diseños.html`: copia un bloque `<section>` y cambia `data-m="ALU"`.

## Las 3 conversiones de archivos

| # | Conversión | Dónde |
|---|---|---|
| 1 | DXF → miniatura SVG | `dxf_a_catalogo.py` (en tu PC) |
| 2 | Tarjeta SVG → PNG | `catalogo-autocad.js`, sección 08 |
| 3 | PNG → archivo adjunto del formulario | `script.js`, `cargarDisenoDelCatalogo()` |

## Si una tarjeta no aparece

Abre la consola del navegador (F12): la página avisa qué ficha está mal escrita
(dibujo inexistente, DXF sin registrar, sección sin datos).
