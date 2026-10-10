"""Curriculum regression: existing assignments, saved progress, and new intermediate workflows."""
import unittest
import test_level_two as legacy

class IntermediateLabsTests(unittest.TestCase):
    setUpClass=classmethod(legacy.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(legacy.LevelTwoTests.tearDownClass.__func__)
    setUp=legacy.LevelTwoTests.setUp
    tearDown=legacy.LevelTwoTests.tearDown
    app=legacy.LevelTwoTests.app
    open_tool=legacy.LevelTwoTests.open_tool
    submit=legacy.LevelTwoTests.submit

    def test_catalog_preserves_all_existing_labs_and_completion_keys(self):
        p=self.page
        existing={f'{track}:{n}':True for track in ['networking','sysadmin','cyber','cloud','integrated'] for n in range(1,7)}
        p.evaluate('(completedLevels)=>localStorage.setItem("prempehtech-simulator-progress-v1",JSON.stringify({completedLevels,completed:{},xp:3000}))',existing)
        p.reload();p.locator('#openWorkspaceBtn').click()
        p.locator('[data-project-tier]').select_option('1')
        self.assertEqual(p.locator('[data-project]').count(),25)
        self.assertEqual(p.locator('.workspace-projects small').filter(has_text='Completed').count(),25)
        p.locator('[data-project-tier]').select_option('2')
        self.assertEqual(p.locator('[data-project]').count(),25)
        self.assertEqual(p.locator('.workspace-projects small').filter(has_text='Completed').count(),5)
        p.locator('[data-project-track]').select_option('cloud')
        self.assertEqual(p.locator('[data-project]').count(),5)
        for track in ['networking','sysadmin','cyber','cloud','integrated']:
            for slot in range(1,6):
                p.evaluate('([t,n])=>PrempehDesktopLab.launch(t,n)',[track,slot])
                self.assertIn('Level 1',p.locator('#desktopMissionMeta').inner_text())
                self.assertGreater(len(p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')),0)
        saved=p.evaluate('JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1"))')
        self.assertEqual(saved['completedLevels'],existing)
        self.assertEqual(saved['xp'],3000)

    def test_new_labs_reject_early_checks_wrong_values_and_complete(self):
        p=self.page;p.on('dialog',lambda d:d.accept())
        for track in ['networking','sysadmin','cyber','cloud','integrated']:
            for slot in range(6,11):
                with self.subTest(track=track,slot=slot):
                    self.app('Project Center')
                    p.locator(f'[data-project="{track}"][data-project-level="{slot}"]').click()
                    self.assertIn('Level 2',p.locator('#desktopMissionMeta').inner_text())
                    tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
                    # An unapproved change and a downstream verification must both fail.
                    for t in [tasks[1],next(t for t in tasks if t['type']=='command'),tasks[-1]]:
                        self.submit(t)
                        self.assertFalse(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',t['id']))
                    first=tasks[0];win=self.open_tool(first['app'])
                    win.locator(f'[data-submit-task="{first["id"]}"]').click()
                    self.assertFalse(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',first['id']))
                    for t in tasks:
                        self.submit(t)
                        self.assertTrue(p.evaluate('(id)=>PrempehDesktopLab.getRuntime().taskState[id]',t['id']),t['id'])
                    self.assertTrue(p.locator('#vmComplete').is_visible())
                    self.assertIn('Level 2',p.locator('#vmComplete').inner_text())
                    p.locator('#vmChoose').click();p.locator('#openWorkspaceBtn').click()
        p.reload()
        saved=p.evaluate('JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1"))')
        self.assertEqual(saved['completedLevels'],{f'{t}:{n}':True for t in ['networking','sysadmin','cyber','cloud','integrated'] for n in range(6,11)})
        self.assertEqual(saved['xp'],2500)
        self.assertEqual(p.locator('#completedValue').inner_text(),'25')

    def test_replay_resets_changes_and_does_not_award_duplicate_xp(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="6"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        for t in tasks:self.submit(t)
        p.locator('#vmReplay').click()
        self.assertFalse(any(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState)')))
        win=self.open_tool('powershell');entry=win.locator('form input')
        entry.fill('get-labstate');entry.press('Enter')
        self.assertIn('PENDING: Correct the application record',win.locator('[data-terminal-output]').inner_text())
        for t in tasks:self.submit(t)
        self.assertEqual(p.evaluate('JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1")).xp'),100)

    def test_landing_selects_both_levels_and_all_foundation_assignments(self):
        p=self.page;p.evaluate('PrempehDesktopLab.close()')
        self.assertEqual(p.locator('.level-btn').count(),2)
        p.locator('#foundationAssignment').select_option('5')
        p.locator('#levelJumpBtn').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),5)
        self.assertIn('Level 1',p.locator('#desktopMissionMeta').inner_text())
        p.evaluate('PrempehDesktopLab.close()')
        p.locator('.level-btn[data-level="2"]').click()
        self.assertTrue(p.locator('#foundationPicker').is_visible())
        self.assertEqual(p.locator('#foundationAssignment option').count(),5)
        p.locator('#foundationAssignment').select_option('10')
        p.locator('#levelJumpBtn').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),10)
        self.assertIn('Level 2',p.locator('#desktopMissionMeta').inner_text())

    def test_intermediate_guided_reference_and_mobile_assignment_selection(self):
        p=self.page
        p.locator('[data-project=cloud][data-project-level="10"]').click()
        p.locator('[data-pane=showme]').click()
        self.assertIn('Click the PT Start button',p.locator('[data-guide-pane=showme]').inner_text())
        self.assertFalse(any(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState)')))
        p.evaluate('PrempehDesktopLab.close()')
        p.set_viewport_size({'width':390,'height':844})
        p.locator('.level-btn[data-level="2"]').click()
        for track in ['networking','sysadmin','cyber','cloud','integrated']:
            p.locator(f'.track-tab[data-track="{track}"]').click()
            self.assertEqual(p.locator('#foundationAssignment option').count(),5)
            p.locator('#foundationAssignment').select_option('10')
            self.assertIn('Level 2',p.locator('#assignmentLabel').inner_text())
        self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth'),390)
        p.locator('#levelJumpBtn').click()
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.track'),'integrated')
        self.assertEqual(p.evaluate('PrempehDesktopLab.getRuntime().current.level'),10)

if __name__=='__main__':unittest.main()
