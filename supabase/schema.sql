-- =====================================================================
-- Combi - KDS (Kitchen Display System) + Pantalla de clientes
-- =====================================================================
-- Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard
-- -> tu proyecto -> SQL Editor -> New query -> pegar y correr).
-- =====================================================================

-- pgcrypto trae gen_random_uuid(); viene habilitada por defecto en Supabase,
-- pero lo dejamos explícito por si se corre en un proyecto Postgres nuevo.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tabla: pedidos
-- ---------------------------------------------------------------------
create table if not exists public.pedidos (
  id             uuid primary key default gen_random_uuid(),
  numero_ticket  varchar(10) not null,
  items          jsonb not null,
  estado         varchar(20) not null default 'en_preparacion'
                 check (estado in ('en_preparacion', 'listo', 'entregado')),
  created_at     timestamptz not null default now()
);

comment on table public.pedidos is 'Pedidos recibidos desde el sistema de facturación, mostrados en el KDS y la pantalla de clientes.';
comment on column public.pedidos.items is 'Array JSON con el detalle de productos, ej: [{"nombre":"Hamburguesa","cantidad":2}]';

create index if not exists pedidos_estado_idx on public.pedidos (estado);
create index if not exists pedidos_created_at_idx on public.pedidos (created_at desc);

-- ---------------------------------------------------------------------
-- Realtime: necesario para que la cocina y la pantalla de clientes
-- reciban INSERT/UPDATE en vivo vía supabase.channel(...).
-- ---------------------------------------------------------------------
-- REPLICA IDENTITY FULL: incluye los valores anteriores de la fila en
-- los eventos de UPDATE/DELETE (necesario para detectar el cambio de
-- estado 'en_preparacion' -> 'listo' en el cliente).
alter table public.pedidos replica identity full;

-- Agrega la tabla a la publicación realtime de Supabase.
alter publication supabase_realtime add table public.pedidos;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- El KDS y la pantalla de clientes son pantallas públicas sin login
-- (tablets/TVs en el local), así que leen y actualizan con la anon key.
-- Los INSERT solo los hace el webhook de facturación con la
-- service_role key (que ignora RLS), por eso no hay policy de insert
-- para el rol anon/authenticated.
alter table public.pedidos enable row level security;

create policy "pedidos_select_all" on public.pedidos
  for select using (true);

create policy "pedidos_update_estado" on public.pedidos
  for update using (true) with check (true);
