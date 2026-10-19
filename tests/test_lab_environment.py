"""Native configuration mistakes, diagnostics, recovery, assessment, and evidence."""
import json
from pathlib import Path
import unittest
import test_level_two as f

class LabEnvironmentTests(unittest.TestCase):
    setUpClass=classmethod(f.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(f.LevelTwoTests.tearDownClass.__func__)
    setUp=f.LevelTwoTests.setUp
    tearDown=f.LevelTwoTests.tearDown
    app=f.LevelTwoTests.app
    open_tool=f.LevelTwoTests.open_tool
    submit=f.LevelTwoTests.submit

    def launch_dns(self):
        self.page.locator('[data-project=networking][data-project-level="2"]').click()
        self.tasks=self.page.evaluate('PrempehDesktopLab.getRuntime().current.data.tasks')
        for t in self.tasks[:2]:self.submit(t)

    def dns_dialog(self):
        win=self.open_tool('dns');win.get_by_role('button',name='New / Edit host (A)…').click()
        return self.page.get_by_role('dialog',name='Host record properties')

    def test_wrong_dns_affects_lookup_and_backup_restores_actual_state(self):
        p=self.page;self.launch_dns();self.submit(self.tasks[2])
        p.locator('[data-lab-environment]').click();environment=p.get_by_role('dialog',name='Lab Environment')
        environment.get_by_role('button',name='Create configuration backup',exact=True).click();environment.get_by_role('button',name='Close',exact=True).click()
        d=self.dns_dialog();d.get_by_label('Host name',exact=True).fill('files');d.get_by_label('IP address',exact=True).fill('10.0.0.99')
        d.get_by_role('button',name='Apply changes',exact=True).click();d.get_by_role('button',name='Close',exact=True).click()
        self.assertFalse(p.evaluate('PrempehDesktopLab.getRuntime().taskState.n2dns'))
        win=self.open_tool('cmd');win.locator('form input').fill('nslookup files.corp.local');win.locator('form input').press('Enter')
        self.assertIn('Address: 10.0.0.99',win.locator('[data-terminal-output]').inner_text())
        p.locator('[data-lab-environment]').click();environment=p.get_by_role('dialog',name='Lab Environment')
        environment.locator('summary').filter(has_text='Create the missing A record').click()
        self.assertIn('10.0.0.99',environment.inner_text())
        environment.get_by_role('button',name='Restore backup',exact=True).click();environment.get_by_role('button',name='Close',exact=True).click()
        self.assertEqual(p.evaluate('PrempehLabEnvironment.configs().n2dns.address'),'10.0.0.20')
        self.assertTrue(p.evaluate('PrempehDesktopLab.getRuntime().taskState.n2dns'))
        for t in self.tasks[3:]:self.submit(t)
        self.assertTrue(p.locator('#vmComplete').is_visible())
        evidence=p.evaluate('PrempehLabEnvironment.evidence()');self.assertEqual(len(evidence),len(self.tasks))
        self.assertEqual(next(e['values']['address'] for e in evidence if e['id']=='n2dns'),'10.0.0.20')

    def test_native_properties_context_menu_and_power_fault(self):
        p=self.page;self.launch_dns();self.app('Lab Environment')
        p.locator('.lab-network-diagram').get_by_role('button',name='Open DNS Manager',exact=True).click()
        win=p.locator('.vm-window[data-app=dns]')
        win.locator('.pt-tree').click(button='right');p.get_by_role('menuitem',name='New host (A): Create the missing A record').click()
        d=p.get_by_role('dialog',name='Host record properties');d.get_by_label('Host name',exact=True).fill('files');d.get_by_label('IP address',exact=True).fill('10.0.0.20')
        d.get_by_role('button',name='Validate configuration',exact=True).click();self.assertIn('Validation passed',d.inner_text());d.get_by_role('button',name='Close',exact=True).click()
        p.locator('[data-lab-environment]').click();environment=p.get_by_role('dialog',name='Lab Environment')
        device=environment.locator('.lab-device').filter(has=p.get_by_role('heading',name='Switch Console',exact=True));device.get_by_role('button',name='Power off',exact=True).click();environment.get_by_role('button',name='Close',exact=True).click()
        win=self.open_tool('cmd');win.locator('form input').fill('ping 10.0.0.20');win.locator('form input').press('Enter')
        self.assertIn('powered off',win.locator('[data-terminal-output]').inner_text())
        self.assertFalse(p.evaluate('PrempehDesktopLab.getRuntime().taskState.n2client'))

    def test_assessment_hides_answers_but_keeps_configuration_and_ticket(self):
        p=self.page;self.launch_dns();p.locator('[data-learning-mode]').select_option('assessment')
        self.assertFalse(p.locator('[data-guide-pane=procedure]').is_visible())
        self.assertFalse(p.locator('[data-pane=showme]').is_visible())
        win=self.open_tool('cmd');self.assertFalse(win.locator('[data-terminal-help]').is_visible())
        self.assertIn('Support VLAN 20',p.locator('#vmMission').inner_text())
        p.locator('[data-learning-mode]').select_option('guided');self.assertTrue(win.locator('[data-terminal-help]').is_visible())

    def test_server_rules_match_all_current_labs(self):
        source=(Path(__file__).resolve().parents[1]/'supabase/verified-competition.sql').read_text()
        rules=json.loads(source.split('$rules$')[1])
        actual=self.page.evaluate('PrempehDesktopLab.getCatalog().map(l=>({track:l.track,slot:l.id,tasks:l.data.tasks.map(t=>({id:t.id,type:t.type,expected:t.expected||{},required:t.required||[],dependencies:t.dependencies||[]}))}))')
        self.assertEqual(rules,actual)

if __name__=='__main__':unittest.main()
