(() => {
  'use strict';
  const notice = document.getElementById('monthlyResultsNotice');
  const starts = Date.parse('2026-11-01T19:05:58Z');
  const expires = starts + 72 * 60 * 60 * 1000;
  function refresh() {
    const now = Date.now();
    notice.hidden = now < starts || now >= expires;
  }
  refresh();
  // Also remove the notice from tabs left open past its expiry.
  setInterval(refresh, 1000);
  document.addEventListener('visibilitychange', refresh);
  document.getElementById('monthlyResultsOpen').addEventListener('click', () => {
    window.PrempehLeaderboard.open();
    const select = document.querySelector('[data-month]');
    // The leaderboard loads its month list asynchronously.
    let attempts = 0;
    const timer = setInterval(() => {
      if (select?.querySelector('option[value="2026-10-01"]')) {
        clearInterval(timer);
        select.value = '2026-10-01';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (++attempts >= 50) clearInterval(timer);
    }, 100);
  });
})();
