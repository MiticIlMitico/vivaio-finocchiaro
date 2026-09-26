-- ============================================================
-- Vivaio — schema database, storage e sicurezza
-- Da eseguire una volta sola nel SQL Editor di Supabase.
-- È idempotente: puoi rilanciarlo senza rompere niente.
-- ============================================================

-- ---------- 1. Tabella piante ----------

create table if not exists public.piante (
  id                      uuid primary key default gen_random_uuid(),

  nome                    text not null,              -- nome botanico, es. "Crassula ovata"
  nome_comune             text,                       -- es. "Albero di giada"
  categoria               text default 'Altre piante',-- raggruppa la fisarmonica in home
  tipologia               text,                       -- es. "Succulenta da esterno"
  descrizione             text,

  vaso_cm                 numeric,                    -- diametro vaso, es. 17
  altezza_cm              text,                       -- spesso è un range: "40/60"
  peso_kg                 numeric,

  pz_pianale              text,                       -- text: nel settore si scrive "21/33"
  pz_carrello             text,                       -- text: es. "100"
  disponibilita_carrelli  text,                       -- text: es. "6 CC"

  giacenza                integer default 0,          -- pezzi fisici in magazzino
  disponibile             integer default 0,          -- pezzi disponibili alla vendita
  varianti                jsonb default '[]'::jsonb,  -- calibri vasi multipli con disponibilità e giacenza: [{"vaso_cm": 16, "disponibile": 600, "giacenza": 600}]

  prezzo                  numeric(10,2),              -- facoltativo / disattivato da vetrina
  note                    text,                       -- sconti, condizioni

  foto_url                text,                       -- URL pubblico per la vetrina
  foto_path               text,                       -- path interno nel bucket, serve per cancellare

  visibile                boolean not null default true,  -- l'icona dell'occhio
  ordine                  integer default 0,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists piante_visibile_idx  on public.piante (visibile);
create index if not exists piante_categoria_idx on public.piante (categoria);
create index if not exists piante_nome_idx      on public.piante (nome);

-- ---------- 2. updated_at automatico ----------

create or replace function public.tocca_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists piante_updated_at on public.piante;
create trigger piante_updated_at
  before update on public.piante
  for each row execute function public.tocca_updated_at();

-- ---------- 3. Row Level Security sulla tabella ----------

alter table public.piante enable row level security;

drop policy if exists "lettura pubblica solo piante visibili" on public.piante;
create policy "lettura pubblica solo piante visibili"
  on public.piante for select
  to anon
  using (visibile = true);

drop policy if exists "lettura completa per utenti autenticati" on public.piante;
create policy "lettura completa per utenti autenticati"
  on public.piante for select
  to authenticated
  using (true);

drop policy if exists "inserimento solo autenticati" on public.piante;
create policy "inserimento solo autenticati"
  on public.piante for insert
  to authenticated
  with check (true);

drop policy if exists "modifica solo autenticati" on public.piante;
create policy "modifica solo autenticati"
  on public.piante for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "cancellazione solo autenticati" on public.piante;
create policy "cancellazione solo autenticati"
  on public.piante for delete
  to authenticated
  using (true);

-- ---------- 3b. Tabella impostazioni generali & periodo validità ----------

create table if not exists public.impostazioni (
  chiave                  text primary key,
  valore                  text,
  updated_at              timestamptz default now()
);

alter table public.impostazioni enable row level security;

drop policy if exists "lettura pubblica impostazioni" on public.impostazioni;
create policy "lettura pubblica impostazioni"
  on public.impostazioni for select
  to anon
  using (true);

drop policy if exists "lettura autenticata impostazioni" on public.impostazioni;
create policy "lettura autenticata impostazioni"
  on public.impostazioni for select
  to authenticated
  using (true);

drop policy if exists "modifica impostazioni autenticati" on public.impostazioni;
create policy "modifica impostazioni autenticati"
  on public.impostazioni for all
  to authenticated
  using (true)
  with check (true);

-- Valore iniziale periodo validità listino
insert into public.impostazioni (chiave, valore)
values ('valido_fino', '31 Agosto 2026')
on conflict (chiave) do update set valore = excluded.valore;

-- Valore iniziale visibilità giacenze all'utente finale (default: true)
insert into public.impostazioni (chiave, valore)
values ('mostra_giacenze', 'true')
on conflict (chiave) do nothing;

-- ---------- 4. Bucket Storage per le foto ----------

insert into storage.buckets (id, name, public)
values ('foto-piante', 'foto-piante', true)
on conflict (id) do update set public = true;

drop policy if exists "foto leggibili da tutti" on storage.objects;
create policy "foto leggibili da tutti"
  on storage.objects for select
  to public
  using (bucket_id = 'foto-piante');

drop policy if exists "caricamento foto solo autenticati" on storage.objects;
create policy "caricamento foto solo autenticati"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'foto-piante');

drop policy if exists "sostituzione foto solo autenticati" on storage.objects;
create policy "sostituzione foto solo autenticati"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'foto-piante')
  with check (bucket_id = 'foto-piante');

drop policy if exists "cancellazione foto solo autenticati" on storage.objects;
create policy "cancellazione foto solo autenticati"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'foto-piante');

-- ============================================================
-- Fatto. Prossimi passi manuali dalla dashboard Supabase:
--   Authentication > Providers > Email  -> disattiva "Enable sign ups"
--   Authentication > Users > Add user   -> crea l'unico account del cliente
-- ============================================================
