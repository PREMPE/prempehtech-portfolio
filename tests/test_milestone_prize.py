"""Private prize contact and explicit forfeiture use server eligibility, not local XP."""
import unittest
from playwright.sync_api import expect
import test_level_two as f
class MilestonePrizeTests(unittest.TestCase):
    setUpClass=classmethod(f.LevelTwoTests.setUpClass.__func__)
    tearDownClass=classmethod(f.LevelTwoTests.tearDownClass.__func__)
    setUp=f.LevelTwoTests.setUp
    tearDown=f.LevelTwoTests.tearDown
    app=f.LevelTwoTests.app
    def mock(self,points=4000):
        self.page.evaluate('''points=>{
          window.prizeChoices=[];
          PrempehCloud.milestonePublic=async()=>({active:true,month:'2026-11-01',starts_month:'2026-11-01',candidate:null});
          PrempehCloud.milestonePrivate=async()=>({month:'2026-11-01',points,reached:points>=4000,contact_choice:'pending',review_state:'pending'});
          PrempehCloud.milestoneContact=async(choice,email)=>prizeChoices.push({choice,email});
        }''',points)
    def dialog(self):return self.page.get_by_role('dialog',name='4,000-point prize and contact')
    def test_prompt_at_4000_not_3500_and_private_email_consent(self):
        p=self.page;self.mock(3500);p.evaluate('PrempehMilestone.check()')
        expect(self.dialog()).not_to_be_visible()
        p.evaluate('localStorage.setItem("fake-xp","999999")');p.evaluate('PrempehMilestone.check()')
        expect(self.dialog()).not_to_be_visible()
        self.mock();p.evaluate('PrempehMilestone.check()');d=self.dialog();expect(d).to_be_visible()
        d.get_by_label('Private contact email',exact=True).fill('player@example.invalid')
        d.get_by_role('button',name='Save private prize email').click()
        self.assertEqual(p.evaluate('prizeChoices'),[])
        d.locator('input[type=checkbox]').check();d.get_by_role('button',name='Save private prize email').click()
        expect(d.locator('[role=status]')).to_contain_text('private prize email is saved')
        self.assertEqual(p.evaluate('prizeChoices'),[{'choice':'email','email':'player@example.invalid'}])
        self.assertNotIn('player@example.invalid',d.inner_text())
        self.assertNotIn('player@example.invalid',p.evaluate('JSON.stringify(localStorage)'))
    def test_external_email_option_uses_correct_address(self):
        self.mock();self.page.evaluate('PrempehMilestone.open()');d=self.dialog()
        d.get_by_role('button',name='I will email PrempehTech with my screenshot').click()
        link=d.get_by_role('link',name='Open an email to prempehtech.ca@gmail.com')
        expect(link).to_have_attribute('href',__import__('re').compile(r'^mailto:prempehtech\.ca@gmail\.com\?'))
        self.assertEqual(self.page.evaluate('prizeChoices'),[{'choice':'external','email':None}])
        expect(d.locator('[role=status]')).to_contain_text('not a winner confirmation')
    def test_forfeiture_requires_confirmation_and_errors_preserve_choice(self):
        p=self.page;self.mock();p.evaluate('PrempehMilestone.open()');d=self.dialog()
        d.get_by_role('button',name='Decline both options and forfeit the $200 prize').click()
        self.assertEqual(p.evaluate('prizeChoices'),[])
        d.get_by_role('button',name='Keep my eligibility').click()
        self.assertEqual(p.evaluate('prizeChoices'),[])
        d.get_by_role('button',name='Decline both options and forfeit the $200 prize').click()
        d.get_by_role('button',name='Confirm: forfeit this month’s $200 prize').click()
        self.assertEqual(p.evaluate('prizeChoices'),[{'choice':'forfeited','email':None}])
        expect(d.locator('[role=status]')).to_contain_text('has been forfeited')
        d.get_by_role('button',name='Close prize details').click();p.evaluate('PrempehCloud.milestoneContact=async()=>{throw new Error("offline")};PrempehMilestone.open()')
        d.get_by_role('button',name='I will email PrempehTech with my screenshot').click()
        expect(d.locator('[role=status]')).to_contain_text('has not been changed')
        expect(d.get_by_role('button',name='I will email PrempehTech with my screenshot')).to_be_enabled()
    def test_missing_setup_and_forfeited_status_do_not_offer_contact(self):
        p=self.page;self.mock();p.evaluate('PrempehCloud.milestonePublic=async()=>{throw {code:"PGRST202"}};PrempehMilestone.open()')
        d=self.dialog();expect(d.locator('[role=status]')).to_contain_text('awaiting database activation')
        expect(d.locator('input[type=email]')).to_have_count(0)
        d.get_by_role('button',name='Close prize details').click();self.mock()
        p.evaluate('PrempehCloud.milestonePrivate=async()=>({points:4000,reached:true,contact_choice:"forfeited"});PrempehMilestone.open()')
        expect(d).to_contain_text('You forfeited')
        expect(d.locator('input[type=email]')).to_have_count(0)
