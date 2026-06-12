# Hermes Plugin Debug Runbook

Use this when Wardrobe appears broken inside Hermes Mobile.

## 1. Identify The Layer

Check in this order:

1. Manifest reachable.
2. Frame ancestor allowed.
3. Launch succeeds.
4. Session established.
5. App shell loads.
6. API JSON calls work.
7. Image/resource calls work.
8. Navigation/back/refresh events flow.
9. PWA viewport and dark-mode visuals are correct.

Do not start by changing Hermes Mobile business code. Wardrobe owns the iframe
application behavior.

## 2. Manifest

Call:

```http
GET /api/v1/hermes/plugin/manifest?origin=<hermes-origin>
```

Expected:

- `id=wardrobe`
- `kind=embedded_app`
- `embedding.requested_frame_ancestor_allowed=true`
- `program_api.plugin_launch=/api/v1/hermes/plugin/launch`
- navigation event names present

If the origin is not allowed, register it through:

```http
POST /api/v1/hermes/plugin/frame-ancestors
```

Use configured/admin authorization. Do not hardcode private domains into the
repository.

## 3. Launch

Hermes calls:

```http
POST /api/v1/hermes/plugin/launch
```

with the workspace Access Key and `workspace_id`.

Expected:

- response has `entry_path`
- `entry_path` contains only a short launch token
- response does not return raw Access Key
- browser/iframe follows the launch redirect and receives a web session

If launch fails:

- `401`: bearer key missing/invalid
- `403`: workspace/key mismatch
- `404`: workspace not registered
- `400`: malformed request or expired/invalid launch token

## 4. Session

Normal browsers may use the `wardrobe_session` cookie. iOS/WebKit iframe
contexts may block third-party cookies, so embedded mode also supports:

- `X-Wardrobe-Session` for same-origin JSON API calls
- `plugin_session` query parameter for same-origin `/api/...` resource URLs
  loaded through `<img>` or similar browser-managed requests

Do not print concrete cookie or session values.

## 5. Resources And Images

For image failures:

- verify the JSON field contains a structured path, not a rewritten prose
  string
- verify the endpoint returns binary bytes with an image `Content-Type`
- verify the same-origin proxy preserves the path and content type
- verify no-photo items are treated as valid missing-visual cases

Common paths:

- `/api/photos/<id>/content`
- `/api/outfit-photos/<id>/content`
- `/api/featured-look-photos/<id>/content`
- `/api/v1/items/<code>/photos/...`
- `/media/...`

## 6. Navigation And Back

Inspect parent/iframe messages:

- Wardrobe emits `wardrobe.plugin.navigation`.
- Hermes sends `hermes.plugin.back` only when the latest state says
  `canGoBack=true`.
- Wardrobe emits `wardrobe.plugin.back_result`.

If `handled=false`, Hermes owns the outer back action.

## 7. Refresh Required

Wardrobe may emit:

```js
wardrobe.plugin.refresh_required
```

Expected:

- throttled
- bounded route hints only
- no secrets
- no full inventory/resource payloads

Hermes should rebuild the iframe and use route hints when practical.

## 8. Installed PWA Verification

For plugin UI regressions, use the installed Hermes Mobile PWA on emulator or
device. Browser address-bar checks are useful smoke tests but do not complete
PWA validation.

Minimum manual path:

1. Open Hermes Mobile PWA from the launcher.
2. Open Wardrobe plugin tab.
3. Open item detail.
4. Open photo lightbox, then back.
5. Enter edit state, then back/cancel.
6. Switch to another Hermes tab and return.
7. Confirm route state, images, and dark mode remain correct.

## 9. Handoff

After fixes, record:

- changed files
- validation commands
- deploy state
- remaining Hermes Mobile coordination
- known risks

Do not record raw secrets, cookies, one-time tokens, or long logs.
