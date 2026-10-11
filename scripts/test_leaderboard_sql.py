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
 print('Leaderboard SQL passed: migration idempotency, top 20, ties, scoring, opt-in privacy, access isolation, unique names and opt-out without progress loss.')
finally:
 subprocess.run(['docker','rm','-f',name],capture_output=True)
