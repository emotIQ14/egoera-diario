/* ───────── DETECTOR DE RIESGO DEL DIARIO WEB (15-11-2026) ─────────
   Es el MISMO detector que la app iOS (paquete Seguridad): núcleo (deteccion-riesgo.js) + capa ampliada
   (deteccion-ampliada.js, motor, y deteccion-ampliada.json, datos). Los tres vienen de la fuente única y NO se editan
   aquí: tests/riesgo.test.cjs comprueba su sha256. Para cambiarlos: cambiar la fuente, volver a copiarlos y actualizar
   las huellas de la prueba.
   Fallo seguro, como en la app: si algo no carga o no compila, esRiesgo devuelve true (ayuda, nunca silencio).
   Sin red: no envía, no guarda y no registra nada (ni analítica). */
'use strict';

var detector = null;
try {
  var nucleo = require('./deteccion-riesgo.js');
  var ampliada = require('./deteccion-ampliada.js');
  var datos = require('./deteccion-ampliada.json');
  detector = ampliada.crearDetectorAmpliado(datos, nucleo.norma, nucleo.esRiesgo);
} catch (e) {
  detector = null;
}

/** true si el texto se parece a una frase de riesgo. Texto vacío: false. Detector roto: true. */
function esRiesgo(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return false;
  if (!detector) return true;
  try {
    return detector.esRiesgo(texto) === true;
  } catch (e) {
    return true;
  }
}

/** Conversa: true si el detector salta en CUALQUIER texto que se enviaría a la IA
    (todos los mensajes de la conversación y el texto y la transcripción de voz de las entradas de contexto).
    Como en la app (PrefiltroConversa): si salta, no se envía nada y se muestra la ayuda. */
function hayRiesgoEnConversa(mensajes, entradas) {
  var textos = [];
  var i;
  if (Array.isArray(mensajes)) {
    for (i = 0; i < mensajes.length; i++) {
      if (mensajes[i] && typeof mensajes[i].content === 'string') textos.push(mensajes[i].content);
    }
  }
  if (Array.isArray(entradas)) {
    for (i = 0; i < entradas.length; i++) {
      var e = entradas[i];
      if (!e) continue;
      if (typeof e.text === 'string') textos.push(e.text);
      if (typeof e.voiceTranscript === 'string') textos.push(e.voiceTranscript);
    }
  }
  for (i = 0; i < textos.length; i++) if (esRiesgo(textos[i])) return true;
  return false;
}

module.exports = {
  esRiesgo: esRiesgo,
  hayRiesgoEnConversa: hayRiesgoEnConversa,
  disponible: detector !== null,
  version: detector ? detector.version : null,
};
