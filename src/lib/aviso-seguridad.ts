// Marca, solo en memoria de esta página, de que el aviso de seguridad se ha mostrado. No se guarda ni se envía.
// La usa la medición de rendimiento (Speed Insights) para no enviar nada desde ese momento: sus métricas llevan el
// elemento con el que se interactuó, que podría ser el botón de cerrar el aviso o el de llamar al 024.
let visto = false;

export function marcarAvisoVisto(): void {
  visto = true;
}

export function avisoVisto(): boolean {
  return visto;
}
