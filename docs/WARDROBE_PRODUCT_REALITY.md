# Wardrobe Product Reality Contract

This document defines the product thesis and journey-level acceptance contract
for Wardrobe. It complements the platform, architecture, and embedded-plugin
contracts: a route is correct only when it enters the product state promised by
the host-visible action.

## Product Thesis

Wardrobe is an owner-scoped wardrobe management and outfit workflow product.
Its primary actor is the wardrobe owner using the embedded Home AI plugin or
the standalone Wardrobe Web UI. Hermes Mobile may assist with model-facing
wardrobe reasoning through the Wardrobe MCP toolset, but Wardrobe remains the
source of truth for inventory, photos, featured looks, outfit history, wear
counts, and owner-scoped UI state.

Promised outcomes:

- the owner can inspect and maintain inventory items with ordered photos;
- the owner can capture today's outfit and later inspect wear history;
- featured looks can be used as styling references for `配衣服`;
- featured looks can be used as packing references for `出行打包`;
- empty, degraded, and failure states are explicit instead of silently falling
  back to a misleading journey.

## Core Journey Matrix

| Journey ID | Entry and route | Completion state | Empty or existing state | Executable evidence |
| --- | --- | --- | --- | --- |
| `inventory-item-photo-lifecycle` | Host action `add_item` routes to `#inventory?mode=add_item`; `inventory` routes to `#inventory`. | Inventory table/search is visible; add-item opens the create panel; item detail can show ordered photos, no-photo rows, and destructive photo actions through in-app dialogs. | Non-owner sessions see owner-scoped inventory only. No-photo items remain valid records with `primary_photo=null`; image failure is an item media state, not an inventory failure. | `tests.test_hermes_plugin_contract` verifies `add_item` route state, `#tab-inventory`, `#create-item-panel`, photo template/lightbox controls, and Program API item/photo endpoints. |
| `today-outfit-capture` | Host action `today` routes to `#outfits?mode=today`; `outfit_history` routes to `#outfits?mode=history`. | Today's date is selected. If no same-day outfit exists for the owner, the today capture form opens. If one exists, the same-day outfit is shown without opening a duplicate capture form. | Missing same-day outfit is a capture opportunity, not an error. Existing same-day outfit is a completed state. History remains a separate route and must not open today capture. | `tests.test_hermes_plugin_contract` executes `plugin-action-routes.js` and verifies `opensTodayOutfit`, `#tab-outfits`, `#outfit-create-today-btn`, and `openTodayOutfitAction`. |
| `styling-reference` | Host action `style` routes to `#featured-looks?mode=style`. | Featured looks are visible with `featuredLookActionMode=style` and a compact styling-reference context. The journey is done when the owner can inspect look details, items, photos, and notes as styling reference material. | No featured looks renders an explicit empty state. Search/no-match keeps the styling context and shows no-match copy. Wardrobe does not expose native model styling; Home AI model work uses Wardrobe MCP. | `tests.test_hermes_plugin_contract` executes `plugin-action-routes.js` and verifies `featuredLookMode=style`, `#tab-featured-looks`, `#featured-looks-summary`, and `data-plugin-action-mode`. |
| `packing-reference` | Host action `packing` routes to `#featured-looks?mode=packing`. | Featured looks are visible with `featuredLookActionMode=packing` and a compact packing-reference context. The journey is done when the owner can inspect the look as a packing checklist/reference. | No featured looks and search/no-match states remain explicit and keep the packing context. Wardrobe does not claim to generate a trip packing plan; Home AI may use Wardrobe MCP for model-side packing assistance. | `tests.test_hermes_plugin_contract` executes `plugin-action-routes.js` and verifies `featuredLookMode=packing`, `#tab-featured-looks`, `#featured-looks-summary`, and `data-plugin-action-mode`. |
| `recommendation-to-wear-history` | Home AI recommendation output calls `wardrobe.prepare_outfit_wear_intent` after all selected item codes are locked, then stores the returned `outfit_wear_intent` in bounded message metadata. | A deterministic Home AI action can call `wardrobe.execute_outfit_wear_intent`, which dry-runs, writes through Program API `POST /api/v1/history/outfits`, and verifies the saved outfit through `wear_history` readback. | Missing code, expired intent, workspace/principal mismatch, unavailable MCP/API/readback, or same-day conflict is explicit non-executable state. Same-day conflict returns `needs_confirmation` and requires confirmed `replace`; it must not auto-overwrite. | `tests.test_wardrobe_mcp` verifies intent metadata creation, missing-code rejection, same-day `needs_confirmation`, idempotency-key write, and readback verification. |

## Domain And State Contract

- Item identity is the stable item record in SQLite, surfaced by section/code
  and owner binding. The Program API namespace is `/api/v1/items`.
- Owner/workspace binding is enforced by the plugin launch/session bridge,
  Program API token scopes, and MCP workspace binding. A non-owner workspace
  must not silently fall back to Owner data.
- Product photos are ordered media records. The first ordered photo is the
  primary preview/full-product image. Original bytes are fetched on demand;
  thumbnails are safe derived media. No-photo items are valid records.
- Outfit identity is the saved outfit date plus outfit row/items. Wear history
  links to actual wear dates, not acquisition dates.
- Recommendation-to-history identity is the bounded `outfit_wear_intent`:
  `principal_id`, `workspace_id`, `wear_date`, `timezone`, role/code item
  list, source message ids, `idempotency_key`, and `expires_at`.
- Featured-look identity is `look_id` or row id plus owner, status, use case,
  items, photos, and notes. Featured looks are the source for styling and
  packing reference journeys in Wardrobe UI.
- Degraded states are stateful and visible: no photo, image load failure,
  missing same-day outfit, no featured looks, search no-match, upload failure,
  session/launch failure, and resource proxy failure.

## UX And Failure Contract

- `no-photo item`: show the item as valid and omit photo thumbnail rather than
  failing sync, inventory, or recommendation inputs.
- `image load failure`: keep the item/look/outfit record visible and surface a
  media failure state; do not white-screen the route.
- `missing same-day outfit`: open today capture from the `today` action.
- `existing same-day outfit`: show the same-day outfit and avoid duplicate
  capture by default.
- `same-day outfit write conflict`: return `needs_confirmation`; do not
  replace until Home AI sends an explicit confirmed `replace` action.
- `invalid outfit_wear_intent`: keep the action disabled or report a visible
  action error; do not rerun a model or fall back to generic text parsing.
- `no featured looks`: show an explicit empty featured-looks state while
  preserving `style` or `packing` action context.
- `non-owner empty inventory`: remain empty for that owner/workspace; do not
  substitute Owner inventory.
- `upload failure`: keep the form route and report an in-app error.
- `resource proxy failure`: keep the route diagnosable; do not use browser
  native alerts or silent refresh loops.

## Test And Harness Contract

Product Reality closure requires both surface and journey evidence:

- Surface evidence: `plugin-action-routes.js` maps host actions to route states
  and `tests.test_hermes_plugin_contract` executes that contract.
- Journey evidence: `tests.test_hermes_plugin_contract` maps each journey ID in
  this document to real DOM ids, route-state flags, and API/state boundaries.
- Embedded host evidence: Home AI proxy smoke should read the embedded HTML and
  confirm `plugin-action-routes.js`, `app.js`, and `styles.css` are loaded.
- Full visual closure, when requested, should use the Home AI visual lane and
  installed PWA harness rather than replacing this document with screenshots.

The action-route tests alone are surface evidence. They are Product Reality
closure only when paired with the journey matrix checks above.
