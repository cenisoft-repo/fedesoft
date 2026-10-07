/* Fuera del módulo de cliente: el layout (componente de servidor) necesita el
   texto del script, no una referencia de cliente. */
export const CLAVE_TEMA = "fedesoft-tema";

/**
 * Se ejecuta en el <head> antes de pintar: aplica la vista elegida sin el
 * destello del tema equivocado. Texto fijo, sin datos de la petición.
 */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="claro"||t==="oscuro")document.documentElement.setAttribute("data-theme",t==="oscuro"?"dark":"light")}catch(e){}`;
