# Wardrobe Project Docs

This directory is the stable entry point for engineering work on the Wardrobe
project. Read it after `.agent-context/PROJECT_CONTEXT.md` and
`.agent-context/HANDOFF.md`, then open only the smallest document needed for the
task.

## Map

- `ARCHITECTURE.md`: durable boundaries between SQLite, Program API, Web UI,
  Wardrobe MCP, and Hermes Mobile embedded plugin hosting.
- `WARDROBE_PRODUCT_REALITY.md`: product thesis, core journey completion
  states, failure states, and journey-to-test evidence.
- `MODULES/hermes-plugin.md`: the embedded-app plugin contract.
- `TEST_MATRIX.md`: harness requirements for plugin, MCP, resources, PWA,
  session, visual, and deployment behavior.
- `RUNBOOKS/hermes-plugin-debug.md`: operational checks when the embedded
  Wardrobe plugin fails to load, loses session, fails images, or mishandles
  back/refresh behavior.

## Working Rules

- Wardrobe owns its UI, API, SQLite data, MCP wrapper, and business rules.
- Hermes Mobile is the plugin host: it reads the manifest, launches a short
  session, embeds the iframe, forwards navigation/back/refresh events, and
  exposes the Wardrobe MCP toolset.
- Model-facing wardrobe operations should use Wardrobe MCP through Hermes
  Mobile. Wardrobe native AI routes and UI entrypoints are removed.
- Human browsing and editing should use the embedded Wardrobe Web UI.
- Do not put long-lived Access Keys, session tokens, cookies, launch tokens,
  raw private inventory dumps, push endpoints, screenshots containing secrets,
  or long raw logs in docs or handoffs.
- Deployment endpoints, Hermes origins, frame ancestors, and workspace bindings
  are configuration, not repository-level constants.

## Handoff Requirements

After substantial changes, update `.agent-context/HANDOFF.md` with:

- current status and goal
- changed files
- validation commands and results
- deployment state
- known risks
- Hermes Mobile coordination still required

Do not record raw credentials or one-time runtime state.
