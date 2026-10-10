"""Follow the actual published walkthrough data through real controls, without bypassing validation."""
import unittest
import test_level_two as fixtures

class WalkthroughTests(unittest.TestCase):
    setUpClass=classmethod(fixtures.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(fixtures.LevelTwoTests.tearDownClass.__func__)
    setUp=fixtures.LevelTwoTests.setUp
    tearDown=fixtures.LevelTwoTests.tearDown
    app=fixtures.LevelTwoTests.app
    open_tool=fixtures.LevelTwoTests.open_tool

    def follow(self):
        p=self.page
        steps=p.evaluate('PrempehWalkthrough.steps()')
        win=None
        for s in steps:
            action=s.get('action')
            if action=='open':win=self.open_tool(s['app'])
            elif action=='service':win.locator(f'[data-cloud-service="{s["service"]}"]').click()
            elif action=='field':
                field=win.locator(f'[data-field="{s["taskId"]}:{s["key"]}"]')
                if s['fieldType']=='select':field.select_option(s['value'])
                else:field.fill(s['value'])
            elif action=='apply':
                win.locator(f'[data-submit-task="{s["taskId"]}"]').click()
                self.assertTrue(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',s['taskId']),s)
            elif action=='command':
                entry=win.locator('form input');entry.fill(s['command']);entry.press('Enter')
                output=win.locator('[data-terminal-output]').inner_text().split(s['command'])[-1]
                self.assertNotIn('did not recognize',output,s)
            elif action=='verify':self.assertTrue(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',s['taskId']),s)
        self.assertTrue(p.locator('#vmComplete').is_visible())

    def test_all_50_projects_complete_by_following_the_walkthrough(self):
        p=self.page
        for track in ['networking','sysadmin','cyber','cloud','integrated']:
            for slot in range(1,11):
                with self.subTest(track=track,slot=slot):
                    p.locator(f'[data-project="{track}"][data-project-level="{slot}"]').click()
                    self.follow()
                    p.locator('#vmChoose').click();p.locator('#openWorkspaceBtn').click()

    def test_vlan_walkthrough_and_show_control_do_not_skip_learning(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="3"]').click()
        p.locator('.vm-desktop-icon[data-app=switch]').click(button='right')
        p.locator('#workspaceContext').get_by_role('menuitem',name='Open',exact=True).click()
        self.assertTrue(p.locator('.vm-window[data-app=switch]').is_visible())
        p.locator('.vm-window[data-app=switch] .vm-close').click()
        steps=p.evaluate('PrempehWalkthrough.steps()')
        commands=[s['command'] for s in steps if s.get('action')=='command']
        self.assertIn('name users',commands);self.assertIn('name servers',commands)
        self.assertLess(commands.index('interface gi0/24'),commands.index('switchport mode trunk'))
        self.assertIn('switchport trunk allowed vlan 10,20',commands)
        p.locator('[data-coach-next]').click();p.locator('[data-coach-next]').click()
        p.locator('[data-coach-show]').click()
        self.assertTrue(p.locator('.vm-window[data-app=switch]').is_visible())
        self.assertFalse(any(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState)')))
        # Demonstration locates a field; it does not fill in the answer.
        index=next(i for i,s in enumerate(steps) if s.get('key')=='users')
        p.evaluate('(i)=>PrempehWalkthrough.show(i)',index)
        field=p.locator('[data-field="n3router:users"]')
        self.assertTrue(field.evaluate('(e)=>document.activeElement===e'))
        self.assertEqual(field.input_value(),'')
        self.follow()
        p.locator('#vmReplay').click()
        self.assertIn('CURRENT STEP 1',p.locator('[data-guide-pane=procedure]').inner_text())

if __name__=='__main__':unittest.main()
