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
        gate.get_by_role('button',name='Save name and start lab').click()
        self.assertTrue(gate.is_visible())
        gate.locator('[data-cancel]').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),0)
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate.locator('[data-player-name]').fill('Prempeh Learner')
        gate.get_by_role('button',name='Save name and start lab').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),11)
        self.assertEqual(p.evaluate("localStorage.getItem('prempeh-player-name:guest')"),'Prempeh Learner')

    def test_signed_in_username_is_published_only_with_consent(self):
        p=self.page
        p.evaluate("""() => {
          PrempehCloud.playerKey=()=> 'test-account';
          PrempehCloud.isSignedIn=()=>true;
          PrempehCloud.ownLeaderboardProfile=async()=>null;
          window.profileCalls=[];
          PrempehCloud.setLeaderboardProfile=async(name,consent)=>profileCalls.push([name,consent]);
        }""")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate=p.get_by_role('dialog',name='Choose your player name')
        self.assertTrue(gate.is_visible())
        self.assertFalse(gate.locator('[data-player-public]').is_checked())
        gate.locator('[data-player-name]').fill('Network Expert')
        gate.locator('[data-player-public]').check()
        gate.get_by_role('button',name='Save name and start lab').click()
        self.assertEqual(p.evaluate('profileCalls'),[['Network Expert',True]])
        self.assertEqual(p.evaluate("localStorage.getItem('prempeh-player-name:test-account')"),'Network Expert')
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),11)

    def test_late_profile_load_does_not_overwrite_players_choice(self):
        p=self.page
        p.evaluate("""() => {
          PrempehCloud.playerKey=()=> 'test-account';
          PrempehCloud.isSignedIn=()=>true;
          PrempehCloud.ownLeaderboardProfile=()=>new Promise(resolve=>window.resolveProfile=resolve);
        }""")
        p.locator('[data-project=networking][data-project-level="11"]').click()
        gate=p.get_by_role('dialog',name='Choose your player name')
        gate.locator('[data-player-name]').fill('My New Name')
        p.evaluate("resolveProfile({display_name:'Previous Name',opted_in:true})")
        self.assertEqual(gate.locator('[data-player-name]').input_value(),'My New Name')
        self.assertFalse(gate.locator('[data-player-public]').is_checked())

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
        dialog=p.get_by_role('dialog',name='Top 20 practice leaderboard')
        self.assertEqual(dialog.locator('tbody tr').count(),20)
        self.assertEqual(dialog.locator('tbody img').count(),0)
        self.assertIn('600 points',dialog.locator('[data-local]').inner_text())
        self.assertFalse(dialog.locator('[data-consent]').is_checked())

    def test_unavailable_backend_and_name_collision_do_not_publish(self):
        p=self.page;p.evaluate('''() => {
         PrempehCloud.leaderboard=async()=>{throw {code:'PGRST202'}};
         PrempehCloud.isSignedIn=()=>true;
         PrempehCloud.setLeaderboardProfile=async()=>{throw {code:'23505'}};
        }''')
        p.evaluate('PrempehDesktopLab.close()');p.locator('#leaderboardBtn').click()
        dialog=p.get_by_role('dialog',name='Top 20 practice leaderboard')
        self.assertIn('not activated',dialog.locator('[data-status]').inner_text())
        dialog.locator('[data-name]').fill('Taken Name');dialog.locator('[data-consent]').check()
        dialog.get_by_role('button',name='Join / update profile').click()
        self.assertIn('taken',dialog.locator('[data-profile-status]').inner_text())
        self.assertEqual(p.evaluate("localStorage.getItem('prempeh-player-name:guest')"),'Test Learner')

if __name__=='__main__':unittest.main()
