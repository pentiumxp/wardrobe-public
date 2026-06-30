# Test Matrix

This matrix defines what must be covered when Wardrobe changes embedded plugin,
MCP, session, media, navigation, or theme behavior.

## Automated Harness

Run at minimum:

```powershell
python -m py_compile wardrobe_app\server.py wardrobe_app\hermes_plugin.py tests\test_program_api_helpers.py tests\test_wardrobe_mcp.py tests\test_hermes_plugin_contract.py
python -m unittest tests.test_program_api_helpers tests.test_wardrobe_mcp tests.test_hermes_plugin_contract
node --check web\app.js
git diff --check
```

Expected coverage:

- manifest shape is complete
- manifest contains no raw keys/tokens/cookies
- launch token is short, one-time, and never returns the long-lived key
- workspace registration stores binding metadata and not raw response secrets
- fresh-install workspace registration accepts the registration-only file key
  without preexisting migrated `api_tokens` rows, and that key is not accepted
  for unrelated owner-registration routes
- `?embed=hermes` session bridge uses cookie plus `X-Wardrobe-Session`
- frontend declares navigation, back, back result, and refresh required events
- resource URL helpers only add `plugin_session` to same-origin `/api/...`
  resource URLs
- no-photo products remain valid rows
- MCP sync is resource-level and does not fetch all original images
- MCP `outfit_wear_intent` prepares bounded recommendation metadata and
  executes wear-history writes through dry-run, idempotency, explicit
  confirmation, and readback verification
- Wardrobe native AI service stays removed: prompt-editing and AI-review
  endpoints return `410 native_ai_removed`, and model-facing wardrobe service is
  provided by Hermes Mobile through the mounted `wardrobe` MCP toolset.

## Product Journey Harness

`docs/WARDROBE_PRODUCT_REALITY.md` is the durable product journey contract.
Focused tests must map each core journey to executable route, DOM, and API/state
evidence:

- `inventory-item-photo-lifecycle`: verifies the inventory route, add-item
  create panel, item search/input surface, photo template/lightbox controls, and
  item/photo Program API endpoint declarations.
- `today-outfit-capture`: verifies `today` resolves to
  `#outfits?mode=today`, sets `opensTodayOutfit`, and maps to the outfits tab
  and today capture button/state handler.
- `styling-reference`: verifies `style` resolves to
  `#featured-looks?mode=style`, maps to the featured-looks tab, and preserves a
  visible `data-plugin-action-mode` context.
- `packing-reference`: verifies `packing` resolves to
  `#featured-looks?mode=packing`, maps to the featured-looks tab, and preserves
  a visible `data-plugin-action-mode` context.
- `recommendation-to-wear-history`: verifies executable
  `outfit_wear_intent` metadata only appears when role/code items are locked,
  conflicts return `needs_confirmation`, confirmed writes use the stable
  idempotency key, and success includes readback verification.

Action-route assertions are surface evidence. They are not sufficient for Deep
Product Reality closure unless the same test or harness also verifies the
journey's visible destination/state and relevant data boundary.

## Manifest Harness

- `GET /api/v1/hermes/plugin/manifest` returns `id=wardrobe`.
- `kind=embedded_app`.
- `entry.url` points to `/?embed=hermes`.
- `embedding.requested_frame_ancestor_allowed` is true only for configured
  origins.
- endpoint values are relative or derived from configured base URL.
- no raw key, cookie, launch token, or session token appears.

## Launch/Session Harness

- workspace key can be exchanged for a one-time launch token.
- launch accepts sanitized session-scoped `appearance.theme` and
  `appearance.fontSize`.
- iframe entry contains only the short launch token plus safe
  `pluginTheme`/`pluginFontSize` query values.
- `/api/v1/hermes/plugin/session` returns the same sanitized appearance.
- head script applies `data-theme` and `data-font-size` before CSS and app JS
  load.
- launch stores only the effective plugin theme `dark` or `light`; host-side
  `system` is resolved by Hermes before launch.
- same-origin Hermes proxy mode follows the parent document's effective
  `dark` / `light` theme when readable.
- switching the Hermes host from explicit dark to system/light while the iframe
  remains mounted updates Wardrobe's effective theme without requiring iframe
  reconstruction.
- app JS scrubs `plugin_session`, `pluginTheme`, and `pluginFontSize` from the
  visible iframe URL.
- launch appearance does not overwrite standalone long-term local preferences.
- consuming the token twice fails.
- iOS/WebKit mode can authenticate API requests with `X-Wardrobe-Session`.
- image tag resources can authenticate with `plugin_session` query parameter.
- failed launch shows a diagnostic state and does not flash back to legacy
  username/password for a registered workspace.
- non-admin Hermes workspace sessions filter stateful Web API reads to the
  session owner across items, outfits, featured looks, related routes, and
  item/outfit/featured-look photo content; admin standalone sessions retain
  explicit full-management access.
- embedded mobile input and sheet layout consumes the Home AI
  `hermes.plugin.viewport` event before falling back to iframe-local
  `visualViewport`, so native keyboard open does not push form inputs outside
  the visible iframe area.
- frontend destructive confirmations and user-visible errors use in-app dialog
  DOM instead of browser-native `alert`, `confirm`, or `prompt`, so they remain
  visible inside iOS/WebView embedding.

## Embed Mode Harness

For `?embed=hermes`:

- no duplicate global navigation shell appears.
- no legacy login shell appears after valid launch.
- main UI is directly usable.
- mobile viewport has no horizontal overflow.
- dark mode does not flash or leave white detail surfaces.
- host viewport bridge evidence is present or explicitly stubbed for keyboard
  tests; test coverage must include the `hermes.plugin.viewport` message branch
  and the fallback local viewport branch.

## Navigation/Back Harness

Cover:

- top-level page sends `canGoBack=false`
- top-level page reports `route.name=home`, `depth=0`, and the active tab in
  `route.tab`
- top-level pages show Wardrobe primary tabs in the bottom navigation
- item detail sends `canGoBack=true`
- item detail, focused history/featured-look routes, and photo lightbox hide
  the bottom navigation
- photo lightbox closes on `hermes.plugin.back`
- drawer closes on `hermes.plugin.back`
- edit state exits safely
- detail returns to the prior top-level tab
- `wardrobe.plugin.back_result` is emitted
- root `hermes.plugin.back` emits `handled=false` so Hermes can return to the
  pre-plugin page
- root left-edge/right-swipe gestures are not consumed by Wardrobe touch guards

## Refresh Harness

Cover:

- app version mismatch emits `wardrobe.plugin.refresh_required`
- repeated events are throttled
- route hints are bounded
- payload has no sensitive fields
- Hermes can rebuild iframe and return near the prior route
- embed-mode reconnect retry is bounded and recovers when `/api/auth/status`
  later reports authenticated: the login/reconnect overlay is hidden and
  `bootstrapAuthenticatedApp()` continues without user refresh.

## Resource/Image Harness

Cover:

- HTML image URLs
- CSS/JS static URLs
- JSON image API URL fields
- binary `Content-Type` for image endpoints
- ordinary text containing `/api/...` is not treated as a resource URL
- no-photo items do not fail sync or recommendations

## Installed PWA Harness

Plugin UI validation should be run from the installed Hermes Mobile PWA on an
Android emulator or real device, not only by typing a URL in a browser address
bar. Wardrobe-side requirements:

- iframe/PWA `?embed=hermes` entry works
- iOS/WebKit session bridge does not depend only on third-party cookies
- returning from another app does not white-screen
- images, details, back behavior, and refresh behavior survive PWA lifecycle
  transitions

## Visual/Dark Harness

- initial shell is not white
- iframe background transitions naturally against Hermes host background
- no top-left temporary text or page drift on navigation
- detail pages, settings, forms, chips, media cards, dialogs, and loading
  overlays use theme variables
- button, font, and tag sizes fit mobile tool-style UI
