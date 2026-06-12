# Hermes Embedded Plugin Contract

## Purpose

Wardrobe is an embedded-app plugin for Hermes Mobile. Hermes hosts the shell;
Wardrobe owns the iframe application and all wardrobe business behavior.

Wardrobe does not own model execution in embedded mode. The iframe is the
stateful wardrobe UI, while model-facing wardrobe assistance is provided by
Hermes Mobile through the mounted `wardrobe` MCP toolset. Legacy Wardrobe
stateful Web API routes for prompt editing and native AI review return
`410 native_ai_removed`.

## Manifest

Endpoint:

```http
GET /api/v1/hermes/plugin/manifest
```

The live manifest is authoritative. The static file under
`hermes-plugin/manifest.json` is only an install-time pointer.

Required manifest fields:

- `id`: `wardrobe`
- `kind`: `embedded_app`
- `entry.url`: points to `/?embed=hermes` on the configured base URL
- `program_api.plugin_manifest`
- `program_api.workspace_registration`
- `program_api.plugin_launch`
- `embedding.registration_endpoint`
- `navigation.state_event`
- `navigation.back_event`
- `navigation.back_result_event`
- `navigation.refresh_required_event`
- `navigation.preserve_iframe_state`
- `mcp.server`, `mcp.toolset`, and required tools
- `owner_binding.raw_key_returned_by_wardrobe=false`

The manifest must not contain raw Access Keys, launch tokens, session tokens,
cookies, private inventory dumps, or deployment-specific private domains.

## Configuration

These values are configuration, not hardcoded contract:

- public base URL
- local base URL
- Hermes origin
- frame ancestors
- workspace ID
- owner binding
- Access Key storage location

Use example domains such as `https://hermes.example.com` in docs and tests.
Concrete local deployment values belong in local config and durable handoff
references, not in the generic plugin contract.

## Workspace Registration

Endpoint:

```http
POST /api/v1/hermes/plugin/workspaces
```

Hermes Mobile generates the workspace Access Key and sends it once during
registration. Wardrobe stores only the token hash and binding metadata. The
registration response returns a prefix and metadata only; it never returns the
raw key.

## Launch And Session

Endpoint:

```http
POST /api/v1/hermes/plugin/launch
```

Hermes Mobile calls this with the workspace Access Key, `workspace_id` or
`workspaceId`, and optional session-scoped host appearance:

```json
{
  "workspaceId": "owner",
  "appearance": {
    "theme": "dark",
    "fontSize": "large"
  }
}
```

`theme` is sanitized to the effective plugin theme `dark` or `light`.
Host-side `system` must be resolved by Hermes before launch. `fontSize` is
sanitized to `small`, `default`, `large`, `xlarge`, or `xxlarge`.

Wardrobe verifies the binding and returns a short one-time entry path:

```text
/?embed=hermes&launch=<one-time-token>&pluginTheme=<theme>&pluginFontSize=<fontSize>
```

The long-lived key must never enter the iframe URL. The launch redirect creates
an owner web session and returns to:

```text
/?embed=hermes&plugin_session=<short-session-id>&pluginTheme=<theme>&pluginFontSize=<fontSize>
```

The iframe head script applies `data-theme` and `data-font-size` before
`styles.css` and `app.js` load. In same-origin Hermes proxy mode, Wardrobe may
also follow the parent document's non-secret `data-effective-theme` /
`data-theme` / `data-plugin-theme` value when it is readable, so the iframe
matches the host's current effective dark/light
appearance even if the iframe's own system media query differs. Wardrobe also
rechecks that parent effective theme while the embedded iframe remains mounted,
so switching Hermes from explicit dark to system/light does not leave the
Wardrobe iframe stuck in the previous theme. The frontend stores `plugin_session` and
sanitized appearance in `sessionStorage`, removes `plugin_session`,
`pluginTheme`, and `pluginFontSize` from the visible URL, sends
`X-Wardrobe-Session` on same-origin API calls, and appends `plugin_session`
only to same-origin `/api/...` resource URLs that cannot carry custom headers,
such as image tags.

Session appearance can be read through:

```http
GET /api/v1/hermes/plugin/session
```

It returns a sanitized `appearance` object. This is a session-scoped host
preference and must not overwrite the app's standalone long-term local theme
preference unless the user explicitly changes the app's own setting.

Launch redirects must be handled by the browser/iframe. Host-side HTTP clients
should not follow the redirect chain and then expect browser cookies to exist.

## Workspace-Scoped Data Reads

The embedded session owner is an authorization boundary for Wardrobe Web APIs.
After a workspace launch creates a `wardrobe_session` / `X-Wardrobe-Session`,
ordinary stateful endpoints must filter by that session owner unless the
session is an explicit Wardrobe admin session.

Covered workspace-private read surfaces include:

- `/api/items`
- `/api/items/<id>`
- `/api/items/<id>/outfits`
- `/api/items/<id>/featured-looks`
- `/api/outfits`
- `/api/outfits/<id>`
- `/api/featured-looks`
- `/api/photos/<id>/content`
- `/api/outfit-photos/<id>/content`
- `/api/featured-look-photos/<id>/content`

A non-admin Hermes workspace such as `weixin_test_1` must see only rows whose
Wardrobe owner equals that workspace owner. If no rows exist, the UI should
render its normal empty state instead of falling back to Owner data. Program API
bearer-token routes keep their existing token-owner scope rules.

## Navigation And Back

Wardrobe renders its primary app tabs as a bottom navigation bar on
root/top-level pages. Secondary iframe-local routes hide that bar and use this
navigation/back contract instead of showing primary tabs inside detail pages.

Wardrobe emits:

```js
wardrobe.plugin.navigation
```

Payload rules:

- include `canGoBack`
- include bounded route metadata such as `name`, `tab`, `depth`, `itemId`, and
  `hash`
- root/top-level pages use `route.name="home"`, `depth=0`, and
  `canGoBack=false`; the concrete Wardrobe tab is carried in `route.tab`
- do not include keys, tokens, cookies, full inventory dumps, image bytes, or
  private URLs

Hermes sends:

```js
hermes.plugin.back
```

Wardrobe handles iframe-local state first:

- photo lightbox closes
- drawer closes
- edit state exits safely
- item detail returns to the previous top-level tab
- focused history/featured-look filters clear
- top-level pages return `handled=false`
- root/top-level pages do not consume the host left-edge/right-swipe gesture

Wardrobe responds:

```js
wardrobe.plugin.back_result
```

When `handled=false`, Hermes may handle the outer shell back action.
The response includes bounded top-level `route` metadata plus the current
navigation state, but no secrets.

Hermes should keep the iframe node mounted across bottom-tab switches.
Wardrobe must not reset to home only because the plugin tab is activated again.

## Host Viewport And Keyboard Bridge

When Wardrobe runs inside Home AI with `?embed=hermes`, Home AI is the source of
truth for keyboard-sensitive iframe viewport metrics. iOS and installed-PWA
WebKit can leave the child iframe's `window.innerHeight` or `visualViewport`
larger than the visible area after the native keyboard opens. Wardrobe must
therefore consume the host postMessage event:

```js
{
  type: "hermes.plugin.viewport",
  version: 1,
  pluginId: "wardrobe",
  viewport: { height: 624, offsetTop: 0, layoutHeight: 844 },
  keyboard: { visible: true, bottomInset: 274 },
  iframe: { top: 0, height: 570 },
  footer: { visible: true }
}
```

Wardrobe stores only bounded layout metadata from this event. It must ignore
payloads for other plugin ids and must not expect Access Keys, launch tokens,
cookies, inventory data, route URLs, or user content in the viewport payload.

The latest host viewport payload is used to set the embedded visible-height and
keyboard-bottom CSS variables for mobile form controls. Local iframe
`visualViewport` metrics remain a fallback only when the host message has not
arrived or has gone stale.

## Refresh Required

Wardrobe emits:

```js
wardrobe.plugin.refresh_required
```

Use this when the embedded iframe should be rebuilt by Hermes, for example
after an app version change or incompatible session/embed state.

Rules:

- throttle repeated sends
- include only bounded route hints
- include no keys, tokens, cookies, full inventory data, image bytes, or raw
  responses
- avoid reload loops
- preserve the current route when practical
- in `?embed=hermes` mode, if a transient auth/status failure shows the
  reconnect overlay, Wardrobe should run a bounded local retry; when
  `/api/auth/status` becomes authenticated, it must hide the overlay and
  continue app bootstrap instead of requiring the user to reopen the tab.

## Resource And Image URLs

The Web UI should generate structured same-origin resource URLs. Hermes
same-origin proxy implementations can then preserve MIME type and rewrite
origin/path/cookie details without guessing from arbitrary text.

Resource paths that must remain valid in embedded mode include:

- `/api/photos/<id>/content`
- `/api/outfit-photos/<id>/content`
- `/api/featured-look-photos/<id>/content`
- `/api/v1/items/<code>/photos/...`
- `/uploads/...`
- `/media/...`
- `/images/...`
- `/assets/...`
- `/static/...`

Rules:

- binary image endpoints must preserve `Content-Type`
- JSON should expose resource URLs in structured fields
- explanatory text containing `/api/...` must not be rewritten as a resource
  URL
- original product images are fetched on demand; routine visual workflows use
  first-photo safe thumbnails from MCP cache

## Failure Diagnostics

Plugin failures must be diagnosable:

- manifest unreachable
- frame ancestor not allowed
- launch rejected or expired
- session expired
- resource/image proxy failed
- version refresh required
- model-side `wardrobe` MCP missing from the active Hermes Agent/Gateway
  profile

Do not silently white-screen, loop reload, or fall back to username/password
inside a registered Hermes workspace launch.

If the iframe/proxy works but a model turn says the Wardrobe MCP toolset is
missing, check the active Mac production Gateway/profile first. Windows
`lowgw*` development profile registration is not sufficient production
evidence.

For MCP runtime, schema, or toolset changes, production closure requires direct
MCP discovery plus selected Mac production Gateway callable-schema validation
for the expected `mcp_wardrobe_*` tools.
