-- ATELIER / schema v1 — install in a dedicated Supabase project only.
-- UUIDs, booking exclusion constraint, and role-based RLS.
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists public.salon_settings (
 id uuid primary key default gen_random_uuid(),
 name text not null default 'ATELIER',
 timezone text not null default 'America/Boa_Vista',
 interval_minutes int not null default 30 check (interval_minutes in (15,30,60)),
 created_at timestamptz not null default now()
);
create table if not exists public.services (
 id uuid primary key default gen_random_uuid(),
 category text not null default 'Cabelo',
 name text not null,
 description text,
 duration_minutes int not null check (duration_minutes between 15 and 480),
 buffer_minutes int not null default 0 check(buffer_minutes between 0 and 120),
 price_cents int not null check(price_cents >= 0),
 image_url text,
 active boolean not null default true,
 sort_order int not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.staff (
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid unique references auth.users(id) on delete set null,
 name text not null,
 title text,
 photo_url text,
 role text not null default 'professional' check(role in ('owner','manager','professional')),
 active boolean not null default true,
 sort_order int not null default 0
);
create table if not exists public.staff_services (
 staff_id uuid not null references public.staff(id) on delete cascade,
 service_id uuid not null references public.services(id) on delete cascade,
 primary key(staff_id,service_id)
);
create table if not exists public.staff_hours (
 id uuid primary key default gen_random_uuid(),
 staff_id uuid not null references public.staff(id) on delete cascade,
 weekday int not null check(weekday between 0 and 6),
 starts_at time not null,
 ends_at time not null,
 check(ends_at > starts_at),
 unique(staff_id,weekday,starts_at)
);
create table if not exists public.staff_time_off (
 id uuid primary key default gen_random_uuid(),
 staff_id uuid not null references public.staff(id) on delete cascade,
 begins_at timestamptz not null,
 ends_at timestamptz not null,
 reason text,
 check(ends_at > begins_at)
);
create table if not exists public.clients (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 120),
 email text not null,
 phone text not null,
 notes text,
 created_at timestamptz not null default now()
);
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(),
 client_id uuid not null references public.clients(id),
 service_id uuid not null references public.services(id),
 staff_id uuid not null references public.staff(id),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'confirmed' check(status in ('pending','confirmed','completed','cancelled','no_show')),
 price_cents_snapshot int not null,
 created_at timestamptz not null default now(),
 check(ends_at > starts_at)
);
alter table public.bookings add constraint bookings_no_overlap
 exclude using gist (staff_id with =, tstzrange(starts_at,ends_at,'[)') with &&)
 where (status in ('pending','confirmed','completed'));

create index if not exists bookings_starts_idx on public.bookings(starts_at);
create index if not exists bookings_staff_start_idx on public.bookings(staff_id,starts_at);
create index if not exists time_off_staff_idx on public.staff_time_off(staff_id,begins_at);

alter table public.salon_settings enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_services enable row level security;
alter table public.staff_hours enable row level security;
alter table public.staff_time_off enable row level security;
alter table public.clients enable row level security;
alter table public.bookings enable row level security;
create policy "public active services" on public.services for select to anon,authenticated using(active);
create policy "public active professionals" on public.staff for select to anon,authenticated using(active);
create policy "public services offered" on public.staff_services for select to anon,authenticated using(true);

create or replace function public.available_slots(p_service uuid,p_staff uuid,p_date date)
returns table(slot text)
language plpgsql security definer set search_path = ''
as $$
declare
 v_minutes int; v_buffer int; v_tz text; v_start time; v_end time; v_cursor timestamp; v_finish timestamp; v_start_at timestamptz; v_end_at timestamptz;
begin
 select duration_minutes,buffer_minutes into v_minutes,v_buffer from public.services where id=p_service and active;
 if v_minutes is null then return; end if;
 if not exists(select 1 from public.staff_services ss join public.staff s on s.id=ss.staff_id where ss.staff_id=p_staff and ss.service_id=p_service and s.active) then return; end if;
 select timezone into v_tz from public.salon_settings order by created_at limit 1; v_tz:=coalesce(v_tz,'America/Boa_Vista');
 if p_date < (now() at time zone v_tz)::date or p_date > (now() at time zone v_tz)::date + 60 then return; end if;
 for v_start,v_end in select starts_at,ends_at from public.staff_hours where staff_id=p_staff and weekday=extract(dow from p_date)::int loop
   v_cursor:=p_date+v_start; v_finish:=p_date+v_end;
   while v_cursor+make_interval(mins=>v_minutes+v_buffer)<=v_finish loop
     v_start_at:=v_cursor at time zone v_tz;
     v_end_at:=(v_cursor+make_interval(mins=>v_minutes+v_buffer)) at time zone v_tz;
     if v_start_at > now()+interval '30 minutes'
       and not exists(select 1 from public.bookings b where b.staff_id=p_staff and b.status in ('pending','confirmed','completed') and tstzrange(b.starts_at,b.ends_at,'[)') && tstzrange(v_start_at,v_end_at,'[)'))
       and not exists(select 1 from public.staff_time_off t where t.staff_id=p_staff and tstzrange(t.begins_at,t.ends_at,'[)') && tstzrange(v_start_at,v_end_at,'[)')) then
       slot:=to_char(v_cursor,'HH24:MI'); return next;
     end if;
     v_cursor:=v_cursor+interval '30 minutes';
   end loop;
 end loop;
end $$;

create or replace function public.create_booking(p_service uuid,p_staff uuid,p_date date,p_time text,p_name text,p_email text,p_phone text,p_notes text default null)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_tz text; v_minutes int; v_buffer int; v_price int; v_start timestamptz; v_end timestamptz; v_client uuid; v_booking uuid;
begin
 if length(trim(p_name))<2 or length(trim(p_name))>120 or length(p_email)>254 or p_email not like '%@%.%' or length(trim(p_phone))<8 or length(trim(p_phone))>24 or length(coalesce(p_notes,''))>500 then
   raise exception 'Dados do cliente inválidos';
 end if;
 if p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'Horário inválido'; end if;
 -- Avoid transactional races between two simultaneous requests for the same staff/day.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_staff::text),pg_catalog.hashtext(p_date::text));
 if not exists(select 1 from public.available_slots(p_service,p_staff,p_date) s where s.slot=p_time) then raise exception 'Horário indisponível'; end if;
 select duration_minutes,buffer_minutes,price_cents into v_minutes,v_buffer,v_price from public.services where id=p_service and active;
 select timezone into v_tz from public.salon_settings order by created_at limit 1;v_tz:=coalesce(v_tz,'America/Boa_Vista');
 v_start:=((p_date::text||' '||p_time)::timestamp at time zone v_tz);
 v_end:=v_start+make_interval(mins=>v_minutes+v_buffer);
 insert into public.clients(name,email,phone,notes) values(trim(p_name),lower(trim(p_email)),trim(p_phone),nullif(trim(coalesce(p_notes,'')),'')) returning id into v_client;
 insert into public.bookings(client_id,service_id,staff_id,starts_at,ends_at,price_cents_snapshot)
 values(v_client,p_service,p_staff,v_start,v_end,v_price) returning id into v_booking;
 return v_booking;
end $$;
revoke all on function public.available_slots(uuid,uuid,date) from public;
revoke all on function public.create_booking(uuid,uuid,date,text,text,text,text,text) from public;
-- Server-only calls using service-role; do not grant booking RPC directly to anonymous clients.
grant execute on function public.available_slots(uuid,uuid,date) to service_role;
grant execute on function public.create_booking(uuid,uuid,date,text,text,text,text,text) to service_role;

insert into public.salon_settings(name,timezone) select 'ATELIER','America/Boa_Vista'
where not exists(select 1 from public.salon_settings);
-- Seed catalog in Supabase dashboard using actual licensed images and professionals.
-- Set a real owner's auth_user_id and role='owner' after creating Auth user.
