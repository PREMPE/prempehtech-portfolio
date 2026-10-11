import unittest
import test_level_two as fixtures

class AdvancedLeaderboardTests(unittest.TestCase):
    setUpClass=classmethod(fixtures.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(fixtures.LevelTwoTests.tearDownClass.__func__)
    setUp=fixtures.LevelTwoTests.setUp
    tearDown=fixtures.LevelTwoTests.tearDown
    app=fixtures.LevelTwoTests.app
    open_tool=fixtures.LevelTwoTests.open_tool
    submit=fixtures.LevelTwoTests.submit

    def test_username_required_before_lab_and_cancel_is_safe(self):
        p=self.page;p.evaluate("localStorage.removeItem('prempeh-player-name:guest')")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate=p.get_by_role('dialog',name='Choose your player name')
        self.assertTrue(gate.is_visible())
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),0)
        gate.locator('[data-player-name]').fill('a@b.com')
        gate.get_by_role('button',name='Enroll and start lab').click()
        self.assertTrue(gate.is_visible())
        gate.locator('[data-cancel]').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),0)
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate.locator('[data-player-name]').fill('Prempeh Learner')
        gate.get_by_role('button',name='Enroll and start lab').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),11)
        self.assertEqual(p.evaluate("localStorage.getItem('prempeh-player-name:guest')"),'Prempeh Learner')

    def test_start_automatically_enrolls_under_username(self):
        p=self.page
        p.evaluate("""() => {
          PrempehCloud.playerKey=()=> 'test-account';
          window.entryCalls=[];
          PrempehCloud.startCompetition=async(name,track,slot)=>{entryCalls.push([name,track,slot]);return 'run-123'};
        }""")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate=p.get_by_role('dialog',name='Choose your player name')
        self.assertTrue(gate.is_visible())
        self.assertEqual(gate.locator('input[type=checkbox]').count(),0)
        gate.locator('[data-player-name]').fill('Network Expert')
        gate.get_by_role('button',name='Enroll and start lab').click()
        self.assertEqual(p.evaluate('entryCalls'),[['Network Expert','networking',11]])
        self.assertEqual(p.evaluate("localStorage.getItem('prempeh-player-name:test-account')"),'Network Expert')
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),11)

    def test_sign_in_required_when_competition_is_available(self):
        p=self.page;p.evaluate("PrempehCloud.isSignedIn=()=>false")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate=p.get_by_role('dialog',name='Choose your player name')
        self.assertTrue(gate.is_visible())
        self.assertIn('Sign in',gate.locator('[data-player-status]').inner_text())
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),0)
        self.assertTrue(gate.locator('[data-practice-only]').is_hidden())

    def test_unavailable_competition_requires_explicit_unranked_practice(self):
        p=self.page;p.evaluate("() => {PrempehCloud.competitionStatus=async()=>{throw {code:'PGRST202'}}}")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate=p.get_by_role('dialog',name='Choose your player name')
        self.assertIn('not activated',gate.locator('[data-player-status]').inner_text())
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),0)
        gate.locator('[data-practice-only]').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),11)

    def test_completion_retries_failed_monthly_write_without_duplicate_queue(self):
        p=self.page
        p.evaluate("() => {PrempehCloud.finishCompetition=async()=>{throw new Error('offline')}}")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        p.evaluate("window.dispatchEvent(new CustomEvent('prempeh-desktop-complete',{detail:{track:'networking',level:11}}))")
        self.assertEqual(p.evaluate("JSON.parse(localStorage.getItem('prempeh-monthly-pending:guest'))"),['test-networking-11'])
        p.evaluate("window.dispatchEvent(new CustomEvent('prempeh-desktop-complete',{detail:{track:'networking',level:11}}))")
        self.assertEqual(p.evaluate("JSON.parse(localStorage.getItem('prempeh-monthly-pending:guest')).length"),1)
        p.evaluate("PrempehCloud.finishCompetition=async()=>1; PrempehCloud.leaderboard=async()=>[]; PrempehLeaderboard.open()")
        p.wait_for_function("JSON.parse(localStorage.getItem('prempeh-monthly-pending:guest')).length===0")

    def test_canceled_enrollment_response_does_not_launch_lab(self):
        p=self.page
        p.evaluate("() => {PrempehCloud.startCompetition=()=>new Promise(resolve=>window.finishEntry=resolve)}")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        p.locator('[data-cancel]').click()
        p.evaluate("finishEntry('late-entry')")
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),0)

    def test_closed_month_retry_does_not_block_current_month_result(self):
        p=self.page
        p.evaluate("""() => {
          localStorage.setItem('prempeh-monthly-pending:guest',JSON.stringify(['expired-entry','new-entry']));
          window.savedEntries=[];
          PrempehCloud.finishCompetition=async id=>{if(id==='expired-entry')throw {code:'22023'};savedEntries.push(id);return 100};
          PrempehCloud.leaderboard=async()=>[];
          PrempehLeaderboard.open();
        }""")
        p.wait_for_function("JSON.parse(localStorage.getItem('prempeh-monthly-pending:guest')).length===0")
        self.assertEqual(p.evaluate('savedEntries'),['new-entry'])
        self.assertIn('closed month expired',p.locator('[data-profile-status]').inner_text())

    def test_advanced_failure_and_recovery_state(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="11"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        def state():
            win=self.open_tool('powershell');entry=win.locator('form input');entry.fill('get-advanced-state');entry.press('Enter')
            return win.locator('[data-terminal-output]').inner_text().split('get-advanced-state')[-1]
        self.assertIn('DEGRADED',state())
        self.submit(tasks[8]);self.assertFalse(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',tasks[8]['id']))
        for t in tasks[:5]:self.submit(t)
        self.assertIn('RESTORED',state())
        self.submit(tasks[5]);self.assertIn('DISRUPTED',state())
        self.submit(tasks[8]);self.assertFalse(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',tasks[8]['id']))
        for t in tasks[6:10]:self.submit(t)
        self.assertIn('RECOVERED',state())
        self.submit(tasks[-1]);self.assertTrue(p.locator('#vmComplete').is_visible())

    def test_leaderboard_top_20_escaped_names_and_weighted_progress(self):
        p=self.page
        p.evaluate('''() => {
          localStorage.setItem('prempehtech-simulator-progress-v1',JSON.stringify({completedLevels:{'networking:1':true,'cloud:6':true,'cyber:11':true},xp:999999}));
          PrempehCloud.leaderboard=async()=>Array.from({length:25},(_,i)=>({place:i+1,display_name:i===0?'<img src=x onerror=alert(1)>':'Player '+i,points:300,level_one:0,level_two:0,level_three:1}));
        }''')
        p.evaluate('PrempehDesktopLab.close()');p.locator('#leaderboardBtn').click()
        dialog=p.get_by_role('dialog',name='Top 20 monthly leaderboard')
        self.assertEqual(dialog.locator('tbody tr').count(),20)
        self.assertEqual(dialog.locator('tbody img').count(),0)
        self.assertIn('600 lifetime practice points',dialog.locator('[data-local]').inner_text())
        self.assertIn('Equal points are ordered by most labs completed',dialog.text_content())

    def test_unavailable_backend_and_name_collision_do_not_publish(self):
        p=self.page;p.evaluate('''() => {
         PrempehCloud.leaderboard=async()=>{throw {code:'PGRST202'}};
         PrempehCloud.isSignedIn=()=>true;
         PrempehCloud.setLeaderboardProfile=async()=>{throw {code:'23505'}};
        }''')
        p.evaluate('PrempehDesktopLab.close()');p.locator('#leaderboardBtn').click()
        dialog=p.get_by_role('dialog',name='Top 20 monthly leaderboard')
        self.assertIn('not activated',dialog.locator('[data-status]').inner_text())
        dialog.locator('[data-name]').fill('Taken Name')
        dialog.get_by_role('button',name='Update public username').click()
        self.assertIn('taken',dialog.locator('[data-profile-status]').inner_text())
        self.assertEqual(p.evaluate("localStorage.getItem('prempeh-player-name:guest')"),'Test Learner')

if __name__=='__main__':unittest.main()
