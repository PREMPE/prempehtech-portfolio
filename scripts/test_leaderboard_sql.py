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
 activity=(ROOT/'supabase/monthly-activity.sql').read_text();sql(activity);sql(activity)
 assert sql('select count(*) from public.simulator_lab_task_catalog;')=='75'
 assert sql("set role anon; select count(*) from public.simulator_monthly_activity('Chosen Name');").splitlines()[-1]=='75'
 assert sql("select count(*) from public.simulator_monthly_activity('Player 26');")=='0'
 activity_run=sql("select id from public.simulator_competition_runs where user_id=lpad('1',32,'0')::uuid and month=date '"+month+"' and track='cloud' and slot=1;")
 task_ids=json.loads(sql("select to_json(task_ids) from public.simulator_lab_task_catalog where track='cloud' and slot=1;"))
 task=lambda t:"'"+t.replace("'","''")+"'"
 first=task(task_ids[0]);second=task(task_ids[1])
 assert sql(auth+f"select public.simulator_competition_activity('{activity_run}',array[{first}]);").splitlines()[-1]=='1'
 assert sql(auth+f"select public.simulator_competition_activity('{activity_run}',array[{first}]);").splitlines()[-1]=='1'
 assert sql(auth+f"select public.simulator_competition_activity('{activity_run}',array[{second}]);").splitlines()[-1]=='2'
 sql(auth+f"select public.simulator_competition_activity('{activity_run}',array['invented-task']);",False)
 sql(auth+f"select public.simulator_competition_activity('{activity_run}',array[null]::text[]);",False)
 sql(otherauth+f"select public.simulator_competition_activity('{activity_run}',array[{first}]);",False)
 sql('set role anon;'+f"select public.simulator_competition_activity('{activity_run}',array[{first}]);",False)
 sql('set role authenticated;select * from public.simulator_lab_task_catalog;',False)
 assert sql("select validated||':'||points from public.simulator_monthly_activity('Chosen Name') where track='cloud' and slot=1;")=='2:'+str(200//len(task_ids))
 assert sql("select points from public.simulator_monthly_leaderboard() where display_name='Chosen Name';")==str(300+200//len(task_ids))
 assert sql("select count(*) from public.simulator_monthly_activity('Chosen Name') where completed and validated=total;")=='3'
 assert sql("select count(*) from public.simulator_monthly_activity('Chosen Name') where started_at is null and validated=0;")=='71'
 all_tasks='array['+','.join(task(x) for x in task_ids)+']'
 assert sql(auth+f"select public.simulator_competition_activity('{activity_run}',{all_tasks});").splitlines()[-1]==str(len(task_ids))
 assert sql("select points||':'||completed from public.simulator_monthly_activity('Chosen Name') where track='cloud' and slot=1;")=='100:false'
 assert sql(auth+f"select public.simulator_competition_finish('{activity_run}');").splitlines()[-1]=='100'
 assert sql("select points from public.simulator_monthly_leaderboard() where display_name='Chosen Name';")=='400'
 assert sql(auth+f"select public.simulator_competition_finish('{activity_run}');").splitlines()[-1]=='0'
 assert sql("select public.simulator_activity_points(11,10,11,false);")=='272'
 assert sql("select public.simulator_activity_points(11,11,11,false);")=='300'
 sql(f"update public.simulator_competition_runs set month=(month-interval '1 month')::date where id='{activity_run}';")
 sql(auth+f"select public.simulator_competition_activity('{activity_run}',array[{first}]);",False)
 assert sql("select validated from public.simulator_monthly_activity('Chosen Name') where track='cloud' and slot=1;")=='0'
 sql((ROOT/'supabase/monthly-winner-review.sql').read_text())
 sql('set role anon;'+(ROOT/'supabase/monthly-winner-review.sql').read_text(),False)
 print('Lab activity SQL passed: all 75 labs, unique validated tasks, proportional task points, account isolation, hidden profiles, task allowlist and month boundaries.')
 print('Monthly SQL passed: automatic enrollment, owner-only runs, server timestamps, replay protection, monthly reset, no lifetime import, points/lab-count/time tie breaks, Toronto DST, withdrawal and top 20.')
 print('Leaderboard SQL passed: migration idempotency, top 20, ties, scoring, opt-in privacy, access isolation, unique names and opt-out without progress loss.')
 # Server evidence validation replaces task-ID-only credit without erasing historical scores.
 verified_migration=(ROOT/'supabase/verified-competition.sql').read_text();sql(verified_migration);sql(verified_migration)
 sql("insert into auth.users values(lpad('27',32,'0')::uuid);")
 verifier_auth=auth.replace('000000000001','000000000027')
 verification_run=sql(verifier_auth+"select public.simulator_competition_start('Verifier Test','networking',2);").splitlines()[-1]
 sql(verifier_auth+f"select public.simulator_competition_finish('{verification_run}');",False)
 sql(verifier_auth+f"select public.simulator_competition_activity('{verification_run}',array['n2inspect']);",False)
 sql('set role anon; select * from public.simulator_lab_rules;',False)
 sql('set role authenticated; select * from public.simulator_competition_review;',False)
 def verify_payload(payload,run=verification_run):
  literal=json.dumps(payload).replace("'","''")
  return json.loads(sql(verifier_auth+f"select public.simulator_competition_verify('{run}','{literal}'::jsonb);").splitlines()[-1])
 assert not verify_payload([{'id':'n2dns','values':{'name':'files','address':'10.0.0.20'}}])['accepted']
 assert not verify_payload([{'id':'n2inspect','values':{'fault':'invented'}}])['accepted']
 assert not verify_payload([{'id':'invented'}])['accepted']
 assert not verify_payload([{'id':'n2inspect'},{'id':'n2inspect'}])['accepted']
 assert sql(f"select 'rejected_evidence'=any(flags) from public.simulator_competition_review where run_id='{verification_run}';")=='t'
 sql(otherauth+f"select public.simulator_competition_verify('{verification_run}','[]');",False)
 rules=json.loads(sql("select jsonb_agg(jsonb_build_object('track',track,'slot',slot,'tasks',tasks)) from public.simulator_lab_rules;"))
 for rule_set in rules:
  run=sql(verifier_auth+f"select public.simulator_competition_start('Verifier Test','{rule_set['track']}',{rule_set['slot']});").splitlines()[-1]
  payload=[{'id':t['id'],**({'values':t['expected']} if t['type']=='form' else {'commands':t['required']})} for t in rule_set['tasks']]
  if rule_set['track']=='networking' and rule_set['slot']==2:
   partial=verify_payload(payload[:1],run);assert partial['accepted'] and partial['validated']==1
   bad=json.loads(json.dumps(payload));bad[-1]['commands']=[];assert not verify_payload(bad,run)['accepted']
  result=verify_payload(payload,run);assert result['accepted'],(rule_set,result)
  assert result['validated']==len(payload)
  assert sql(verifier_auth+f"select public.simulator_competition_finish('{run}');").splitlines()[-1]==str(((rule_set['slot']-1)//5+1)*100)
  assert sql(verifier_auth+f"select public.simulator_competition_finish('{run}');").splitlines()[-1]=='0'
 assert sql(f"select 'rapid_completion'=any(flags) from public.simulator_competition_review where run_id='{verification_run}';")=='t'
 sql(f"update public.simulator_competition_review set window_start=clock_timestamp(),window_attempts=60 where run_id='{verification_run}';")
 assert not verify_payload([])['accepted']
 assert sql(f"select 'rate_limit'=any(flags) from public.simulator_competition_review where run_id='{verification_run}';")=='t'
 sql((ROOT/'supabase/competition-review.sql').read_text())
 sql('set role anon;'+(ROOT/'supabase/competition-review.sql').read_text(),False)
 print('Verified competition passed: all 75 rule sets, prerequisite enforcement, missing/wrong evidence rejection, legacy bypass blocked, access isolation, duplicate credit prevention and review flags.')
finally:
 subprocess.run(['docker','rm','-f',name],capture_output=True)
