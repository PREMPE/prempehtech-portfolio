# Enterprise desktop

Open **Enterprise Desktop** on the simulator page. The desktop opens in a viewport-sized workspace; **Windowed Workspace** returns it to the page. Existing lab cards continue to work.

## Applications

- **Project Center:** searches and filters all 25 labs, shows completion, and launches the appropriate tools. Switching from an unfinished lab asks before resetting its configuration.
- **Admin Center:** lists the current lab's validation tasks, their status, and links to the tools that own them. Refresh status after making changes.
- **File Explorer:** folders, text documents, rename, delete, parent navigation, and file context menus. Files are virtual, stored in this browser.
- **Notepad:** automatically saves Operations notes or an opened virtual text document; Download exports a real text file.
- **Recycle Bin:** restores deleted virtual files and folders, with name-conflict checks.
- **Company Portal:** links to projects, notes, the portfolio, and learning resources.
- **Task Manager:** lists actual open simulator windows and closes selected applications.
- **Settings:** saved wallpaper/icon preferences and launchers for the active assignment's administrative tools.
- **Calculator:** arithmetic, percent, sign change, clear, and division-by-zero handling.
- **System Information:** workspace details and keyboard shortcuts.

Existing network, directory, service, security and cloud applications retain their lab state and validation. Opening tools from Start or Admin Center uses the same application instances as desktop icons.

## Desktop behavior

Right-click the desktop or a file for contextual actions. Desktop Refresh and F5 preserve windows and lab work. Windows support repeated pointer dragging, resizing on desktop, minimize/restore via the taskbar, maximize, and keyboard snapping. Double-click a title bar to maximize/restore.

The tray provides task view, notifications, a calendar, show-desktop/restore, and lock. Start provides app search, lock, restart, and exit. A training lock hides the work area without discarding state; it is not device security. Restart resets in-progress lab configuration after confirmation; saved files, preferences and completed progress remain.

Keyboard shortcuts:

- Ctrl+Alt+P: Project Center
- Ctrl+Alt+T: Task view
- Ctrl+Alt+L: Lock session
- F5 inside the desktop: Refresh
- Alt+Left/Right on a title bar: Snap window
- Alt+Up/Down on a title bar: Maximize/restore
- Shift+F10 or the menu key on the desktop: Context menu
- Arrow keys in a context menu: Move through actions
- Escape: Dismiss context/tray panels

Virtual files and preferences are browser-local, separate from existing account-based lab completion sync. They do not synchronize to another device. The environment simulates supported IT workflows; it does not boot Windows, access a real local filesystem, or connect to production infrastructure.

## Validation

Install Python Playwright and Chromium, then run from the repository root:

```sh
python -m pip install playwright
python -m playwright install chromium
python -m unittest discover -s tests -v
```

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an existing Chromium executable. Tests start an ephemeral localhost server and isolate browser storage per test. External account calls are blocked; account authentication and cloud sync are outside this suite.

The suite checks all 25 project launches, end-to-end networking lab validation, file persistence/restore, calculator, lock, task manager, window controls, context menus, calendar, preferences, and mobile layout.
