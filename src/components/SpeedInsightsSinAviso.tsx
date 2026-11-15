'use client';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { avisoVisto } from '@/lib/aviso-seguridad';

// Speed Insights adjunta a cada métrica el elemento con el que se interactuó. Para que ningún dato de medición quede
// ligado al aviso de seguridad ni a la ayuda (dato de salud, RGPD art. 9): desde que el aviso se ha mostrado en esta
// página, no se envía ninguna métrica más.
export function SpeedInsightsSinAviso(): React.ReactElement {
  return <SpeedInsights beforeSend={(evento) => (avisoVisto() ? null : evento)} />;
}
