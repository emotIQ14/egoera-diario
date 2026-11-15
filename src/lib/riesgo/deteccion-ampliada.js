/* ───────── DETECTOR DE RIESGO · CAPA AMPLIADA (motor JS) · 15-11-2026 ─────────
   Se suma al núcleo (deteccion-riesgo.js, función esRiesgo y norma): SOLO añade detecciones, nunca quita.
   Los datos (reescrituras y reglas) viven en deteccion-ampliada.json, el MISMO fichero que lee la app iOS (paquete
   Seguridad). Este motor y el de Swift (Ampliacion.swift) hacen exactamente lo mismo; una prueba de la app lo compara
   evaluando este archivo con JavaScriptCore.
   Requisitos: bandera u (\p{L}); sin lookbehind; sin \b. Sin red: no envía ni guarda nada.
   Uso:  var d = crearDetectorAmpliado(DATOS_JSON, norma, esRiesgoNucleo);  d.esRiesgo(texto) -> true/false   */
var crearDetectorAmpliado = function (datos, norma, esRiesgoNucleo) {
  var compilar = function (lista, ambito) {
    var ps = [];
    for (var i = 0; i < lista.length; i++) if (lista[i].ambito === ambito) ps.push(lista[i].patron);
    if (!ps.length) return null;
    var cuerpo = ps.join('|');
    if (ambito === 'texto' || ambito === 'solo_texto') return new RegExp('(?:^| )(?:' + cuerpo + ')(?= |$)', 'u');
    return new RegExp('(?:' + cuerpo + ')', 'u');
  };
  var RE_TEXTO = compilar(datos.reglas, 'texto');
  var RE_SOLO_TEXTO = compilar(datos.reglas, 'solo_texto');
  var RE_CLAUSULA = compilar(datos.reglas, 'clausula');
  var RE_ENTERO = compilar(datos.reglas, 'entero');
  var RE_SEP = new RegExp(datos.separadores_clausula, 'gu');
  /* Las fronteras de cláusula se marcan con una palabra centinela que ninguna regla ni reescritura toca, y el texto se
     normaliza UNA vez (normalizar cada cláusula por separado costaba 5 veces más en entradas largas). */
  var CENTINELA = 'xqzx';
  /* Raíces inequívocas buscadas con los espacios quitados («sui cidio», «auto lesión»). Lista mínima a propósito. */
  var RE_PEGADO = datos.raices_pegadas ? new RegExp(datos.raices_pegadas, 'u') : null;
  var REESC = datos.reescrituras.map(function (r) { return [new RegExp(r[0], 'gu'), r[1]]; });
  var RE_SUELTAS = /(^|[^\p{L}\p{N}])((?:\p{L}[ .\-_*·]){2,}\p{L})(?![\p{L}\p{N}])/gu;
  var RE_SEP_SUELTAS = /[ .\-_*·]/g;
  var RE_FICHA = /[\p{L}\p{N}@$]+/gu;
  var RE_LETRA = /\p{L}/u;
  var RE_CIFRA = /[0-9@$]/;
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };

  var preCrudo = function (s) { return String(s).replace(/\+/g, ' más '); };
  var juntarSueltas = function (s) {
    return s.replace(RE_SUELTAS, function (m, a, b) { return a + b.replace(RE_SEP_SUELTAS, ''); });
  };
  var leet = function (s) {
    return s.replace(RE_FICHA, function (f) {
      if (!RE_LETRA.test(f) || !RE_CIFRA.test(f)) return f;
      return f.replace(/[013457@$]/g, function (c) { return LEET[c]; });
    });
  };
  var reescribir = function (n) {
    for (var i = 0; i < REESC.length; i++) n = n.replace(REESC[i][0], REESC[i][1]);
    return n;
  };
  /* Letras repetidas: al final de palabra siempre («quieroo»); dentro, solo las que no se doblan en español
     (se respetan cc, ee, ll, nn, oo y rr: «flequillo», «leer», «correr» deben seguir siendo lo que son). */
  var colapsar = function (n) { return n.replace(/([a-z])\1+(?= |$)/g, '$1').replace(/([abdfghijkmpqstuvwxyz])\1+/g, '$1'); };
  var trocear = function (m) {
    var out = [], cur = [], ts = m ? m.split(' ') : [];
    for (var i = 0; i < ts.length; i++) {
      if (ts[i] === CENTINELA) { out.push(cur.join(' ')); cur = []; } else if (ts[i]) cur.push(ts[i]);
    }
    out.push(cur.join(' '));
    return out;
  };
  var unicos = function (xs) { var o = []; for (var i = 0; i < xs.length; i++) if (o.indexOf(xs[i]) < 0) o.push(xs[i]); return o; };

  /* Lo que ve la capa ampliada (para depurar y para la prueba de equivalencia con Swift). */
  var formas = function (s) {
    var base = preCrudo(s);
    var cands = unicos([base, juntarSueltas(base), leet(base), leet(juntarSueltas(base))]);
    var textos = [], clausulas = [];
    for (var i = 0; i < cands.length; i++) {
      var n = norma(cands[i]), na = reescribir(n), nc = reescribir(colapsar(na));
      textos = unicos(textos.concat([n, na, nc]));
      var m1 = reescribir(norma(cands[i].replace(RE_SEP, ' ' + CENTINELA + ' ')));
      var c1 = trocear(m1), c2 = trocear(reescribir(colapsar(m1)));
      for (var j = 0; j < c1.length; j++) if (c1[j]) clausulas = unicos(clausulas.concat([c1[j], c2[j]]));
    }
    return { textos: textos, clausulas: clausulas };
  };

  var ampliado = function (s) {
    var f = formas(s);
    for (var i = 0; i < f.textos.length; i++) {
      var t = f.textos[i];
      if (esRiesgoNucleo(t)) return true;
      if (RE_TEXTO && RE_TEXTO.test(t)) return true;
      if (RE_SOLO_TEXTO && RE_SOLO_TEXTO.test(t)) return true;
      if (RE_ENTERO && RE_ENTERO.test(t)) return true;
    }
    for (var k = 0; k < f.clausulas.length; k++) {
      var cl = f.clausulas[k];
      if (RE_CLAUSULA && RE_CLAUSULA.test(cl)) return true;
      if (RE_TEXTO && f.textos.indexOf(cl) < 0 && RE_TEXTO.test(cl)) return true; /* si ya es un texto, ya se miró */
    }
    for (var p = 0; p < f.textos.length; p++) if (RE_PEGADO && RE_PEGADO.test(f.textos[p].replace(/ /g, ''))) return true;
    return false;
  };

  /* Qué regla saltó (solo para pruebas e informes; no se usa en el producto). */
  var reglaQueSalta = function (s) {
    var f = formas(s), out = [];
    for (var r = 0; r < datos.reglas.length; r++) {
      var regla = datos.reglas[r];
      var re = (regla.ambito === 'texto' || regla.ambito === 'solo_texto') ? new RegExp('(?:^| )(?:' + regla.patron + ')(?= |$)', 'u') : new RegExp(regla.patron, 'u');
      var lista = regla.ambito === 'clausula' ? f.clausulas : regla.ambito === 'texto' ? f.textos.concat(f.clausulas) : f.textos;
      for (var i = 0; i < lista.length; i++) if (re.test(lista[i])) { out.push(regla.id); break; }
    }
    for (var j = 0; j < f.textos.length; j++) if (esRiesgoNucleo(f.textos[j])) { out.unshift('nucleo'); break; }
    return out;
  };

  return {
    version: datos.version,
    formas: formas,
    ampliado: ampliado,
    reglaQueSalta: reglaQueSalta,
    esRiesgo: function (s) { return esRiesgoNucleo(s) || ampliado(s); }
  };
};
if (typeof module !== 'undefined') module.exports = { crearDetectorAmpliado: crearDetectorAmpliado };
