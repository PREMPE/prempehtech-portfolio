# Security review — 2026-10-09

## Applied in website code

- Replaced the legacy terminal's HTML insertion with text-node rendering. Typed commands can no longer create HTML elements through that output path.
- Escaped dynamic enterprise-console state before inserting it into HTML templates.
- Added a per-page Content Security Policy. Executable inline scripts require exact SHA-256 hashes; inline event handlers, eval, object/embed content, frames, base-URL overrides, and connections outside the site and configured Supabase API are blocked. Form submissions are limited to the same origin. Inline styles remain allowed because the existing interfaces use dynamic styles.
- Added a strict-origin-when-cross-origin referrer policy. The meta policy is placed before other page resources.
- Pinned Supabase JS to 2.117.3 with SHA-384 Subresource Integrity and anonymous CORS. Updates require reviewing a new version and regenerating integrity metadata.
- Restricted loaded progress to known project IDs, booleans, and bounded numeric XP. Progress is a practice record, not proof of achievement or an authorization decision.
- Validated saved file graphs, device data, and desktop preferences to reject malformed types, cyclic folders, oversized records, and invalid references.
- Fixed the unconfirmed-signup UI so a returned user object without a session is not treated as signed in. Cleared submitted passwords, handled sign-out errors, guarded stale cross-account sync responses, and deferred auth-event network work to avoid an auth-lock deadlock.

The CSP is defense in depth, not a sanitizer. Keep untrusted data out of HTML and script contexts. Regenerate policies with `python scripts/security_policy.py` after any inline-script edit. Verify with `python scripts/security_policy.py --check` and the browser tests.

## Read-only live checks

- HTTPS responses already include HSTS and `X-Content-Type-Options: nosniff`.
- Cloudflare fronts the GitHub Pages site. These response observations do not prove WAF rules, rate limits, account MFA, or bot protections are configured.
- The Supabase anonymous-key request to the progress table was denied (HTTP 401, database permission denied). The request used `limit=0`; no user rows were retrieved.
- Public auth settings show email confirmation enabled, anonymous users disabled, and email as the only enabled provider.
- The browser publishable key is intentionally public. No service-role key belongs in frontend code. A scan of tracked text files found no matches for the checked private-key, GitHub-token, AWS-access-key, or Supabase-secret-key patterns; this is not an exhaustive secret scan.

Authenticated cross-user isolation, administrator settings, and password-abuse defenses could not be verified without authorized test accounts or management access. No real accounts were created, emails sent, password guessing performed, or production data modified in this review.

## Dashboard work still required — not applied by this deployment

### Cloudflare: prempehtech.ca

In the zone's Rules / Transform Rules / Modify Response Header section, add these response headers for the hostname (and www if used):

```
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Referrer-Policy: strict-origin-when-cross-origin
```

`frame-ancestors` only works as an HTTP response header; a meta tag cannot provide this clickjacking defense. The header policy above complements the document policy. Do not overwrite an existing broader CSP without preserving its directives. GitHub Pages does not apply arbitrary `_headers` files.

Keep HTTPS enforced and TLS mode Full (strict). Review Cloudflare managed WAF rules, managed DDoS protections, and plan-appropriate bot controls. Add rate limits based on observed traffic rather than blanket challenges that lock out normal users. Test the simulator, SVG assets, photo backgrounds, auth redirects, and mobile navigation after changes. Cloudflare rules on this website do not protect the separate `*.supabase.co` auth API.

### Supabase: simulator project

- Review the existing `supabase/simulator-progress.sql` against the actual schema and `pg_policies`. The intended four policies restrict every operation to `auth.uid() = user_id`; anonymous users have no table privileges. Check for additional permissive policies.
- Apply the optional `supabase/security-progress-constraints.sql` after reviewing existing rows. It limits new/updated progress payload size and shape. It is NOT applied by GitHub Pages deployment.
- Keep email confirmation enabled. Restrict Site URL and redirect allowlists to the production HTTPS origin and explicitly required development addresses; avoid wildcard redirects.
- Configure auth endpoint rate limits, a minimum password length of at least 12 for new accounts, and breached-password protection where supported. Client-side checks are not abuse protection.
- If signup abuse requires CAPTCHA, enable it together with a supported client CAPTCHA integration. Enabling it alone will break the current form.
- Test with two controlled accounts: each must be unable to read, change, or delete the other's progress, including direct REST requests with modified user_id values. Test insert and update ownership checks too.
- Set up auth/security logging, alerts, backups, and a tested recovery process. Do not expose database connection strings or service-role secrets to the browser.

### GitHub, domain registrar, Cloudflare, and Supabase accounts

Enable MFA/passkeys, review collaborators and API tokens, use least privilege, protect the publishing branch, and review recovery methods. Verify repository secret scanning/push protection availability and enable it. No account-level settings were changed by this review.

## Validation and limits

The security tests exercise malicious terminal markup even with CSP disabled, script/base/connection blocking with CSP enabled, corrupted browser state, unauthenticated signup handling, dependency pinning, and normal page loading. The existing desktop suite exercises all 25 project launches and the connected practice network.

Run `python -m unittest discover -s tests -v` with Python Playwright and Chromium installed. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if needed. Account behavior tests use local mocks and cannot certify production RLS or sign-in delivery.

This work reduces verified exposure; it is not a guarantee against all attacks. Server-side abuse controls, clickjacking headers, account security, and cross-user policy verification remain pending until the dashboard work is completed.

The `Website security checks` GitHub workflow verifies CSP hashes, JavaScript syntax, and browser tests on pushes and pull requests. Its token is read-only, checkout does not persist credentials, and the checkout action is pinned to a commit.
