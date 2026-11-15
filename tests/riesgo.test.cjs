// Pruebas del detector de riesgo del diario (src/lib/riesgo). Sin red y sin dependencias: node --test tests/
// 1) Los tres ficheros comunes son, byte a byte, los de la fuente única (la misma que la app iOS).
// 2) Frases fijas (v9/urgente/prueba-detector y las que el detector viejo no veía): las de riesgo saltan; las normales, no.
// 3) Fallo seguro: si el detector no carga, avisa (nunca silencio).
// 4) Conversa: salta en el mensaje, en mensajes anteriores y en el texto o la voz de las entradas de contexto.
// 5) Ni el detector ni el aviso tocan la red ni la analítica.
// Las baterías completas (2.951 frases) se miden fuera del repositorio: son las de la fuente única.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const R = path.join(__dirname, '..', 'src', 'lib', 'riesgo');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const det = require(path.join(R, 'detector.js'));

// Huellas de la fuente única (15-11-2026): v10/sistema/riesgo/deteccion-riesgo.js y
// v11/seguridad-detector/ampliada/deteccion-ampliada.{js,json} (= paquete Seguridad de la app).
const HUELLAS = {
  nucleo: '37ee835a021d921494e44d226d7cefbb6df6c8da52055d949dd4752ee694140c',
  motor: '202c515fa06828f83edd1b927a6e3d94435473863226d694a8e002a0dfa9ec82',
  datos: 'bb9bacf6b52172327e743a93b59541db9dd66964419444e8442a11b68eb4fdbd',
};
const EXPORTA = 'module.exports = { norma: norma, esRiesgo: esRiesgo };';

test('los tres ficheros comunes son los de la fuente única', () => {
  const nucleo = fs.readFileSync(path.join(R, 'deteccion-riesgo.js'));
  const fin = Buffer.from('/*RIESGO:fin*/\n');
  const corte = nucleo.indexOf(fin) + fin.length;
  assert.ok(corte > fin.length, 'falta el marcador /*RIESGO:fin*/');
  assert.equal(sha(nucleo.subarray(0, corte)), HUELLAS.nucleo, 'el núcleo no es el de la fuente');
  const resto = nucleo.subarray(corte).toString('utf8');
  assert.ok(resto.startsWith(EXPORTA) && resto.split('\n').filter(Boolean).length === 1, 'tras el núcleo solo puede ir la línea que lo exporta');
  assert.equal(sha(fs.readFileSync(path.join(R, 'deteccion-ampliada.js'))), HUELLAS.motor, 'el motor no es el de la fuente');
  assert.equal(sha(fs.readFileSync(path.join(R, 'deteccion-ampliada.json'))), HUELLAS.datos, 'los datos no son los de la fuente');
  assert.equal(det.disponible, true);
  assert.equal(det.version, 'v5-2026-11-15');
});

// v9/urgente/prueba-detector.mjs (las 20 de riesgo y las 9 normales)
const SI = ['pienso en el suicidio', 'me quiero suicidar', 'tengo ideas suicidas', 'no aguanto más', 'no aguanto mas', 'estarían mejor sin mí',
  'estarían mejor sin mi', 'no quiero estar aquí', 'no quiero estar aqui', 'quiero hacerme daño', 'quiero morirme', 'me corto los brazos',
  'me autolesiono', 'quiero matarme', 'quiero acabar con todo', 'no quiero vivir', 'ojalá no despertar', 'Pienso en SUICIDARME',
  'ya no quiero vivir', 'me quiero morir',
  // las que el detector viejo no veía (informe del 15-11)
  'suicidio', 'Suicidio', 'No puedo más.', 's u i c i d i o', 'me kiero morir'];
const NO = ['me corto el pelo mañana', 'hoy he corrido mucho', 'el mejor sinónimo', 'quiero desayunar', 'no aguanto el calor de hoy? bueno',
  'vivir en Bilbao es caro', 'la morfina', 'autobús', 'cortarme las uñas', 'me muero de risa', 'me mato a estudiar', '', '   '];

test('frases de riesgo: saltan todas', () => {
  for (const f of SI) assert.equal(det.esRiesgo(f), true, f);
});
test('frases normales: no saltan', () => {
  for (const f of NO) assert.equal(det.esRiesgo(f), false, JSON.stringify(f));
});

test('fallo seguro: si el detector no carga, esRiesgo avisa', () => {
  const src = fs.readFileSync(path.join(R, 'detector.js'), 'utf8');
  const mod = { exports: {} };
  const requireRoto = () => { throw new Error('no carga'); };
  vm.runInNewContext('(function (require, module, exports) {' + src + '\n})', {})(requireRoto, mod, mod.exports);
  assert.equal(mod.exports.disponible, false);
  assert.equal(mod.exports.esRiesgo('hoy he desayunado tostadas'), true);
  assert.equal(mod.exports.esRiesgo(''), false);
});

test('Conversa: salta en el mensaje, en la conversación y en el contexto', () => {
  const benigno = [{ role: 'assistant', content: 'Hola. ¿Cómo estás llegando aquí hoy?' }, { role: 'user', content: 'Algo me está pesando' }];
  const entradas = [{ text: 'Hoy he paseado por la ría.' }, { text: '', voiceTranscript: 'he dormido bien' }];
  assert.equal(det.hayRiesgoEnConversa(benigno, entradas), false);
  assert.equal(det.hayRiesgoEnConversa([...benigno, { role: 'user', content: 'quiero morirme' }], entradas), true);
  assert.equal(det.hayRiesgoEnConversa([{ role: 'user', content: 'me quiero suicidar' }, ...benigno], entradas), true);
  assert.equal(det.hayRiesgoEnConversa(benigno, [...entradas, { text: 'No puedo más.' }]), true);
  assert.equal(det.hayRiesgoEnConversa(benigno, [{ text: 'bien', voiceTranscript: 'pienso en el suicidio' }]), true);
  assert.equal(det.hayRiesgoEnConversa(benigno, undefined), false);
  // Las sugerencias rápidas de Conversa no deben bloquear el envío
  for (const p of ['Algo me está pesando', 'No sé bien cómo empezar', 'Me siento…', 'Hay algo que me da vueltas']) assert.equal(det.esRiesgo(p), false, p);
});

test('sin red ni analítica en el detector y en el aviso', () => {
  const RED = /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|@vercel\/analytics|track\(/;
  for (const f of ['deteccion-riesgo.js', 'deteccion-ampliada.js', 'detector.js']) assert.doesNotMatch(fs.readFileSync(path.join(R, f), 'utf8'), RED, f);
  const aviso = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'SafetyBar.tsx'), 'utf8');
  assert.doesNotMatch(aviso, RED, 'SafetyBar no debe llamar a la analítica ni a la red');
  const tipos = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'track.ts'), 'utf8');
  const layout = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'layout.tsx'), 'utf8');
  assert.doesNotMatch(layout, /<SpeedInsights\s/, 'Speed Insights debe ir por SpeedInsightsSinAviso (no envía nada tras mostrarse el aviso)');
  assert.match(fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'SpeedInsightsSinAviso.tsx'), 'utf8'), /avisoVisto\(\) \? null/);
  assert.match(aviso, /marcarAvisoVisto\(\)/, 'el aviso debe marcar que se ha mostrado');
  const eventos = [...tipos.matchAll(/\|\s*'([a-z_]+)'/g)].map((m) => m[1]);
  assert.ok(eventos.length > 10, 'no encuentro la lista de eventos');
  for (const e of eventos) assert.doesNotMatch(e, /safety|seguridad|riesgo|risk|ayuda|help|crisis|024/, 'evento ligado al aviso, al riesgo o a la ayuda: ' + e);
});
