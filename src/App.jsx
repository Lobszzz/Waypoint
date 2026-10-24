-- 1. Create tables for travelers, cities, and kitty top-ups
create table if not exists trip_travelers (
  id text primary key,
  name text,
  avatar text,
  role text default 'Traveler',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists trip_cities (
  id text primary key,
  name text,
  name_ja text,
  hotel_name text,
  hotel_address text,
  station text,
  start_date text,
  end_date text,
  transit_to_next text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists trip_contributions (
  id text primary key,
  traveler_id text,
  amount_jpy numeric,
  date text,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Turn off RLS so all group members can read & write freely
alter table trip_travelers disable row level security;
alter table trip_cities disable row level security;
alter table trip_contributions disable row level security;

-- 3. Enable realtime syncing & full deletes for all tables
alter publication supabase_realtime add table trip_travelers, trip_cities, trip_contributions;
alter table trip_travelers replica identity full;
alter table trip_cities replica identity full;
alter table trip_contributions replica identity full;

-- 4. Seed initial default travelers and cities if not already present
insert into trip_travelers (id, name, avatar, role)
values
  ('t1', 'Lubelter', '⚡', 'Navigator'),
  ('t2', 'Khai', '🍃', 'Vanguard')
on conflict (id) do nothing;

insert into trip_cities (id, name, name_ja, hotel_name, hotel_address, station, start_date, end_date, transit_to_next)
values
  ('fukuoka', 'Fukuoka', '福岡・博多', 'Miyako Hotel Hakata', '2-1-1 Hakataekihigashi, Hakata Ward, Fukuoka', 'JR Hakata Station Direct Gate', '2026-10-24T09:00', '2026-10-27T10:30', 'Shinkansen Nozomi (2h 45m)'),
  ('kyoto', 'Kyoto', '京都・千年の都', 'The Thousand Kyoto', '570 Higashishiokojicho, Shimogyo Ward, Kyoto', 'JR Kyoto Station Central Gate', '2026-10-27T10:30', '2026-10-30T14:00', 'JR Special Rapid Service (28m)'),
  ('osaka', 'Osaka', '大阪・食いだおれ', 'Swissôtel Nankai Osaka', '5-1-60 Namba, Chuo Ward, Osaka', 'Nankai Namba Station Direct', '2026-10-30T14:00', '2026-11-03T18:00', 'Nankai Rapi:t to KIX Airport (35m)')
on conflict (id) do nothing;
