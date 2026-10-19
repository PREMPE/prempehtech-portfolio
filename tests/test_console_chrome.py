"""Exercise desktop preferences and console controls through the rendered UI."""
import unittest
import test_level_two as fixtures

class ConsoleChromeTests(fixtures.LevelTwoTests):
    # Reuse the fixture without rerunning the inherited curriculum tests.
    test_all_five_level_two_labs_require_repairs_and_complete = None
    test_network_lease_does_not_change_until_renewed_and_replay_resets = None

    def test_default_nature_and_saved_choice(self):
        p=self.page
        self.assertEqual(p.locator('#vmDesktop').get_attribute('data-wallpaper'),'nature-alpine-lake')
        self.app('Settings')
        p.locator('select[data-wallpaper]').select_option('nature-forest-canopy')
        p.reload();p.locator('#openWorkspaceBtn').click()
        self.assertEqual(p.locator('#vmDesktop').get_attribute('data-wallpaper'),'nature-forest-canopy')

    def test_form_navigation_refresh_properties_and_validation(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="2"]').click()
        win=self.open_tool('dhcp')
        win.get_by_label('Go to configuration section').select_option('n2dhcp')
        field=win.locator('[data-field="n2dhcp:start"]');field.fill('192.168.20.100')
        self.assertIn('Unvalidated changes',win.locator('[data-console-status]').inner_text())
        field.press('F5')
        self.assertEqual(win.locator('[data-field="n2dhcp:start"]').input_value(),'192.168.20.100')
        row=win.locator('.pt-work tr').nth(1);row.click(button='right')
        dialog=p.get_by_role('dialog',name='Record properties')
        self.assertIn('Address range',dialog.inner_text());dialog.get_by_role('button',name='Close',exact=True).click()
        win.locator('[data-field="n2inspect:fault"]').select_option('Wrong gateway and DNS options')
        win.locator('[data-submit-task="n2inspect"]').click()
        self.assertIn('1 of 2 tasks validated',win.locator('[data-console-status]').inner_text())
        win.get_by_role('button',name='Activity log',exact=True).click()
        log=p.get_by_role('dialog',name='Console activity log')
        self.assertIn('Validated: Diagnose the incorrect scope options',log.inner_text())
        self.assertIn('Editing: Correct the DHCP scope',log.inner_text())
        log.get_by_role('button',name='Close',exact=True).click()

    def test_terminal_refresh_preserves_history_and_menus_work(self):
        p=self.page;p.locator('[data-project=networking][data-project-level="2"]').click()
        win=self.open_tool('cmd');entry=win.locator('form input')
        entry.fill('ipconfig /all');entry.press('Enter')
        before=win.locator('[data-terminal-output]').inner_text()
        entry.press('F5');self.assertEqual(win.locator('[data-terminal-output]').inner_text(),before)
        win.locator('summary').filter(has_text='View').click()
        win.get_by_role('button',name='Maximize / Restore',exact=True).click()
        self.assertIn('maximized',win.get_attribute('class'))
        win.locator('summary').filter(has_text='File').click();win.get_by_role('button',name='Close',exact=True).click()
        self.assertEqual(p.locator('.vm-window[data-app=cmd]').count(),0)

if __name__=='__main__':unittest.main()
