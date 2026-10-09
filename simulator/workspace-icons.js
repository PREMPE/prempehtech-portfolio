/* Original PrempehTech pictograms, shared by desktop, Start, windows and tools. */
(() => {
  const ids = new Set('network netstudio cmd powershell opsterm switch router cloudconsole cloudshell firewall dhcp dns aduc gpmc services server serverops event siem endpoint operations projects explorer notepad taskmgr control edge calc recycle system admin workstation document folder'.split(' '));
  window.PrempehIcons = {html(id) {
    const key = ids.has(id) ? id : 'system';
    return `<img class="pt-app-icon" src="/assets/desktop-icons/${key}.svg" width="48" height="48" alt="" aria-hidden="true" draggable="false">`;
  }};
})();
