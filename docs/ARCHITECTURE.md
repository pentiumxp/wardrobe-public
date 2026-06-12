# Architecture

## Stable Boundary

Wardrobe remains an independent application. It owns:

- SQLite production data and migrations
- Program API under `/api/v1/...`
- Web UI under `web/`
- Wardrobe MCP wrapper used by Hermes Mobile and agents
- product, photo, history, statistics, and sync business rules

Hermes Mobile remains the host shell. It owns:

- plugin discovery through the Wardrobe manifest
- workspace registration flow and Access Key delivery
- iframe mounting and lifetime
- parent-level mobile gestures
- forwarding `hermes.plugin.back` into the iframe
- rebuilding the iframe when Wardrobe emits `wardrobe.plugin.refresh_required`
- MCP toolset mounting and selection

Hermes Mobile must not copy Wardrobe business logic, photo cache management,
or API write behavior into its own codebase.

## Data Source

SQLite is the source of truth for wardrobe items, watches, featured looks,
history, photos, owner bindings, API tokens, and plugin workspace bindings.
Local development may use a synced copy, but local databases must not overwrite
the production database.

## Program API

Program API is the stable backend contract. It uses bearer-token
authentication and stores only token hashes. Important surfaces include:

- item read/write and photo ordering
- history write
- resource-level sync manifest/resources
- plugin manifest, workspace registration, frame-ancestor registration, and
  launch/session bridge

The resource-level sync protocol avoids monolithic bundle downloads. Clients
compare per-resource checksum/count and fetch only changed resources.

## Web UI

The Web UI is the human-facing application. `?embed=hermes` enables the
Hermes iframe mode. Embedded mode is not a separate fork; it is the same SPA
with host-safe session, navigation, resource, and refresh behavior.

Theme preference is local browser state and supports `system`, `dark`, and
`light`. Dark mode must cover shell, detail pages, media cards, settings,
forms, dialogs, and loading states.

## Wardrobe MCP

Wardrobe MCP is an adapter around Program API. It must not read or write
SQLite directly. It owns owner-local `.hermes-cache` resource JSON and
first-photo thumbnail caches. Hermes Mobile and agents should not mutate this
cache directly.

Statistics and aggregate questions should use dedicated MCP stats tools rather
than many small item reads aggregated in model context.

Model-facing wardrobe assistance is owned by Hermes Mobile through the mounted
`wardrobe` MCP toolset. Wardrobe no longer provides native model calls,
prompt-template editing, draft outfit AI generation, saved outfit AI review, or
featured-look AI review in its Web UI or stateful Web API. The legacy
`ai_analysis` columns remain in SQLite only for schema compatibility and old
data retention; they are not an active Wardrobe AI service boundary.

## Hermes Plugin

Wardrobe can be mounted as an embedded Hermes Mobile plugin. The plugin
contract is deployment-location independent:

- live manifest: `GET /api/v1/hermes/plugin/manifest`
- embedded entry: `/?embed=hermes`
- workspace registration: `POST /api/v1/hermes/plugin/workspaces`
- frame ancestor registration:
  `POST /api/v1/hermes/plugin/frame-ancestors`
- launch/session bridge: `POST /api/v1/hermes/plugin/launch`

The repository must not hardcode private Hermes domains, Wardrobe public
domains, internal IP addresses, owner-local paths, or raw keys into the plugin
contract. Those belong in deployment configuration or local owner workspace
config files.

## Security

Long-lived keys are never placed in iframe URLs. Hermes exchanges the workspace
key for a short one-time launch token, and Wardrobe converts that into a
bounded web session. iOS/WebKit iframe environments may use
`X-Wardrobe-Session` and `plugin_session` query parameters for same-origin
API/media requests; these are short session identifiers and must not be logged
or documented as concrete values.

Documents, tests, handoffs, and diagnostics may mention secret file locations
but must not include secret values.
