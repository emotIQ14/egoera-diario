# Egoera App · puesta en marcha de Supabase

Base de datos de la App (rebrand del Diario Emocional → herramienta integral).
Contenido = WordPress (egoera.es, REST). Datos de usuario = Supabase (este repo).

## 1. Crear el proyecto (lo hace Ander)
1. Entra en https://supabase.com → **New project** (región EU, p. ej. `eu-west` Londres/Frankfurt).
2. Nombre del proyecto: `egoera`. Guarda la contraseña de la base de datos.
3. En **Project Settings → API** copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (secreta, solo servidor/migraciones) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Crear las tablas
SQL Editor → pega y ejecuta `supabase/schema.sql` (de este repo). Crea tablas +
RLS + triggers. Idempotente (se puede re-ejecutar sin romper nada).

## 3. Variables de entorno
- Local: copia `.env.local.example` → `.env.local` y rellena.
- Vercel: **Project → Settings → Environment Variables** añade las 3 (las dos
  `NEXT_PUBLIC_*` en todos los entornos; la `SERVICE_ROLE` solo Production/Preview,
  nunca expuesta al cliente).

## 4. Dependencias
```bash
npm i @supabase/supabase-js @supabase/ssr
```

## 5. Cliente (crear estos ficheros cuando estén las claves)

`src/lib/supabase/client.ts` — componentes de cliente:
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

`src/lib/supabase/server.ts` — Server Components / Route Handlers / Actions:
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(toSet) {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* invocado desde un Server Component: lo refresca el middleware */ }
        },
      },
    }
  );
}
```

`src/middleware.ts` — refresca la sesión en cada request:
```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );
  await supabase.auth.getUser(); // refresca el token si toca
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'],
};
```

## 6. Modelo de datos (resumen)
| Tabla | Para qué |
|---|---|
| `profiles` | 1:1 con auth.users · locale, role (usuario/pro), onboarding, prefs |
| `moods` | estado de ánimo (escala 0-3 de la brújula) |
| `entries` | diario / check-in / registro TCC libre |
| `habits` + `habit_logs` | hábitos y su seguimiento diario |
| `cbt_records` | registro de pensamiento (situación→pensamiento→emoción→reencuadre) |
| `sessions` | preparación de sesión de terapia |
| `saved_resources` | puente con la web: guarda `wp_post_id` de egoera.es |

Todas con **RLS**: `auth.uid() = user_id`. El contenido (artículos/ejercicios)
se lee de WordPress por REST; aquí solo se referencia por `wp_post_id`.

## 7. Cuando tenga las claves
Avísame y: creo los ficheros del cliente, migro el diario actual (localStorage →
Supabase), añado auth (email + magic link) y verifico build verde antes de fusionar a `main`.
