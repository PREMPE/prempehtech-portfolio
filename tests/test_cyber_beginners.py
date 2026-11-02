"""Beginner experiments operate through real controls; legacy scores remain separate."""
import json,unittest,hashlib
from pathlib import Path
from playwright.sync_api import expect
import test_walkthrough as f
class CyberBeginnerTests(unittest.TestCase):
    setUpClass=classmethod(f.WalkthroughTests.setUpClass.__func__)
    tearDownClass=classmethod(f.WalkthroughTests.tearDownClass.__func__)
    setUp=f.WalkthroughTests.setUp
    tearDown=f.WalkthroughTests.tearDown
    app=f.WalkthroughTests.app
    open_tool=f.WalkthroughTests.open_tool
    follow=f.WalkthroughTests.follow

    def test_ten_beginner_experiments_complete_from_published_instructions(self):
        p=self.page
        for slot in range(16,26):
            with self.subTest(slot=slot):
                p.locator(f'[data-project=cyber][data-project-level="{slot}"]').click()
                self.follow()
                outputs=p.locator('[data-experiment-output]').all_text_contents()
                if slot==18:
                    self.assertIn(hashlib.sha256(b'Meet at the training room').hexdigest(),outputs[0])
                    self.assertIn(hashlib.sha256(b'Meet at the training room!').hexdigest(),outputs[1])
                if slot==19:
                    self.assertIn('Authentication failed',outputs[1])
                    self.assertIn('Original key decrypted: Meet at the training room',outputs[2])
                if slot==20:self.assertIn('verification: rejected',outputs[1])
                if slot==21:
                    self.assertIn('Correct sample accepted: true',outputs[2])
                    self.assertIn('Incorrect sample accepted: false',outputs[2])
                if slot==22:self.assertIn('Replay accepted: false',outputs[2])
                if slot==25:self.assertIn('Content and hash match: true',outputs[2])
                self.assertEqual(len(p.evaluate('PrempehLabEnvironment.evidence()')),3)
                p.locator('#vmChoose').click();p.locator('#openWorkspaceBtn').click()
        saved=p.evaluate('JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1"))')
        self.assertTrue(all(saved['completedLevels'].get('cyber:'+str(n)) for n in range(16,26)))
        self.assertFalse(any(saved['completedLevels'].get('cyber:'+str(n)) for n in range(1,6)))

    def test_checkpoint_requires_experiment_and_prerequisite(self):
        p=self.page;p.locator('[data-project=cyber][data-project-level="19"]').click()
        win=self.open_tool('basics')
        win.locator('[data-field="cb19_1:answer"]').select_option('Authenticated encryption')
        win.locator('[data-submit-task=cb19_1]').click()
        self.assertIn('Run experiment step 1',win.locator('[data-feedback=cb19_1]').inner_text())
        win.locator('[data-experiment-step="1"]').click()
        self.assertIn('Run experiment step 1 first',win.locator('[data-experiment-output="1"]').inner_text())
        self.assertFalse(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState).some(Boolean)'))

    def test_legacy_cases_are_retained_in_related_incidents(self):
        p=self.page
        expected={6:4,7:1,8:2,9:3,11:5}
        p.evaluate('localStorage.setItem("prempehtech-simulator-progress-v1",JSON.stringify({xp:500,completedLevels:{"cyber:1":true,"cyber:2":true,"cyber:3":true,"cyber:4":true,"cyber:5":true}}))')
        for slot,case in expected.items():
            p.locator(f'[data-project=cyber][data-project-level="{slot}"]').click()
            p.locator(f'[data-cyber-case="{case}"]').click()
            d=p.get_by_role('dialog',name='Integrated case study')
            self.assertIn('Previously completed',d.inner_text())
            tasks=p.evaluate('(id)=>PrempehDesktopLab.getScenario("cyber",id).tasks',case)
            for i,t in enumerate(tasks):
                form=d.locator('form').nth(i)
                if t['type']=='command':
                    for command in t['required']:
                        form.get_by_label('Case command').fill(command)
                        form.get_by_role('button',name='Run case command').click()
                    continue
                form.locator('summary').click()
                for key,label,kind,*rest in t['fields']:
                    field=form.get_by_label(label,exact=True)
                    if kind=='select':field.select_option(t['expected'][key])
                    else:field.fill(t['expected'][key])
                form.get_by_role('button',name='Validate case step').click()
            self.assertIn('Case study complete',d.inner_text())
            d.get_by_role('button',name='Return to current lab').click()
            self.assertFalse(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState).some(Boolean)'))
            p.evaluate('PrempehDesktopLab.close()');p.locator('#openWorkspaceBtn').click()
        self.assertEqual(p.evaluate('JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1")).xp'),500)

    def test_catalog_and_rules_only_expand_cybersecurity(self):
        p=self.page
        self.assertEqual(p.evaluate('PrempehDesktopLab.getCatalog().length'),80)
        self.assertEqual(p.evaluate('PrempehDesktopLab.getCatalog(true).length'),85)
        self.assertEqual(p.evaluate('PrempehDesktopLab.getCatalog().filter(l=>l.track==="cyber"&&l.level===1).length'),10)
        for track in ['networking','sysadmin','cloud','integrated']:
            self.assertEqual(p.evaluate('(t)=>PrempehDesktopLab.getCatalog().filter(l=>l.track===t).length',track),15)
        source=(Path(__file__).resolve().parents[1]/'supabase/cybersecurity-beginners.sql').read_text()
        rules=json.loads(source.split('$cyberrules$')[1])
        actual=p.evaluate('PrempehDesktopLab.getCatalog().filter(l=>l.track==="cyber"&&l.id>=16).map(l=>({track:l.track,slot:l.id,tasks:l.data.tasks.map(t=>({id:t.id,type:t.type,expected:t.expected||{},required:t.required||[],dependencies:t.dependencies||[]}))}))')
        self.assertEqual(rules,actual)
