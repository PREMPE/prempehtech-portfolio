# Enterprise desktop

Open **Enterprise Desktop** on the simulator page. The desktop opens in a viewport-sized workspace; **Windowed Workspace** returns it to the page. Existing lab cards continue to work.

## Applications

- **Project Center:** searches and filters all 50 labs by track and level (25 preserved Level 1 labs and 25 Level 2 intermediate labs), shows completion, and launches the appropriate tools. Switching from an unfinished lab asks before resetting its configuration.
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

The suite checks all 25 original project launches plus 25 intermediate workflows, end-to-end networking lab validation, file persistence/restore, calculator, lock, task manager, window controls, context menus, calendar, preferences, and mobile layout.


## PrempehTech enterprise tools

The original PrempehTech desktop uses a teal, graphite, and copper visual design with generic devices. Open **Operations Center**, **Network Studio**, **Server Console**, or **Operations Terminal** from Start or the desktop. Project Center also links to the practice network.

- Operations Center shows actual practice-device health and inventory. Start the office-outage exercise, restore CORE-01 power and the DNS/web services, and validate recovery. Save inventory reports into File Explorer's Documents folder.
- Network Studio supports adding routers, switches, servers and workstations, dragging devices (or moving them with arrow keys), connecting/disconnecting links, and right-click properties/power/diagnostics. Double-click a device to edit its name and address. The properties dialog rejects duplicate names/IPs and invalid host addresses.
- Server Console starts and stops DNS and web services. A server must be powered on for a service to operate. DESK-01's DNS setting selects the resolver; the DNS zone automatically tracks device names and the portal's address.
- Operations Terminal supports `help`, `clear`, `status`, `ipconfig`, `ping`, `lookup`, `trace`, and `fetch`. Example: `fetch portal.prempeh.lab`. Diagnostics use current device power, physical paths, addresses, DNS settings, and service state.
- Activity records the most recent 60 configuration changes. All open enterprise-tool windows share state and update after changes. Practice configuration persists under `prempeh-enterprise-network-v1`; resetting it requires confirmation and leaves scored projects and documents intact.

This is a local-network simulation with /24 interfaces and DESK-01 as its diagnostic source. Routers and switches forward simulated paths; general routing protocols, packet emulation, real operating systems, and external network access are not implemented. The practice network is independent of the 50 scored projects so experiments cannot corrupt assignment validation. It does not use Cisco assets or Packet Tracer integration.

Browser tests additionally cover DNS/service failures, power and disconnected links, repair validation, configuration errors, topology movement, persistence, report files, and mobile diagnostics.
