# Egoera Diario — Build móvil (Capacitor)

Esta app es un **wrapper webview** sobre la web desplegada en
`https://egoera-diario.vercel.app`. La app nativa carga la URL remota
(ver `capacitor.config.ts` → `server.url`), por lo que mantiene
compatibilidad con las API routes server-side de Next.js
(`/api/conversa`, `/api/lecturas`).

## Arquitectura

- `appId`: `es.egoera.diario`
- `appName`: `Egoera Diario`
- Estrategia: `server.url` apunta a Vercel; `webDir: 'public'` actúa como
  carpeta dummy (Capacitor exige una, pero no se sirve cuando hay
  `server.url`).
- Plugins: `@capacitor/splash-screen`, `@capacitor/status-bar`.

## Requisitos del entorno

| Plataforma | Tooling |
|------------|---------|
| iOS        | macOS, Xcode 15+, CocoaPods (`brew install cocoapods`) |
| Android    | JDK 17+, Android Studio (Hedgehog o superior), Android SDK 34+ |

> Si las rutas del proyecto contienen tildes (ej. `Documentación/...`),
> exporta `LANG=en_US.UTF-8` y `LC_ALL=en_US.UTF-8` antes de ejecutar
> `pod install` para evitar el `Encoding::CompatibilityError` de Ruby.

## Comandos habituales

```bash
# Sincronizar config y assets a las plataformas nativas
npx cap sync

# Solo iOS / solo Android
npx cap sync ios
npx cap sync android

# Regenerar iconos y splash (requiere assets/ con icon.png 1024x1024)
npx @capacitor/assets generate \
  --iconBackgroundColor '#f1ead8' \
  --splashBackgroundColor '#f1ead8' \
  --assetPath assets
```

## Compilar para iOS

```bash
npx cap open ios
```

En Xcode:

1. Selecciona el target `App`.
2. En **Signing & Capabilities**, asigna tu Team de desarrollo.
3. Elige un simulador (iPhone 15 Pro, etc.) o un dispositivo físico.
4. Pulsa **Run** (`Cmd + R`).

> Si `npx cap sync ios` falla en la fase `pod install` con un error de
> `IDESimulatorFoundation`, ejecuta `xcodebuild -runFirstLaunch` o haz
> `pod install` manualmente desde `ios/App/`:
>
> ```bash
> cd ios/App && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
> ```

## Compilar para Android

```bash
npx cap open android
```

En Android Studio:

1. Espera al Gradle sync.
2. Selecciona un AVD (emulador) o dispositivo conectado por USB con
   depuración activada.
3. Pulsa **Run** (`Shift + F10`).

## Publicación

### App Store (iOS)

1. En Xcode: **Product → Archive**.
2. En el Organizer, selecciona el archive y pulsa **Distribute App** →
   **App Store Connect** → **Upload**.
3. En [App Store Connect](https://appstoreconnect.apple.com), crea la
   ficha de la app con el bundle ID `es.egoera.diario`, sube
   capturas, descripción y envía a revisión.

Requiere: cuenta de Apple Developer (99 USD/año) y certificados de
distribución configurados.

### Play Store (Android)

1. En Android Studio: **Build → Generate Signed Bundle / APK** →
   **Android App Bundle** (`.aab`).
2. Genera o importa un keystore y configura los datos de firma.
3. En [Play Console](https://play.google.com/console), crea la app,
   sube el bundle a un track interno/cerrado/abierto y completa la
   ficha (capturas, política de privacidad, clasificación).

Requiere: cuenta de Google Play Console (25 USD único).

## Limitaciones de esta arquitectura

- **Requiere conexión** — al ser un webview de la URL remota, no
  funciona offline.
- **Latencia** — cada navegación implica un round-trip a Vercel.
- **Plugins nativos limitados** — la web no puede invocar APIs
  Capacitor a no ser que se exponga el bridge JS desde la propia
  página servida (Capacitor inyecta `window.Capacitor` aunque sea
  remote URL, pero las llamadas dependen de que la web las realice).

## Migrar a app offline-first (futuro)

Si se quiere empaquetar el contenido dentro del binario:

1. Mover las API routes (`/api/conversa`, `/api/lecturas`) a una
   **función serverless externa** (Vercel Functions standalone,
   Cloudflare Workers, Supabase Edge Functions).
2. En `next.config.mjs` activar `output: 'export'`.
3. En `capacitor.config.ts`, eliminar el bloque `server` y poner
   `webDir: 'out'`.
4. Ejecutar `next build && npx cap sync`.
5. La app cargará el bundle local; las llamadas fetch deberán apuntar
   a la URL absoluta del backend.

## Estructura de archivos relevante

```
egoera-diario/
├── capacitor.config.ts          # Configuración Capacitor (server.url, plugins)
├── assets/                       # Iconos y splash source (gitignored)
│   ├── icon.png                  # 1024x1024 sugerido
│   ├── icon-foreground.png       # Para adaptive icons Android
│   └── icon-only.png             # Solo glyph
├── ios/App/                      # Proyecto Xcode
│   ├── App.xcworkspace           # Abrir SIEMPRE este (no .xcodeproj)
│   ├── Podfile                   # platform :ios, '15.0'
│   └── App/Assets.xcassets/      # Iconos y splash generados
└── android/                      # Proyecto Android Studio
    └── app/src/main/res/         # mipmap-* con iconos generados
```
