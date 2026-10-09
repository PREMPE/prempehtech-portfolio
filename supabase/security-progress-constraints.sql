-- Optional administrative migration. NOT applied by deploying the static site.
-- Review existing rows and take a backup before running in the correct project.
-- NOT VALID preserves existing data while enforcing the check on new/updated rows.
begin;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'simulator_progress_shape'
      and conrelid = 'public.simulator_progress'::regclass
  ) then
    alter table public.simulator_progress add constraint simulator_progress_shape check (
      jsonb_typeof(progress) = 'object'
      and octet_length(progress::text) <= 16384
      and progress - array['completed','completedLevels','xp'] = '{}'::jsonb
      and progress ? 'xp'
      and jsonb_typeof(progress->'xp') = 'number'
      and (progress->>'xp')::numeric between 0 and 1000000
      and (progress->>'xp')::numeric = trunc((progress->>'xp')::numeric)
      and (not (progress ? 'completed') or (
        jsonb_typeof(progress->'completed') = 'object'
        and (progress->'completed') - array['networking','sysadmin','cyber','cloud','integrated'] = '{}'::jsonb
        and not jsonb_path_exists(progress, '$.completed.* ? (@.type() != "boolean")')
      ))
      and (not (progress ? 'completedLevels') or (
        jsonb_typeof(progress->'completedLevels') = 'object'
        and (progress->'completedLevels') - array[
          'networking:1','networking:2','networking:3','networking:4','networking:5',
          'sysadmin:1','sysadmin:2','sysadmin:3','sysadmin:4','sysadmin:5',
          'cyber:1','cyber:2','cyber:3','cyber:4','cyber:5',
          'cloud:1','cloud:2','cloud:3','cloud:4','cloud:5',
          'integrated:1','integrated:2','integrated:3','integrated:4','integrated:5'
        ] = '{}'::jsonb
        and not jsonb_path_exists(progress, '$.completedLevels.* ? (@.type() != "boolean")')
      ))
    ) not valid;
  end if;
end;
$$;
commit;
-- After reviewing/remediating any incompatible old rows:
-- alter table public.simulator_progress validate constraint simulator_progress_shape;
