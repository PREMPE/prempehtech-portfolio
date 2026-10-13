"""Monthly activity across every lab, task deduplication and public per-lab display."""
import json
from pathlib import Path
import unittest
import test_level_two as fixtures

class LabActivityTests(unittest.TestCase):
    setUpClass=classmethod(fixtures.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(fixtures.LevelTwoTests.tearDownClass.__func__)
    setUp=fixtures.LevelTwoTests.setUp
    tearDown=fixtures.LevelTwoTests.tearDown
    app=fixtures.LevelTwoTests.app
    open_tool=fixtures.LevelTwoTests.open_tool
    submit=fixtures.LevelTwoTests.submit

    def test_database_task_allowlist_covers_every_current_lab(self):
        source=(Path(__file__).resolve().parents[1]/'supabase/monthly-activity.sql').read_text()
        catalog=json.loads(source.split("jsonb_to_recordset('",1)[1].split("'::jsonb)",1)[0])
        actual=self.page.evaluate('PrempehDesktopLab.getCatalog().map(x=>({track:x.track,slot:x.id,task_ids:x.data.tasks.map(t=>t.id)}))')
        self.assertEqual(catalog,actual)
        self.assertEqual(len(catalog),75)

    def test_actual_validation_sends_activity_and_replay_does_not_inflate_queue(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="11"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        p.evaluate("() => {window.activityCalls=[];PrempehCloud.recordLabActivity=async(run,tasks)=>{activityCalls.push({run,tasks});document.body.dataset.activityCalls=activityCalls.length;return tasks.length}}")
        self.submit(tasks[0])
        p.locator('body[data-activity-calls="1"]').wait_for()
        self.assertEqual(p.evaluate('activityCalls[0].tasks'),[tasks[0]['id']])
        p.evaluate("tasks=>window.dispatchEvent(new CustomEvent('prempeh-desktop-activity',{detail:{track:'networking',level:11,tasks}}))",[tasks[0]['id']])
        self.submit(tasks[1])
        p.locator('body[data-activity-calls="2"]').wait_for()
        self.assertEqual(set(p.evaluate('activityCalls[1].tasks')),{tasks[0]['id'],tasks[1]['id']})
        self.assertFalse(p.locator('#vmComplete').is_visible())

    def test_public_activity_lists_all_labs_and_filters_disciplines(self):
        p=self.page
        p.evaluate("""() => {
          PrempehCloud.leaderboard=async()=>[{place:1,display_name:'Learner',points:100,level_one:1,level_two:0,level_three:0}];
          PrempehCloud.labActivity=async()=>PrempehDesktopLab.getCatalog().map((x,i)=>({track:x.track,slot:x.id,validated:i===0?x.data.tasks.length:i===1?1:0,total:x.data.tasks.length,completed:i===0,points:i===0?100:i===1?20:0,started_at:i<2?'2026-10-10T10:00:00Z':null}));
          PrempehLeaderboard.open();
        }""")
        p.get_by_role('button',name='View lab activity for Learner').click()
        self.assertEqual(p.locator('[data-activity-rows] tr').count(),75)
        self.assertIn('2 started · 1 completed',p.locator('[data-activity-status]').inner_text())
        self.assertIn('In progress',p.locator('[data-activity-rows]').inner_text())
        self.assertIn('20',p.locator('[data-activity-rows] tr').nth(1).inner_text())
        self.assertIn('Points accrue as tasks are validated',p.locator('[data-activity-status]').inner_text())
        p.locator('select[data-track]').select_option('cloud')
        p.get_by_role('button',name='View lab activity for Learner').click()
        self.assertEqual(p.locator('[data-activity-rows] tr').count(),15)

    def test_failed_activity_sync_is_retained_and_retried(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="11"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        p.evaluate("() => {PrempehCloud.recordLabActivity=async()=>{throw new Error('offline')}}")
        self.submit(tasks[0])
        p.wait_for_function("Object.keys(JSON.parse(localStorage.getItem('prempeh-monthly-activity-pending:guest')||'{}')).length===1")
        p.evaluate("() => {PrempehCloud.recordLabActivity=async()=>1;PrempehCloud.leaderboard=async()=>[];PrempehLeaderboard.open()}")
        p.wait_for_function("Object.keys(JSON.parse(localStorage.getItem('prempeh-monthly-activity-pending:guest'))).length===0")

if __name__=='__main__':unittest.main()
