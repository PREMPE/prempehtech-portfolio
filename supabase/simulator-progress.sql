-- PrempehTech Simulator cloud progress schema
-- Run in the Supabase project used by https://prempehtech.ca/simulator/

create table if not exists public.simulator_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{"completed":{},"xp":0}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.simulator_progress enable row level security;

drop policy if exists "Players can read their own simulator progress" on public.simulator_progress;
create policy "Players can read their own simulator progress"
on public.simulator_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Players can create their own simulator progress" on public.simulator_progress;
create policy "Players can create their own simulator progress"
on public.simulator_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Players can update their own simulator progress" on public.simulator_progress;
create policy "Players can update their own simulator progress"
on public.simulator_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Players can delete their own simulator progress" on public.simulator_progress;
create policy "Players can delete their own simulator progress"
on public.simulator_progress
for delete
to authenticated
using (auth.uid() = user_id);

revoke all privileges on table public.simulator_progress from anon;
revoke all privileges on table public.simulator_progress from authenticated;
grant select, insert, update, delete on table public.simulator_progress to authenticated;

create or replace function public.touch_simulator_progress_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists simulator_progress_touch_updated_at on public.simulator_progress;
create trigger simulator_progress_touch_updated_at
before update on public.simulator_progress
for each row execute function public.touch_simulator_progress_updated_at();
