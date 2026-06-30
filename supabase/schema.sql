-- ============================================================
-- Egoera App · esquema base (Supabase / Postgres)
-- Rebrand del "Diario Emocional" → herramienta integral.
-- Ejecutar en el SQL Editor de Supabase (una vez creado el proyecto).
-- RLS activado en TODAS las tablas: cada usuario solo ve y edita lo suyo.
-- Contenido (artículos, ejercicios, novelas) NO vive aquí: vive en WordPress
-- (egoera.es) y la app lo consume por REST; aquí solo se guarda la referencia
-- (wp_post_id) en saved_resources.
-- ============================================================

-- ---------- PROFILES (1:1 con auth.users) ----------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  locale          text not null default 'es',
  role            text not null default 'usuario' check (role in ('usuario','pro')),
  onboarding_done boolean not null default false,
  prefs           jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- MOODS (estado de ánimo · escala 0-3 de la brújula) ----------
create table if not exists public.moods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  ts          timestamptz not null default now(),
  valencia    smallint check (valencia between -3 and 3),   -- agradable/desagradable
  intensidad  smallint check (intensidad between 0 and 3),  -- 0 No · 1 Quizá · 2 Sí · 3 Mucho
  emociones   text[] not null default '{}',
  contexto    text[] not null default '{}',
  nota        text
);

-- ---------- ENTRIES (diario / check-in / registro libre) ----------
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tipo        text not null default 'diario' check (tipo in ('diario','checkin','tcc')),
  texto       text,
  mood_id     uuid references public.moods(id) on delete set null,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- HABITS + HABIT_LOGS (hábitos) ----------
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  nombre      text not null,
  cadencia    text not null default 'diaria',
  objetivo    int,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);
create table if not exists public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  fecha       date not null default current_date,
  hecho       boolean not null default true,
  unique (habit_id, fecha)
);

-- ---------- CBT_RECORDS (registro de pensamiento · TCC) ----------
create table if not exists public.cbt_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  ts           timestamptz not null default now(),
  situacion    text,
  pensamiento  text,
  emocion      text,
  intensidad   smallint check (intensidad between 0 and 10),
  distorsiones text[] not null default '{}',
  reencuadre   text
);

-- ---------- SESSIONS (preparación de sesión de terapia) ----------
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  fecha       date,
  notas       text,
  prep        text,
  created_at  timestamptz not null default now()
);

-- ---------- SAVED_RESOURCES (puente con la web WP) ----------
create table if not exists public.saved_resources (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  wp_post_id  bigint not null,          -- id del post en egoera.es (artículo/ejercicio/novela)
  titulo      text,
  url         text,
  guardado_en timestamptz not null default now(),
  unique (user_id, wp_post_id)
);

-- ---------- Índices ----------
create index if not exists idx_entries_user_ts   on public.entries(user_id, created_at desc);
create index if not exists idx_moods_user_ts     on public.moods(user_id, ts desc);
create index if not exists idx_habitlogs_user    on public.habit_logs(user_id, fecha desc);
create index if not exists idx_cbt_user_ts       on public.cbt_records(user_id, ts desc);
create index if not exists idx_saved_user        on public.saved_resources(user_id, guardado_en desc);

-- ---------- updated_at automático ----------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_entries_updated on public.entries;
create trigger trg_entries_updated before update on public.entries for each row execute function public.set_updated_at();

-- ---------- Crear profile automáticamente al registrarse ----------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', null))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================================
-- RLS · cada usuario gestiona SOLO sus filas
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.moods           enable row level security;
alter table public.entries         enable row level security;
alter table public.habits          enable row level security;
alter table public.habit_logs      enable row level security;
alter table public.cbt_records     enable row level security;
alter table public.sessions        enable row level security;
alter table public.saved_resources enable row level security;

-- profiles (la PK es el propio user id)
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- resto de tablas: filtro por user_id
do $$
declare t text;
begin
  foreach t in array array['moods','entries','habits','habit_logs','cbt_records','sessions','saved_resources']
  loop
    execute format('drop policy if exists %I on public.%I;', t||'_owner', t);
    execute format(
      'create policy %I on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t||'_owner', t);
  end loop;
end $$;
