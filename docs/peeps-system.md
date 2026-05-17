# Sistema de ilustraciones del diario

Última actualización: 17 mayo 2026.

## Resumen

24 ilustraciones generadas con OpenPeeps componen el "elenco emocional" del diario:

| Familia | Cuántas | Carpeta `public/peeps/` | Uso principal |
| --- | --- | --- | --- |
| Amigas | 10 | `amigas/` | Personajes recurrentes con personalidad emocional |
| Partes IFS | 10 | `ifs/` | Estados internos concretos (críticos, complacientes, etc.) |
| Arquetipos IFS | 4 | `arquetipos/` | Estructura mayor: Self / Manager / Firefighter / Exiliado |

El catálogo canónico vive en
[`src/components/peeps/peep-catalog.ts`](../src/components/peeps/peep-catalog.ts).
Cada entrada documenta `tagline`, `emotions[]` y `context[]`.

## Mapa por pantalla

### `/bienvenida` (7 pasos)

| Paso | Pantalla | Peep(s) | Razón semántica |
| --- | --- | --- | --- |
| 1 | Bienvenida | **Nora** (180px, sola) | Personaje "embajadora" curiosa que da la bienvenida |
| 2 | Relatable | 7 amigas (una por frase, 56px) | Cada frase de "¿te suena?" tiene su personaje emocional |
| 3 | Autoridad | 3 arquetipos IFS (64px en card) | Bowlby→Exiliado · Rosenberg→Manager · Kabat-Zinn→Self |
| 4 | Promesa | **Teo** (96px) acompaña checklist | Personaje del orden / estructura |
| 5 | Timeline | **Lola** en D7 + **Mau** en D30 (64px) | Antes/después: ansiosa → calmada |
| 6 | Nombre | **Nora** (96px) saluda | Continuidad del personaje embajadora |
| 7 | Atribución | **Mira** (64px) tras seleccionar | Personaje del agradecimiento silencioso |

### `/diario` (entrada del día) — sugerencias

| Zona | Peep recomendado | Cómo |
| --- | --- | --- |
| Empty state ("primera entrada") | **Nora** | "Hola otra vez. ¿Qué quieres contar?" |
| Sugerencia por emoción seleccionada | `EMOTION_TO_PEEP[em]` | Avatar dinámico junto al título de la entrada |
| Cierre de entrada (post-save) | **Mau** | "Hoy lo dejaste por escrito. Eso ya es algo." |

### `/patrones` — sugerencias

| Pattern card | Peep |
| --- | --- |
| Ansiedad anticipatoria | **Lola** |
| Rumiación nocturna | **Iris** |
| Rumiación diurna | **June** |
| Complacencia | **Oli** o `ifs/complaciente` |
| Crítico interno | `ifs/critico-interno` |
| Hambre emocional | `ifs/come-para-calmar` |
| Rabia explosiva | `ifs/volcan` |
| Soledad elegida | `ifs/la-que-esta-sola` |
| Procrastinación | `ifs/procrastinadora` |
| Heading: "Tus protectores" | `arquetipos/manager` + `arquetipos/firefighter` lado a lado |
| Heading: "Tus exiliados" | `arquetipos/exiliado` |
| Logro de integración | `arquetipos/self` |

### `/tu` — sugerencias

| Zona | Peep |
| --- | --- |
| Header de perfil | El peep guardado en `localStorage` como `egoera-peep-identity` (default: `nora`) |
| Estado de racha | **Mau** si racha >= 7, **Teo** entre 2-6, **Nora** si 1 |

### `/lecturas` — sugerencias

| Zona | Peep |
| --- | --- |
| Hero | `arquetipos/self` (presencia + lectura) |
| Cards de artículo | Peep relacionado con el tema (rumiación → June, IFS → arquetipo correspondiente) |

## Componente `<Peep />`

[`src/components/peeps/Peep.tsx`](../src/components/peeps/Peep.tsx)

```tsx
import Peep from '@/components/peeps/Peep';

// Amiga
<Peep name="nora" size={120} alt="Nora te saluda" />

// Parte IFS
<Peep name="critico-interno" folder="ifs" size={96} />

// Arquetipo
<Peep name="self" folder="arquetipos" size={64} alt="Self" />
```

Props:

| Prop | Default | Notas |
| --- | --- | --- |
| `name` | — | id del archivo en `/peeps/<folder>/` (sin `.png`) |
| `folder` | `amigas` | `amigas` \| `ifs` \| `arquetipos` |
| `size` | `120` | px lado (la imagen se sirve a 2× para retina) |
| `alt` | `''` | si vacío → `aria-hidden` |
| `delay` | `0` | retraso del spawn-pop en ms (escalonado en listas) |
| `priority` | `false` | fuerza `priority` en `next/image` |

Animación `peep-pop` por defecto (0.55s, cubic-bezier overshoot). Respeta `prefers-reduced-motion`.

## Decisión: ¿mobile frame en desktop?

**No.** La app es mobile-first responsive con `safe-area-inset` y `100dvh`. Añadir un
marco de teléfono en desktop crearía 3 problemas:

1. En Capacitor (build nativa) el frame es contraproducente (doble chrome).
2. En desktop, simular un iPhone reduce el área útil sin aportar valor narrativo
   propio del diario (no estamos haciendo demo de marketing).
3. Rompe la sensación de "la app vive en este navegador" que cuida la onboarding.

**Alternativa adoptada implícitamente**: `OnboardingStep` ya limita el contenido
a `max-width: 520px` centrado en desktop, lo cual lee como un cuaderno editorial,
no como un teléfono virtual. Mantenemos eso.

Si en futuro se quiere "modo escaparate" para demos:
- crear ruta `/showcase/bienvenida` que envuelva la página en un frame estático
- nunca aplicar el frame a la ruta canónica `/bienvenida`.

## Catálogo: emoción → peep

Mapeado en `EMOTION_TO_PEEP` (peep-catalog.ts):

| Emoción | Peep |
| --- | --- |
| ansiedad | lola |
| insomnio | iris |
| rumiacion | june |
| calma | mau |
| sensibilidad | zuri |
| retraimiento | mira |
| complacencia | oli |
| cuidado | eva |
| curiosidad | nora |
| orden | teo |
| autocritica | critico-interno |
| perfeccionismo | perfeccionista |
| rabia | volcan |
| soledad | la-que-esta-sola |
| miedo | nino-asustado |
| ternura | nina-pequena |
| procrastinacion | procrastinadora |
| hambre_emocional | come-para-calmar |
| presencia | self |

## Convenciones técnicas

- Archivos: PNG transparente, 720×720, ~75 KB por archivo (peso aceptable con `next/image`).
- Cada peep ya viene "rebotado" en `compose-amigas.py` con head wrapper alineado.
- Para generar más ilustraciones: usar `posts-redes/ilustraciones/compose-amigas.py`
  o `compose-ifs-partes.py` en el repo `Egoera/`.

## Roadmap incremental

- [x] Catálogo + componente compartido + bienvenida operativa.
- [ ] Empty state de `/diario` con Nora.
- [ ] Avatar dinámico en `/diario` por emoción dominante.
- [ ] Heading de `/patrones` con arquetipos.
- [ ] Selector de peep favorito en `/tu`.
