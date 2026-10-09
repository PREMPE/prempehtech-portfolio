"""Browser regression tests. Run: python -m unittest discover -s tests -v.
Requires Playwright and Chromium; set PLAYWRIGHT_CHROMIUM_EXECUTABLE for a custom browser.
"""
import functools
import http.server
import os
from pathlib import Path
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

class EnterpriseWorkspaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.pw = sync_playwright().start()
        args = {'headless': True}
        if os.getenv('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):
            args['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
        cls.browser = cls.pw.chromium.launch(**args)
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/simulator/'

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 1440, 'height': 1000})
        self.page = self.context.new_page()
        self.page.set_default_timeout(6000)
        self.errors = []
        self.page.on('pageerror', lambda e: self.errors.append(str(e)))
        # Local UI tests do not exercise account services or transmit progress.
        self.page.route('https://**/*', lambda route: route.abort())
        self.page.goto(self.url)
        self.page.locator('#openWorkspaceBtn').click()

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def app(self, app):
        # Keyboard-accessible Start search is also exercised by every app launch.
        p = self.page
        p.locator('#vmStart').click()
        p.locator('#vmStartMenu input').fill(app)
        p.locator('.workspace-start-apps button').first.click()

    def test_project_center_contains_all_labs_and_filters(self):
        p = self.page
        self.assertEqual(p.locator('[data-project]').count(), 25)
        p.locator('[data-project-track]').select_option('cloud')
        self.assertEqual(p.locator('[data-project]').count(), 5)
        p.locator('[data-project-search]').fill('no matching project')
        self.assertEqual(p.locator('[data-project]').count(), 0)
        self.assertIn('try another', p.locator('[data-project-count]').inner_text())

    def test_files_rename_delete_restore_and_persist(self):
        p = self.page
        self.app('File Explorer')
        p.locator('[data-new-text]').click()
        p.locator('.workspace-dialog input').fill('Incident.txt')
        p.locator('.workspace-dialog button[type=submit]').click()
        p.locator('.workspace-notes').fill('Root cause: incorrect gateway. Repaired and verified.')
        p.locator('[data-utility=notepad] .vm-close').click()
        row = p.locator('.workspace-file-row').filter(has_text='Incident.txt')
        row.locator('[data-rename]').click()
        p.locator('.workspace-dialog input').fill('Resolved.txt')
        p.locator('.workspace-dialog button[type=submit]').click()
        p.locator('.workspace-file-row').filter(has_text='Resolved.txt').locator('[data-delete]').click()
        self.app('Recycle Bin')
        p.locator('[data-restore]').click()
        p.reload()
        p.locator('#openWorkspaceBtn').click()
        self.app('File Explorer')
        p.locator('.workspace-file-row').filter(has_text='Resolved.txt').locator('[data-open]').click()
        self.assertIn('incorrect gateway', p.locator('.workspace-notes').input_value())

    def test_refresh_and_window_controls(self):
        p = self.page
        self.app('Notepad')
        p.locator('.workspace-notes').fill('Keep my unsaved-to-disk session work')
        win = p.locator('[data-utility=notepad]')
        title = win.locator('.vm-titlebar')
        before = win.bounding_box()
        r = title.bounding_box()
        p.mouse.move(r['x']+70,r['y']+12)
        p.mouse.down();p.mouse.move(r['x']+130,r['y']+62);p.mouse.up()
        after = win.bounding_box()
        self.assertGreater(after['x'], before['x'])
        title.focus();title.press('Alt+ArrowRight')
        self.assertIn('workspace-snap-right', win.get_attribute('class'))
        title.press('Alt+ArrowUp')
        self.assertIn('maximized', win.get_attribute('class'))
        self.assertGreater(win.bounding_box()['width'], 1300)
        p.keyboard.press('F5')
        self.assertEqual(p.locator('.workspace-notes').input_value(), 'Keep my unsaved-to-disk session work')
        win.locator('.vm-min').click()
        self.assertFalse(win.is_visible())
        p.locator('[data-workspace-task=notepad]').click()
        self.assertTrue(win.is_visible())

    def test_calculator_lock_and_task_manager(self):
        p = self.page
        self.app('Calculator')
        keys = p.locator('.workspace-keypad')
        for key in ['7', '+', '5', '=']:
            keys.get_by_role('button',name=key,exact=True).click()
        self.assertEqual(p.locator('.workspace-calculator').inner_text(),'12')
        p.get_by_role('button',name='Lock session',exact=True).click()
        self.assertTrue(p.locator('#workspaceLock').is_visible())
        p.get_by_role('button',name='Resume session').click()
        self.assertEqual(p.locator('.workspace-calculator').inner_text(),'12')
        self.app('Task Manager')
        p.locator('.workspace-process').filter(has_text='Calculator').get_by_role('button',name='End task').click()
        self.assertEqual(p.locator('[data-utility=calc]').count(),0)

    def test_all_25_projects_launch_with_correct_tools(self):
        p = self.page
        p.on('dialog',lambda dialog: dialog.accept())
        for track in ['networking','sysadmin','cyber','cloud','integrated']:
            for level in range(1,6):
                with self.subTest(track=track,level=level):
                    self.app('Project Center')
                    p.locator(f'[data-project="{track}"][data-project-level="{level}"]').click()
                    current = p.evaluate('PrempehDesktopLab.getRuntime().current')
                    self.assertEqual((current['track'],current['level']),(track,level))
                    for app in current['data']['apps']:
                        self.assertEqual(p.locator(f'.vm-desktop-icon[data-app="{app}"]').count(),1)

    def test_network_lab_validation_still_completes(self):
        p = self.page
        p.locator('[data-project=networking][data-project-level="1"]').click()
        self.app('Network Connections')
        win = p.locator('.vm-window[data-app=network]')
        win.locator('.vm-max').click()
        p.locator('.ticket-reopen').click()
        self.assertTrue(p.locator('#vmMission').evaluate('(e)=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+30,r.y+80))}'))
        p.locator('[data-task-app=network]').click()
        for key,value in {'ip':'192.168.10.10','mask':'255.255.255.0','gateway':'192.168.10.1','dns':'192.168.10.53'}.items():
            win.locator(f'[data-field="n1cfg:{key}"]').fill(value)
        win.locator('[data-submit-task=n1cfg]').click()
        self.app('Command Prompt')
        inp = p.locator('[data-terminal-form=cmd] input')
        for cmd in ['ping 192.168.10.1','ping 10.0.0.10','nslookup intranet.corp.local']:
            inp.fill(cmd);inp.press('Enter')
        self.assertTrue(p.locator('#vmComplete').is_visible())
        self.assertEqual(p.locator('#completedValue').inner_text(),'1')

    def test_desktop_context_menu_and_calendar(self):
        p = self.page
        p.locator('#vmDesktop').click(button='right', position={'x':1300,'y':180})
        menu = p.locator('#workspaceContext')
        self.assertTrue(menu.is_visible())
        menu.get_by_role('menuitem',name='Refresh',exact=True).click()
        self.assertEqual(p.locator('[data-project]').count(),25)
        self.assertIn('preserved',p.locator('#workspaceStatus').inner_text())
        p.get_by_role('button',name='Open calendar',exact=True).click()
        self.assertEqual(p.locator('.workspace-calendar .today').count(),1)
        p.keyboard.press('Escape')
        self.assertEqual(p.locator('#workspaceTrayPanel').count(),0)

    def test_folders_file_context_menu_and_theme(self):
        p = self.page
        self.app('File Explorer')
        p.locator('[data-new-folder]').click()
        p.locator('.workspace-dialog input').fill('Case records')
        p.locator('.workspace-dialog button[type=submit]').click()
        row = p.locator('.workspace-file-row').filter(has_text='Case records')
        row.click(button='right')
        p.locator('#workspaceContext').get_by_role('menuitem',name='Open',exact=True).click()
        self.assertIn('Case records',p.locator('[data-utility=explorer] .workspace-toolbar').inner_text())
        self.app('Settings')
        p.locator('select[data-wallpaper]').select_option('slate')
        self.assertEqual(p.locator('#vmDesktop').get_attribute('data-wallpaper'),'slate')
        p.reload();p.locator('#openWorkspaceBtn').click()
        self.assertEqual(p.locator('#vmDesktop').get_attribute('data-wallpaper'),'slate')

    def test_all_lab_tools_have_readable_text_contrast(self):
        p = self.page
        p.on('dialog', lambda dialog: dialog.accept())
        # Check rendered text, including evidence tables, controls and terminal panels.
        # These tool surfaces have opaque backgrounds; hidden and disabled controls
        # are excluded. Every cloud service is opened so its forms are included.
        contrast_script = r"""root=>Array.from(root.querySelectorAll('*')).filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility==='visible'&&!e.disabled&&(Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())||e.matches('input,select,textarea'))).flatMap(e=>{
const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number),lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const fg=rgb(getComputedStyle(e).color);let n=e,bg;while(n){bg=rgb(getComputedStyle(n).backgroundColor);if(bg.length===3||bg[3]===1)break;n=n.parentElement;}bg=n?bg:[255,255,255];const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);return ratio<4.5?[{tag:e.tagName,cls:e.className,text:(e.innerText||e.placeholder||e.value||'').slice(0,70),fg,bg,ratio}]:[]})"""
        for track in ('networking', 'sysadmin', 'cyber', 'cloud', 'integrated'):
            for level in range(1, 6):
                self.app('Project Center')
                p.locator(f'[data-project="{track}"][data-project-level="{level}"]').click()
                apps = p.evaluate('PrempehDesktopLab.getRuntime().current.data.apps')
                for app in apps:
                    with self.subTest(track=track, level=level, app=app):
                        name = p.evaluate('(id)=>PrempehDesktopLab.getRuntime().APP_DEFS[id].label', app)
                        self.app(name)
                        win = p.locator(f'.vm-window[data-app="{app}"]')
                        win.locator('.vm-app-body').wait_for()
                        tabs = win.locator('[data-cloud-service]')
                        for tab in range(max(1, tabs.count())):
                            if tabs.count():
                                tabs.nth(tab).click()
                            self.assertEqual(win.evaluate(contrast_script), [], f'{track} {level} {app} tab {tab}')
                        win.locator('.vm-close').click()

    def enterprise_command(self, command):
        self.app('Operations Terminal')
        win = self.page.locator('[data-utility=opsterm]')
        win.locator('[data-net-command]').fill(command)
        win.locator('[data-net-command]').press('Enter')
        return win.locator('[data-output]').inner_text().split('> ' + command)[-1]

    def test_enterprise_network_services_and_link_failures_propagate(self):
        p = self.page
        self.assertIn('HTTP 200', self.enterprise_command('fetch portal.prempeh.lab'))
        self.app('Server Console')
        p.locator('[data-server=directory][data-service=dnsService]').click()
        self.assertIn('DNS unavailable', self.enterprise_command('lookup portal.prempeh.lab'))
        self.assertIn('4 received', self.enterprise_command('ping 10.24.0.30'))
        self.app('Server Console')
        p.locator('[data-server=directory][data-service=dnsService]').click()
        p.locator('[data-server=web][data-service=webService]').click()
        self.assertIn('Connection refused', self.enterprise_command('fetch portal.prempeh.lab'))
        self.app('Network Studio')
        p.locator('.pt-os-device[data-device=switch]').click(button='right')
        p.locator('#ptDeviceMenu').get_by_role('menuitem', name='Power off', exact=True).click()
        self.assertIn('unreachable', self.enterprise_command('ping 10.24.0.30'))
        self.app('Network Studio')
        p.locator('.pt-os-device[data-device=switch]').click(button='right')
        p.locator('#ptDeviceMenu').get_by_role('menuitem', name='Power on', exact=True).click()
        p.locator('[data-disconnect="3"]').click()
        self.assertIn('unreachable', self.enterprise_command('ping 10.24.0.30'))
        self.app('Network Studio')
        p.locator('[data-connect] [name=from]').select_option('switch')
        p.locator('[data-connect] [name=to]').select_option('web')
        p.locator('[data-connect] button').click()
        self.assertIn('4 received', self.enterprise_command('ping 10.24.0.30'))

    def test_enterprise_properties_topology_and_persistence(self):
        p = self.page
        self.app('Network Studio')
        node = p.locator('[data-device=client]')
        before = node.bounding_box()
        p.mouse.move(before['x'] + 30, before['y'] + 20)
        p.mouse.down();p.mouse.move(before['x'] + 55, before['y'] + 20);p.mouse.up()
        self.assertGreater(node.bounding_box()['x'], before['x'])
        before = node.bounding_box()
        node.focus(); node.press('ArrowRight')
        self.assertGreater(node.bounding_box()['x'], before['x'])
        node.dblclick()
        dialog = p.locator('.pt-os-dialog')
        dialog.locator('[name=ip]').fill('10.24.0.30')
        dialog.get_by_role('button', name='Apply changes').click()
        self.assertIn('already in use', dialog.locator('[data-error]').inner_text())
        dialog.locator('[name=ip]').fill('10.24.0.21')
        dialog.locator('[name=dns]').fill('10.24.0.99')
        dialog.get_by_role('button', name='Apply changes').click()
        self.assertIn('DNS unavailable', self.enterprise_command('lookup portal.prempeh.lab'))
        self.app('Network Studio')
        p.locator('[data-kind]').select_option('server')
        p.locator('[data-add]').click()
        self.assertEqual(p.locator('.pt-os-device').count(), 6)
        p.reload();p.locator('#openWorkspaceBtn').click()
        self.app('Network Studio')
        self.assertEqual(p.locator('.pt-os-device').count(), 6)
        self.assertIn('10.24.0.21', p.locator('[data-device=client]').inner_text())
        self.assertIn('10.24.0.99', self.enterprise_command('ipconfig'))

    def test_enterprise_incident_recovery_and_inventory_file(self):
        p = self.page
        p.on('dialog', lambda dialog: dialog.accept())
        self.app('Operations Center')
        center = p.locator('[data-utility=operations]')
        center.locator('[data-incident]').click()
        center.locator('[data-check]').click()
        self.assertIn('incomplete', center.locator('[data-result]').inner_text())
        self.app('Network Studio')
        p.locator('.pt-os-device[data-device=switch]').click(button='right')
        p.locator('#ptDeviceMenu').get_by_role('menuitem', name='Power on', exact=True).click()
        self.app('Server Console')
        p.locator('[data-server=directory][data-service=dnsService]').click()
        p.locator('[data-server=web][data-service=webService]').click()
        self.app('Operations Center')
        center.locator('[data-check]').click()
        self.assertIn('Recovery validated', center.locator('[data-result]').inner_text())
        center.locator('[data-snapshot]').click()
        self.app('File Explorer')
        p.locator('.workspace-file-row').filter(has_text='Documents').locator('[data-open]').click()
        p.locator('.workspace-file-row').filter(has_text='Network inventory.txt').locator('[data-open]').click()
        self.assertIn('PORTAL-01', p.locator('.workspace-notes').input_value())

    def test_enterprise_mobile_tools_and_quick_diagnostics(self):
        p = self.page
        p.set_viewport_size({'width':390,'height':844})
        self.app('Network Studio')
        win = p.locator('[data-utility=netstudio]')
        self.assertLessEqual(win.bounding_box()['width'],390)
        node = win.locator('[data-device=client]')
        node.click()
        win.locator('[data-properties]').click()
        p.locator('.pt-os-dialog').get_by_role('button',name='Cancel',exact=True).click()
        win.locator('[data-net-tab=terminal]').click()
        win.locator('[data-run="fetch portal.prempeh.lab"]').click()
        self.assertIn('HTTP 200', win.locator('[data-output]').inner_text())
        self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth'),390)

    def test_mobile_workspace_fits_and_launches(self):
        p = self.page
        p.set_viewport_size({'width':390,'height':844})
        p.locator('[data-project-track]').select_option('cyber')
        p.locator('[data-project=cyber][data-project-level="1"]').click()
        self.app('Admin Center')
        self.assertEqual(p.locator('[data-admin-tool]').count(),3)
        self.assertLessEqual(p.evaluate('document.documentElement.scrollWidth'),390)

if __name__=='__main__':
    unittest.main()
