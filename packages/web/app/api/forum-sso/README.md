# [Discourse](https://www.discourse.org) Connect SSO (forum.vbdhub.org ↔ vbdhub.org)

This folder contains the Next.js route that acts as the DiscourseConnect SSO provider for the forum.

## Endpoints
- `GET /api/forum-sso` (bypasses Next.js caches): entry point Discourse calls with `sso` (base64 payload) and `sig` (HMAC-SHA256).

## Required env vars
- `NEXT_PUBLIC_WEB_URL`: public origin for vbdhub.org (e.g., `https://vbdhub.org`); used to pin redirects to the correct host.
- `DISCOURSE_CONNECT_SECRET`: shared HMAC secret; must match Discourse “DiscourseConnect secret”.
- `DISCOURSE_RETURN_BASE_URL`: expected Discourse origin (e.g., `https://forum.vbdhub.org`) to validate `return_sso_url` host.

## Flow (happy path)
1) Discourse redirects browser to `/api/forum-sso?sso=…&sig=…`.  
2) Route verifies HMAC with `DISCOURSE_CONNECT_SECRET` (constant-time compare).  
3) Decodes payload → extracts `nonce` and `return_sso_url`; rejects if missing. Validates `return_sso_url` host matches `DISCOURSE_RETURN_BASE_URL`.  
4) Auth check: reads [Stytch](https://stytch.com) cookies `stytch_session` / `stytch_session_jwt`; calls Stytch `sessions.authenticate`. If unauthenticated, redirects to `/auth?next=<original forum-sso URL>` (host forced to `NEXT_PUBLIC_WEB_URL`).  
5) After login (and optional `/register`), user returns to `/api/forum-sso`.  
6) Builds outgoing payload with `nonce`, `external_id` (Stytch `user_id`), `email`; adds `require_activation=true` if email unverified; optional `name` and `username` (email local part).  
7) Signs payload with `DISCOURSE_CONNECT_SECRET`, appends `sso`/`sig` to `return_sso_url`, redirects browser back to Discourse. Discourse finalizes login.

## Frontend pieces involved
- `/auth` page: Stytch magic-link login; honors `next` param; on success routes to `/register` if name missing, else to `next` or `/`.
- `/register` page: collects name/consent; redirects to `next` or `/` when complete; wrapped in `Suspense` for `useSearchParams`.

## Discourse configuration (admin UI)
- Enable DiscourseConnect (official SSO) and set:  
  - **DiscourseConnect URL**: `https://vbdhub.org/api/forum-sso`  
  - **DiscourseConnect secret**: same as `DISCOURSE_CONNECT_SECRET`  
- Ensure Discourse generates `return_sso_url` on `https://forum.vbdhub.org` (matches `DISCOURSE_RETURN_BASE_URL`).  
- Optional: set name/username sync, avatar rules, logout behavior per policy.

## Domain / proxy notes
- Redirect host/protocol are forced to `NEXT_PUBLIC_WEB_URL`; set it to the public origin.  
- Cookies are host-only (`availableToSubdomains: false`) in Stytch config: app must run on the same host as `NEXT_PUBLIC_WEB_URL` to read them on the SSO route.

## Error cases returned by the route
- 400: missing `sso`/`sig`; invalid HMAC; missing `nonce`/`return_sso_url`; return URL host mismatch; authenticated user missing email.
- 500: Stytch authentication error.
- Unauthenticated: redirects to `/auth?next=<original request>`.

## Testing (manual)
- From logged-out Discourse, click “Log in” → redirected to `/auth` on `vbdhub.org`.  
- Complete magic-link login; if prompted, fill `/register`; confirm you are returned to Discourse and logged in.  
- Repeat login to confirm idempotent linking (same Discourse account).  
- Tamper test: modify `sig` or `return_sso_url` host → expect 400 JSON.

## Disable / rollback
- In Discourse admin, disable DiscourseConnect; Discourse reverts to its native login (if enabled).  
- In the app, you can block `/api/forum-sso` via routing or unset `DISCOURSE_CONNECT_SECRET` (will force 400s) if emergency stop is needed.
