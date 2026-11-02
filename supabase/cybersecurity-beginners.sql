-- Apply AFTER player-services.sql and verified-competition.sql. Repeatable.
-- Adds ten new identities. No old runs, completions, points or evidence are deleted.
begin;
alter table public.simulator_competition_runs drop constraint if exists simulator_competition_runs_slot_check;
alter table public.simulator_competition_runs drop constraint if exists simulator_competition_runs_curriculum_slot;
alter table public.simulator_competition_runs add constraint simulator_competition_runs_curriculum_slot check(slot between 1 and 15 or (track='cyber' and slot between 16 and 25));


insert into public.simulator_lab_rules(track,slot,tasks) select track,slot,tasks from jsonb_to_recordset($cyberrules$[
  {
    "track": "cyber",
    "slot": 16,
    "tasks": [
      {
        "id": "cb16_1",
        "type": "form",
        "expected": {
          "answer": "Access denied"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb16_2",
        "type": "form",
        "expected": {
          "answer": "Integrity mismatch"
        },
        "required": [],
        "dependencies": [
          "cb16_1"
        ]
      },
      {
        "id": "cb16_3",
        "type": "form",
        "expected": {
          "answer": "File available"
        },
        "required": [],
        "dependencies": [
          "cb16_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 17,
    "tasks": [
      {
        "id": "cb17_1",
        "type": "form",
        "expected": {
          "answer": "Customer training records"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb17_2",
        "type": "form",
        "expected": {
          "answer": "Public write permission"
        },
        "required": [],
        "dependencies": [
          "cb17_1"
        ]
      },
      {
        "id": "cb17_3",
        "type": "form",
        "expected": {
          "answer": "Remove public write access"
        },
        "required": [],
        "dependencies": [
          "cb17_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 18,
    "tasks": [
      {
        "id": "cb18_1",
        "type": "form",
        "expected": {
          "answer": "64 hexadecimal characters"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb18_2",
        "type": "form",
        "expected": {
          "answer": "Different hash"
        },
        "required": [],
        "dependencies": [
          "cb18_1"
        ]
      },
      {
        "id": "cb18_3",
        "type": "form",
        "expected": {
          "answer": "Reject changed file"
        },
        "required": [],
        "dependencies": [
          "cb18_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 19,
    "tasks": [
      {
        "id": "cb19_1",
        "type": "form",
        "expected": {
          "answer": "Authenticated encryption"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb19_2",
        "type": "form",
        "expected": {
          "answer": "Authentication failed"
        },
        "required": [],
        "dependencies": [
          "cb19_1"
        ]
      },
      {
        "id": "cb19_3",
        "type": "form",
        "expected": {
          "answer": "Meet at the training room"
        },
        "required": [],
        "dependencies": [
          "cb19_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 20,
    "tasks": [
      {
        "id": "cb20_1",
        "type": "form",
        "expected": {
          "answer": "Private key"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb20_2",
        "type": "form",
        "expected": {
          "answer": "Rejected"
        },
        "required": [],
        "dependencies": [
          "cb20_1"
        ]
      },
      {
        "id": "cb20_3",
        "type": "form",
        "expected": {
          "answer": "Integrity and signer authenticity"
        },
        "required": [],
        "dependencies": [
          "cb20_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 21,
    "tasks": [
      {
        "id": "cb21_1",
        "type": "form",
        "expected": {
          "answer": "Unique passphrase per account"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb21_2",
        "type": "form",
        "expected": {
          "answer": "Different stored hashes"
        },
        "required": [],
        "dependencies": [
          "cb21_1"
        ]
      },
      {
        "id": "cb21_3",
        "type": "form",
        "expected": {
          "answer": "Prevent identical-password hash reuse"
        },
        "required": [],
        "dependencies": [
          "cb21_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 22,
    "tasks": [
      {
        "id": "cb22_1",
        "type": "form",
        "expected": {
          "answer": "Second factor required"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb22_2",
        "type": "form",
        "expected": {
          "answer": "Knowledge and possession"
        },
        "required": [],
        "dependencies": [
          "cb22_1"
        ]
      },
      {
        "id": "cb22_3",
        "type": "form",
        "expected": {
          "answer": "Rejected after first use"
        },
        "required": [],
        "dependencies": [
          "cb22_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 23,
    "tasks": [
      {
        "id": "cb23_1",
        "type": "form",
        "expected": {
          "answer": "Unexpected urgent credential request"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb23_2",
        "type": "form",
        "expected": {
          "answer": "Encrypted connection, not proof of legitimacy"
        },
        "required": [],
        "dependencies": [
          "cb23_1"
        ]
      },
      {
        "id": "cb23_3",
        "type": "form",
        "expected": {
          "answer": "Report and use a known trusted address"
        },
        "required": [],
        "dependencies": [
          "cb23_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 24,
    "tasks": [
      {
        "id": "cb24_1",
        "type": "form",
        "expected": {
          "answer": "Denied"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb24_2",
        "type": "form",
        "expected": {
          "answer": "Read only"
        },
        "required": [],
        "dependencies": [
          "cb24_1"
        ]
      },
      {
        "id": "cb24_3",
        "type": "form",
        "expected": {
          "answer": "Read the assigned document"
        },
        "required": [],
        "dependencies": [
          "cb24_2"
        ]
      }
    ]
  },
  {
    "track": "cyber",
    "slot": 25,
    "tasks": [
      {
        "id": "cb25_1",
        "type": "form",
        "expected": {
          "answer": "Patched training version"
        },
        "required": [],
        "dependencies": []
      },
      {
        "id": "cb25_2",
        "type": "form",
        "expected": {
          "answer": "Separate copy"
        },
        "required": [],
        "dependencies": [
          "cb25_1"
        ]
      },
      {
        "id": "cb25_3",
        "type": "form",
        "expected": {
          "answer": "Content and hash match"
        },
        "required": [],
        "dependencies": [
          "cb25_2"
        ]
      }
    ]
  }
]$cyberrules$::jsonb) as x(track text,slot integer,tasks jsonb) on conflict(track,slot) do update set tasks=excluded.tasks;

insert into public.simulator_lab_task_catalog(track,slot,task_ids) select track,slot,array(select t->>'id' from jsonb_array_elements(tasks) t) from public.simulator_lab_rules where track='cyber' and slot between 16 and 25 on conflict(track,slot) do update set task_ids=excluded.task_ids;

create or replace function public.simulator_competition_start(p_name text,p_track text,p_slot integer)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_month date; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in before entering' using errcode='42501'; end if;
 if p_track is null or p_track not in ('networking','sysadmin','cyber','cloud','integrated') or p_slot is null or not (p_slot between 1 and 15 or (p_track='cyber' and p_slot between 16 and 25)) then
  raise exception 'Unknown lab' using errcode='22023';
 end if;
 if p_track='cyber' and p_slot<=5 and not exists(select 1 from public.simulator_competition_runs where user_id=auth.uid() and track='cyber' and slot=p_slot and month=date_trunc('month',clock_timestamp() at time zone 'America/Toronto')::date) then
  raise exception 'Original investigation cases are now integrated into Levels 2 and 3' using errcode='22023';
 end if;
 -- Starting is enrollment. Public name disclosure is shown before the Start action.
 perform public.simulator_leaderboard_profile(p_name,true);
 v_month:=date_trunc('month',clock_timestamp() at time zone 'America/Toronto')::date;
 insert into public.simulator_competition_runs(user_id,month,track,slot)
 values(auth.uid(),v_month,p_track,p_slot)
 on conflict(user_id,month,track,slot) do nothing;
 select r.id into v_id from public.simulator_competition_runs r
 where r.user_id=auth.uid() and r.month=v_month and r.track=p_track and r.slot=p_slot;
 return v_id;
end; $$;

create or replace function public.simulator_activity_points(p_slot integer,p_validated integer,p_total integer,p_completed boolean)
returns integer language sql immutable set search_path='' as $$
 select case when p_completed then (case when p_slot between 16 and 25 then 100 else ((p_slot-1)/5+1)*100 end)
 else floor(((case when p_slot between 16 and 25 then 100 else ((p_slot-1)/5+1)*100 end))::numeric*least(greatest(coalesce(p_validated,0),0),p_total)/greatest(p_total,1))::integer end;
$$;

create or replace function public.simulator_competition_finish(p_run uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare r public.simulator_competition_runs; allowed text[]; now_at timestamptz:=clock_timestamp();
begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode='42501'; end if;
 select * into r from public.simulator_competition_runs where id=p_run and user_id=auth.uid() for update;
 if not found then raise exception 'Start this lab first' using errcode='42501'; end if;
 if r.month<>date_trunc('month',now_at at time zone 'America/Toronto')::date then raise exception 'Month closed' using errcode='22023'; end if;
 if not exists(select 1 from public.simulator_leaderboard_profiles where user_id=auth.uid() and opted_in) then raise exception 'Entry withdrawn' using errcode='42501'; end if;
 if r.completed_at is not null then return 0; end if;
 select task_ids into allowed from public.simulator_lab_task_catalog where track=r.track and slot=r.slot;
 if allowed is null or not allowed<@r.verified_tasks then raise exception 'All tasks need server-verified evidence before completion' using errcode='42501'; end if;
 update public.simulator_competition_runs set completed_at=now_at where id=r.id;
 return public.simulator_activity_points(r.slot,cardinality(allowed),cardinality(allowed),true);
end; $$;

create or replace function public.simulator_monthly_leaderboard(p_track text default 'all',p_month date default null)
returns table(place bigint,display_name text,points bigint,level_one bigint,level_two bigint,level_three bigint)
language plpgsql stable security definer set search_path='' as $$
declare v_month date:=coalesce(p_month,date_trunc('month',now() at time zone 'America/Toronto')::date);
begin
 if p_track is null or p_track not in ('all','networking','sysadmin','cyber','cloud','integrated') then raise exception 'Unknown discipline'; end if;
 if v_month<>date_trunc('month',v_month)::date or v_month>date_trunc('month',now() at time zone 'America/Toronto')::date then raise exception 'Invalid month'; end if;
 return query
 with totals as (
  select r.user_id,p.display_name,
   sum(public.simulator_activity_points(r.slot,cardinality(r.validated_tasks),cardinality(c.task_ids),r.completed_at is not null))::bigint as score,
   count(*) filter(where r.completed_at is not null and (r.slot<=5 or r.slot between 16 and 25)) as l1,
   count(*) filter(where r.completed_at is not null and r.slot between 6 and 10) as l2,
   count(*) filter(where r.completed_at is not null and r.slot between 11 and 15) as l3,
   max(greatest(r.completed_at,r.last_activity_at)) as reached_at,min(r.started_at) as joined_at
  from public.simulator_competition_runs r
  join public.simulator_lab_task_catalog c on c.track=r.track and c.slot=r.slot
  join public.simulator_leaderboard_profiles p on p.user_id=r.user_id and p.opted_in
  where r.month=v_month and (p_track='all' or r.track=p_track)
  group by r.user_id,p.display_name
 )
 select row_number() over(order by t.score desc,(t.l1+t.l2+t.l3) desc,t.reached_at asc nulls last,t.joined_at,t.user_id),
 t.display_name,t.score,t.l1,t.l2,t.l3
 from totals t order by t.score desc,(t.l1+t.l2+t.l3) desc,t.reached_at asc nulls last,t.joined_at,t.user_id limit 20;
end; $$;

create or replace function public.simulator_monthly_activity(p_name text,p_month date default null)
returns table(track text,slot integer,validated integer,total integer,completed boolean,points integer,started_at timestamptz,last_activity_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
declare v_month date:=coalesce(p_month,date_trunc('month',now() at time zone 'America/Toronto')::date); v_user uuid;
begin
 if v_month<>date_trunc('month',v_month)::date or v_month>date_trunc('month',now() at time zone 'America/Toronto')::date then raise exception 'Invalid month'; end if;
 select p.user_id into v_user from public.simulator_leaderboard_profiles p where lower(p.display_name)=lower(p_name) and p.opted_in;
 if v_user is null then return; end if;
 return query select c.track,c.slot,
 case when r.completed_at is not null then cardinality(c.task_ids) else coalesce(cardinality(r.validated_tasks),0) end,
 cardinality(c.task_ids),r.completed_at is not null,
 public.simulator_activity_points(c.slot,coalesce(cardinality(r.validated_tasks),0),cardinality(c.task_ids),r.completed_at is not null),
 r.started_at,coalesce(r.completed_at,r.last_activity_at,r.started_at)
 from public.simulator_lab_task_catalog c
 left join public.simulator_competition_runs r on r.track=c.track and r.slot=c.slot and r.user_id=v_user and r.month=v_month
 where c.track<>'cyber' or c.slot>5 or r.id is not null
 order by c.track,c.slot;
end; $$;

create or replace function public.simulator_leaderboard(p_track text default 'all')
returns table(place bigint,display_name text,points bigint,level_one bigint,level_two bigint,level_three bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
 if p_track is null or p_track not in ('all','networking','sysadmin','cyber','cloud','integrated') then
  raise exception 'Unknown discipline';
 end if;
 return query
 with valid as (
  select lp.display_name, split_part(k.key,':',1) as track,
   split_part(k.key,':',2)::integer as slot
  from public.simulator_leaderboard_profiles lp
  join public.simulator_progress sp on sp.user_id=lp.user_id
  cross join lateral jsonb_each(case when jsonb_typeof(sp.progress->'completedLevels')='object'
    then sp.progress->'completedLevels' else '{}'::jsonb end) k
  where lp.opted_in and k.value='true'::jsonb
    and (k.key ~ '^(networking|sysadmin|cyber|cloud|integrated):([1-9]|1[0-5])$' or k.key ~ '^cyber:(1[6-9]|2[0-5])$')
    and (p_track='all' or split_part(k.key,':',1)=p_track)
 ), counts as (
  select v.display_name,
   count(*) filter(where (slot<=5 or slot between 16 and 25)) as l1,
   count(*) filter(where slot between 6 and 10) as l2,
   count(*) filter(where slot between 11 and 15) as l3
  from valid v group by v.display_name
 ), scores as (
  select c.*,c.l1*100+c.l2*200+c.l3*300 as score from counts c
 )
 select rank() over(order by s.score desc,s.l3 desc),s.display_name,s.score,s.l1,s.l2,s.l3
 from scores s order by s.score desc,s.l3 desc,lower(s.display_name) limit 20;
end; $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'simulator_progress_shape_v5'
      and conrelid = 'public.simulator_progress'::regclass
  ) then
    alter table public.simulator_progress add constraint simulator_progress_shape_v5 check (
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
          'networking:1','networking:2','networking:3','networking:4','networking:5','networking:6','networking:7','networking:8','networking:9','networking:10','networking:11','networking:12','networking:13','networking:14','networking:15',
          'sysadmin:1','sysadmin:2','sysadmin:3','sysadmin:4','sysadmin:5','sysadmin:6','sysadmin:7','sysadmin:8','sysadmin:9','sysadmin:10','sysadmin:11','sysadmin:12','sysadmin:13','sysadmin:14','sysadmin:15',
          'cyber:1','cyber:2','cyber:3','cyber:4','cyber:5','cyber:6','cyber:7','cyber:8','cyber:9','cyber:10','cyber:11','cyber:12','cyber:13','cyber:14','cyber:15','cyber:16','cyber:17','cyber:18','cyber:19','cyber:20','cyber:21','cyber:22','cyber:23','cyber:24','cyber:25',
          'cloud:1','cloud:2','cloud:3','cloud:4','cloud:5','cloud:6','cloud:7','cloud:8','cloud:9','cloud:10','cloud:11','cloud:12','cloud:13','cloud:14','cloud:15',
          'integrated:1','integrated:2','integrated:3','integrated:4','integrated:5','integrated:6','integrated:7','integrated:8','integrated:9','integrated:10','integrated:11','integrated:12','integrated:13','integrated:14','integrated:15'
        ] = '{}'::jsonb
        and not jsonb_path_exists(progress, '$.completedLevels.* ? (@.type() != "boolean")')
      ))
    ) not valid;
  end if;
  -- Replace the earlier optional allowlist only after the expanded constraint exists.
  alter table public.simulator_progress drop constraint if exists simulator_progress_shape_v4;
  alter table public.simulator_progress drop constraint if exists simulator_progress_shape;
  alter table public.simulator_progress drop constraint if exists simulator_progress_shape_v2;
  alter table public.simulator_progress drop constraint if exists simulator_progress_shape_v3;
end;
$$;


commit;
