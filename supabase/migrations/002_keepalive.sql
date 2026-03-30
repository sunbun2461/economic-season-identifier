-- Keepalive ping table
-- Single-row table upserted on every keepalive run.
-- A real write operation Supabase counts as activity.

create table if not exists keepalive_pings (
  id          int primary key default 1,
  last_ping   timestamptz not null default now(),
  ping_count  int not null default 0
);

-- Seed the one row so upsert always has something to update
insert into keepalive_pings (id, last_ping, ping_count)
values (1, now(), 0)
on conflict (id) do nothing;
