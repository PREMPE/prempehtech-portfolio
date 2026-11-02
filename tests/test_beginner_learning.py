"""Editable examples, feedback, progressive hints, focused validation and private feedback."""
import hashlib,unittest
from playwright.sync_api import expect
import test_cyber_beginners as f
class BeginnerLearningTests(unittest.TestCase):
    setUpClass=classmethod(f.CyberBeginnerTests.setUpClass.__func__)
    tearDownClass=classmethod(f.CyberBeginnerTests.tearDownClass.__func__)
    setUp=f.CyberBeginnerTests.setUp
    tearDown=f.CyberBeginnerTests.tearDown
    app=f.CyberBeginnerTests.app
    open_tool=f.CyberBeginnerTests.open_tool

    def start(self,slot=18):
        self.page.locator(f'[data-project=cyber][data-project-level="{slot}"]').click()
        return self.open_tool('basics')

    def test_editable_crypto_handles_identical_changed_and_hostile_text(self):
        p=self.page;win=self.start();win.locator('.beginner-playground summary').click()
        a=win.get_by_label('Original message');b=win.get_by_label('Edited message')
        payload='<img src=x onerror="window.injected=true">fiction'
        a.fill(payload);b.fill(payload)
        win.get_by_role('button',name='Compare hashes',exact=True).click()
        out=win.locator('[data-playground-output]')
        expect(out).to_contain_text(hashlib.sha256(payload.encode()).hexdigest())
        expect(out).to_contain_text('Fingerprints match')
        b.fill(payload+'!');win.get_by_role('button',name='Compare hashes',exact=True).click()
        expect(out).to_contain_text('Fingerprints differ')
        win.get_by_role('button',name='Encrypt and decrypt both').click()
        expect(out).to_contain_text('Edited recovered: '+payload+'!')
        self.assertEqual(out.locator('img').count(),0)
        self.assertFalse(p.evaluate('Boolean(window.injected)'))
        win.get_by_role('button',name='Sign original and verify both').click()
        expect(out).to_contain_text('Original signature verified: true')
        expect(out).to_contain_text('Edited message verified with original signature: false')
        a.evaluate('(el)=>el.value="x".repeat(513)')
        win.get_by_role('button',name='Compare hashes',exact=True).click()
        expect(out).to_contain_text('1–512 characters')
        self.assertFalse(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState).some(Boolean)'))

    def test_wrong_answer_explains_and_hints_do_not_fill_fields(self):
        p=self.page;win=self.start()
        win.locator('[data-experiment-step="0"]').click()
        expect(win.locator('[data-experiment-output="0"]')).to_contain_text('Trusted SHA-256')
        field=win.locator('[data-field="cb18_1:answer"]');field.select_option('Same length as the file')
        win.locator('[data-submit-task="cb18_1"]').click()
        expect(win.locator('[data-feedback="cb18_1"]')).to_contain_text('regardless of file length')
        hint=win.locator('[data-hint-for="cb18_1"]');out=win.locator('[data-learning-hint="cb18_1"]')
        self.assertEqual(out.inner_text(),'')
        hint.click();self.assertNotIn('Full procedure',out.inner_text())
        hint.click();self.assertIn('SHA-256',out.inner_text())
        hint.click();self.assertIn('Full procedure',out.inner_text())
        self.assertTrue(hint.is_disabled())
        self.assertEqual(field.input_value(),'Same length as the file')
        self.assertFalse(p.evaluate('PrempehDesktopLab.getRuntime().taskState.cb18_1'))

    def test_phone_focus_uses_real_validation_and_returns_to_completion(self):
        p=self.page;p.set_viewport_size({'width':390,'height':844});win=self.start(16)
        win.get_by_role('button',name='Focused learning / phone view').click()
        d=p.get_by_role('dialog',name='Focused learning — Security Fundamentals: Protect a Training File')
        self.assertEqual(d.locator('[data-learning-step]:visible').count(),1)
        self.assertTrue(d.get_by_role('button',name='Next step',exact=True).is_disabled())
        for i,answer in enumerate(['Access denied','Integrity mismatch','File available']):
            d.locator(f'[data-experiment-step="{i}"]').click()
            expect(d.locator(f'[data-experiment-output="{i}"]')).not_to_have_text('Not run yet.')
            d.locator(f'[data-field="cb16_{i+1}:answer"]').select_option(answer)
            d.locator(f'[data-submit-task="cb16_{i+1}"]').click()
            if i<2:d.get_by_role('button',name='Next step',exact=True).click()
        expect(d).not_to_be_visible()
        self.assertTrue(p.locator('#vmComplete').is_visible())
        self.assertEqual(len(p.evaluate('PrempehLabEnvironment.evidence()')),3)
        self.assertEqual(p.locator('#vmWindows .vm-window[data-app=basics]').count(),1)
        self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth'),390)

    def test_capstone_requires_evidence_and_does_not_award_points(self):
        p=self.page;win=self.start();win.get_by_role('button',name='Beginner capstone',exact=True).click()
        d=p.get_by_role('dialog',name='Beginner capstone: protect the project handover')
        expect(d).to_be_visible();self.assertNotIn('Full solution',d.inner_text())
        phishing='URGENT' in d.locator('pre').inner_text()
        select=d.locator('select');select.select_option('Routine training notice' if phishing else 'Suspicious credential request')
        d.get_by_role('button',name='Check decision').click()
        expect(d.locator('[role=status]')).to_contain_text('Not yet')
        select.select_option('Suspicious credential request' if phishing else 'Routine training notice');d.get_by_role('button',name='Check decision').click()
        lines=d.locator('pre').inner_text().splitlines();a=lines[1];b=lines[3]
        d.locator('select').select_option('Accept the matching file' if a==b else 'Reject the changed file');d.get_by_role('button',name='Check decision').click()
        d.locator('select').select_option('Read only');d.get_by_role('button',name='Check decision').click()
        d.locator('select').select_option('Backup B');d.get_by_role('button',name='Restore and verify').click()
        expect(d.locator('[role=status]')).to_contain_text('Not yet')
        d.locator('select').select_option('Backup A');d.get_by_role('button',name='Restore and verify').click()
        expect(d).to_contain_text('Capstone complete')
        self.assertFalse(p.evaluate('Object.values(PrempehDesktopLab.getRuntime().taskState).some(Boolean)'))
        with p.expect_download() as download:d.get_by_role('button',name='Download capstone report').click()
        self.assertEqual(download.value.suggested_filename,'prempehtech-capstone-report.txt')

    def test_feedback_is_explicit_local_download(self):
        p=self.page;win=self.start();win.get_by_role('button',name='Help improve these labs').click()
        d=p.get_by_role('dialog',name='Help improve beginner labs')
        for select,value in zip(d.locator('select').all(),['None','Mixed','Clue']):select.select_option(value)
        d.locator('textarea').first.fill('I hesitated at the checksum comparison.')
        with p.expect_download() as download:d.get_by_role('button',name='Download feedback report').click()
        expect(d.locator('[role=status]')).to_contain_text('Nothing was uploaded or sent')
        self.assertEqual(download.value.suggested_filename,'prempehtech-beginner-feedback.txt')
