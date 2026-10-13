-- Run after monthly-competition.sql. Repeatable; keeps existing monthly scores.
begin;
create table if not exists public.simulator_lab_task_catalog (
 track text not null,slot integer not null,task_ids text[] not null,
 primary key(track,slot),check(cardinality(task_ids)>0)
);
revoke all on public.simulator_lab_task_catalog from public,anon,authenticated;
alter table public.simulator_lab_task_catalog enable row level security;
-- Task IDs from the complete 75-lab catalog, used to reject unrelated task submissions.
insert into public.simulator_lab_task_catalog(track,slot,task_ids)
select track,slot,task_ids from jsonb_to_recordset('
[
{"track": "networking", "slot": 1, "task_ids": ["n1cfg", "n1ping", "n1dns"]},
{"track": "networking", "slot": 2, "task_ids": ["n2inspect", "n2dhcp", "n2dns", "n2lease", "n2client"]},
{"track": "networking", "slot": 3, "task_ids": ["n3switch", "n3router", "n3test"]},
{"track": "networking", "slot": 4, "task_ids": ["n4trace", "n4acl", "n4verify"]},
{"track": "networking", "slot": 5, "task_ids": ["n5route", "n5nat", "n5verify"]},
{"track": "networking", "slot": 6, "task_ids": ["netdiagnose", "netchange", "netdns", "netpolicy", "netresolve", "netpositive", "netnegative", "nethandover"]},
{"track": "networking", "slot": 7, "task_ids": ["networking7diagnose", "networking7plan", "networking7fix0", "networking7fix1", "networking7fix2", "networking7recovery", "networking7boundary", "networking7handover"]},
{"track": "networking", "slot": 8, "task_ids": ["networking8diagnose", "networking8plan", "networking8fix0", "networking8fix1", "networking8fix2", "networking8recovery", "networking8boundary", "networking8handover"]},
{"track": "networking", "slot": 9, "task_ids": ["networking9diagnose", "networking9plan", "networking9fix0", "networking9fix1", "networking9fix2", "networking9recovery", "networking9boundary", "networking9handover"]},
{"track": "networking", "slot": 10, "task_ids": ["networking10diagnose", "networking10plan", "networking10fix0", "networking10fix1", "networking10fix2", "networking10recovery", "networking10boundary", "networking10handover"]},
{"track": "networking", "slot": 11, "task_ids": ["anetworking11scope", "anetworking11plan", "anetworking11repair0", "anetworking11repair1", "anetworking11baseline", "anetworking11fault", "anetworking11repair2", "anetworking11repair3", "anetworking11resilience", "anetworking11boundary", "anetworking11handover"]},
{"track": "networking", "slot": 12, "task_ids": ["anetworking12scope", "anetworking12plan", "anetworking12repair0", "anetworking12repair1", "anetworking12baseline", "anetworking12fault", "anetworking12repair2", "anetworking12repair3", "anetworking12resilience", "anetworking12boundary", "anetworking12handover"]},
{"track": "networking", "slot": 13, "task_ids": ["anetworking13scope", "anetworking13plan", "anetworking13repair0", "anetworking13repair1", "anetworking13baseline", "anetworking13fault", "anetworking13repair2", "anetworking13repair3", "anetworking13resilience", "anetworking13boundary", "anetworking13handover"]},
{"track": "networking", "slot": 14, "task_ids": ["anetworking14scope", "anetworking14plan", "anetworking14repair0", "anetworking14repair1", "anetworking14baseline", "anetworking14fault", "anetworking14repair2", "anetworking14repair3", "anetworking14resilience", "anetworking14boundary", "anetworking14handover"]},
{"track": "networking", "slot": 15, "task_ids": ["anetworking15scope", "anetworking15plan", "anetworking15repair0", "anetworking15repair1", "anetworking15baseline", "anetworking15fault", "anetworking15repair2", "anetworking15repair3", "anetworking15resilience", "anetworking15boundary", "anetworking15handover"]},
{"track": "sysadmin", "slot": 1, "task_ids": ["s1user", "s1group", "s1perm"]},
{"track": "sysadmin", "slot": 2, "task_ids": ["s2event", "s2svc", "s2recovery", "s2verify"]},
{"track": "sysadmin", "slot": 3, "task_ids": ["s3ou", "s3gpo", "s3apply"]},
{"track": "sysadmin", "slot": 4, "task_ids": ["s4event", "s4svc", "s4health"]},
{"track": "sysadmin", "slot": 5, "task_ids": ["s5dns", "s5gpo", "s5verify"]},
{"track": "sysadmin", "slot": 6, "task_ids": ["sysdiagnose", "syschange", "sysacl", "sysidentity", "sysservice", "syspositive", "sysnegative", "syshandover"]},
{"track": "sysadmin", "slot": 7, "task_ids": ["sysadmin7diagnose", "sysadmin7plan", "sysadmin7fix0", "sysadmin7fix1", "sysadmin7fix2", "sysadmin7recovery", "sysadmin7boundary", "sysadmin7handover"]},
{"track": "sysadmin", "slot": 8, "task_ids": ["sysadmin8diagnose", "sysadmin8plan", "sysadmin8fix0", "sysadmin8fix1", "sysadmin8fix2", "sysadmin8recovery", "sysadmin8boundary", "sysadmin8handover"]},
{"track": "sysadmin", "slot": 9, "task_ids": ["sysadmin9diagnose", "sysadmin9plan", "sysadmin9fix0", "sysadmin9fix1", "sysadmin9fix2", "sysadmin9recovery", "sysadmin9boundary", "sysadmin9handover"]},
{"track": "sysadmin", "slot": 10, "task_ids": ["sysadmin10diagnose", "sysadmin10plan", "sysadmin10fix0", "sysadmin10fix1", "sysadmin10fix2", "sysadmin10recovery", "sysadmin10boundary", "sysadmin10handover"]},
{"track": "sysadmin", "slot": 11, "task_ids": ["asysadmin11scope", "asysadmin11plan", "asysadmin11repair0", "asysadmin11repair1", "asysadmin11baseline", "asysadmin11fault", "asysadmin11repair2", "asysadmin11repair3", "asysadmin11resilience", "asysadmin11boundary", "asysadmin11handover"]},
{"track": "sysadmin", "slot": 12, "task_ids": ["asysadmin12scope", "asysadmin12plan", "asysadmin12repair0", "asysadmin12repair1", "asysadmin12baseline", "asysadmin12fault", "asysadmin12repair2", "asysadmin12repair3", "asysadmin12resilience", "asysadmin12boundary", "asysadmin12handover"]},
{"track": "sysadmin", "slot": 13, "task_ids": ["asysadmin13scope", "asysadmin13plan", "asysadmin13repair0", "asysadmin13repair1", "asysadmin13baseline", "asysadmin13fault", "asysadmin13repair2", "asysadmin13repair3", "asysadmin13resilience", "asysadmin13boundary", "asysadmin13handover"]},
{"track": "sysadmin", "slot": 14, "task_ids": ["asysadmin14scope", "asysadmin14plan", "asysadmin14repair0", "asysadmin14repair1", "asysadmin14baseline", "asysadmin14fault", "asysadmin14repair2", "asysadmin14repair3", "asysadmin14resilience", "asysadmin14boundary", "asysadmin14handover"]},
{"track": "sysadmin", "slot": 15, "task_ids": ["asysadmin15scope", "asysadmin15plan", "asysadmin15repair0", "asysadmin15repair1", "asysadmin15baseline", "asysadmin15fault", "asysadmin15repair2", "asysadmin15repair3", "asysadmin15resilience", "asysadmin15boundary", "asysadmin15handover"]},
{"track": "cyber", "slot": 1, "task_ids": ["c1event", "c1class", "c1resp"]},
{"track": "cyber", "slot": 2, "task_ids": ["c2alert", "c2process", "c2evidence", "c2contain", "c2verify"]},
{"track": "cyber", "slot": 3, "task_ids": ["c3fw", "c3acct", "c3audit"]},
{"track": "cyber", "slot": 4, "task_ids": ["c4corr", "c4event", "c4contain"]},
{"track": "cyber", "slot": 5, "task_ids": ["c5scope", "c5tech", "c5contain"]},
{"track": "cyber", "slot": 6, "task_ids": ["irdiagnose", "irevidence", "iridentity", "irisolate", "irblock", "irverify", "irnegative", "irhandover"]},
{"track": "cyber", "slot": 7, "task_ids": ["cyber7diagnose", "cyber7plan", "cyber7fix0", "cyber7fix1", "cyber7fix2", "cyber7recovery", "cyber7boundary", "cyber7handover"]},
{"track": "cyber", "slot": 8, "task_ids": ["cyber8diagnose", "cyber8plan", "cyber8fix0", "cyber8fix1", "cyber8fix2", "cyber8recovery", "cyber8boundary", "cyber8handover"]},
{"track": "cyber", "slot": 9, "task_ids": ["cyber9diagnose", "cyber9plan", "cyber9fix0", "cyber9fix1", "cyber9fix2", "cyber9recovery", "cyber9boundary", "cyber9handover"]},
{"track": "cyber", "slot": 10, "task_ids": ["cyber10diagnose", "cyber10plan", "cyber10fix0", "cyber10fix1", "cyber10fix2", "cyber10recovery", "cyber10boundary", "cyber10handover"]},
{"track": "cyber", "slot": 11, "task_ids": ["acyber11scope", "acyber11plan", "acyber11repair0", "acyber11repair1", "acyber11baseline", "acyber11fault", "acyber11repair2", "acyber11repair3", "acyber11resilience", "acyber11boundary", "acyber11handover"]},
{"track": "cyber", "slot": 12, "task_ids": ["acyber12scope", "acyber12plan", "acyber12repair0", "acyber12repair1", "acyber12baseline", "acyber12fault", "acyber12repair2", "acyber12repair3", "acyber12resilience", "acyber12boundary", "acyber12handover"]},
{"track": "cyber", "slot": 13, "task_ids": ["acyber13scope", "acyber13plan", "acyber13repair0", "acyber13repair1", "acyber13baseline", "acyber13fault", "acyber13repair2", "acyber13repair3", "acyber13resilience", "acyber13boundary", "acyber13handover"]},
{"track": "cyber", "slot": 14, "task_ids": ["acyber14scope", "acyber14plan", "acyber14repair0", "acyber14repair1", "acyber14baseline", "acyber14fault", "acyber14repair2", "acyber14repair3", "acyber14resilience", "acyber14boundary", "acyber14handover"]},
{"track": "cyber", "slot": 15, "task_ids": ["acyber15scope", "acyber15plan", "acyber15repair0", "acyber15repair1", "acyber15baseline", "acyber15fault", "acyber15repair2", "acyber15repair3", "acyber15resilience", "acyber15boundary", "acyber15handover"]},
{"track": "integrated", "slot": 1, "task_ids": ["i1net", "i1access", "i1sec", "cl1vm", "cl1sg", "cl1disk", "cl1verify"]},
{"track": "integrated", "slot": 2, "task_ids": ["i2dhcp", "i2dns", "i2user", "i2share", "i2alert", "cl2inspect", "cl2subnet", "cl2route", "cl2sg", "cl2verify", "i2lease", "i2client", "i2handover"]},
{"track": "integrated", "slot": 3, "task_ids": ["i3vlan", "i3gpo", "i3fw", "cl3role", "cl3public", "cl3storage", "cl3verify"]},
{"track": "integrated", "slot": 4, "task_ids": ["i4svc", "i4restore", "i4soc", "cl4scale", "cl4health", "cl4alarm", "cl4verify"]},
{"track": "integrated", "slot": 5, "task_ids": ["i5route", "i5identity", "i5soc", "cl5restore", "cl5health", "cl5contain", "cl5verify"]},
{"track": "integrated", "slot": 6, "task_ids": ["opsdiagnose", "opsevidence", "opschange", "opsidentity", "opsdns", "opspolicy", "opsservice", "opsbusiness", "opssecurity", "opshandover"]},
{"track": "integrated", "slot": 7, "task_ids": ["integrated7diagnose", "integrated7plan", "integrated7fix0", "integrated7fix1", "integrated7fix2", "integrated7recovery", "integrated7boundary", "integrated7handover"]},
{"track": "integrated", "slot": 8, "task_ids": ["integrated8diagnose", "integrated8plan", "integrated8fix0", "integrated8fix1", "integrated8fix2", "integrated8recovery", "integrated8boundary", "integrated8handover"]},
{"track": "integrated", "slot": 9, "task_ids": ["integrated9diagnose", "integrated9plan", "integrated9fix0", "integrated9fix1", "integrated9fix2", "integrated9recovery", "integrated9boundary", "integrated9handover"]},
{"track": "integrated", "slot": 10, "task_ids": ["integrated10diagnose", "integrated10plan", "integrated10fix0", "integrated10fix1", "integrated10fix2", "integrated10recovery", "integrated10boundary", "integrated10handover"]},
{"track": "integrated", "slot": 11, "task_ids": ["aintegrated11scope", "aintegrated11plan", "aintegrated11repair0", "aintegrated11repair1", "aintegrated11baseline", "aintegrated11fault", "aintegrated11repair2", "aintegrated11repair3", "aintegrated11resilience", "aintegrated11boundary", "aintegrated11handover"]},
{"track": "integrated", "slot": 12, "task_ids": ["aintegrated12scope", "aintegrated12plan", "aintegrated12repair0", "aintegrated12repair1", "aintegrated12baseline", "aintegrated12fault", "aintegrated12repair2", "aintegrated12repair3", "aintegrated12resilience", "aintegrated12boundary", "aintegrated12handover"]},
{"track": "integrated", "slot": 13, "task_ids": ["aintegrated13scope", "aintegrated13plan", "aintegrated13repair0", "aintegrated13repair1", "aintegrated13baseline", "aintegrated13fault", "aintegrated13repair2", "aintegrated13repair3", "aintegrated13resilience", "aintegrated13boundary", "aintegrated13handover"]},
{"track": "integrated", "slot": 14, "task_ids": ["aintegrated14scope", "aintegrated14plan", "aintegrated14repair0", "aintegrated14repair1", "aintegrated14baseline", "aintegrated14fault", "aintegrated14repair2", "aintegrated14repair3", "aintegrated14resilience", "aintegrated14boundary", "aintegrated14handover"]},
{"track": "integrated", "slot": 15, "task_ids": ["aintegrated15scope", "aintegrated15plan", "aintegrated15repair0", "aintegrated15repair1", "aintegrated15baseline", "aintegrated15fault", "aintegrated15repair2", "aintegrated15repair3", "aintegrated15resilience", "aintegrated15boundary", "aintegrated15handover"]},
{"track": "cloud", "slot": 1, "task_ids": ["cl1vm", "cl1sg", "cl1disk", "cl1verify"]},
{"track": "cloud", "slot": 2, "task_ids": ["cl2inspect", "cl2subnet", "cl2route", "cl2sg", "cl2verify"]},
{"track": "cloud", "slot": 3, "task_ids": ["cl3role", "cl3public", "cl3storage", "cl3verify"]},
{"track": "cloud", "slot": 4, "task_ids": ["cl4scale", "cl4health", "cl4alarm", "cl4verify"]},
{"track": "cloud", "slot": 5, "task_ids": ["cl5restore", "cl5health", "cl5contain", "cl5verify"]},
{"track": "cloud", "slot": 6, "task_ids": ["clddiagnose", "cldchange", "cldcapacity", "cldhealth", "cldalarm", "cldverify", "cldnegative", "cldhandover"]},
{"track": "cloud", "slot": 7, "task_ids": ["cloud7diagnose", "cloud7plan", "cloud7fix0", "cloud7fix1", "cloud7fix2", "cloud7recovery", "cloud7boundary", "cloud7handover"]},
{"track": "cloud", "slot": 8, "task_ids": ["cloud8diagnose", "cloud8plan", "cloud8fix0", "cloud8fix1", "cloud8fix2", "cloud8recovery", "cloud8boundary", "cloud8handover"]},
{"track": "cloud", "slot": 9, "task_ids": ["cloud9diagnose", "cloud9plan", "cloud9fix0", "cloud9fix1", "cloud9fix2", "cloud9recovery", "cloud9boundary", "cloud9handover"]},
{"track": "cloud", "slot": 10, "task_ids": ["cloud10diagnose", "cloud10plan", "cloud10fix0", "cloud10fix1", "cloud10fix2", "cloud10recovery", "cloud10boundary", "cloud10handover"]},
{"track": "cloud", "slot": 11, "task_ids": ["acloud11scope", "acloud11plan", "acloud11repair0", "acloud11repair1", "acloud11baseline", "acloud11fault", "acloud11repair2", "acloud11repair3", "acloud11resilience", "acloud11boundary", "acloud11handover"]},
{"track": "cloud", "slot": 12, "task_ids": ["acloud12scope", "acloud12plan", "acloud12repair0", "acloud12repair1", "acloud12baseline", "acloud12fault", "acloud12repair2", "acloud12repair3", "acloud12resilience", "acloud12boundary", "acloud12handover"]},
{"track": "cloud", "slot": 13, "task_ids": ["acloud13scope", "acloud13plan", "acloud13repair0", "acloud13repair1", "acloud13baseline", "acloud13fault", "acloud13repair2", "acloud13repair3", "acloud13resilience", "acloud13boundary", "acloud13handover"]},
{"track": "cloud", "slot": 14, "task_ids": ["acloud14scope", "acloud14plan", "acloud14repair0", "acloud14repair1", "acloud14baseline", "acloud14fault", "acloud14repair2", "acloud14repair3", "acloud14resilience", "acloud14boundary", "acloud14handover"]},
{"track": "cloud", "slot": 15, "task_ids": ["acloud15scope", "acloud15plan", "acloud15repair0", "acloud15repair1", "acloud15baseline", "acloud15fault", "acloud15repair2", "acloud15repair3", "acloud15resilience", "acloud15boundary", "acloud15handover"]}
]
'::jsonb) as x(track text,slot integer,task_ids text[])
on conflict(track,slot) do update set task_ids=excluded.task_ids;
alter table public.simulator_competition_runs add column if not exists validated_tasks text[] not null default '{}';
alter table public.simulator_competition_runs add column if not exists last_activity_at timestamptz;
update public.simulator_competition_runs set last_activity_at=coalesce(completed_at,started_at) where last_activity_at is null;

create or replace function public.simulator_competition_activity(p_run uuid,p_tasks text[])
returns integer language plpgsql security definer set search_path='' as $$
declare r public.simulator_competition_runs; allowed text[]; combined text[]; v_now timestamptz:=clock_timestamp();
begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode='42501'; end if;
 select * into r from public.simulator_competition_runs x where x.id=p_run and x.user_id=auth.uid() for update;
 if not found then raise exception 'Start this lab first' using errcode='42501'; end if;
 if r.month<>date_trunc('month',v_now at time zone 'America/Toronto')::date then
  raise exception 'Month closed' using errcode='22023';
 end if;
 if not exists(select 1 from public.simulator_leaderboard_profiles p where p.user_id=auth.uid() and p.opted_in) then
  raise exception 'Entry withdrawn' using errcode='42501';
 end if;
 select c.task_ids into allowed from public.simulator_lab_task_catalog c where c.track=r.track and c.slot=r.slot;
 if allowed is null or p_tasks is null or cardinality(p_tasks)>cardinality(allowed) or array_position(p_tasks,null) is not null or not p_tasks<@allowed then
  raise exception 'Unknown lab tasks' using errcode='22023';
 end if;
 select array_agg(distinct t order by t) into combined from unnest(r.validated_tasks||p_tasks) t;
 combined:=coalesce(combined,'{}'::text[]);
 -- Replays and repeated validation cannot inflate progress or alter ranking tie times.
 if combined is distinct from r.validated_tasks and r.completed_at is null then
  update public.simulator_competition_runs set validated_tasks=combined,last_activity_at=v_now where id=r.id;
 end if;
 return case when r.completed_at is not null then cardinality(allowed) else cardinality(combined) end;
end; $$;

-- Full lab value is conserved; partial progress cannot exceed the lab maximum.
create or replace function public.simulator_activity_points(p_slot integer,p_validated integer,p_total integer,p_completed boolean)
returns integer language sql immutable set search_path='' as $$
 select case when p_completed then ((p_slot-1)/5+1)*100
 else floor((((p_slot-1)/5+1)*100)::numeric*least(greatest(coalesce(p_validated,0),0),p_total)/greatest(p_total,1))::integer end;
$$;
revoke all on function public.simulator_activity_points(integer,integer,integer,boolean) from public,anon,authenticated;

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
 order by c.track,c.slot;
end; $$;
revoke all on function public.simulator_competition_activity(uuid,text[]) from public,anon;
grant execute on function public.simulator_competition_activity(uuid,text[]) to authenticated;
revoke all on function public.simulator_monthly_activity(text,date) from public;
grant execute on function public.simulator_monthly_activity(text,date) to anon,authenticated;
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
   count(*) filter(where r.completed_at is not null and r.slot<=5) as l1,
   count(*) filter(where r.completed_at is not null and r.slot between 6 and 10) as l2,
   count(*) filter(where r.completed_at is not null and r.slot>=11) as l3,
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
commit;
