// =====================================================================
// PEGAR AL FINAL DE /JS/script.js (después de cargarDisenoDelCatalogo();)
// Rellena el formulario de cotización con la plancha elegida en planchas.html
// =====================================================================

// --- Plancha del catálogo de planchas → formulario de cotización ---
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
        campoDetalles.value =
            `Deseo cotizar la siguiente plancha:\n` +
            `Producto: ${datos.nombre} (${datos.subtitulo})\n` +
            `Espesor: ${datos.espesor}\n` +
            `Código: ${datos.codigo}\n\n` +
            `Medidas, cantidad y otros detalles de mi requerimiento: `;
    }
}

cargarPlanchaDelCatalogo();
