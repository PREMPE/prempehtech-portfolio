"""Saved attempts, incident state, reports, and private player services."""
import unittest
from playwright.sync_api import expect
import test_level_two as f
class LabPlusTests(unittest.TestCase):
    setUpClass=classmethod(f.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(f.LevelTwoTests.tearDownClass.__func__)
    setUp=f.LevelTwoTests.setUp
    tearDown=f.LevelTwoTests.tearDown
    app=f.LevelTwoTests.app
    open_tool=f.LevelTwoTests.open_tool
    submit=f.LevelTwoTests.submit

    def test_reload_restores_configuration_checks_notes_and_windows(self):
        p=self.page
        p.locator('[data-project=networking][data-project-level="2"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        for t in tasks[:2]:self.submit(t)
        p.locator('[data-pane=notes]').click()
        p.locator('[data-guide-pane=notes] textarea').first.fill('Investigated DHCP options')
        win=self.open_tool('dns')
        win.locator('[data-field="n2dns:name"]').fill('draft-name')
        p.evaluate('PrempehLabPlus.save()')
        p.reload();p.locator('#openWorkspaceBtn').click()
        p.locator('[data-project=networking][data-project-level="2"]').click()
        p.get_by_role('button',name='Resume attempt',exact=True).click()
        self.assertTrue(p.evaluate('PrempehDesktopLab.getRuntime().taskState.n2dhcp'))
        self.assertEqual(p.locator('[data-field="n2dns:name"]').input_value(),'draft-name')
        p.locator('[data-pane=notes]').click()
        self.assertEqual(p.locator('[data-guide-pane=notes] textarea').first.input_value(),'Investigated DHCP options')
        self.assertTrue(p.evaluate('PrempehLabEnvironment.evidence().some(e=>e.id==="n2dhcp")'))

    def test_incident_affects_diagnostics_and_restores_without_extra_credit(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="11"]').click()
        p.evaluate('PrempehLabPlus.evidence()')
        d=p.get_by_role('dialog',name='Operations evidence & incident challenges')
        d.get_by_role('button',name='Access switch outage',exact=True).click()
        self.assertIn('DROP: switch offline',d.inner_text())
        self.assertIn('powered off',p.evaluate('PrempehLabEnvironment.block("ping 10.0.0.20")'))
        d.get_by_role('button',name='End challenge / restore configuration').click()
        self.assertNotIn('DROP:',d.inner_text())
        self.assertTrue(p.evaluate('PrempehLabEnvironment.isPowered("switch")'))
        self.assertFalse(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState).some(Boolean)'))

    def test_report_contains_completed_checks_and_mistakes(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="2"]').click()
        tasks=p.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        self.submit(tasks[0]);p.evaluate('PrempehLabPlus.report()')
        d=p.get_by_role('dialog',name='Lab progress report')
        self.assertIn('PASS: '+tasks[0]['title'],d.inner_text())
        self.assertIn('PENDING:',d.inner_text())
        with p.expect_download() as download:d.get_by_role('button',name='Download report').click()
        self.assertEqual(download.value.suggested_filename,'prempehtech-lab-report.txt')

    def test_dashboard_code_and_private_claim_use_scoped_rpcs(self):
        p=self.page
        p.evaluate('''() => {
          window.calls=[];
          PrempehCloud.isGuest=()=>true;PrempehCloud.ensurePlayer=async()=>{};
          PrempehCloud.ownLeaderboardProfile=async()=>({display_name:'Test Learner'});
          PrempehCloud.playerService=async(action,args)=>{calls.push([action,args]);return action==='prizes'?[{month:'2026-09-01',fulfilled:false,claimed:false}]:null};
        }''')
        p.evaluate('PrempehDesktopLab.close()')
        p.get_by_role('button',name='Player dashboard',exact=True).click()
        d=p.get_by_role('dialog',name='Player dashboard')
        d.get_by_role('button',name='Create / replace recovery code').click()
        expect(d.get_by_label('Private recovery code')).to_be_visible()
        self.assertEqual(len(d.get_by_label('Private recovery code').input_value()),64)
        d.get_by_label('Contact email (visible only to the site owner)').fill('winner@example.test')
        d.get_by_role('button',name='Submit private claim').click()
        expect(d.locator('[role=status]')).to_contain_text('Private contact submitted')
        self.assertEqual(p.evaluate('calls.find(c=>c[0]==="claim")[1].p_email'),'winner@example.test')
        self.assertNotIn('winner@example.test',d.inner_text())
