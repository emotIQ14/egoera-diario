/** Tipos de detector.js (el detector común con la app iOS; ver el comentario de cabecera de detector.js). */
export declare function esRiesgo(texto: string): boolean;
export declare function hayRiesgoEnConversa(
  mensajes: ReadonlyArray<{ content: string }> | undefined,
  entradas: ReadonlyArray<{ text?: string; voiceTranscript?: string }> | undefined,
): boolean;
export declare const disponible: boolean;
export declare const version: string | null;
