# Wardrobe Hermes Mobile Plugin Contract

## Boundary

Wardrobe remains an independent application. It owns the UI, SQLite data, Program API, and Wardrobe MCP wrapper. Hermes Mobile should only mount Wardrobe as an embedded plugin tab and call the Wardrobe MCP toolset for model-facing operations.

Wardrobe native AI integration is removed. The embedded UI no longer exposes
prompt editing, draft outfit AI generation, saved outfit AI review, or
featured-look AI review. Legacy stateful Web API routes for those operations
return `410 native_ai_removed`; Hermes Mobile owns model execution through MCP.

The plugin contract is deployment-location independent. Current Wardrobe production is Mac production, with the plugin service and data under `/Users/hermes-host/HermesMobile/plugins/wardrobe`.

Current rollout default: keep using the Mac production source. Do not use retired NAS routes, backups, Docker, or hot-deploy paths for production behavior.

Hermes Mobile must not copy Wardrobe business logic, raw API keys, cache maintenance code, or photo-sync logic into its own codebase.

## Plugin Manifest

Wardrobe exposes a public plugin manifest:

- `GET /api/v1/hermes/plugin/manifest`

The repository also contains a static install-time pointer:

- `hermes-plugin/manifest.json`

That file is non-secret and points Hermes Mobile to the live manifest endpoint. The live endpoint is authoritative because it can derive the correct base URL for local or Mac production deployments.

The manifest declares:

- plugin id: `wardrobe`
- type: embedded web app
- entry URL: `/?embed=hermes`
- navigation event: `wardrobe.plugin.navigation`
- back event: `hermes.plugin.back`
- back result event: `wardrobe.plugin.back_result`
- refresh required event: `wardrobe.plugin.refresh_required`
- preserve iframe state: `true`
- MCP server/toolset: `wardrobe-mcp` / `wardrobe`
- workspace registration endpoint
- plugin launch endpoint
- frame-ancestor registration endpoint
- required MCP tools
- owner binding files:
  - `.hermes-wardrobe/config.json`
  - `.hermes-wardrobe/access-key.txt`
  - `.hermes-cache/`

The manifest contains no raw Access Key.

## Embedding

The embedded entry is the normal Wardrobe web app with `embed=hermes`.
Examples:

- `http://127.0.0.1:8765/?embed=hermes` for same-machine local deployment
- `https://wardrobe.example.com/?embed=hermes` for an owner-controlled HTTPS deployment

When this query parameter is present, Wardrobe does not send `X-Frame-Options: DENY`. Instead it sends a configurable `Content-Security-Policy: frame-ancestors ...` header.

The frame-ancestor allowlist is deployment configuration, not a hardcoded domain list. Configure generic defaults with:

- `WARDROBE_HERMES_PLUGIN_FRAME_ANCESTORS`

Default:

- `'self' http://127.0.0.1:* http://localhost:*`

Hermes Mobile can check whether its current origin is already allowed:

```http
GET /api/v1/hermes/plugin/manifest?origin=<current window.location.origin>
```

The response includes `embedding.requested_frame_ancestor_allowed`. If it is false, Hermes should not render a broken iframe. It should ask an operator/admin registration flow to add the origin.

Allowed Hermes origins are added through:

```http
POST /api/v1/hermes/plugin/frame-ancestors
```

Required authorization is the same as workspace registration: `owners:write`, `admin:*`, or an authenticated same-origin Wardrobe admin browser session.

Request body:

```json
{
  "origin": "https://hermes.example.com"
}
```

or:

```json
{
  "origins": ["https://hermes.example.com", "https://hermes.example.com:8445"]
}
```

Non-local origins must use HTTPS. Local HTTP origins are allowed only for `localhost`, `127.0.0.1`, or `::1`. The value must be an origin only, without path, query, or fragment.

Production deployments should register their actual Hermes Mobile origin through this endpoint. Do not bake a specific deployment domain into the repository, shared skill, or install-time manifest. Local plugin deployments can keep the entry on localhost and avoid public DNS entirely.

## Workspace Registration

Hermes Mobile creates a new workspace and generates the workspace Access Key. It then registers that workspace with Wardrobe:

- `POST /api/v1/hermes/plugin/workspaces`

Required authorization:

- Bearer token with `owners:write`, or
- Bearer token with `admin:*`, or
- an authenticated Wardrobe admin browser session with a valid same-origin request.

Request body:

```json
{
  "owner": "Owner Name",
  "workspace_id": "hermes-owner-name",
  "display_name": "Owner Name Wardrobe",
  "api_base_url": "http://127.0.0.1:8765",
  "access_key": "<workspace_access_key_generated_by_hermes_mobile>",
  "origin": "https://hermes.example.com",
  "store_access_key": true
}
```

Default scopes for the registered owner key:

- `history:write`
- `items:read`
- `items:write`
- `sync:read`

The response returns only the token prefix and registration metadata. It never returns the raw Access Key.

If the request includes `origin`, `frame_ancestor`, `origins`, or `frame_ancestors`, Wardrobe also registers those frame ancestors through the same generic allowlist used by `POST /api/v1/hermes/plugin/frame-ancestors`.

Wardrobe stores:

- `api_tokens.token_hash`
- owner binding
- workspace registry row
- owner option catalog value
- optional server-side secret file under `WARDROBE_API_TOKEN_SECRET_DIR`

If the owner already has an enabled key, registration fails with `owner_key_exists` unless `replace_existing_key: true` is explicitly supplied.

## Plugin Launch / Web Session

The embedded Wardrobe UI must not ask the user for the legacy username/password after the Hermes workspace is registered and bound. Hermes Mobile should launch the tab through a short one-time token:

```http
POST /api/v1/hermes/plugin/launch
Authorization: Bearer <workspace Access Key>
Content-Type: application/json
```

```json
{
  "workspace_id": "hermes-owner-name",
  "appearance": {
    "theme": "dark",
    "fontSize": "large"
  }
}
```

`workspaceId` is accepted as an alias for `workspace_id`. `appearance.theme` is sanitized to the effective plugin theme `dark` or `light`; host-side `system` must be resolved by Hermes before launch. `appearance.fontSize` is sanitized to `small`, `default`, `large`, `xlarge`, or `xxlarge`.

Wardrobe verifies that the bearer key is bound to the requested `workspace_id` in `hermes_plugin_workspaces`. It then returns a one-time launch token and the sanitized appearance:

```json
{
  "launch_token": "wpl_...",
  "token_type": "one_time_plugin_launch",
  "expires_in": 90,
  "workspace_id": "hermes-owner-name",
  "owner": "Owner Name",
  "appearance": {
    "theme": "dark",
    "fontSize": "large"
  },
  "entry_path": "/?embed=hermes&launch=wpl_...&pluginTheme=dark&pluginFontSize=large"
}
```

Hermes Mobile should not create or display the iframe until it has this appearance-aware `entry_path`, avoiding a flash of standalone/default theme or font size. Wardrobe consumes the launch token once, creates the normal `wardrobe_session` cookie for the bound owner, and redirects back to `/?embed=hermes&plugin_session=<session_id>&pluginTheme=<theme>&pluginFontSize=<fontSize>`. The frontend head script applies `data-theme` and `data-font-size` before `styles.css` and `app.js` load. In same-origin Hermes proxy mode, Wardrobe may read only the parent document's non-secret `data-effective-theme` / `data-theme` / `data-plugin-theme` value and use that effective `dark` or `light` theme for the iframe, including when the host setting changes from explicit dark to system/light while the iframe remains mounted. The app script stores only sanitized session-scoped appearance in `sessionStorage`, removes `plugin_session`, `pluginTheme`, and `pluginFontSize` from the visible URL with `history.replaceState`, and sends the session on same-origin API calls as `X-Wardrobe-Session`.

This header session is required for iOS/WebKit iframe environments where third-party cookies may be blocked. Normal browsers can still use the `wardrobe_session` cookie. The long-lived workspace Access Key must never be placed in the iframe URL.

The current session appearance can be checked through:

```http
GET /api/v1/hermes/plugin/session
```

Response:

```json
{
  "appearance": {
    "theme": "dark",
    "fontSize": "large"
  }
}
```

Launch appearance is session-scoped host preference. It must not overwrite the app's standalone long-term local theme preference unless the user explicitly changes the app's own setting.

## Embedded Navigation Contract

Hermes Mobile owns the host shell and edge-swipe gesture. Wardrobe owns the iframe SPA route state. The host must not infer Wardrobe's detail-page state from Hermes task/todo/directory routes; it should use this explicit plugin navigation contract.

Wardrobe's own primary tabs are rendered as a bottom navigation bar on top-level pages. Internal secondary states such as item detail, focused history/featured-look views, and photo lightbox hide this bottom navigation and report `canGoBack=true` so Hermes can route back through the plugin contract. Root/top-level pages keep the bottom navigation visible and report `canGoBack=false`.

When Wardrobe is running with `?embed=hermes`, it sends navigation state to the parent window after initial route render, top-level tab changes, detail/focused route changes, `hashchange`, lightbox open/close, and plugin back handling:

```js
window.parent.postMessage({
  type: "wardrobe.plugin.navigation",
  version: 1,
  canGoBack: true,
  route: {
    name: "item-detail",
    tab: "inventory",
    itemId: "123",
    depth: 1,
    hash: "#item-123"
  }
}, "*");
```

Top-level/root pages report `canGoBack: false`, route name `home`, and `depth: 0`. The concrete Wardrobe tab remains in `route.tab`:

```js
{
  type: "wardrobe.plugin.navigation",
  version: 1,
  canGoBack: false,
  route: {
    name: "home",
    tab: "inventory",
    depth: 0,
    hash: "#inventory"
  }
}
```

Hermes Mobile should keep the iframe node mounted when switching bottom tabs. If the iframe is not destroyed, Wardrobe must preserve its current SPA state and must not reset itself to the home page only because the plugin tab is activated again.

When Hermes Mobile captures a parent-level back gesture while the latest Wardrobe state has `canGoBack: true`, it sends the iframe:

```js
iframe.contentWindow.postMessage({
  type: "hermes.plugin.back",
  plugin_id: "wardrobe"
}, wardrobeOrigin);
```

Wardrobe handles that message without exiting the iframe, without logging out, and without a full page refresh:

- photo lightbox: close the lightbox
- open navigation drawer: close the drawer
- item detail: return to the previous Wardrobe top-level tab, usually inventory or watch collection
- focused outfit or featured-look route: clear the focus query and return to the corresponding top-level tab
- top-level/root page: make no destructive change, post `wardrobe.plugin.back_result` with `handled: false`, and re-emit `canGoBack: false` so Hermes can return to the page that opened the full-screen plugin

Wardrobe root pages must not intercept the host's left-edge/right-swipe back gesture. Mobile zoom or double-tap guards may prevent default browser behavior only when Wardrobe can actually handle the back internally; root pages leave the host edge gesture available to Hermes.

Wardrobe also posts `wardrobe.plugin.back_result` after handling a back message. The back result contains no secrets and includes both a bounded top-level `route` summary and the current navigation state.

Wardrobe can request an iframe rebuild from Hermes Mobile by posting:

```js
window.parent.postMessage({
  type: "wardrobe.plugin.refresh_required",
  version: 1,
  reason: "app_version_changed",
  route: {
    name: "item-detail",
    tab: "inventory",
    depth: 1,
    itemId: "123",
    hash: "#item-123"
  }
}, "*");
```

Refresh-required messages must be throttled and must contain only bounded route hints. They must not include Access Keys, launch tokens, session ids, cookies, raw responses, full inventory payloads, private image URLs, or image bytes.

The message payload must not include raw Access Keys, launch tokens, session ids, passwords, or image bytes. It may include only route name, tab, short record id, hash, depth, and whether a plugin-level back action is available.

## Resource And Image URLs

Wardrobe generates structured same-origin resource URLs so Hermes same-origin
proxy implementations can rewrite origin/cookie details without guessing from
arbitrary text.

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

Binary image endpoints must preserve `Content-Type`. JSON responses should use
structured URL/path fields. Plain explanatory text containing `/api/...` must
not be treated as a resource URL. Original product images remain on-demand;
routine visual workflows should use MCP-managed first-photo thumbnails.

## Harness

The long-term plugin harness is documented in:

- `docs/TEST_MATRIX.md`
- `tests/test_hermes_plugin_contract.py`

These cover manifest shape, no-secret output, launch/session expectations,
embedded message names, refresh-required throttling contract, resource URL
helpers, and dark-mode/translation guardrails.

## Owner Runtime Layout

After registration, Hermes Mobile should create the owner workspace files:

```text
.hermes-wardrobe/config.json
.hermes-wardrobe/access-key.txt
.hermes-cache/
```

Example `config.json`:

```json
{
  "owner": "Owner Name",
  "api_base_url": "http://127.0.0.1:8765",
  "access_key_file": ".hermes-wardrobe/access-key.txt",
  "cache_dir": ".hermes-cache",
  "resource_cache_dir": ".hermes-cache/resources",
  "photo_cache_dir": ".hermes-cache/photos"
}
```

Wardrobe MCP owns cache lifecycle after that. Hermes Mobile should not scan or mutate `.hermes-cache` directly.
