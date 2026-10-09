"""Level 2 acceptance tests: fail before repair, complete through the actual UI."""
import unittest
import test_enterprise_workspace as fixtures

class LevelTwoTests(unittest.TestCase):
    setUpClass=classmethod(fixtures.EnterpriseWorkspaceTests.setUpClass.__func__)
    tearDownClass=classmethod(fixtures.EnterpriseWorkspaceTests.tearDownClass.__func__)
    setUp=fixtures.EnterpriseWorkspaceTests.setUp
    tearDown=fixtures.EnterpriseWorkspaceTests.tearDown
    app=fixtures.EnterpriseWorkspaceTests.app

    def open_tool(self,app):
        name=self.page.evaluate('(id)=>PrempehDesktopLab.getRuntime().APP_DEFS[id].label',app)
        self.app(name)
        return self.page.locator(f'.vm-window[data-app="{app}"]')

    def submit(self,t):
        win=self.open_tool(t['app'])
        if t['type']=='command':
            for command in t['required']:
                entry=win.locator('form input');entry.fill(command);entry.press('Enter')
        else:
            if t.get('service'):win.locator(f'[data-cloud-service="{t["service"]}"]').click()
            for key,value in t['expected'].items():
                field=win.locator(f'[data-field="{t["id"]}:{key}"]')
                if field.evaluate('(e)=>e.tagName')=='SELECT':field.select_option(value)
                else:field.fill(value)
            win.locator(f'[data-submit-task="{t["id"]}"]').click()

    def test_all_five_level_two_labs_require_repairs_and_complete(self):
        p=self.page;p.on('dialog',lambda d:d.accept())
        for track in ['networking','sysadmin','cyber','cloud','integrated']:
            with self.subTest(track=track):
                self.app('Project Center')
                p.locator(f'[data-project="{track}"][data-project-level="2"]').click()
                tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
                verification=next(t for t in tasks if t['type']=='command')
                self.submit(verification)
                self.assertFalse(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',verification['id']))
                for t in tasks:
                    self.submit(t)
                    self.assertTrue(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',t['id']), {'task':t['id'],'feedback':p.locator(f'[data-feedback="{t["id"]}"]').all_text_contents()})
                self.assertTrue(p.locator('#vmComplete').is_visible())
                # Close completion UI before using Start to switch projects.
                p.locator('#vmChoose').click()
                p.locator('#openWorkspaceBtn').click()
        saved=p.evaluate('JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1"))')
        self.assertEqual(sum(bool(saved['completedLevels'].get(t+':2')) for t in ['networking','sysadmin','cyber','cloud','integrated']),5)

    def test_network_lease_does_not_change_until_renewed_and_replay_resets(self):
        p=self.page
        p.locator('[data-project=networking][data-project-level="2"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        # Correct configuration entered out of order cannot bypass diagnosis.
        self.submit(next(t for t in tasks if t['id']=='n2dhcp'))
        self.assertFalse(p.evaluate('PrempehDesktopLab.getRuntime().taskState.n2dhcp'))
        for t in tasks:
            if t['id'] in ['n2inspect','n2dhcp','n2dns']:self.submit(t)
        win=self.open_tool('cmd');entry=win.locator('form input')
        entry.fill('ipconfig /all');entry.press('Enter')
        self.assertIn('169.254.22.41',win.locator('[data-terminal-output]').inner_text())
        self.submit(next(t for t in tasks if t['id']=='n2lease'))
        entry.fill('ipconfig /all');entry.press('Enter')
        output=win.locator('[data-terminal-output]').inner_text().split('ipconfig /all')[-1]
        self.assertIn('192.168.20.114',output)
        self.submit(next(t for t in tasks if t['id']=='n2client'))
        p.locator('#vmReplay').click()
        self.assertFalse(any(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState)')))
        win=self.open_tool('cmd');entry=win.locator('form input');entry.fill('ipconfig /all');entry.press('Enter')
        self.assertIn('169.254.22.41',win.locator('[data-terminal-output]').inner_text())

if __name__=='__main__':unittest.main()
