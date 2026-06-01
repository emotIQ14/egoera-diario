# Motor de cuadernos-revista · Egoera

Genera los **PDF imprimibles** de los cuadernos de Egoera (los que se descargan
gratis desde `egoera.es/tienda` y se leen online en `diario.egoera.es/cuadernos`).

Reconstruye los PDF con la identidad de marca: **Fraunces** (titulares),
**JetBrains Mono** (kickers), **Helvetica** (cuerpo) y paleta
cobalto/crema/coral/mostaza. Páginas A4 con líneas para escribir a mano.

## Requisitos

```bash
pip install reportlab        # única dependencia
```

Las fuentes ya están incluidas en `fonts/` (Fraunces + JetBrains Mono, ambas
OFL — ver `FONTS-LICENSE.md`). No hace falta descargar nada.

## Uso

```bash
cd tools/cuadernos
python3 render.py data/c06-tu-mejor-yo.json \
    ../../public/cuadernos/egoera-cuaderno-06-tu-mejor-yo.pdf
```

Tras regenerar, haz commit del PDF en `public/cuadernos/` y push a `main`
(Vercel lo despliega y queda servido en `diario.egoera.es/cuadernos/…`).

## Descriptores

Un cuaderno = un JSON en `data/`. Estructura:

```jsonc
{
  "title": "Egoera · …",
  "footer_label": "TU MEJOR YO",      // pie de página
  "stamp_num": "06",                   // número del sello de portada
  "theme": {                           // SOLO afecta a la portada
    "cover_bg": "#d97757", "cover_fg": "#f1ead8", "cover_accent": "#f4c842",
    "stamp_bg": "#1d2bdb", "stamp_fg": "#f1ead8", "cover_dots": "#e89a80"
  },
  "pages": [ … ]                       // ver tipos abajo
}
```

Las páginas interiores usan siempre la paleta de marca fija (papel crema +
tinta) para legibilidad e impresión; solo la portada usa los colores del theme.

### Tipos de página

| type | campos |
|------|--------|
| `cover` | `title`, `accent`, `eyebrow`, `lede`, `columns:[{h,body}×3]` |
| `editorial` | `h`, `body:[…]`, `quote`, `quote_src` |
| `sumario` | `title?`, `entries:[{n,h,sub}]` |
| `section` | `n`, `kicker`, `h`, `color_accent` (mostaza/coral/azul), `body:[…]`, `bullets:[…]` |
| `exercise` | `n`, `kicker`, `h`, `intro`, `prompts:[…]`, `reflection?` |
| `quote_break` | `quote`, `src` |
| `map_table` | `h`, `intro`, `columns:[4]`, `rows:[…]` |
| `closing` | `h`, `body:[…]`, `cta_text`, `cta_url` |

El contenido canónico de cada cuaderno vive en
`src/lib/cuadernos-data.ts` (la app online). Para añadir los descriptores de
los cuadernos 1-5 a este motor, copia sus `pages` desde ese archivo al formato
JSON de arriba (el cuaderno 6 ya está hecho como referencia en
`data/c06-tu-mejor-yo.json`).

## Catálogo

| # | slug | theme cover | estado PDF |
|---|------|-------------|------------|
| 1 | hipervigilancia | cobalto | en `public/cuadernos/` |
| 2 | reparar-gottman | navy | en `public/cuadernos/` |
| 3 | lenguajes-amor | coral | en `public/cuadernos/` |
| 4 | mapa-emociones | mostaza | en `public/cuadernos/` |
| 5 | fortalezas-linea-vida | crema | en `public/cuadernos/` |
| 6 | tu-mejor-yo | coral | regenerable aquí (`data/c06-…json`) |
