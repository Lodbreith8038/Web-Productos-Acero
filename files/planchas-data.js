/* ==========================================================================
   CATÁLOGO DE PLANCHAS · Productos de Acero E.I.R.L.
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que editar para actualizar la página.

   ► AGREGAR UN ESPESOR a un tipo existente:
       añade una línea dentro de su lista "espesores". Formatos válidos:
         3                      → solo milímetros
         [3, '1/8″']            → milímetros + pulgada
         { mm: 3, pulg: '1/8″', imagen: 'imagenes/planchas/lac-3mm.jpg' }
                                → con foto propia para ese espesor
       (el orden no importa, la página los ordena de menor a mayor)

   ► AGREGAR UN TIPO NUEVO de plancha (ej. aluminio, antideslizante):
       copia un bloque completo { id: ..., ... } y cámbiale los datos.
       La sección, el menú desplegable y el botón Cotizar se crean solos.

   ► CAMBIAR LA IMAGEN de un tipo: edita el campo "imagen".
       Si queda vacío ('') se muestra una imagen de relleno.
   ========================================================================== */

const CATALOGO_PLANCHAS = [
    {
        id: 'lac',
        codigo: 'LAC',
        nombre: 'Plancha LAC',
        subtitulo: 'Laminada en caliente',
        icono: 'fa-fire',
        descripcion:
            'Acero laminado en caliente, de superficie rugosa y gran resistencia. Se corta, suelda y dobla con facilidad, ' +
            'por eso es la plancha preferida para estructuras y trabajos pesados.',
        usos: ['Estructuras metálicas', 'Maestranza', 'Bases y soportes', 'Tanques'],
        // Imagen de ejemplo (la misma foto de acero del banner). Reemplázala por tu foto.
        imagen: 'https://images.unsplash.com/photo-1565522749008-01d0144d852a?auto=format&fit=crop&w=900&q=80',
        espesores: [
            [1.5, '1/16″'], 2, 2.5, [3, '1/8″'], [4.5, '3/16″'], [6, '1/4″'], [9, '3/8″'],
            [12, '1/2″'], [16, '5/8″'], [19, '3/4″'], [25, '1″'], [32, '1 1/4″'], [38, '1 1/2″'], [50.8, '2″']
        ]
    },
    {
        id: 'laf',
        codigo: 'LAF',
        nombre: 'Plancha LAF',
        subtitulo: 'Laminada en frío',
        icono: 'fa-snowflake',
        descripcion:
            'Acero laminado en frío con superficie lisa, uniforme y de medidas muy precisas. ' +
            'Ofrece un acabado limpio, ideal para piezas que van pintadas o a la vista.',
        usos: ['Muebles metálicos', 'Gabinetes y tableros', 'Piezas pintadas', 'Carrocería liviana'],
        imagen: '', // ← coloca aquí la ruta de tu imagen
        espesores: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, [1.5, '1/16″'], 2, 2.5, [3, '1/8″']]
    },
    {
        id: 'inoxidable',
        codigo: 'INOX',
        nombre: 'Plancha de acero inoxidable',
        subtitulo: 'Inoxidable',
        icono: 'fa-droplet',
        descripcion:
            'Acero resistente a la corrosión, fácil de limpiar y de larga duración. ' +
            'Soporta humedad y ambientes exigentes sin perder su acabado.',
        usos: ['Cocinas y mesas de trabajo', 'Industria alimentaria', 'Acabados arquitectónicos', 'Tanques'],
        imagen: '',
        espesores: [
            0.5, 0.8, 1, 1.2, [1.5, '1/16″'], 2, [3, '1/8″'], 4, 5, [6, '1/4″'], 8, 10,
            [12, '1/2″'], 15, 20, [25, '1″'], [50.8, '2″']
        ]
    },
    {
        id: 'galvanizado',
        codigo: 'GALV',
        nombre: 'Plancha galvanizada',
        subtitulo: 'Galvanizada',
        icono: 'fa-layer-group',
        descripcion:
            'Acero recubierto con zinc que lo protege del óxido. ' +
            'Es una opción duradera y de bajo mantenimiento para exteriores y ambientes húmedos.',
        usos: ['Ductos y ventilación', 'Coberturas y cerramientos', 'Canaletas', 'Trabajos en exterior'],
        imagen: '',
        espesores: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, [1.5, '1/16″'], 2]
    }
];
