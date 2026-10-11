"""Test leaderboard access rules in an isolated disposable PostgreSQL container."""
import json,subprocess,time,uuid
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
IMAGE='postgres@sha256:721873c34ceb9f8d8fc265984940dc982404c105f19ad51be9fdc5970a6080ea'
name='prempeh-leaderboard-test-'+uuid.uuid4().hex[:8]
def sql(source,ok=True):
 result=subprocess.run(['docker','exec','-i',name,'psql','-h','127.0.0.1','-U','postgres','-v','ON_ERROR_STOP=1','-At'],input=source,text=True,capture_output=True)
 if ok and result.returncode:raise AssertionError(result.stderr)
 if not ok and not result.returncode:raise AssertionError('Unauthorized operation unexpectedly succeeded')
 return result.stdout.strip()
try:
 subprocess.run(['docker','run','-d','--rm','--name',name,'--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust',IMAGE],check=True,capture_output=True)
 for _ in range(40):
  ready=subprocess.run(['docker','exec',name,'pg_isready','-h','127.0.0.1','-U','postgres'],capture_output=True)
  if ready.returncode==0:break
  time.sleep(.5)
 else:raise AssertionError('Test database did not start')
 sql("create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;")
 sql((ROOT/'supabase/simulator-progress.sql').read_text())
 migration=(ROOT/'supabase/leaderboard.sql').read_text();sql(migration);sql(migration)
 sql("""insert into auth.users select lpad(n::text,32,'0')::uuid from generate_series(1,26) n;
 insert into public.simulator_progress(user_id,progress) select id,'{"completedLevels":{"networking:1":true,"networking:6":true,"networking:11":true,"networking:999":true,"unknown:11":true},"xp":999999}'::jsonb from auth.users;
 insert into public.simulator_leaderboard_profiles select id,'Player '||lpad(row_number() over(order by id)::text,2,'0'),id<>lpad('26',32,'0')::uuid from auth.users;""")
 assert sql("set role anon; select count(*) from public.simulator_leaderboard('all');").splitlines()[-1]=='20'
 assert sql("set role anon; select min(points)||':'||max(points)||':'||max(place) from public.simulator_leaderboard('all');").splitlines()[-1]=='600:600:1'
 assert sql("set role anon; select count(*) from public.simulator_leaderboard('cloud');").splitlines()[-1]=='0'
 sql('set role anon; select * from public.simulator_leaderboard_profiles;',False)
 sql('set role anon; select * from public.simulator_progress;',False)
 sql("set role anon; select public.simulator_leaderboard_profile('Guest',true);",False)
 auth="set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);"
 sql(auth+"select public.simulator_leaderboard_profile('Chosen Name',true);")
 assert sql("select display_name from public.simulator_leaderboard_profiles where user_id='00000000-0000-0000-0000-000000000001';")=='Chosen Name'
 assert sql(auth+"select display_name from public.simulator_my_leaderboard_profile();").splitlines()[-1]=='Chosen Name'
 sql('set role anon; select * from public.simulator_my_leaderboard_profile();',False)
 sql(auth+"select public.simulator_leaderboard_profile('player 02',true);",False)
 sql(auth+"select public.simulator_leaderboard_profile('x@y.example',true);",False)
 sql(auth+"update public.simulator_leaderboard_profiles set display_name='Other Player' where user_id='00000000-0000-0000-0000-000000000002';",False)
 sql(auth+"select public.simulator_leaderboard_profile('',false);")
 assert sql("select count(*) from public.simulator_leaderboard_profiles where user_id='00000000-0000-0000-0000-000000000001';")=='0'
 assert sql("select count(*) from public.simulator_progress where user_id='00000000-0000-0000-0000-000000000001';")=='1'
 sql("set role anon; select * from public.simulator_leaderboard('invalid');",False)
 constraints=(ROOT/'supabase/security-progress-constraints.sql').read_text();sql(constraints);sql(constraints)
 sql("update public.simulator_progress set progress='{\"completedLevels\":{\"networking:15\":true},\"xp\":300}'::jsonb where user_id='00000000-0000-0000-0000-000000000001';")
 sql("update public.simulator_progress set progress='{\"completedLevels\":{\"networking:16\":true},\"xp\":300}'::jsonb where user_id='00000000-0000-0000-0000-000000000001';",False)
 monthly=(ROOT/'supabase/monthly-competition.sql').read_text();sql(monthly);sql(monthly)
 month=sql('select month from public.simulator_competition_status();')
 assert sql("set role anon; select time_zone from public.simulator_competition_status();").splitlines()[-1]=='America/Toronto'
 assert sql("set role anon; select count(*) from public.simulator_monthly_leaderboard();").splitlines()[-1]=='0'
 sql("set role anon; select public.simulator_competition_start('Guest','networking',1);",False)
 sql(auth+"select public.simulator_competition_start('Chosen Name','networking',16);",False)
 run=sql(auth+"select public.simulator_competition_start('Chosen Name','networking',11);").splitlines()[-1]
 assert sql(auth+"select public.simulator_competition_start('Chosen Name','networking',11);").splitlines()[-1]==run
 assert sql("select points from public.simulator_monthly_leaderboard();")=='0'
 otherauth=auth.replace('000000000001','000000000002')
 sql(otherauth+f"select public.simulator_competition_finish('{run}');",False)
 sql(auth+"select public.simulator_competition_finish(gen_random_uuid());",False)
 assert sql(auth+f"select public.simulator_competition_finish('{run}');").splitlines()[-1]=='300'
 assert sql(auth+f"select public.simulator_competition_finish('{run}');").splitlines()[-1]=='0'
 assert sql("select points from public.simulator_monthly_leaderboard();")=='300'
 sql('set role anon; select * from public.simulator_competition_runs;',False)
 sql(auth+"update public.simulator_competition_runs set completed_at=now();",False)
 # No backdated completion or imported lifetime progress; a new month gets a new run.
 sql("update public.simulator_competition_runs set month=(month-interval '1 month')::date;")
 sql(auth+f"select public.simulator_competition_finish('{run}');",False)
 assert sql('select count(*) from public.simulator_monthly_leaderboard();')=='0'
 newrun=sql(auth+"select public.simulator_competition_start('Chosen Name','networking',11);").splitlines()[-1]
 assert newrun!=run
 assert sql("select points from public.simulator_monthly_leaderboard('all',(date '"+month+"'-interval '1 month')::date);")=='300'
 sql(auth+"select public.simulator_leaderboard_profile('',false);")
 sql(auth+f"select public.simulator_competition_finish('{newrun}');",False)
 assert sql('select count(*) from public.simulator_monthly_leaderboard();')=='0'
 sql(auth+"select public.simulator_competition_start('Chosen Name','networking',11);")
 # Equal points: most labs wins, then earliest reached result. Owner fixtures provide deterministic times.
 sql('delete from public.simulator_competition_runs;')
 sql(f"""insert into public.simulator_competition_runs(user_id,month,track,slot,started_at,completed_at)
 select lpad('1',32,'0')::uuid,date '{month}','networking',n,now()-interval '2 hours',now() from generate_series(1,3)n;
 insert into public.simulator_competition_runs(user_id,month,track,slot,started_at,completed_at) values
 (lpad('2',32,'0')::uuid,date '{month}','networking',11,now()-interval '2 hours',now()-interval '1 hour');""")
 assert sql("select display_name||':'||points from public.simulator_monthly_leaderboard() order by place limit 1;")=='Chosen Name:300'
 sql(f"""insert into public.simulator_competition_runs(user_id,month,track,slot,started_at,completed_at)
 select lpad('3',32,'0')::uuid,date '{month}','networking',n,now()-interval '2 hours',now()-interval '30 minutes' from generate_series(1,3)n;""")
 assert sql('select display_name from public.simulator_monthly_leaderboard() order by place limit 1;')=='Player 03'
 sql(f"""insert into public.simulator_competition_runs(user_id,month,track,slot)
 select id,date '{month}','cloud',1 from auth.users on conflict do nothing;""")
 assert sql('set role anon; select count(*) from public.simulator_monthly_leaderboard();').splitlines()[-1]=='20'
 assert sql("select count(*) from public.simulator_monthly_leaderboard('cloud') where points=0;")=='20'
 assert sql("select count(*) from public.simulator_monthly_leaderboard() where display_name='Player 26';")=='0'
 sql("select * from public.simulator_monthly_leaderboard('all','2099-01-01');",False)
 assert sql("select ('2026-11-01 00:00'::timestamp at time zone 'America/Toronto') at time zone 'UTC';")=='2026-11-01 04:00:00'
 assert sql("select ('2026-12-01 00:00'::timestamp at time zone 'America/Toronto') at time zone 'UTC';")=='2026-12-01 05:00:00'
 sql('alter table auth.users add column email text;')
 sql((ROOT/'supabase/monthly-winner-review.sql').read_text())
 sql('set role anon;'+(ROOT/'supabase/monthly-winner-review.sql').read_text(),False)
 print('Monthly SQL passed: automatic enrollment, owner-only runs, server timestamps, replay protection, monthly reset, no lifetime import, points/lab-count/time tie breaks, Toronto DST, withdrawal and top 20.')
 print('Leaderboard SQL passed: migration idempotency, top 20, ties, scoring, opt-in privacy, access isolation, unique names and opt-out without progress loss.')
finally:
 subprocess.run(['docker','rm','-f',name],capture_output=True)
