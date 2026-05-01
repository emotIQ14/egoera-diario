# Egoera Diario

Diario emocional. Estética cobalto + crema. Next.js 15 · React 19 · Capacitor.

## Stack
- Next.js 15 (App Router) + React 19
- TypeScript estricto
- Capacitor para iOS / Android
- PWA con service worker
- Anthropic Claude API para "Conversa con Egoera"

## Pantallas
1. Hoy — entrada principal
2. Diario — registrar entrada (mood + emociones + voz)
3. Conversa — chat AI socrático
4. Patrones — analítica semanal
5. Lecturas — feed del vlog
6. Tú — perfil + ajustes

## Despliegue

### PWA

La app es instalable como PWA en navegadores compatibles (Safari iOS, Chrome Android, Edge, etc.).

Activos relevantes:
- `public/manifest.json` — manifiesto con nombre, colores, iconos y orientación.
- `public/sw.js` — service worker con estrategia network-first para HTML y cache-first para fonts y assets estáticos. Versionado mediante `egoera-diario-vN`.
- `public/icons/` — `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.ico` y `source.svg` (fuente vectorial para regenerar).
- `src/components/ServiceWorkerRegister.tsx` — registra `/sw.js` solo en producción.

Para regenerar los iconos a partir del SVG fuente:

```bash
qlmanage -t -s 1024 -o public/icons public/icons/source.svg
mv public/icons/source.svg.png public/icons/source.png
sips -Z 512 public/icons/source.png --out public/icons/icon-512.png
sips -Z 192 public/icons/source.png --out public/icons/icon-192.png
sips -Z 180 public/icons/source.png --out public/icons/apple-touch-icon.png
python3 -c "from PIL import Image; Image.open('public/icons/source.png').save('public/icons/favicon.ico', sizes=[(16,16),(32,32),(48,48)])"
rm public/icons/source.png
```

El service worker solo se registra en `NODE_ENV=production`, así que en `next dev` no interfiere con el HMR.

### Capacitor (iOS / Android)

`capacitor.config.ts` ya está listo (`appId: es.egoera.diario`, `webDir: out`). Para generar el binario nativo:

```bash
# 1. Instalar dependencias de Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# 2. Inicializar (ya hecho via capacitor.config.ts — saltar npx cap init)
npx cap add ios
npx cap add android

# 3. Build estático de Next.js
npm run build      # genera la carpeta out/

# 4. Sincronizar el web build con los proyectos nativos
npx cap sync

# 5. Abrir en Xcode / Android Studio
npx cap open ios
npx cap open android
```

> Nota: para que Capacitor funcione, Next.js debe exportar estático. Añadir `output: 'export'` a `next.config.mjs` o usar el script `npm run cap:sync` ya definido en `package.json`.
