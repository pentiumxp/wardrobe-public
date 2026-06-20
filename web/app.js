const state = {
  items: [],
  watchItems: [],
  dashboardItems: [],
  outfits: [],
  outfitDetailsById: {},
  outfitDetailErrorsById: {},
  outfitLoading: false,
  outfitDetailLoadingId: null,
  relatedOutfitDetailLoadingId: null,
  featuredLooks: [],
  options: { brands: [], owners: [], locs: [], roles: [], scene_tags: [], relax_levels: [], catalog_owners: [], catalog_wardrobe_brands: [], catalog_watch_brands: [] },
  importDirectory: "",
  dashboardImports: [],
  dashboardDbSizeBytes: 0,
  lastImportFingerprint: "",
  selectedItemId: null,
  selectedItemDetail: null,
  relatedItems: {},
  selectedOutfitDate: "",
  relatedOutfitItemId: null,
  relatedFeaturedLookItemId: null,
  relatedOutfitEntries: [],
  relatedFeaturedLookEntries: [],
  relatedOutfitYear: "",
  relatedOutfitMonth: "",
  selectedRelatedFeaturedLookId: "",
  outfitSelectedOwner: "",
  outfitPhotosOnly: false,
  featuredLookSelectedOwner: "",
  brandShareSelectedBrands: [],
  brandShareSelectedOwners: [],
  wearShareSelectedBrands: [],
  wearShareSelectedRoles: [],
  wearSharePeriod: "total",
  wearStatsCategory: "wardrobe",
  wearShareActiveBrand: "",
  wearShareActiveFilterGroup: "brand",
  watchWearShareSelectedBrands: [],
  watchWearSharePeriod: "total",
  watchWearShareActiveBrand: "",
  watchWearShareActiveFilterGroup: "brand",
  inventoryFilters: {
    brands: [],
    owners: [],
    locs: [],
    roles: [],
    channels: [],
  },
  watchFilters: {
    brands: [],
    owners: [],
  },
  maintenanceFilters: {
    brands: [],
    roles: [],
  },
  maintenanceKnownBrands: [],
  maintenanceKnownRoles: [],
  maintenanceActiveLevel: "",
  watchBrandShareMetric: "amount",
  watchBrandShareYear: "total",
  inventoryBrandShareYear: "total",
  inventoryFilterEventsBound: false,
  watchFilterEventsBound: false,
  maintenanceFilterEventsBound: false,
  inventoryActiveFilterGroup: "brand",
  watchActiveFilterGroup: "brand",
  maintenanceActiveFilterGroup: "brand",
  inventoryBrandShareMetric: "amount",
  inventoryBrandInitialized: false,
  inventoryOwnerInitialized: false,
  inventoryLocInitialized: false,
  inventoryRoleInitialized: false,
  inventoryChannelInitialized: false,
  watchBrandInitialized: false,
  watchOwnerInitialized: false,
  maintenanceBrandInitialized: false,
  maintenanceRoleInitialized: false,
  brandShareSelectionInitialized: false,
  brandShareOwnerSelectionInitialized: false,
  wearShareSelectionInitialized: false,
  wearShareRoleSelectionInitialized: false,
  watchWearShareSelectionInitialized: false,
  inventorySort: { key: "acquired_at", direction: "desc" },
  watchSort: { key: "acquired_at", direction: "desc" },
  photoLightboxPhotos: [],
  photoLightboxIndex: 0,
  photoLightboxTouchStart: null,
  photoLightboxContext: null,
  photoLightboxDeleting: false,
  authenticated: false,
  authUser: "",
  authIsAdmin: false,
  authAccounts: [],
  loginSelectedUser: "",
  passwordChangeDraft: null,
  passwordChangeOpen: false,
  passwordChangeSaving: false,
  passwordChangeError: "",
  passwordChangeSuccess: "",
  itemDetailSubtab: "detail",
  itemDetailEditMode: false,
  itemDetailEditDraft: null,
  itemDetailEditSaving: false,
  itemDetailEditError: "",
  outfitEditMode: false,
  outfitEditSaving: false,
  outfitEditError: "",
  outfitEditDraft: null,
  outfitCreateMode: false,
  outfitCreateSaving: false,
  outfitCreateError: "",
  outfitCreateDraft: null,
  outfitAiLoading: false,
  outfitAiError: "",
  outfitAiResult: "",
  outfitAiApplyMessage: "",
  outfitAiPanelOpen: false,
  outfitAiSavingId: null,
  featuredLookAiSavingId: null,
  aiPromptTemplates: { outfit: "", outfit_draft: "", featured_look: "" },
  aiPromptDrafts: {},
  aiPromptPanelsOpen: {},
  aiPromptSavingKind: "",
  aiPromptErrorKind: "",
  aiPromptError: "",
  aiPromptSuccessKind: "",
  aiPromptSuccessTimer: 0,
  aiPanelsOpen: {},
  aiAutoRefreshLoading: false,
  aiAnalysisEditKey: "",
  aiAnalysisEditText: "",
  aiAnalysisEditSaving: false,
  aiAnalysisEditError: "",
  featuredLookEditId: null,
  featuredLookEditSaving: false,
  featuredLookEditError: "",
  featuredLookEditDraft: null,
  createItemMode: false,
  createItemKind: "wardrobe",
  createItemDraft: null,
  createItemSaving: false,
  createItemError: "",
  createItemSuccess: "",
  catalogManagerSavingType: "",
  catalogManagerError: "",
  catalogManagerSuccess: "",
  manualRefreshLoading: false,
  startupDeferredRefreshScheduled: false,
  startupDeferredRefreshRunning: false,
  pluginReconnectTimer: null,
  pluginReconnectAttempts: 0,
  pluginReconnectBootstrapping: false,
  hermesHostViewport: null,
  installPromptEvent: null,
  installPromptAvailable: false,
  serviceWorkerReady: false,
  installStatusText: "",
  installRetryTimer: null,
  autoImportTimer: null,
  appUpdateAvailable: false,
  appUpdateVersion: "",
  pluginReturnHash: "#inventory",
};

const LAST_LOGIN_USER_COOKIE = "wardrobe_last_user";
const CLIENT_BUILD_VERSION = "20260608hostviewport";
const APP_VERSION_KEY = "wardrobe_app_version";
const APP_VERSION_POLL_MS = 60000;
const AUTH_PASSWORD_MIN_LENGTH = 8;
const AUTH_PASSWORD_MAX_LENGTH = 24;
const PLUGIN_SESSION_STORAGE_KEY = "wardrobe_plugin_session";
const PLUGIN_APPEARANCE_STORAGE_KEY = "wardrobe_plugin_appearance";
const THEME_STORAGE_KEY = "wardrobeTheme";
const THEME_OPTIONS = [
  { value: "system", label: "跟随系统" },
  { value: "dark", label: "深色" },
  { value: "light", label: "浅色" },
];
const PLUGIN_THEME_OPTIONS = new Set(["dark", "light"]);
const PLUGIN_FONT_SIZE_OPTIONS = new Set(["small", "default", "large", "xlarge", "xxlarge"]);
const PLUGIN_ID = "wardrobe";
const PLUGIN_NAVIGATION_MESSAGE_VERSION = 1;
const PLUGIN_REFRESH_REQUIRED_MIN_INTERVAL_MS = 30000;
const PLUGIN_RECONNECT_RETRY_MS = 1500;
const PLUGIN_RECONNECT_MAX_ATTEMPTS = 4;
const PLUGIN_HOST_EDGE_SWIPE_WIDTH_PX = 32;
const PLUGIN_VIEWPORT_MESSAGE_TYPE = "hermes.plugin.viewport";
const PLUGIN_VIEWPORT_MESSAGE_TTL_MS = 8000;
const PLUGIN_KEYBOARD_SHRINK_THRESHOLD_PX = 80;
const PLUGIN_FOCUSED_FIELD_MARGIN_PX = 14;
const PLUGIN_ACTION_ROUTE_HASH = Object.freeze({
  style: "#featured-looks",
  today: "#outfits",
  add_item: "#inventory",
  inventory: "#inventory",
  outfit_history: "#outfits",
  packing: "#featured-looks",
});
let lastPluginRefreshRequiredAt = 0;
let initialPluginActionRoute = "";
let initialPluginActionApplied = false;
const FALLBACK_AUTH_ACCOUNTS = [
  { username: "徐欣", remaining_attempts: 3, locked: false },
  { username: "吴萍", remaining_attempts: 3, locked: false },
];

function initPluginSessionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const pluginSession = params.get("plugin_session") || "";
  const appearance = pluginAppearanceFromParams(params);
  if (appearance) {
    storePluginAppearance(appearance);
    applyPluginAppearance(appearance);
  }
  if (pluginSession) {
    window.sessionStorage.setItem(PLUGIN_SESSION_STORAGE_KEY, pluginSession);
  }
  params.delete("plugin_session");
  params.delete("pluginTheme");
  params.delete("pluginFontSize");
  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || ""}`;
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash || ""}`) {
    window.history.replaceState({}, document.title, nextUrl);
  }
}

function pluginSessionToken() {
  return window.sessionStorage.getItem(PLUGIN_SESSION_STORAGE_KEY) || "";
}

function clearPluginSessionToken() {
  window.sessionStorage.removeItem(PLUGIN_SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(PLUGIN_APPEARANCE_STORAGE_KEY);
}

function isHermesPluginEmbed() {
  try {
    return new URLSearchParams(window.location.search).get("embed") === "hermes";
  } catch (error) {
    return false;
  }
}

function readInitialPluginActionRoute() {
  try {
    const params = new URLSearchParams(window.location.search);
    const route = String(params.get("pluginRoute") || params.get("route") || params.get("pluginActionId") || "").trim().toLowerCase();
    return PLUGIN_ACTION_ROUTE_HASH[route] ? route : "";
  } catch (error) {
    return "";
  }
}

function applyInitialPluginActionHash() {
  initialPluginActionRoute = readInitialPluginActionRoute();
  const targetHash = PLUGIN_ACTION_ROUTE_HASH[initialPluginActionRoute] || "";
  if (!targetHash) return;
  const currentHash = window.location.hash || "";
  if (!currentHash || currentHash === "#inventory") {
    window.location.hash = targetHash;
  }
}

function sameOriginApiRequest(input) {
  const raw = typeof input === "string" ? input : input?.url || "";
  if (!raw) return false;
  const url = new URL(raw, window.location.href);
  return url.origin === window.location.origin && url.pathname.startsWith("/api/");
}

function authenticatedResourceUrl(raw) {
  const sessionToken = pluginSessionToken();
  if (!sessionToken || !raw) return raw;
  const url = new URL(raw, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) {
    return raw;
  }
  if (!url.searchParams.has("plugin_session")) {
    url.searchParams.set("plugin_session", sessionToken);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

function normalizePluginAppearance(value) {
  const source = value && typeof value === "object" ? value : {};
  const theme = PLUGIN_THEME_OPTIONS.has(source.theme) ? source.theme : "light";
  const fontSize = PLUGIN_FONT_SIZE_OPTIONS.has(source.fontSize) ? source.fontSize : "default";
  return { theme, fontSize };
}

function hermesParentEffectiveTheme() {
  if (!isHermesPluginEmbed() || window.parent === window) return "";
  try {
    const parentRoot = window.parent.document?.documentElement;
    if (!parentRoot) return "";
    const value = parentRoot.getAttribute("data-effective-theme")
      || parentRoot.getAttribute("data-theme")
      || parentRoot.getAttribute("data-plugin-theme")
      || "";
    return value === "dark" || value === "light" ? value : "";
  } catch (error) {
    return "";
  }
}

function pluginAppearanceFromParams(params) {
  const theme = params.get("pluginTheme") || "";
  const fontSize = params.get("pluginFontSize") || "";
  if (!theme && !fontSize) return null;
  return normalizePluginAppearance({ theme, fontSize });
}

function storePluginAppearance(appearance) {
  try {
    window.sessionStorage.setItem(PLUGIN_APPEARANCE_STORAGE_KEY, JSON.stringify(normalizePluginAppearance(appearance)));
  } catch (error) {
    // Session storage can be unavailable in strict embedded contexts; keep DOM attributes applied.
  }
}

function readPluginAppearance() {
  try {
    const raw = window.sessionStorage.getItem(PLUGIN_APPEARANCE_STORAGE_KEY) || "";
    return raw ? normalizePluginAppearance(JSON.parse(raw)) : null;
  } catch (error) {
    return null;
  }
}

function applyPluginAppearance(appearance) {
  const normalized = normalizePluginAppearance(appearance);
  const theme = hermesParentEffectiveTheme() || normalized.theme;
  window.wardrobeTheme?.apply?.(theme);
  document.documentElement.setAttribute("data-font-size", normalized.fontSize);
}

async function refreshPluginAppearanceFromSession() {
  if (!isHermesPluginEmbed()) return;
  try {
    const response = await fetch("/api/v1/hermes/plugin/session", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const appearance = normalizePluginAppearance(payload.appearance || {});
    storePluginAppearance(appearance);
    applyPluginAppearance(appearance);
  } catch (error) {
    // Appearance sync is an embedded polish feature; auth/data failures are handled elsewhere.
  }
}

function reapplyPluginAppearance(reason = "restore") {
  if (!isHermesPluginEmbed()) return;
  const appearance = readPluginAppearance();
  if (appearance) {
    applyPluginAppearance(appearance);
  }
  refreshPluginAppearanceFromSession().catch(() => undefined);
}

function syncPluginHostAppearance() {
  if (!isHermesPluginEmbed()) return;
  const inheritedTheme = hermesParentEffectiveTheme();
  if (!inheritedTheme) return;
  const currentTheme = document.documentElement.getAttribute("data-effective-theme") || "";
  if (currentTheme !== inheritedTheme) {
    window.wardrobeTheme?.apply?.(inheritedTheme);
  }
}

function selectedThemePreference() {
  const pluginAppearance = isHermesPluginEmbed() ? readPluginAppearance() : null;
  if (pluginAppearance) return pluginAppearance.theme;
  if (window.wardrobeTheme?.read) {
    return window.wardrobeTheme.read();
  }
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY) || "system";
    return THEME_OPTIONS.some((option) => option.value === value) ? value : "system";
  } catch (error) {
    return "system";
  }
}

function applyThemePreference(value) {
  const nextValue = THEME_OPTIONS.some((option) => option.value === value) ? value : "system";
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextValue);
  } catch (error) {
    // Storage can be unavailable in strict embedded contexts; still apply the current page theme.
  }
  if (window.wardrobeTheme?.apply) {
    window.wardrobeTheme.apply(nextValue);
  } else {
    document.documentElement.setAttribute("data-theme", nextValue);
  }
}

function syncSystemThemeChrome() {
  if (selectedThemePreference() !== "system") return;
  window.wardrobeTheme?.apply?.("system");
}

function pluginNavigationState() {
  const rawHash = window.location.hash || "#inventory";
  const hashText = rawHash.replace(/^#/, "");
  const [hash, hashQuery = ""] = hashText.split("?");
  const params = new URLSearchParams(hashQuery);
  const lightboxOpen = Boolean((state.photoLightboxPhotos || []).length);
  const pageActionMenuOpen = document.body.classList.contains("page-action-menu-open");
  const sidebarOpen = document.body.classList.contains("sidebar-open");
  let reason = "";
  if (lightboxOpen) {
    reason = "lightbox";
  } else if (pageActionMenuOpen) {
    reason = "page_menu";
  } else if (sidebarOpen) {
    reason = "sidebar";
  } else if (hash.startsWith("item-") || (hash === "item-detail" && state.selectedItemId)) {
    reason = "item_detail";
  } else if (hash === "outfits" && params.has("item")) {
    reason = "filtered_outfits";
  } else if (hash === "featured-looks" && (params.has("item") || params.has("look"))) {
    reason = "focused_featured_looks";
  }
  const itemId = hash.startsWith("item-")
    ? hash.slice(5)
    : (hash === "item-detail" && state.selectedItemId ? String(state.selectedItemId) : "");
  const routeName = reason === "lightbox"
    ? "photo-lightbox"
    : reason === "page_menu"
      ? "page-menu"
      : reason === "sidebar"
        ? "navigation"
      : itemId
        ? "item-detail"
        : "home";
  const tab = itemId
    ? (String(state.selectedItemDetail?.layer_role || "") === "Watch" ? "watch-collection" : "inventory")
    : (hash || "inventory");
  const canGoBack = Boolean(reason);
  return {
    source: "wardrobe-plugin",
    plugin_id: PLUGIN_ID,
    type: "wardrobe.plugin.navigation",
    version: PLUGIN_NAVIGATION_MESSAGE_VERSION,
    canGoBack,
    can_go_back: canGoBack,
    back_reason: reason,
    route: {
      name: routeName,
      tab,
      itemId,
      depth: canGoBack ? 1 : 0,
      hash: rawHash,
    },
  };
}

function syncRouteChrome(navigation = pluginNavigationState()) {
  const routeName = String(navigation?.route?.name || "");
  const secondaryRoute = Boolean(navigation?.canGoBack) && routeName !== "navigation";
  document.body.classList.toggle("secondary-route", secondaryRoute);
}

function announcePluginNavigationState() {
  const navigation = pluginNavigationState();
  syncRouteChrome(navigation);
  if (!isHermesPluginEmbed() || window.parent === window) return;
  window.parent.postMessage(navigation, "*");
}

function currentPluginRouteSummary() {
  return pluginNavigationState().route;
}

function boundedPluginRouteHint() {
  const route = pluginNavigationState().route || {};
  return {
    name: String(route.name || "").slice(0, 64),
    tab: String(route.tab || "").slice(0, 64),
    depth: Number(route.depth || 0) > 0 ? 1 : 0,
    itemId: String(route.itemId || "").slice(0, 64),
    hash: String(route.hash || window.location.hash || "").slice(0, 160),
  };
}

function announcePluginRefreshRequired(reason, details = {}) {
  if (!isHermesPluginEmbed() || window.parent === window) return false;
  const now = Date.now();
  if (now - lastPluginRefreshRequiredAt < PLUGIN_REFRESH_REQUIRED_MIN_INTERVAL_MS) return false;
  lastPluginRefreshRequiredAt = now;
  window.parent.postMessage({
    source: "wardrobe-plugin",
    plugin_id: PLUGIN_ID,
    type: "wardrobe.plugin.refresh_required",
    version: PLUGIN_NAVIGATION_MESSAGE_VERSION,
    reason: String(reason || "refresh_required").slice(0, 80),
    route: boundedPluginRouteHint(),
    app_version: String(details.appVersion || CLIENT_BUILD_VERSION).slice(0, 40),
    next_app_version: String(details.nextAppVersion || "").slice(0, 40),
  }, "*");
  return true;
}

function pluginBackTargetHash() {
  const rawHash = window.location.hash || "#inventory";
  const hashText = rawHash.replace(/^#/, "");
  const [hash] = hashText.split("?");
  if (hash === "outfits") return "#outfits";
  if (hash === "featured-looks") return "#featured-looks";
  if (state.pluginReturnHash && state.pluginReturnHash !== rawHash) return state.pluginReturnHash;
  const role = String(state.selectedItemDetail?.layer_role || "").trim();
  return role === "Watch" ? "#watch-collection" : "#inventory";
}

async function handlePluginBackRequest() {
  if ((state.photoLightboxPhotos || []).length) {
    closePhotoLightbox();
    return true;
  }
  if (document.body.classList.contains("page-action-menu-open")) {
    setPageActionMenuOpen(false);
    return true;
  }
  if (document.body.classList.contains("sidebar-open")) {
    setSidebarOpen(false);
    return true;
  }
  if (state.itemDetailEditMode && state.selectedItemDetail) {
    state.itemDetailEditMode = false;
    state.itemDetailEditDraft = null;
    state.itemDetailEditSaving = false;
    state.itemDetailEditError = "";
    renderItemDetail(state.selectedItemDetail);
    announcePluginNavigationState();
    return true;
  }
  const current = pluginNavigationState();
  if (!current.canGoBack) {
    announcePluginNavigationState();
    return false;
  }
  const targetHash = pluginBackTargetHash();
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    await handleRoute();
  }
  return true;
}

function shouldAllowHostEdgeSwipe(event) {
  if (!isHermesPluginEmbed()) return false;
  if (pluginNavigationState().canGoBack) return false;
  const touch = event.changedTouches?.[0] || event.touches?.[0];
  if (!touch) return false;
  return Number(touch.clientX || 0) <= PLUGIN_HOST_EDGE_SWIPE_WIDTH_PX;
}

function isPluginBackMessage(data) {
  if (!data || typeof data !== "object") return false;
  const type = String(data.type || data.action || "").trim();
  const pluginId = String(data.plugin_id || data.pluginId || data.id || "").trim();
  return (!pluginId || pluginId === PLUGIN_ID) && [
    "hermes.plugin.back",
    "wardrobe:navigate-back",
    "plugin:navigate-back",
    "hermes:plugin-back",
    "back",
  ].includes(type);
}

function isPluginViewportMessage(data) {
  if (!data || typeof data !== "object") return false;
  const type = String(data.type || "").trim();
  if (type !== PLUGIN_VIEWPORT_MESSAGE_TYPE) return false;
  const pluginId = String(data.plugin_id || data.pluginId || data.id || "").trim();
  return !pluginId || pluginId === PLUGIN_ID;
}

function numberFromMetric(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function currentPluginViewportMetrics() {
  const now = Date.now();
  const payload = state.hermesHostViewport;
  if (payload && now - numberFromMetric(payload.receivedAt) <= PLUGIN_VIEWPORT_MESSAGE_TTL_MS) {
    const iframe = payload.iframe && typeof payload.iframe === "object" ? payload.iframe : {};
    const viewport = payload.viewport && typeof payload.viewport === "object" ? payload.viewport : {};
    const keyboard = payload.keyboard && typeof payload.keyboard === "object" ? payload.keyboard : {};
    const frameTop = Math.max(0, numberFromMetric(iframe.top));
    const frameHeight = Math.max(0, numberFromMetric(iframe.height));
    const visualHeight = Math.max(0, numberFromMetric(viewport.height));
    const visualOffsetTop = Math.max(0, numberFromMetric(viewport.offsetTop));
    const visualBottom = visualHeight ? visualOffsetTop + visualHeight : 0;
    let visibleHeight = 0;
    if (visualBottom && frameHeight) {
      visibleHeight = Math.max(0, Math.min(frameHeight, visualBottom - frameTop));
    }
    if (!visibleHeight && frameHeight) visibleHeight = frameHeight;
    const layoutHeight = Math.max(0, Math.round(frameHeight || numberFromMetric(viewport.layoutHeight) || visibleHeight || 0));
    const keyboardBottom = Math.max(0, Math.round(numberFromMetric(keyboard.bottomInset || keyboard.height)));
    const height = Math.max(240, Math.round(visibleHeight || layoutHeight || window.innerHeight || 0));
    return {
      source: "host",
      height,
      layoutHeight: Math.max(height, layoutHeight),
      keyboardBottom,
      keyboardVisible: Boolean(keyboard.visible || keyboardBottom > PLUGIN_KEYBOARD_SHRINK_THRESHOLD_PX || (layoutHeight && height < layoutHeight - PLUGIN_KEYBOARD_SHRINK_THRESHOLD_PX)),
    };
  }
  const visual = window.visualViewport;
  const localLayout = Math.max(
    numberFromMetric(window.innerHeight),
    numberFromMetric(document.documentElement?.clientHeight),
    0,
  );
  const visualHeight = Math.max(0, numberFromMetric(visual?.height));
  const visualOffsetTop = Math.max(0, numberFromMetric(visual?.offsetTop));
  const visibleHeight = Math.max(240, Math.round((visualHeight ? visualHeight + visualOffsetTop : localLayout) || localLayout || 0));
  const keyboardBottom = Math.max(0, Math.round(visual ? localLayout - visual.height - visual.offsetTop : 0));
  return {
    source: "local",
    height: visibleHeight,
    layoutHeight: Math.max(visibleHeight, Math.round(localLayout || visibleHeight)),
    keyboardBottom,
    keyboardVisible: Boolean(keyboardBottom > PLUGIN_KEYBOARD_SHRINK_THRESHOLD_PX),
  };
}

function isFocusedTextControl(node) {
  return node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement;
}

function scrollFocusedControlIntoPluginViewport(metrics) {
  if (!metrics?.keyboardVisible) return;
  const active = document.activeElement;
  if (!isFocusedTextControl(active)) return;
  const rect = active.getBoundingClientRect();
  const visibleHeight = Math.max(240, numberFromMetric(metrics.height));
  const bottomLimit = visibleHeight - PLUGIN_FOCUSED_FIELD_MARGIN_PX;
  let delta = 0;
  if (rect.bottom > bottomLimit) {
    delta = rect.bottom - bottomLimit;
  } else if (rect.top < PLUGIN_FOCUSED_FIELD_MARGIN_PX) {
    delta = rect.top - PLUGIN_FOCUSED_FIELD_MARGIN_PX;
  }
  if (!delta) return;
  const container = active.closest(".content");
  if (container && container.scrollHeight > container.clientHeight) {
    container.scrollTop += delta;
    return;
  }
  window.scrollBy({ top: delta, left: 0, behavior: "smooth" });
}

function applyPluginViewportState(reason = "viewport") {
  if (!isHermesPluginEmbed()) return;
  const metrics = currentPluginViewportMetrics();
  document.body.classList.add("hermes-plugin-embed");
  document.body.classList.toggle("keyboard-viewport-active", Boolean(metrics.keyboardVisible));
  document.documentElement.classList.toggle("keyboard-open", Boolean(metrics.keyboardVisible));
  document.documentElement.style.setProperty("--app-height", `${metrics.height}px`);
  document.documentElement.style.setProperty("--wardrobe-plugin-visible-height", `${metrics.height}px`);
  document.documentElement.style.setProperty("--wardrobe-plugin-layout-height", `${metrics.layoutHeight}px`);
  document.documentElement.style.setProperty("--wardrobe-plugin-keyboard-bottom", `${metrics.keyboardBottom}px`);
  if (reason !== "blur") {
    window.setTimeout(() => scrollFocusedControlIntoPluginViewport(metrics), 40);
    window.setTimeout(() => scrollFocusedControlIntoPluginViewport(currentPluginViewportMetrics()), 180);
  }
}

function handlePluginViewportMessage(data) {
  if (!isPluginViewportMessage(data)) return false;
  state.hermesHostViewport = { ...data, receivedAt: Date.now() };
  applyPluginViewportState("host-message");
  return true;
}

window.handleHermesPluginViewportMessage = handlePluginViewportMessage;
window.__codexMobileVisualHarness = Object.assign({}, window.__codexMobileVisualHarness || {}, {
  hostViewport: () => state.hermesHostViewport || null,
});

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const sessionToken = pluginSessionToken();
  if (!sessionToken || !sameOriginApiRequest(input)) {
    return nativeFetch(input, init);
  }
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
  if (!headers.has("X-Wardrobe-Session")) {
    headers.set("X-Wardrobe-Session", sessionToken);
  }
  return nativeFetch(input, { ...init, headers });
};

applyInitialPluginActionHash();
initPluginSessionFromUrl();
refreshPluginAppearanceFromSession();

function cloneFallbackAuthAccounts() {
  return FALLBACK_AUTH_ACCOUNTS.map((account) => ({ ...account }));
}

function blankPasswordChangeDraft() {
  return {
    current_password: "",
    new_password: "",
    confirm_password: "",
  };
}

function ensurePasswordChangeDraft() {
  if (!state.passwordChangeDraft) {
    state.passwordChangeDraft = blankPasswordChangeDraft();
  }
  return state.passwordChangeDraft;
}

function resetPasswordChangeState() {
  state.passwordChangeDraft = blankPasswordChangeDraft();
  state.passwordChangeOpen = false;
  state.passwordChangeSaving = false;
  state.passwordChangeError = "";
  state.passwordChangeSuccess = "";
}

function setPasswordChangeOpen(nextOpen) {
  state.passwordChangeOpen = Boolean(nextOpen);
  if (!state.passwordChangeOpen && !state.passwordChangeSaving) {
    state.passwordChangeError = "";
    state.passwordChangeSuccess = "";
  }
}

function passwordPolicyHint() {
  return `新密码需为 ${AUTH_PASSWORD_MIN_LENGTH}-${AUTH_PASSWORD_MAX_LENGTH} 位，包含大写字母、小写字母、数字和特殊字符，不含空格。`;
}

function passwordPolicyError(password) {
  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    return `新密码至少 ${AUTH_PASSWORD_MIN_LENGTH} 位。`;
  }
  if (password.length > AUTH_PASSWORD_MAX_LENGTH) {
    return `新密码最多 ${AUTH_PASSWORD_MAX_LENGTH} 位。`;
  }
  if (/\s/.test(password)) {
    return "新密码不能包含空格。";
  }
  if (!/[A-Z]/.test(password)) {
    return "新密码需包含至少 1 个大写字母。";
  }
  if (!/[a-z]/.test(password)) {
    return "新密码需包含至少 1 个小写字母。";
  }
  if (!/\d/.test(password)) {
    return "新密码需包含至少 1 个数字。";
  }
  if (!/[^0-9A-Za-z]/.test(password)) {
    return "新密码需包含至少 1 个特殊字符。";
  }
  return "";
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchWithTimeout(path, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(path, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchAuthStatus() {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetchWithTimeout(`/api/auth/status?_ts=${Date.now()}_${attempt}`, { cache: "no-store" }, 8000);
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await delay(500 * (attempt + 1));
      }
    }
  }
  throw lastError || new Error("auth_status_failed");
}

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : "";
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function preferredLoginUser() {
  const remembered = getCookie(LAST_LOGIN_USER_COOKIE);
  if (remembered && state.authAccounts.some((account) => account.username === remembered)) {
    return remembered;
  }
  return state.authAccounts[0]?.username || "";
}

function beijingDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return values;
}

function parseAsBeijingDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (/^\d{5}$/.test(text)) {
    const serial = Number(text);
    if (Number.isFinite(serial) && serial > 30000 && serial < 80000) {
      const excelEpoch = Date.UTC(1899, 11, 30);
      return new Date(excelEpoch + serial * 86400000);
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(`${text}T00:00:00+08:00`);
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatBeijingDate(value) {
  const parsed = parseAsBeijingDate(value);
  if (!parsed) return value || "";
  const parts = beijingDateParts(parsed);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatBeijingDateTime(value) {
  const text = String(value || "").trim();
  let parsed = null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
    parsed = new Date(text.replace(" ", "T") + "Z");
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(text)) {
    parsed = new Date(`${text}Z`);
  } else {
    parsed = parseAsBeijingDate(value);
  }
  if (!parsed) return value || "";
  const parts = beijingDateParts(parsed);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

const today = formatBeijingDate(new Date());

const CLOTHING_BASELINE_EDIT_FIELDS = [
  { key: "code", label: "货号" },
  { key: "brand", label: "品牌" },
  { key: "section", label: "Section" },
  { key: "loc", label: "地点" },
  { key: "owner", label: "Owner" },
  { key: "layer_role", label: "层级" },
  { key: "outer_type", label: "OuterType" },
  { key: "scene_tag", label: "场景" },
  { key: "relax_index", label: "松弛指数" },
  { key: "wear_maintenance", label: "磨损指数", inputMode: "decimal" },
  { key: "wear_threshold", label: "磨损阈值", inputMode: "decimal" },
  { key: "temp_min", label: "Temp Min", inputMode: "decimal" },
  { key: "temp_max", label: "Temp Max", inputMode: "decimal" },
  { key: "standalone_min", label: "Standalone Min", inputMode: "decimal" },
  { key: "standalone_max", label: "Standalone Max", inputMode: "decimal" },
  { key: "primary_color", label: "主色系" },
  { key: "secondary_color", label: "第二色系" },
  { key: "official_desc", label: "官网描述", multiline: true },
  { key: "price_original", label: "原始价格" },
  { key: "price_original_currency", label: "原始货币" },
  { key: "price_cny", label: "实际价格" },
  { key: "series", label: "系列" },
  { key: "size", label: "尺码" },
  { key: "acquired_at", label: "入库时间", type: "date" },
  { key: "official_color_code", label: "官方色号" },
  { key: "material", label: "材质", multiline: true },
  { key: "care", label: "洗涤方式", multiline: true },
  { key: "notes", label: "说明", multiline: true },
];

const CLOTHING_STATUS_EDIT_FIELD = { key: "status", label: "状态" };

const WATCH_BASELINE_EDIT_FIELDS = [
  { key: "section", label: "名称" },
  { key: "code", label: "Ref" },
  { key: "brand", label: "品牌" },
  { key: "loc", label: "地点" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "状态" },
  { key: "material", label: "规格", multiline: true },
  { key: "notes", label: "机芯", multiline: true },
  { key: "acquired_at", label: "购买日期", type: "date" },
  { key: "price_original", label: "购买价格" },
  { key: "price_original_currency", label: "原始货币" },
  { key: "official_desc", label: "功能", multiline: true },
];

function defaultCreateItemDraft(kind = "wardrobe") {
  if (kind === "watch") {
    return {
      kind: "watch",
      section: "",
      code: "",
      brand: "",
      material: "",
      notes: "",
      acquired_at: today,
      price_original: "",
      price_original_currency: "CNY",
      official_desc: "",
      owner: "徐欣",
      loc: "SH",
      status: "Active",
      layer_role: "Watch",
    };
  }
  return {
    kind: "wardrobe",
    code: "",
    brand: "",
    section: "",
    loc: "SH",
    owner: state.authUser || "徐欣",
    layer_role: "",
    outer_type: "",
    scene_tag: "",
    relax_index: "",
    temp_min: "",
    temp_max: "",
    standalone_min: "",
    standalone_max: "",
    primary_color: "",
    secondary_color: "",
    official_desc: "",
    price_original: "",
    price_original_currency: "CNY",
    price_cny: "",
    series: "",
    size: "",
    acquired_at: today,
    official_color_code: "",
    material: "",
    care: "",
    notes: "",
  };
}

function normalizeItemDraftPayload(payload, { kind = "", preserveKind = false } = {}) {
  const next = { ...payload };
  const resolvedKind = kind || next.kind || (normalizedItemLayerRole(next.layer_role) === "watch" ? "watch" : "wardrobe");
  if (!preserveKind) {
    next.kind = resolvedKind;
  }
  if (resolvedKind === "watch") {
    next.layer_role = "Watch";
    next.outer_type = "";
    next.temp_min = "";
    next.temp_max = "";
    next.standalone_min = "";
    next.standalone_max = "";
    return next;
  }
  const role = next.layer_role;
  if (!roleAllowsOuterType(role)) {
    next.outer_type = "";
  }
  if (roleUsesStandaloneTemperature(role)) {
    next.temp_min = "";
    next.temp_max = "";
  } else if (roleUsesLayerTemperature(role)) {
    next.standalone_min = "";
    next.standalone_max = "";
  } else {
    next.temp_min = "";
    next.temp_max = "";
    next.standalone_min = "";
    next.standalone_max = "";
  }
  return next;
}

function ensureRequiredItemFields(payload) {
  if (!String(payload?.code || "").trim()) {
    throw new Error("货号必填。");
  }
  if (!String(payload?.brand || "").trim()) {
    throw new Error("品牌必填。");
  }
  return payload;
}

const fields = [
  "code", "brand", "section", "loc", "owner", "layer_role", "outer_type", "scene_tag",
  "relax_index", "temp_min", "temp_max", "standalone_min", "standalone_max",
  "primary_color", "secondary_color", "official_desc", "price_original", "price_original_currency", "price_cny",
  "series", "size", "acquired_at", "official_color_code", "material", "care", "notes",
  "wear_total", "wear_maintenance", "wear_year", "maint_count", "wear_threshold",
];
const TOP_LEVEL_TABS = new Set(["dashboard", "wear-stats", "maintenance-planning", "inventory", "watch-collection", "outfits", "featured-looks"]);

function $(id) {
  if (id === "search-input") {
    return document.getElementById("search-input") || document.getElementById("messageInput");
  }
  return document.getElementById(id);
}

function updateViewportMode() {
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const narrowViewport = window.matchMedia("(max-width: 820px)").matches;
  document.body.classList.toggle("mobile", mobileUserAgent || narrowViewport);
  document.body.classList.toggle("hermes-plugin-embed", isHermesPluginEmbed());
}

function setSidebarOpen(open) {
  document.body.classList.toggle("sidebar-open", Boolean(open));
  announcePluginNavigationState();
}

function toggleSidebar() {
  setSidebarOpen(!document.body.classList.contains("sidebar-open"));
}

function setPageActionMenuOpen(open) {
  const menu = $("page-action-menu");
  const button = $("nav-toggle-btn");
  const nextOpen = Boolean(open);
  document.body.classList.toggle("page-action-menu-open", nextOpen);
  if (menu) menu.hidden = !nextOpen;
  if (button) button.setAttribute("aria-expanded", nextOpen ? "true" : "false");
}

function togglePageActionMenu() {
  const menu = $("page-action-menu");
  setPageActionMenuOpen(Boolean(menu?.hidden));
}

function apiResponseErrorMessage(path, response, text) {
  const raw = String(text || "").trim();
  const contentType = response?.headers?.get?.("content-type") || "";
  if (/^\s*(<!doctype|<html|<\?xml)/i.test(raw) || contentType.includes("text/html")) {
    return `${path}: 接口返回 HTML (${response.status})，可能访问到了 Synology 默认站点或反向代理路径错误。请切换到内网地址 http://192.168.10.99:8765 后重试。`;
  }
  try {
    const parsed = JSON.parse(raw);
    return String(parsed?.message || parsed?.error || raw || response.status).trim();
  } catch (_error) {
    return raw || `${response.status}`;
  }
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    throw new Error(`${path}: ${error?.message || error || "request_failed"}`);
  }
  if (!response.ok) {
    if (response.status === 401) {
      state.authenticated = false;
      state.authUser = "";
      state.authIsAdmin = false;
      try {
        await ensureAuthenticated("请先登录");
      } catch (error) {
        console.error(error);
      }
    }
    const text = await response.text();
    throw new Error(apiResponseErrorMessage(path, response, text));
  }
  const parseSource = typeof response.clone === "function" ? response.clone() : response;
  try {
    return await response.json();
  } catch (error) {
    const text = await parseSource.text().catch(() => "");
    throw new Error(apiResponseErrorMessage(path, response, text || error?.message || "invalid_json"));
  }
}

function parseApiErrorMessage(error) {
  const raw = String(error?.message || error || "").trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return String(parsed?.message || parsed?.error || raw).trim();
  } catch (_error) {
    return raw;
  }
}

function selectedAuthAccount() {
  if (!state.authAccounts.length) return null;
  return state.authAccounts.find((account) => account.username === state.loginSelectedUser) || state.authAccounts[0];
}

function resetPluginReconnectRetry() {
  if (state.pluginReconnectTimer) {
    window.clearTimeout(state.pluginReconnectTimer);
    state.pluginReconnectTimer = null;
  }
  state.pluginReconnectAttempts = 0;
}

async function retryHermesPluginReconnect() {
  state.pluginReconnectTimer = null;
  if (!isHermesPluginEmbed() || state.authenticated || state.pluginReconnectBootstrapping) return;
  state.pluginReconnectAttempts += 1;
  try {
    const authenticated = await ensureAuthenticated();
    if (!authenticated) return;
    state.pluginReconnectBootstrapping = true;
    try {
      await bootstrapAuthenticatedApp();
    } finally {
      state.pluginReconnectBootstrapping = false;
    }
  } catch (error) {
    console.warn("plugin_reconnect_retry_failed", error);
    if (!state.authenticated) {
      schedulePluginReconnectRetry();
    }
  }
}

function schedulePluginReconnectRetry() {
  if (!isHermesPluginEmbed() || state.authenticated || state.pluginReconnectTimer) return;
  if (state.pluginReconnectAttempts >= PLUGIN_RECONNECT_MAX_ATTEMPTS) return;
  state.pluginReconnectTimer = window.setTimeout(() => {
    retryHermesPluginReconnect().catch((error) => console.warn("plugin_reconnect_retry_failed", error));
  }, PLUGIN_RECONNECT_RETRY_MS);
}

function showLoginOverlay(message = "") {
  const overlay = $("login-overlay");
  const card = $("login-card");
  if (!overlay || !card) return;
  if (isHermesPluginEmbed()) {
    announcePluginRefreshRequired("plugin_launch_required", { appVersion: CLIENT_BUILD_VERSION });
    card.innerHTML = `
      <div class="login-head">
        <div>
          <h2>正在重新连接衣橱</h2>
          <p>当前嵌入页没有有效的 Hermes 启动会话，已请求 Hermes 重新启动插件。</p>
        </div>
      </div>
      <div class="login-note">如果页面没有自动恢复，请从 Hermes 重新打开衣橱标签。</div>
    `;
    overlay.hidden = false;
    document.body.classList.add("login-required");
    setSidebarOpen(false);
    schedulePluginReconnectRetry();
    return;
  }
  if (!state.loginSelectedUser && state.authAccounts.length) {
    state.loginSelectedUser = preferredLoginUser();
  }
  const selectedAccount = selectedAuthAccount();
  const locked = Boolean(selectedAccount?.locked);
  const helper = locked
    ? "该用户名已锁定，当前不可继续输入。"
    : selectedAccount
      ? `剩余 ${selectedAccount.remaining_attempts} 次机会`
      : "当前没有可登录的 owner。";
  const note = message || helper;
  card.innerHTML = `
    <div class="login-head">
      <div class="detail-eyebrow">登录</div>
      <h2 class="login-title">男装衣橱</h2>
      <div class="login-helper">${escapeHtml(helper)}</div>
    </div>
    <form id="login-form" class="login-form">
      <label>
        <span>用户名</span>
        <select id="login-username" ${state.authAccounts.length ? "" : "disabled"}>
          ${state.authAccounts.map((account) => `
            <option value="${escapeHtml(account.username)}" ${account.username === selectedAccount?.username ? "selected" : ""}>
              ${escapeHtml(account.username)}
            </option>
          `).join("")}
        </select>
      </label>
      <label>
        <span>密码</span>
        <input id="login-password" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" ${locked || !state.authAccounts.length ? "disabled" : ""}>
      </label>
      <div class="login-note ${locked ? "locked" : ""}">${escapeHtml(note)}</div>
      <button id="login-submit" type="submit" ${locked || !state.authAccounts.length ? "disabled" : ""}>进入</button>
    </form>
  `;
  overlay.hidden = false;
  document.body.classList.add("login-required");
  setSidebarOpen(false);
}

function hideLoginOverlay() {
  const overlay = $("login-overlay");
  if (!overlay) return;
  overlay.hidden = true;
  document.body.classList.remove("login-required");
}

async function ensureAuthenticated(message = "") {
  try {
    const response = await fetchAuthStatus();
    const payload = await response.json();
    state.authAccounts = payload.accounts || [];
    if (!state.loginSelectedUser && state.authAccounts.length) {
      state.loginSelectedUser = preferredLoginUser();
    }
    if (payload.authenticated) {
      state.authenticated = true;
      state.authUser = payload.username || "";
      state.authIsAdmin = Boolean(payload.is_admin);
      if (state.authUser) {
        setCookie(LAST_LOGIN_USER_COOKIE, state.authUser);
      }
      hideLoginOverlay();
      resetPluginReconnectRetry();
      return true;
    }
    state.authenticated = false;
    state.authUser = "";
    state.authIsAdmin = false;
    resetPasswordChangeState();
    showLoginOverlay(message);
    return false;
  } catch (error) {
    console.warn("auth_status_failed", error);
    state.authenticated = false;
    state.authUser = "";
    state.authIsAdmin = false;
    resetPasswordChangeState();
    if (!state.authAccounts.length) {
      state.authAccounts = cloneFallbackAuthAccounts();
    }
    if (!state.loginSelectedUser && state.authAccounts.length) {
      state.loginSelectedUser = preferredLoginUser();
    }
    showLoginOverlay(message || "连接状态异常，请直接登录或下拉刷新重试。");
    return false;
  }
}

function safeNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePrice(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDiscountRate(originalPrice, actualPrice) {
  const original = parsePrice(originalPrice);
  const actual = parsePrice(actualPrice);
  if (!(original > 0) || !(actual > 0)) return "";
  return `${((actual / original) * 100).toFixed(1)}%`;
}

function normalizedAcquiredYear(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const explicitYearMatch = text.match(/^(\d{4})(?:[-/.]|$)/);
  if (explicitYearMatch) {
    const explicitYear = Number(explicitYearMatch[1]);
    if (Number.isFinite(explicitYear) && explicitYear >= 1900 && explicitYear <= 2100) {
      return String(explicitYear);
    }
  }
  if (!/^\d+(?:\.\d+)?$/.test(text)) return "";
  const serial = Number(text);
  if (!Number.isFinite(serial) || serial < 20000 || serial > 80000) return "";
  const excelEpochUtcMs = Date.UTC(1899, 11, 30);
  const normalizedDate = new Date(excelEpochUtcMs + Math.round(serial) * 86400000);
  const year = normalizedDate.getUTCFullYear();
  return Number.isFinite(year) && year >= 1900 && year <= 2100 ? String(year) : "";
}

function itemAcquiredYear(item) {
  return normalizedAcquiredYear(item?.acquired_at);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBytes(value) {
  const size = Number(value || 0);
  if (!(size > 0)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = size;
  let index = 0;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  const digits = index === 0 ? 0 : current >= 100 ? 0 : current >= 10 ? 1 : 2;
  return `${current.toFixed(digits)} ${units[index]}`;
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function buildWearBrandDetailHtml(items, metricField, activeBrand, emptyText = "当前品牌下没有可显示的单品统计。") {
  const brandItems = items
    .filter((item) => (item.brand || "Unknown") === activeBrand)
    .map((item) => ({
      ...item,
      metricValue: safeNumber(item[metricField]) || 0,
    }))
    .sort((left, right) => {
      const diff = right.metricValue - left.metricValue;
      if (diff !== 0) return diff;
      return String(left.section || left.code || "").localeCompare(String(right.section || right.code || ""), "zh-CN");
    });
  if (!brandItems.length) {
    return `<div class="list-item">${emptyText}</div>`;
  }
  const brandTotal = brandItems.reduce((sum, item) => sum + item.metricValue, 0);
  return `
    <div class="brand-drilldown-list">
      ${brandItems.map((item) => `
        <div class="brand-drilldown-row">
          <div class="brand-drilldown-main">
            <div class="brand-drilldown-section">${sectionLink(item, "section-link")}</div>
            <div class="muted-text">货号: ${escapeHtml(item.code || "")}</div>
          </div>
          <div class="brand-drilldown-meta">
            <strong>${item.metricValue} 次</strong>
            <span>${formatPercent(brandTotal > 0 ? (item.metricValue / brandTotal) * 100 : 0)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderChartFilterSwitcher(tabs, activeGroup, bulkLabel) {
  return `
    <div class="chart-filter-switcher">
      <div class="chart-filter-tabs">
        ${tabs.map((tab) => `
          <button type="button" class="chart-filter-tab ${tab.key === activeGroup ? "active" : ""}" data-filter-tab="${escapeHtml(tab.key)}">${escapeHtml(tab.label)}</button>
        `).join("")}
      </div>
      <button type="button" class="chart-filter-bulk-btn ${bulkLabel ? "" : "is-hidden"}" data-filter-bulk="true">${escapeHtml(bulkLabel)}</button>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const INVENTORY_TABLE_BRAND_LABELS = {
  "Brunello Cucinelli": "BC",
  "Loro Piana": "LP",
};

function inventoryTableBrandLabel(brand) {
  const fullBrand = String(brand || "").trim();
  if (!fullBrand) return "";
  return INVENTORY_TABLE_BRAND_LABELS[fullBrand] || fullBrand;
}

function compactDirectoryLabel(path) {
  const text = String(path || "").trim();
  if (!text) return "未设置";
  const segments = text.split(/[\\/]+/).filter(Boolean);
  if (segments.length <= 4) return text;
  return `...\\${segments.slice(-4).join("\\")}`;
}

function sortBrandsByAmount(brands, items) {
  return sortValuesByAmount(brands, items, (item) => item.brand || "");
}

function sortOwnersByAmount(owners, items) {
  return sortValuesByAmount(owners, items, (item) => item.owner || "");
}

function sortLocsByAmount(locs, items) {
  return sortValuesByAmount(locs, items, (item) => item.loc || "");
}

function sortRolesByAmount(roles, items, valueGetter = (item) => String(item.layer_role || "").trim() || "未分类") {
  return sortValuesByAmount(roles, items, valueGetter);
}

function sortValuesByAmount(values, items, valueGetter) {
  const totals = new Map();
  items.forEach((item) => {
    const value = valueGetter(item);
    if (!value) return;
    totals.set(value, (totals.get(value) || 0) + parsePrice(item.price_cny || item.price_original));
  });
  return [...values].sort((left, right) => {
    const amountDiff = (totals.get(right) || 0) - (totals.get(left) || 0);
    if (amountDiff !== 0) return amountDiff;
    return String(left).localeCompare(String(right), "zh-CN", { sensitivity: "base", numeric: true });
  });
}

function isWatchItem(item) {
  return String(item?.brand || "").trim() === "Watch" || String(item?.layer_role || "").trim() === "Watch";
}

function inventorySourceItems() {
  const sourceItems = state.dashboardItems.length ? state.dashboardItems : state.items;
  return sourceItems.filter((item) => !isWatchItem(item));
}

function watchSourceItems() {
  const sourceItems = state.dashboardItems.length ? state.dashboardItems : state.items;
  return sourceItems.filter((item) => isWatchItem(item));
}

function allKnownWatchItems() {
  const merged = new Map();
  [...(state.watchItems || []), ...(state.dashboardItems || []), ...(state.items || [])].forEach((item) => {
    if (!isWatchItem(item)) return;
    const id = Number(item?.id || 0);
    if (id > 0 && !merged.has(id)) merged.set(id, item);
  });
  return [...merged.values()];
}

function allKnownWardrobeItems() {
  const merged = new Map();
  [...(state.dashboardItems || []), ...(state.items || [])].forEach((item) => {
    if (isWatchItem(item)) return;
    const id = Number(item?.id || 0);
    if (!Number.isFinite(id) || id <= 0) return;
    if (!merged.has(id)) {
      merged.set(id, item);
    }
  });
  return [...merged.values()];
}

function inventoryRoleValue(item) {
  return String(item.layer_role || "").trim() || "未分类";
}

function shouldApplyInventoryRoleFilter(item) {
  return inventoryRoleValue(item) !== "Watch" && String(item.brand || "").trim() !== "Watch";
}

function inventoryChannelValue(item) {
  const original = parsePrice(item.price_original);
  const actual = parsePrice(item.price_cny);
  if (original > 0 && actual > 0 && original > actual) {
    return "折扣";
  }
  return "正价";
}

function maintenanceSourceItems() {
  const selectedOwner = loggedInOwner();
  const sourceItems = state.dashboardItems.length ? state.dashboardItems : [...state.items, ...state.watchItems];
  return sourceItems.filter((item) => {
    if (String(item.status || "Active").startsWith("Archived")) return false;
    if (String(item.layer_role || "").trim() === "Watch") return false;
    if (!ownerMatchesRecord(item, selectedOwner)) return false;
    return (safeNumber(item.wear_threshold) || 0) > 0;
  });
}

function maintenanceRoleValue(item) {
  return String(item.layer_role || "").trim() || "未分类";
}

function maintenanceTypeLabel(item) {
  const role = maintenanceRoleValue(item);
  if (role === "Outer") {
    return item.outer_type ? `${role} · ${item.outer_type}` : role;
  }
  return role;
}

function maintenanceLevelMeta(item) {
  if (maintenanceStateValue(item) === 1) {
    return { key: "in_progress", label: "保养中", priority: 0, color: "#5f6c7b" };
  }
  const threshold = safeNumber(item.wear_threshold);
  const wear = safeNumber(item.wear_maintenance) || 0;
  if (!(threshold > 0)) {
    return { key: "unset", label: "未设阈值", priority: 5, color: "#8f8578" };
  }
  const remaining = Number((threshold - wear).toFixed(1));
  if (remaining <= 0) {
    return { key: "expired", label: "已到期", priority: 1, color: "#a44a3f" };
  }
  if (remaining <= 2) {
    return { key: "red", label: "红色级", priority: 2, color: "#c26a3d" };
  }
  if (remaining <= 4) {
    return { key: "orange", label: "橙色级", priority: 3, color: "#d6a44d" };
  }
  return { key: "green", label: "绿色级", priority: 4, color: "#5d8a63" };
}

function maintenanceStateValue(item) {
  const value = Number(item?.maintenance_state ?? 0);
  return Number.isFinite(value) && value === 1 ? 1 : 0;
}

function displayWardrobeStatus(item) {
  if (maintenanceStateValue(item) === 1) return "保养";
  const raw = String(item?.status || "").trim().toLowerCase();
  if (raw === "archived") return "归档";
  return "激活";
}

function filteredMaintenanceItems() {
  const sourceItems = maintenanceCandidateItems();
  return sourceItems.filter((item) => {
    if (state.maintenanceFilters.brands.length === 0) return false;
    if (state.maintenanceFilters.roles.length === 0) return false;
    if (!state.maintenanceFilters.brands.includes(item.brand || "")) return false;
    if (!state.maintenanceFilters.roles.includes(maintenanceRoleValue(item))) return false;
    return true;
  });
}

function compareValues(left, right) {
  if (left === right) return 0;
  if (left === null || left === undefined || left === "") return 1;
  if (right === null || right === undefined || right === "") return -1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "zh-CN", { numeric: true, sensitivity: "base" });
}

function sortValue(item, key) {
  if (key === "acquired_at") {
    const parsed = parseAsBeijingDate(item.acquired_at);
    return parsed ? parsed.getTime() : Number.NEGATIVE_INFINITY;
  }
  if (key === "price") return parsePrice(item.price_cny || item.price_original);
  if (key === "relax") return safeNumber(item.relax_index) ?? Number.POSITIVE_INFINITY;
  if (key === "total") return safeNumber(item.wear_total) ?? Number.POSITIVE_INFINITY;
  if (key === "scene_tag") return item.scene_tag || "";
  if (key === "code") return item.code || "";
  if (key === "section") return item.section || "";
  return item[key] ?? "";
}

function sortedCollectionItems(items, sortState) {
  const list = [...items];
  const { key, direction } = sortState;
  list.sort((a, b) => {
    const result = compareValues(sortValue(a, key), sortValue(b, key));
    return direction === "asc" ? result : -result;
  });
  return list;
}

function sortedItems() {
  return sortedCollectionItems(displayInventoryItems(), state.inventorySort);
}

function sortedWatchItems() {
  return sortedCollectionItems(displayWatchItems(), state.watchSort);
}

function filteredWatchItems() {
  const sourceItems = watchSourceItems();
  const watchSearchInput = $("watch-search-input");
  const search = watchSearchInput ? watchSearchInput.value.trim().toLowerCase() : "";
  return sourceItems.filter((item) => {
    if (state.watchFilters.brands.length === 0) return false;
    if (state.watchFilters.owners.length === 0) return false;
    if (search) {
      const haystack = [
        item.code,
        item.section,
        item.brand,
        item.material,
        item.notes,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (state.watchFilters.brands.length && !state.watchFilters.brands.includes(item.brand || "")) return false;
    if (state.watchFilters.owners.length && !state.watchFilters.owners.includes(item.owner || "")) return false;
    return true;
  });
}

function displayWatchItems() {
  const items = filteredWatchItems();
  const period = state.watchBrandShareYear !== "total" ? String(state.watchBrandShareYear || "").trim() : "total";
  if (!period || period === "total") return items;
  return items.filter((item) => itemAcquiredYear(item) === period);
}

function displayInventoryItems() {
  const items = state.items || [];
  const period = state.inventoryBrandShareYear !== "total" ? String(state.inventoryBrandShareYear || "").trim() : "total";
  if (!period || period === "total") return items;
  return items.filter((item) => itemAcquiredYear(item) === period);
}

function renderSortHeaders(tableKey, sortState) {
  document.querySelectorAll(`.sort-header[data-sort-table="${tableKey}"]`).forEach((button) => {
    const active = button.dataset.sortKey === sortState.key;
    const directionMark = active ? (sortState.direction === "asc" ? " ↑" : " ↓") : "";
    const baseLabel = button.textContent.replace(/ [↑↓]$/, "");
    button.textContent = `${baseLabel}${directionMark}`;
    button.classList.toggle("active", active);
  });
}

function itemPayload() {
  const payload = {};
  for (const key of fields) {
    payload[key] = $(key).value.trim();
  }
  [
    "relax_index", "temp_min", "temp_max", "standalone_min", "standalone_max",
    "wear_total", "wear_maintenance", "wear_year", "maint_count", "wear_threshold",
  ].forEach((key) => {
    payload[key] = safeNumber(payload[key]);
  });
  payload.status = "Active";
  return ensureRequiredItemFields(payload);
}

function setTab(name) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${name}`);
  });
  document.body.classList.toggle("detail-route", name === "item-detail");
  if (TOP_LEVEL_TABS.has(name)) {
    state.pluginReturnHash = `#${name}`;
  }
  announcePluginNavigationState();
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

async function navigateTopLevelTab(tab) {
  if (!TOP_LEVEL_TABS.has(tab)) return;
  const targetHash = `#${tab}`;
  if (window.location.hash !== targetHash) {
    history.replaceState(null, "", targetHash);
  }
  await handleRoute();
}

function sectionLink(item, className = "section-link") {
  const label = item.section || item.code || "";
  if (!item?.id) {
    return label;
  }
  return `<a href="#item-${item.id}" class="${className}" data-item-id="${item.id}">${label}</a>`;
}

function allKnownItems() {
  const merged = new Map();
  [state.selectedItemDetail, ...Object.values(state.relatedItems || {}), ...state.items, ...state.watchItems, ...state.dashboardItems].forEach((item) => {
    const id = Number(item?.id || 0);
    if (id > 0 && !merged.has(id)) {
      merged.set(id, item);
    }
  });
  return [...merged.values()];
}

function findKnownItemById(itemId) {
  const targetId = Number(itemId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) return null;
  return allKnownItems().find((item) => Number(item?.id || 0) === targetId) || null;
}

function relatedEntryMatchesItem(entry, item) {
  if (!entry || !item) return false;
  const entryId = Number(entry.id || 0);
  const itemId = Number(item.id || 0);
  if (entryId > 0 && itemId > 0 && entryId === itemId) {
    return true;
  }
  const itemCode = String(item.code || "").trim().toLowerCase();
  const entryCode = String(entry.code || entry.source_code || entry.watch_ref || "").trim().toLowerCase();
  if (itemCode && entryCode && itemCode === entryCode) {
    return true;
  }
  const itemSection = String(item.section || "").trim().toLowerCase();
  const entrySection = String(entry.section || entry.source_section || "").trim().toLowerCase();
  if (itemSection && entrySection && itemSection === entrySection) {
    return true;
  }
  return false;
}

async function ensureKnownItemLoaded(itemId) {
  const existing = findKnownItemById(itemId);
  if (existing) return existing;
  const targetId = Number(itemId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) return null;
  try {
    const item = await api(`/api/items/${targetId}`);
    if (item?.id) {
      state.relatedItems[String(item.id)] = item;
      return item;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function clearRelatedOutfitFilter() {
  state.relatedOutfitItemId = null;
  state.relatedOutfitYear = "";
  state.relatedOutfitMonth = "";
}

function clearRelatedFeaturedLookFilter() {
  state.relatedFeaturedLookItemId = null;
}

function relatedTabHref(tab, itemId) {
  const normalizedTab = tab === "outfits" ? "outfits" : "featured-looks";
  const normalizedId = Number(itemId || 0);
  return normalizedId > 0 ? `#${normalizedTab}?item=${normalizedId}` : `#${normalizedTab}`;
}

async function openRelatedOutfitsForItem(item, targetDate = "") {
  if (!item?.id) return;
  await ensureKnownItemLoaded(item.id);
  const targetHash = relatedTabHref("outfits", item.id);
  const normalizedTargetDate = String(targetDate || "").trim();
  if (normalizedTargetDate) {
    state.relatedOutfitYear = normalizedTargetDate.slice(0, 4);
    state.relatedOutfitMonth = normalizedTargetDate.slice(0, 7);
    state.selectedOutfitDate = normalizedTargetDate;
  }
  if (window.location.hash === targetHash) {
    if (!state.outfits.length) {
      await refreshOutfits();
    }
    state.relatedOutfitItemId = item.id;
    await refreshRelatedOutfits(item.id);
    renderSelectedOutfit();
    setTab("outfits");
    setSidebarOpen(false);
    return;
  }
  window.location.hash = targetHash;
}

async function openRelatedFeaturedLooksForItem(item) {
  if (!item?.id) return;
  await ensureKnownItemLoaded(item.id);
  const targetHash = relatedTabHref("featured-looks", item.id);
  if (window.location.hash === targetHash) {
    if (!state.featuredLooks.length) {
      await refreshFeaturedLooks();
    }
    state.relatedFeaturedLookItemId = item.id;
    renderFeaturedLooks();
    setTab("featured-looks");
    setSidebarOpen(false);
    return;
  }
  window.location.hash = targetHash;
}

async function openFeaturedLookByIdentifier(lookIdentifier) {
  const targetLookId = String(lookIdentifier || "").trim();
  if (!targetLookId) return;
  const params = new URLSearchParams();
  params.set("look", targetLookId);
  const targetHash = `#featured-looks?${params.toString()}`;
  if (window.location.hash === targetHash) {
    if (!state.featuredLooks.length) {
      await refreshFeaturedLooks();
    }
    clearRelatedFeaturedLookFilter();
    state.relatedFeaturedLookEntries = [];
    state.selectedRelatedFeaturedLookId = targetLookId;
    renderFeaturedLooks();
    setTab("featured-looks");
    setSidebarOpen(false);
    return;
  }
  window.location.hash = targetHash;
}

function currentFeaturedLookRouteId() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [hash, hashQuery = ""] = rawHash.split("?");
  if (hash !== "featured-looks") return "";
  const params = new URLSearchParams(hashQuery);
  return String(params.get("look") || "").trim();
}

function fillSelect(node, options, placeholder = "全部") {
  node.innerHTML = "";
  const base = document.createElement("option");
  base.value = "";
  base.textContent = placeholder;
  node.appendChild(base);
  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    node.appendChild(option);
  });
}

function fillExactSelect(node, options, preferredValue = "") {
  if (!node) return;
  const values = options.filter(Boolean);
  node.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  if (!values.length) {
    node.value = "";
    return;
  }
  node.value = values.includes(preferredValue) ? preferredValue : values[0];
}

function renderCheckboxGroup(hostId, values, selectedValues, groupKey) {
  const host = $(hostId);
  if (!host) return;
  host.innerHTML = values.map((value) => `
    <label class="brand-share-check inventory-check">
      <input type="checkbox" data-filter-group="${groupKey}" value="${escapeHtml(value)}" ${selectedValues.includes(value) ? "checked" : ""}>
      <span>${escapeHtml(value)}</span>
    </label>
  `).join("");
}

function inventorySearchText() {
  return $("search-input")?.value.trim().toLowerCase() || "";
}

function watchSearchText() {
  return $("watch-search-input")?.value.trim().toLowerCase() || "";
}

function maintenanceSearchText() {
  return $("maintenance-search-input")?.value.trim().toLowerCase() || "";
}

function inventoryCandidateItems({ ignoreBrand = false } = {}) {
  const search = inventorySearchText();
  return inventorySourceItems().filter((item) => {
    if (search) {
      const haystack = [item.code, item.section, item.brand, item.material].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (state.inventoryFilters.owners.length && !state.inventoryFilters.owners.includes(item.owner || "")) return false;
    if (state.inventoryFilters.locs.length && !state.inventoryFilters.locs.includes(item.loc || "")) return false;
    if (shouldApplyInventoryRoleFilter(item) && state.inventoryFilters.roles.length && !state.inventoryFilters.roles.includes(inventoryRoleValue(item))) return false;
    if (state.inventoryFilters.channels.length && !state.inventoryFilters.channels.includes(inventoryChannelValue(item))) return false;
    if (!ignoreBrand && state.inventoryFilters.brands.length && !state.inventoryFilters.brands.includes(item.brand || "")) return false;
    return true;
  });
}

function watchCandidateItems({ ignoreBrand = false } = {}) {
  const search = watchSearchText();
  return watchSourceItems().filter((item) => {
    if (search) {
      const haystack = [item.code, item.section, item.brand, item.series].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (state.watchFilters.owners.length && !state.watchFilters.owners.includes(item.owner || "")) return false;
    if (!ignoreBrand && state.watchFilters.brands.length && !state.watchFilters.brands.includes(item.brand || "")) return false;
    return true;
  });
}

function maintenanceCandidateItems({ ignoreBrand = false } = {}) {
  const search = maintenanceSearchText();
  return maintenanceSourceItems().filter((item) => {
    if (String(item.layer_role || "").trim() === "Watch") return false;
    if (!(safeNumber(item.wear_threshold) > 0)) return false;
    if (search) {
      const haystack = [item.code, item.section, item.brand, item.material, item.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (state.maintenanceFilters.roles.length && !state.maintenanceFilters.roles.includes(maintenanceRoleValue(item))) return false;
    if (!ignoreBrand && state.maintenanceFilters.brands.length && !state.maintenanceFilters.brands.includes(item.brand || "")) return false;
    return true;
  });
}

function mergeTrackedSelections(currentValues, availableValues, knownValues = []) {
  const availableSet = new Set(availableValues);
  const knownSet = new Set(knownValues);
  const merged = [];
  (currentValues || []).forEach((value) => {
    if (availableSet.has(value) && !merged.includes(value)) {
      merged.push(value);
    }
  });
  availableValues.forEach((value) => {
    if (!knownSet.has(value) && !merged.includes(value)) {
      merged.push(value);
    }
  });
  return merged;
}

function syncDynamicBrandFilters() {
  const inventoryCandidates = inventoryCandidateItems({ ignoreBrand: true });
  const inventoryBrands = sortBrandsByAmount(
    [...new Set(inventoryCandidates.map((item) => item.brand).filter(Boolean))],
    inventoryCandidates,
  );
  state.inventoryFilters.brands = state.inventoryFilters.brands.filter((value) => inventoryBrands.includes(value));
  renderCheckboxGroup("brand-filter", inventoryBrands, state.inventoryFilters.brands, "brand");

  const watchCandidates = watchCandidateItems({ ignoreBrand: true });
  const watchBrands = sortBrandsByAmount(
    [...new Set(watchCandidates.map((item) => item.brand).filter(Boolean))],
    watchCandidates,
  );
  state.watchFilters.brands = state.watchFilters.brands.filter((value) => watchBrands.includes(value));
  renderCheckboxGroup("watch-brand-filter", watchBrands, state.watchFilters.brands, "brand");

  const maintenanceCandidates = maintenanceCandidateItems({ ignoreBrand: true });
  const maintenanceBrands = sortBrandsByAmount(
    [...new Set(maintenanceCandidates.map((item) => item.brand).filter(Boolean))],
    maintenanceCandidates,
  );
  if (!state.maintenanceBrandInitialized) {
    state.maintenanceFilters.brands = [...maintenanceBrands];
    state.maintenanceBrandInitialized = true;
  } else {
    state.maintenanceFilters.brands = mergeTrackedSelections(
      state.maintenanceFilters.brands,
      maintenanceBrands,
      state.maintenanceKnownBrands,
    );
  }
  state.maintenanceKnownBrands = [...maintenanceBrands];
  renderCheckboxGroup("maintenance-brand-filter", maintenanceBrands, state.maintenanceFilters.brands, "brand");
}

function inventoryFilterConfig(groupKey) {
  return {
    brand: { targetId: "brand-filter", selectionKey: "brands" },
    owner: { targetId: "owner-filter", selectionKey: "owners" },
    loc: { targetId: "loc-filter", selectionKey: "locs" },
    role: { targetId: "role-filter", selectionKey: "roles" },
    channel: { targetId: "channel-filter", selectionKey: "channels" },
  }[groupKey] || null;
}

function updateInventoryFilterUi() {
  const activeGroup = inventoryFilterConfig(state.inventoryActiveFilterGroup) ? state.inventoryActiveFilterGroup : "brand";
  state.inventoryActiveFilterGroup = activeGroup;
  const root = $("tab-inventory");
  if (!root) return;
  root.querySelectorAll(".inventory-filter-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.filterTab === activeGroup);
  });
  root.querySelectorAll(".inventory-filter-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.filterPanel === activeGroup);
  });
  const bulkButton = $("inventory-filter-bulk-btn");
  const config = inventoryFilterConfig(activeGroup);
  if (!bulkButton || !config) return;
  const checkboxes = Array.from(root.querySelectorAll(`#${config.targetId} input[type="checkbox"]`));
  const allSelected = checkboxes.length > 0 && checkboxes.every((checkbox) => checkbox.checked);
  bulkButton.textContent = allSelected ? "清空" : "全选";
}

function updateInventorySearchUi() {
  const input = $("search-input");
  const clearButton = $("search-clear-btn");
  if (!input || !clearButton) return;
  clearButton.classList.toggle("visible", Boolean(input.value.trim()));
}

function updateWatchSearchUi() {
  const input = $("watch-search-input");
  const clearButton = $("watch-search-clear-btn");
  if (!input || !clearButton) return;
  clearButton.classList.toggle("visible", Boolean(input.value.trim()));
}

function updateFeaturedLooksSearchUi() {
  const input = $("featured-looks-search-input");
  const clearButton = $("featured-looks-search-clear-btn");
  if (!input || !clearButton) return;
  clearButton.classList.toggle("visible", Boolean(input.value.trim()));
}

function updateMaintenanceSearchUi() {
  const input = $("maintenance-search-input");
  const clearButton = $("maintenance-search-clear-btn");
  if (!input || !clearButton) return;
  clearButton.classList.toggle("visible", Boolean(input.value.trim()));
}

function updateWatchFilterUi() {
  const activeGroup = ["brand", "owner"].includes(state.watchActiveFilterGroup) ? state.watchActiveFilterGroup : "brand";
  state.watchActiveFilterGroup = activeGroup;
  if (activeGroup === "owner") {
    const watches = watchSourceItems();
    const fallbackOwnerValues = state.options?.owners?.length
      ? state.options.owners.filter((value) => watches.some((item) => (item.owner || "") === value))
      : [...new Set(watches.map((item) => item.owner).filter(Boolean))];
    const fallbackOwners = sortOwnersByAmount(fallbackOwnerValues, watches);
    if (!state.watchFilters.owners.length && fallbackOwners.length) {
      const defaultWatchOwner = state.authUser && fallbackOwners.includes(state.authUser) ? state.authUser : "徐欣";
      state.watchFilters.owners = fallbackOwners.includes(defaultWatchOwner) ? [defaultWatchOwner] : [...fallbackOwners];
    }
    if ($("watch-owner-filter") && fallbackOwners.length) {
      renderCheckboxGroup("watch-owner-filter", fallbackOwners, state.watchFilters.owners, "owner");
    }
  }
  document.querySelectorAll(".watch-filter-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.filterTab === activeGroup);
  });
  document.querySelectorAll(".watch-filter-groups .inventory-filter-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.filterPanel === activeGroup);
  });
  const bulkButton = $("watch-filter-bulk-btn");
  if (!bulkButton) return;
  const targetId = activeGroup === "owner" ? "watch-owner-filter" : "watch-brand-filter";
  const checkboxes = Array.from(document.querySelectorAll(`#${targetId} input[type="checkbox"]`));
  const allSelected = checkboxes.length > 0 && checkboxes.every((checkbox) => checkbox.checked);
  bulkButton.textContent = allSelected ? "清空" : "全选";
}

function updateMaintenanceFilterUi() {
  const activeGroup = ["brand", "role"].includes(state.maintenanceActiveFilterGroup) ? state.maintenanceActiveFilterGroup : "brand";
  state.maintenanceActiveFilterGroup = activeGroup;
  document.querySelectorAll(".maintenance-filter-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.filterTab === activeGroup);
  });
  document.querySelectorAll(".maintenance-filter-groups .inventory-filter-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.filterPanel === activeGroup);
  });
  const bulkButton = $("maintenance-filter-bulk-btn");
  if (!bulkButton) return;
  const targetId = activeGroup === "role" ? "maintenance-role-filter" : "maintenance-brand-filter";
  const checkboxes = Array.from(document.querySelectorAll(`#${targetId} input[type="checkbox"]`));
  const allSelected = checkboxes.length > 0 && checkboxes.every((checkbox) => checkbox.checked);
  bulkButton.textContent = allSelected ? "清空" : "全选";
}

function syncInventoryFiltersFromDom() {
  state.inventoryFilters.brands = Array.from(document.querySelectorAll('#brand-filter input:checked')).map((node) => node.value);
  state.inventoryFilters.owners = Array.from(document.querySelectorAll('#owner-filter input:checked')).map((node) => node.value);
  state.inventoryFilters.locs = Array.from(document.querySelectorAll('#loc-filter input:checked')).map((node) => node.value);
  state.inventoryFilters.roles = Array.from(document.querySelectorAll('#role-filter input:checked')).map((node) => node.value);
  state.inventoryFilters.channels = Array.from(document.querySelectorAll('#channel-filter input:checked')).map((node) => node.value);
}

function syncWatchFiltersFromDom() {
  state.watchFilters.brands = Array.from(document.querySelectorAll('#watch-brand-filter input:checked')).map((node) => node.value);
  state.watchFilters.owners = Array.from(document.querySelectorAll('#watch-owner-filter input:checked')).map((node) => node.value);
}

function syncMaintenanceFiltersFromDom() {
  state.maintenanceFilters.brands = Array.from(document.querySelectorAll('#maintenance-brand-filter input:checked')).map((node) => node.value);
  state.maintenanceFilters.roles = Array.from(document.querySelectorAll('#maintenance-role-filter input:checked')).map((node) => node.value);
}

function bindInventoryFilterEvents() {
  if (state.inventoryFilterEventsBound) return;
  const root = $("tab-inventory");
  const host = root?.querySelector(".inventory-filter-groups");
  if (!host) return;
  const onFilterChange = (event) => {
    if (!event.target.closest('input[type="checkbox"]')) return;
    syncInventoryFiltersFromDom();
    updateInventoryFilterUi();
    refreshItems().catch((error) => console.error(error));
  };
  const onFilterAction = (event) => {
    const tabButton = event.target.closest(".inventory-filter-tab");
    if (tabButton) {
      state.inventoryActiveFilterGroup = tabButton.dataset.filterTab || "brand";
      updateInventoryFilterUi();
      renderInventoryBrandShareChart();
      return;
    }
    const bulkButton = event.target.closest("#inventory-filter-bulk-btn");
    if (!bulkButton) return;
    const config = inventoryFilterConfig(state.inventoryActiveFilterGroup);
    if (!config) return;
    const checkboxes = Array.from(root.querySelectorAll(`#${config.targetId} input[type="checkbox"]`));
    const shouldSelectAll = checkboxes.some((checkbox) => !checkbox.checked);
    checkboxes.forEach((checkbox) => {
      checkbox.checked = shouldSelectAll;
    });
    syncInventoryFiltersFromDom();
    updateInventoryFilterUi();
    refreshItems().catch((error) => console.error(error));
  };
  host.addEventListener("change", onFilterChange);
  host.addEventListener("input", onFilterChange);
  host.addEventListener("click", onFilterAction);
  state.inventoryFilterEventsBound = true;
}

function bindWatchFilterEvents() {
  if (state.watchFilterEventsBound) return;
  const host = document.querySelector(".watch-filter-groups");
  if (!host) return;
  const onFilterChange = (event) => {
    if (!event.target.closest('input[type="checkbox"]')) return;
    syncWatchFiltersFromDom();
    updateWatchFilterUi();
    refreshWatchItems().catch((error) => console.error(error));
  };
  const onFilterAction = (event) => {
    const tabButton = event.target.closest(".watch-filter-tab");
    if (tabButton) {
      state.watchActiveFilterGroup = tabButton.dataset.filterTab || "brand";
      updateWatchFilterUi();
      renderWatchBrandShareChart();
      return;
    }
    const bulkButton = event.target.closest("#watch-filter-bulk-btn");
    if (!bulkButton) return;
    const targetId = state.watchActiveFilterGroup === "owner" ? "watch-owner-filter" : "watch-brand-filter";
    const checkboxes = Array.from(document.querySelectorAll(`#${targetId} input[type="checkbox"]`));
    const shouldSelectAll = checkboxes.some((checkbox) => !checkbox.checked);
    checkboxes.forEach((checkbox) => {
      checkbox.checked = shouldSelectAll;
    });
    syncWatchFiltersFromDom();
    updateWatchFilterUi();
    refreshWatchItems().catch((error) => console.error(error));
  };
  host.addEventListener("change", onFilterChange);
  host.addEventListener("input", onFilterChange);
  host.addEventListener("click", onFilterAction);
  state.watchFilterEventsBound = true;
}

function bindMaintenanceFilterEvents() {
  if (state.maintenanceFilterEventsBound) return;
  const host = document.querySelector(".maintenance-filter-groups");
  if (!host) return;
  const onFilterChange = (event) => {
    if (!event.target.closest('input[type="checkbox"]')) return;
    syncMaintenanceFiltersFromDom();
    updateMaintenanceFilterUi();
    refreshMaintenancePlanning();
  };
  const onFilterAction = (event) => {
    const tabButton = event.target.closest(".maintenance-filter-tab");
    if (tabButton) {
      state.maintenanceActiveFilterGroup = tabButton.dataset.filterTab || "brand";
      updateMaintenanceFilterUi();
      renderMaintenanceChart();
      return;
    }
    const bulkButton = event.target.closest("#maintenance-filter-bulk-btn");
    if (!bulkButton) return;
    const targetId = state.maintenanceActiveFilterGroup === "role" ? "maintenance-role-filter" : "maintenance-brand-filter";
    const checkboxes = Array.from(document.querySelectorAll(`#${targetId} input[type="checkbox"]`));
    const shouldSelectAll = checkboxes.some((checkbox) => !checkbox.checked);
    checkboxes.forEach((checkbox) => {
      checkbox.checked = shouldSelectAll;
    });
    syncMaintenanceFiltersFromDom();
    updateMaintenanceFilterUi();
    refreshMaintenancePlanning();
  };
  host.addEventListener("change", onFilterChange);
  host.addEventListener("input", onFilterChange);
  host.addEventListener("click", onFilterAction);
  state.maintenanceFilterEventsBound = true;
}

function photoUrl(photo, { thumb = false } = {}) {
  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e8dece"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Segoe UI" font-size="16" fill="#6b6258">${photo.original_name || photo.file_name}</text></svg>`
  )}`;
  const suffix = thumb ? "?thumb=1" : "";
  if (photo.content_path) return authenticatedResourceUrl(`${photo.content_path}${suffix}`);
  if (photo.has_blob) return authenticatedResourceUrl(`/api/photos/${photo.id}/content${suffix}`);
  if (photo.source_tag === "upload") return `/media/${photo.file_name}`;
  return fallback;
}

function photosForContext(entityType, entityId) {
  const id = Number(entityId);
  if (entityType === "item") {
    return state.selectedItemDetail?.id === id ? state.selectedItemDetail.photos || [] : [];
  }
  if (entityType === "outfit") {
    return state.outfitDetailsById[String(id)]?.photos
      || state.relatedOutfitEntries.find((outfit) => Number(outfit.id) === id)?.photos
      || state.outfits.find((outfit) => Number(outfit.id) === id)?.photos
      || [];
  }
  if (entityType === "featured-look") {
    return state.relatedFeaturedLookEntries.find((look) => Number(look.id) === id)?.photos
      || state.featuredLooks.find((look) => Number(look.id) === id)?.photos
      || [];
  }
  return [];
}

function isApproxHongKongCoordinate(latitude, longitude) {
  return latitude >= 22.1 && latitude <= 22.6 && longitude >= 113.8 && longitude <= 114.5;
}

function isApproxMacauCoordinate(latitude, longitude) {
  return latitude >= 22.05 && latitude <= 22.25 && longitude >= 113.5 && longitude <= 113.65;
}

function isApproxTaiwanCoordinate(latitude, longitude) {
  return latitude >= 21.8 && latitude <= 25.5 && longitude >= 119.8 && longitude <= 122.1;
}

function isMainlandChinaCoordinate(latitude, longitude) {
  if (longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271) {
    return false;
  }
  if (isApproxHongKongCoordinate(latitude, longitude)) return false;
  if (isApproxMacauCoordinate(latitude, longitude)) return false;
  if (isApproxTaiwanCoordinate(latitude, longitude)) return false;
  return true;
}

function gcjTransformLatitude(x, y) {
  let result = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  result += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
  result += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
  result += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
  return result;
}

function gcjTransformLongitude(x, y) {
  let result = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  result += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
  result += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
  result += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
  return result;
}

function mapLinkCoordinates(latitude, longitude) {
  if (!isMainlandChinaCoordinate(latitude, longitude)) {
    return { latitude, longitude };
  }
  const axisA = 6378245;
  const axisEe = 0.00669342162296594323;
  const deltaLat = gcjTransformLatitude(longitude - 105, latitude - 35);
  const deltaLng = gcjTransformLongitude(longitude - 105, latitude - 35);
  const radLat = latitude / 180 * Math.PI;
  const magic = 1 - axisEe * Math.sin(radLat) * Math.sin(radLat);
  const sqrtMagic = Math.sqrt(magic);
  const adjustedLat = latitude + (deltaLat * 180) / ((axisA * (1 - axisEe)) / (magic * sqrtMagic) * Math.PI);
  const adjustedLng = longitude + (deltaLng * 180) / (axisA / sqrtMagic * Math.cos(radLat) * Math.PI);
  return {
    latitude: Number(adjustedLat.toFixed(6)),
    longitude: Number(adjustedLng.toFixed(6)),
  };
}

function photoMapUrl(photo, entityType) {
  if (entityType !== "outfit") return "";
  const rawLatitude = photo?.gps_lat;
  const rawLongitude = photo?.gps_lng;
  if (rawLatitude === null || rawLatitude === undefined || rawLatitude === "") return "";
  if (rawLongitude === null || rawLongitude === undefined || rawLongitude === "") return "";
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "";
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return "";
  const mapCoordinates = mapLinkCoordinates(latitude, longitude);
  const mapLatitude = mapCoordinates.latitude;
  const mapLongitude = mapCoordinates.longitude;
  const mapPinLabel = encodeURIComponent("位置");
  const userAgent = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return `https://maps.apple.com/?ll=${mapLatitude},${mapLongitude}&q=${mapPinLabel}`;
  }
  if (/Android/i.test(userAgent)) {
    return `geo:0,0?q=${mapLatitude},${mapLongitude}(${mapPinLabel})`;
  }
  return `https://maps.apple.com/?ll=${mapLatitude},${mapLongitude}&q=${mapPinLabel}`;
}

function renderPhotoCardsHtml(photos, entityType, entityId) {
  if (!photos?.length) {
    return `<div class="list-item photo-empty-note">当前还没有图片。</div>`;
  }
  return photos.map((photo, index) => {
    const mapUrl = photoMapUrl(photo, entityType);
    const canSetPrimary = entityType === "item" && photos.length > 1 && index > 0 && Number(photo.id || 0) > 0;
    return `
      <div class="photo-card" data-photo-entity="${escapeHtml(entityType)}" data-photo-owner-id="${escapeHtml(entityId)}" data-photo-index="${index}" data-photo-id="${escapeHtml(photo.id || "")}">
        <img src="${photoUrl(photo, { thumb: true })}" alt="${escapeHtml(photo.original_name || photo.file_name || "")}" loading="lazy">
        ${canSetPrimary ? `
          <button
            type="button"
            class="photo-primary-btn"
            data-photo-order-action="first"
            data-photo-id="${escapeHtml(photo.id)}"
            data-photo-owner-id="${escapeHtml(entityId)}"
            title="设为第一张"
            aria-label="设为第一张"
          ><span aria-hidden="true"></span></button>
        ` : ""}
        ${mapUrl ? `
          <a
            class="photo-map-link"
            data-photo-map-link="1"
            href="${mapUrl}"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="打开地图"
            title="打开地图"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2.25a6.75 6.75 0 0 1 6.75 6.75c0 4.64-5.3 10.43-6.1 11.28a.9.9 0 0 1-1.3 0C10.55 19.43 5.25 13.64 5.25 9A6.75 6.75 0 0 1 12 2.25Zm0 4.2A2.55 2.55 0 1 0 12 11.55a2.55 2.55 0 0 0 0-5.1Z"></path>
            </svg>
          </a>
        ` : ""}
      </div>
    `;
  }).join("");
}

function renderEntityPhotoSection(photos, entityType, entityId, uploadUrl) {
  return `
    <div class="detail-photo-section context-photo-section">
      <div class="photo-grid detail-photo-strip context-photo-strip">
        ${renderPhotoCardsHtml(photos, entityType, entityId)}
      </div>
      <label class="upload-btn" aria-label="上传图片" title="上传图片（一次最多 8 张）">
        +
        <input
          class="entity-photo-input"
          type="file"
          accept="image/*"
          multiple
          data-upload-url="${escapeHtml(uploadUrl)}"
          data-entity-type="${escapeHtml(entityType)}"
          data-entity-id="${escapeHtml(entityId)}"
        >
      </label>
    </div>
  `;
}

function updatePhotoLightbox() {
  const lightbox = $("photo-lightbox");
  const image = $("photo-lightbox-image");
  const counter = $("photo-lightbox-counter");
  const deleteButton = $("photo-lightbox-delete");
  if (!lightbox || !image || !counter) return;
  const photos = state.photoLightboxPhotos || [];
  if (!photos.length) {
    lightbox.hidden = true;
    document.body.classList.remove("photo-lightbox-open");
    image.removeAttribute("src");
    image.alt = "";
    counter.textContent = "";
    if (deleteButton) deleteButton.hidden = true;
    announcePluginNavigationState();
    return;
  }
  const index = Math.max(0, Math.min(state.photoLightboxIndex, photos.length - 1));
  state.photoLightboxIndex = index;
  const photo = photos[index];
  image.src = photoUrl(photo);
  image.alt = photo.original_name || photo.file_name || "";
  counter.textContent = `${index + 1} / ${photos.length}`;
  counter.title = photo.location_display ? `位置 ${photo.location_display}` : `${index + 1} / ${photos.length}`;
  if (deleteButton) {
    deleteButton.hidden = !photo.delete_path;
    deleteButton.disabled = Boolean(state.photoLightboxDeleting);
    deleteButton.dataset.photoId = String(photo.id || "");
  }
  lightbox.hidden = false;
  document.body.classList.add("photo-lightbox-open");
  announcePluginNavigationState();
}

function openPhotoLightbox(photos, index = 0, context = null) {
  if (!photos || !photos.length) return;
  state.photoLightboxPhotos = photos;
  state.photoLightboxIndex = index;
  state.photoLightboxContext = context;
  updatePhotoLightbox();
}

function closePhotoLightbox() {
  state.photoLightboxPhotos = [];
  state.photoLightboxIndex = 0;
  state.photoLightboxTouchStart = null;
  state.photoLightboxContext = null;
  updatePhotoLightbox();
}

function movePhotoLightbox(step) {
  const photos = state.photoLightboxPhotos || [];
  if (!photos.length) return;
  const length = photos.length;
  state.photoLightboxIndex = (state.photoLightboxIndex + step + length) % length;
  updatePhotoLightbox();
}

function confirmPhotoDelete(photo, context) {
  const scopeLabel = {
    item: "商品",
    outfit: "历史记录",
    "featured-look": "精选套装",
  }[context?.entityType] || "当前";
  const name = String(photo?.original_name || photo?.file_name || "").trim();
  const suffix = name ? `\n\n图片：${name}` : "";
  return window.confirm(`确认删除这张${scopeLabel}图片？删除后不能撤销。${suffix}`);
}

function detailValue(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function hasMeaningfulDetailValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "object") {
    if (value.kind === "last-worn-link") {
      return hasMeaningfulDetailValue(value.label);
    }
    return true;
  }
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).trim();
  if (!normalized || normalized === "-") return false;
  if (/^0+(\.0+)?$/.test(normalized)) return false;
  return true;
}

function hasRenderableRelaxSpan(value) {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim();
  return normalized !== "" && normalized !== "-";
}

function isCompactDetailLabel(label) {
  return [
    "购买日期",
    "入库时间",
    "上次穿着",
    "上次佩戴",
    "Owner",
    "地点",
    "层级",
    "场景",
    "松弛指数",
    "温区",
    "外穿温区",
    "总穿着/2026",
    "磨损指数",
    "保养次数",
    "状态",
    "原始价格",
    "实际价格",
    "尺码",
  ].includes(String(label || "").trim());
}

function canWriteOwnedRecord(record) {
  if (!record) return false;
  if (state.authIsAdmin) return true;
  const recordOwner = String(record.owner || "").trim();
  const authUser = String(state.authUser || "").trim();
  return Boolean(recordOwner && authUser && recordOwner === authUser);
}

function canEditItemBaseline(item) {
  if (!item) return false;
  const sourceSheet = String(item.source_sheet || "").trim();
  if (!sourceSheet || sourceSheet === "WearCount" || sourceSheet.startsWith("_")) return false;
  return canWriteOwnedRecord(item);
}

function normalizedItemLayerRole(value) {
  return String(value || "").trim().toLowerCase();
}

function roleUsesStandaloneTemperature(role) {
  return ["inner", "middle"].includes(normalizedItemLayerRole(role));
}

function roleUsesLayerTemperature(role) {
  return ["outer", "bottom"].includes(normalizedItemLayerRole(role));
}

function roleAllowsOuterType(role) {
  return normalizedItemLayerRole(role) === "outer";
}

function clothingFieldsForRole(role) {
  return CLOTHING_BASELINE_EDIT_FIELDS.filter((field) => {
    if (field.key === "outer_type") return roleAllowsOuterType(role);
    if (field.key === "temp_min" || field.key === "temp_max") return roleUsesLayerTemperature(role);
    if (field.key === "standalone_min" || field.key === "standalone_max") return roleUsesStandaloneTemperature(role);
    return true;
  });
}

function itemBaselineEditFields(item) {
  if (!item) return [];
  if (item.layer_role === "Watch") return WATCH_BASELINE_EDIT_FIELDS;
  const fields = [...clothingFieldsForRole(item.layer_role)];
  const ownerIndex = fields.findIndex((field) => field.key === "owner");
  fields.splice(ownerIndex >= 0 ? ownerIndex + 1 : fields.length, 0, CLOTHING_STATUS_EDIT_FIELD);
  return fields;
}

function editItemFieldOptions(item, field) {
  if (!item || !field) return [];
  if (field.key === "status" && item.layer_role !== "Watch") {
    return ["激活", "保养", "归档"];
  }
  if (field.key === "status" && item.layer_role === "Watch") {
    const sourceStatuses = [
      ...new Set(watchSourceItems().map((entry) => String(entry?.status || "").trim()).filter(Boolean)),
    ];
    const currentValue = String(item?.status || "").trim();
    const values = currentValue && !sourceStatuses.includes(currentValue)
      ? [currentValue, ...sourceStatuses]
      : sourceStatuses;
    return values.sort((left, right) => left.localeCompare(right, "zh-CN"));
  }
  if (field.key === "owner") {
    const source = item.layer_role === "Watch" ? watchSourceItems() : inventorySourceItems();
    return ownerOptionsForContext(source, item?.owner || "", { create: false });
  }
  const kind = item.layer_role === "Watch" ? "watch" : "wardrobe";
  const baseOptions = createItemFieldOptions(field, kind);
  if (!baseOptions.length) {
    return [];
  }
  const currentValue = String(item?.[field.key] ?? "").trim();
  if (currentValue && !baseOptions.includes(currentValue)) {
    return [currentValue, ...baseOptions];
  }
  return baseOptions;
}

function editFieldDisplayValue(item, field) {
  if (field?.key === "status" && item?.layer_role !== "Watch") {
    return displayWardrobeStatus(item);
  }
  const raw = item?.[field.key] ?? "";
  if (field.type === "date") {
    return formatBeijingDate(raw);
  }
  return String(raw);
}

function renderItemEditField(item, field) {
  const value = editFieldDisplayValue(item, field);
  const options = editItemFieldOptions(item, field);
  const inputMode = field.inputMode ? ` inputmode="${escapeHtml(field.inputMode)}"` : "";
  if (options.length) {
    return `
      <label class="detail-edit-field">
        <span class="detail-label">${escapeHtml(field.label)}</span>
        <select data-edit-field="${escapeHtml(field.key)}">
          <option value=""></option>
          ${options.map((option) => `
            <option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>
          `).join("")}
        </select>
      </label>
    `;
  }
  if (field.multiline) {
    return `
      <label class="detail-edit-field detail-edit-field-wide">
        <span class="detail-label">${escapeHtml(field.label)}</span>
        <textarea data-edit-field="${escapeHtml(field.key)}" rows="3">${escapeHtml(String(value))}</textarea>
      </label>
    `;
  }
  return `
    <label class="detail-edit-field">
      <span class="detail-label">${escapeHtml(field.label)}</span>
      <input type="${field.type === "date" ? "date" : "text"}" data-edit-field="${escapeHtml(field.key)}" value="${escapeHtml(String(value))}"${inputMode}>
    </label>
  `;
}

function formatStandaloneTemperature(item) {
  const low = safeNumber(item?.standalone_min);
  const high = safeNumber(item?.standalone_max);
  if (low !== null && high !== null) return `${low}–${high}°C`;
  if (low !== null) return `${low}°C+`;
  if (high !== null) return `≤${high}°C`;
  return "";
}

function formatLayerTemperature(item) {
  const low = safeNumber(item?.temp_min);
  const high = safeNumber(item?.temp_max);
  if (low !== null && high !== null) return `${low}–${high}°C`;
  if (low !== null) return `${low}°C+`;
  if (high !== null) return `≤${high}°C`;
  return "";
}

function formatMetricNumber(value) {
  const numeric = safeNumber(value);
  if (numeric === null) return "";
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1).replace(/\.0$/, "");
}

function featuredLookItemTemperature(entry) {
  return formatLayerTemperature(entry) || formatStandaloneTemperature(entry);
}

function buildFeaturedLookMetaParts(look) {
  const temperature = formatLayerTemperature(look);
  return [
    hasMeaningfulDetailValue(look?.relax_center) ? `松弛中枢 ${escapeHtml(look.relax_center)}` : "",
    hasRenderableRelaxSpan(look?.relax_span) ? `松弛跨度 ${escapeHtml(look.relax_span)}` : "",
    temperature ? escapeHtml(temperature) : "",
    hasMeaningfulDetailValue(look?.scene_tag_target) ? escapeHtml(look.scene_tag_target) : "",
  ].filter(Boolean);
}

function copyTextLine(label, value) {
  const text = String(value ?? "").trim();
  return text ? `${label}：${text}` : "";
}

function outfitCopyRoleLabel(item) {
  const role = normalizeOutfitEditRole(item?.role || item?.layer_role || "");
  return {
    Inner: "Inner",
    Middle: "Middle",
    Outer: "Outer",
    Bottom: "Bottom",
    Footwear: "Footwear",
    Watch: "Watch",
  }[role] || role || "Item";
}

function copyColorMetaParts(item) {
  const primary = String(item?.primary_color || "").trim();
  const secondary = String(item?.secondary_color || "").trim();
  return [
    primary ? `第一色系: ${primary}` : "",
    secondary ? `第二色系: ${secondary}` : "",
  ].filter(Boolean);
}

function formatOutfitCopyItemLine(item) {
  const sectionText = String(item?.section || item?.code || "").trim() || "未命名";
  const codeText = String(item?.code || "").trim();
  const relaxText = formatMetricNumber(item?.relax_index);
  const metaParts = [
    String(item?.brand || "").trim(),
    normalizeOutfitEditRole(item?.role || item?.layer_role || "") === "Outer" ? String(item?.outer_type || "").trim() : "",
    relaxText ? `Relax指数: ${relaxText}` : "",
    ...copyColorMetaParts(item),
    codeText && codeText !== sectionText ? codeText : "",
    item?.has_base_layer ? "有打底" : "",
  ].filter(Boolean);
  return `- ${outfitCopyRoleLabel(item)}: ${sectionText}${metaParts.length ? ` [${metaParts.join(" | ")}]` : ""}`;
}

function formatFeaturedLookCopyItemLine(item) {
  const slotLabel = featuredLookSlotLabel(String(item?.slot || "").trim());
  const sectionText = String(item?.section || item?.source_section || item?.source_code || item?.code || "").trim() || "未命名";
  const codeText = String(item?.source_code || item?.code || "").trim();
  const linked = Number.isFinite(Number(item?.id)) && Number(item.id) > 0;
  const relaxText = formatMetricNumber(item?.relax_index);
  const metaParts = [
    String(item?.brand || "").trim(),
    relaxText ? `Relax指数: ${relaxText}` : "",
    ...copyColorMetaParts(item),
    buildFeaturedLookItemMetaText(item),
    codeText && codeText !== sectionText ? codeText : "",
    linked ? "" : "未匹配本地商品",
  ].filter(Boolean);
  return `- ${slotLabel}: ${sectionText}${metaParts.length ? ` [${metaParts.join(" | ")}]` : ""}`;
}

function buildOutfitCopyText(outfit) {
  if (!outfit) return "";
  const sortedItems = [...(outfit.items || [])].sort((a, b) => {
    const rankDiff = outfitItemSortRank(a) - outfitItemSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return String(a.section || a.code || "").localeCompare(String(b.section || b.code || ""), "zh-CN");
  });
  const lines = [
    "历史记录搭配",
    copyTextLine("日期", outfit.wear_date),
    copyTextLine("Owner", outfit.owner),
    copyTextLine("场景", outfit.scene_tag),
    copyTextLine("温度", formatOutfitTemperature(outfit)),
    copyTextLine("地点", outfit.inventory_loc || outfit.city),
    copyTextLine("穿着模式", outfit.wear_mode),
    copyTextLine("平均松弛", formatMetricNumber(outfit.avg_relax)),
    copyTextLine("备注", outfit.notes),
    "",
    "单品：",
    ...(sortedItems.length ? sortedItems.map((item) => formatOutfitCopyItemLine(item)) : ["- 当前详情还没有单品信息"]),
  ];
  return lines.filter((line, index, arr) => line || (index > 0 && arr[index - 1] !== "")).join("\n").trim();
}

function buildFeaturedLookCopyText(look) {
  if (!look) return "";
  const seenKeys = new Set();
  const items = (look.items || []).filter((item) => {
    const dedupeKey = item.id
      ? `id:${item.id}`
      : `src:${item.source_code || ""}|${item.source_section || ""}`;
    if (seenKeys.has(dedupeKey)) return false;
    seenKeys.add(dedupeKey);
    return true;
  });
  const wearCount = Number.isFinite(Number(look?.wear_count)) ? Math.max(0, Number(look.wear_count)) : 0;
  const lines = [
    "精选套装搭配",
    copyTextLine("Look ID", look.look_id),
    copyTextLine("Owner", look.owner),
    copyTextLine("状态", look.status),
    copyTextLine("穿着次数", String(wearCount)),
    copyTextLine("松弛中枢", formatMetricNumber(look.relax_center)),
    copyTextLine("松弛跨度", formatMetricNumber(look.relax_span)),
    copyTextLine("温区", formatLayerTemperature(look)),
    copyTextLine("Scene tag", look.scene_tag_target),
    copyTextLine("说明", look.notes),
    "",
    "单品：",
    ...(items.length ? items.map((item) => formatFeaturedLookCopyItemLine(item)) : ["- 当前套装还没有单品信息"]),
  ];
  return lines.filter((line, index, arr) => line || (index > 0 && arr[index - 1] !== "")).join("\n").trim();
}

function copyDetailFieldText(value) {
  if (value && typeof value === "object" && value.kind === "last-worn-link") {
    return String(detailValue(value.label)).trim();
  }
  return String(detailValue(value)).trim();
}

function buildItemCopyText(item, options = {}) {
  if (!item) return "";
  const heading = String(options.heading || "").trim();
  const includeTypeTitle = options.includeTypeTitle !== false;
  const isWatch = item.layer_role === "Watch";
  const originalPrice = String(item.price_original || "").trim();
  const originalCurrency = String(item.price_original_currency || "").trim().toUpperCase();
  const originalPriceDisplay = originalPrice && originalCurrency ? `${originalCurrency} ${originalPrice}` : originalPrice;
  const actualPrice = String(item.price_cny || "").trim();
  const originalPriceValue = parsePrice(originalPrice);
  const actualPriceValue = parsePrice(actualPrice);
  const samePriceValue = originalPriceValue > 0 && actualPriceValue > 0 && Math.abs(originalPriceValue - actualPriceValue) < 0.0001;
  const samePriceText = originalPrice && actualPrice && originalPrice === actualPrice;
  const originalCurrencyDiffers = Boolean(originalCurrency && originalCurrency !== "CNY");
  const priceFields = actualPrice
    ? (
        originalPrice && ((!samePriceValue && !samePriceText) || originalCurrencyDiffers)
          ? [
              ["原始价格", originalPriceDisplay],
              ["实际价格", actualPrice],
            ]
          : [["实际价格", actualPrice]]
      )
    : (originalPrice ? [["原始价格", originalPriceDisplay]] : []);
  const normalizedRole = normalizedItemLayerRole(item.layer_role);
  const showStandaloneTemperature = roleUsesStandaloneTemperature(normalizedRole);
  const showLayerTemperature = roleUsesLayerTemperature(normalizedRole);
  const layerTemperature = showLayerTemperature ? formatLayerTemperature(item) : "";
  const standaloneTemperature = showStandaloneTemperature ? formatStandaloneTemperature(item) : "";
  const normalizedLayerRoleText = String(item.layer_role || "").trim();
  const normalizedOuterTypeText = String(item.outer_type || "").trim();
  const layerRoleDisplay = roleAllowsOuterType(normalizedRole)
    ? (normalizedOuterTypeText || normalizedLayerRoleText)
    : normalizedLayerRoleText;
  const detailSections = buildDetailSections(item, "item-detail-view", priceFields, layerRoleDisplay, layerTemperature, standaloneTemperature)
    .map((section) => ({ ...section, fields: compactDetailFields(section.fields) }))
    .filter((section) => section.fields.length);
  const lines = [];
  if (heading) {
    lines.push(heading);
  }
  if (includeTypeTitle) {
    lines.push(isWatch ? "腕表详情" : "衣物详情");
  }
  lines.push(copyTextLine(isWatch ? "名称" : "当前商品", item.section || item.code));
  detailSections.forEach((section) => {
    lines.push("");
    lines.push(`${section.title}：`);
    section.fields.forEach(([label, value]) => {
      lines.push(`- ${label}：${copyDetailFieldText(value)}`);
    });
  });
  if (hasMeaningfulDetailValue(item.official_desc)) {
    lines.push("");
    lines.push(`${isWatch ? "功能" : "官网描述"}：`);
    lines.push(String(detailValue(item.official_desc)).trim());
  }
  if (!isWatch && hasMeaningfulDetailValue(item.notes)) {
    lines.push("");
    lines.push("备注：");
    lines.push(String(detailValue(item.notes)).trim());
  }
  return lines.filter((line, index, arr) => line || (index > 0 && arr[index - 1] !== "")).join("\n").trim();
}

function findOutfitForCopy(outfitId) {
  const id = Number(outfitId || 0);
  if (!id) return null;
  return state.outfitDetailsById[String(id)]
    || state.relatedOutfitEntries.find((entry) => Number(entry.id) === id)
    || state.outfits.find((entry) => Number(entry.id) === id)
    || null;
}

async function ensureOutfitForCopy(outfitId) {
  const existing = findOutfitForCopy(outfitId);
  if (existing?.items?.length) return existing;
  const id = Number(outfitId || 0);
  if (!id) return existing;
  try {
    const detail = await api(`/api/outfits/${id}`);
    state.outfitDetailsById[String(id)] = detail;
    return detail;
  } catch (_) {
    return existing;
  }
}

function findFeaturedLookForCopy(lookId) {
  const id = Number(lookId || 0);
  if (!id) return null;
  return state.relatedFeaturedLookEntries.find((entry) => Number(entry.id) === id)
    || state.featuredLooks.find((entry) => Number(entry.id) === id)
    || null;
}

async function writeClipboardText(text) {
  const content = String(text || "");
  if (!content) throw new Error("empty_clipboard_text");
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      return;
    } catch (_) {
      // Fall through to execCommand fallback.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error("clipboard_unavailable");
  }
}

function flashCopyButton(button, text = "已复制") {
  if (!button) return;
  const idleLabel = button.dataset.copyIdleLabel || button.textContent.trim() || "复制搭配";
  const priorTimer = Number(button.dataset.copyTimer || "0");
  if (priorTimer) {
    window.clearTimeout(priorTimer);
  }
  button.dataset.copyIdleLabel = idleLabel;
  button.textContent = text;
  button.disabled = true;
  const timer = window.setTimeout(() => {
    button.textContent = idleLabel;
    button.disabled = false;
    button.dataset.copyTimer = "";
  }, 1400);
  button.dataset.copyTimer = String(timer);
}

function aiAnalysisKey(kind, entityId) {
  return `${kind}:${Number(entityId || 0)}`;
}

function isAiPanelOpen(kind, entityId) {
  return Boolean(state.aiPanelsOpen?.[aiAnalysisKey(kind, entityId)]);
}

function setAiPanelOpen(kind, entityId, isOpen) {
  const key = aiAnalysisKey(kind, entityId);
  state.aiPanelsOpen = { ...(state.aiPanelsOpen || {}) };
  if (isOpen) {
    state.aiPanelsOpen[key] = true;
  } else {
    delete state.aiPanelsOpen[key];
  }
}

function aiPromptPanelKey(kind, entityId = 0) {
  return `${kind}:${Number(entityId || 0)}`;
}

function isAiPromptPanelOpen(kind, entityId = 0) {
  return Boolean(state.aiPromptPanelsOpen?.[aiPromptPanelKey(kind, entityId)]);
}

function setAiPromptPanelOpen(kind, entityId = 0, isOpen) {
  const key = aiPromptPanelKey(kind, entityId);
  state.aiPromptPanelsOpen = { ...(state.aiPromptPanelsOpen || {}) };
  if (isOpen) {
    state.aiPromptPanelsOpen[key] = true;
  } else {
    delete state.aiPromptPanelsOpen[key];
  }
}

function isAiAnalysisEditing(kind, entityId) {
  return state.aiAnalysisEditKey === aiAnalysisKey(kind, entityId);
}

function openAiAnalysisEditor(kind, entityId, text) {
  state.aiAnalysisEditKey = aiAnalysisKey(kind, entityId);
  state.aiAnalysisEditText = String(text || "");
  state.aiAnalysisEditSaving = false;
  state.aiAnalysisEditError = "";
  setAiPanelOpen(kind, entityId, true);
}

function closeAiAnalysisEditor() {
  state.aiAnalysisEditKey = "";
  state.aiAnalysisEditText = "";
  state.aiAnalysisEditSaving = false;
  state.aiAnalysisEditError = "";
}

function aiPromptTemplateKind(kind) {
  if (kind === "outfit-draft") return "outfit_draft";
  return kind === "featured-look" ? "featured_look" : "outfit";
}

function applyAiPromptTemplates(prompts = {}) {
  state.aiPromptTemplates = { outfit: "", outfit_draft: "", featured_look: "" };
  state.aiPromptDrafts = {};
}

function aiPromptDraftValue(kind) {
  const key = aiPromptTemplateKind(kind);
  if (Object.prototype.hasOwnProperty.call(state.aiPromptDrafts || {}, key)) {
    return String(state.aiPromptDrafts[key] || "");
  }
  return String(state.aiPromptTemplates?.[key] || "");
}

function setAiPromptDraft(kind, value) {
  const key = aiPromptTemplateKind(kind);
  state.aiPromptDrafts = { ...(state.aiPromptDrafts || {}), [key]: String(value || "") };
  if (state.aiPromptErrorKind === key) {
    state.aiPromptErrorKind = "";
    state.aiPromptError = "";
  }
  if (state.aiPromptSuccessKind === key) {
    state.aiPromptSuccessKind = "";
  }
}

function rerenderAiAnalysisHost(kind) {
  if (kind === "featured-look") {
    renderFeaturedLooks();
    if (state.itemDetailSubtab === "featured-looks" && state.selectedItemDetail) {
      renderItemDetail(state.selectedItemDetail);
    }
    return;
  }
  renderSelectedOutfit();
  if (state.itemDetailSubtab === "outfits" && state.selectedItemDetail) {
    renderItemDetail(state.selectedItemDetail);
  }
}

function renderAiAnalysisPanel(kind, record, className = "") {
  return "";
}

function renderRecordExpandableRow(kind, record, notesText, noteClassName = "") {
  const notesPanel = hasMeaningfulDetailValue(notesText)
    ? renderExpandableText("说明", notesText, noteClassName)
    : "";
  const aiPanel = renderAiAnalysisPanel(kind, record, noteClassName);
  if (!notesPanel && !aiPanel) return "";
  return `
    <div class="record-expandable-row">
      ${notesPanel}
      ${aiPanel}
    </div>
  `;
}

function findOutfitById(outfitId) {
  const id = Number(outfitId || 0);
  if (!Number.isFinite(id) || id <= 0) return null;
  return state.outfitDetailsById[String(id)]
    || state.outfits.find((entry) => Number(entry.id) === id)
    || state.relatedOutfitEntries.find((entry) => Number(entry.id) === id)
    || null;
}

function findFeaturedLookById(lookId) {
  const id = Number(lookId || 0);
  if (!Number.isFinite(id) || id <= 0) return null;
  return state.featuredLooks.find((entry) => Number(entry.id) === id)
    || state.relatedFeaturedLookEntries.find((entry) => Number(entry.id) === id)
    || null;
}

async function copyOutfitSummary(button, outfitId) {
  const outfit = await ensureOutfitForCopy(outfitId);
  if (!outfit) {
    window.alert("当前历史记录详情还没有加载完成。");
    return;
  }
  await writeClipboardText(buildOutfitCopyText(outfit));
  flashCopyButton(button);
}

async function copyFeaturedLookSummary(button, lookId) {
  const look = findFeaturedLookForCopy(lookId);
  if (!look) {
    window.alert("当前套装详情还没有加载完成。");
    return;
  }
  await writeClipboardText(buildFeaturedLookCopyText(look));
  flashCopyButton(button);
}

async function copyItemDetailSummary(button, itemId) {
  const id = Number(itemId || 0);
  const item = state.selectedItemDetail?.id === id
    ? state.selectedItemDetail
    : findKnownItemById(id);
  if (!item) {
    window.alert("当前商品详情还没有加载完成。");
    return;
  }
  await writeClipboardText(buildItemCopyText(item));
  flashCopyButton(button);
}

function renderFeaturedLookHeadHtml(look, options = {}) {
  const editable = Boolean(options.editable);
  const writable = options.writable !== false && canWriteOwnedRecord(look);
  const meta = buildFeaturedLookMetaParts(look);
  const wearCount = Number.isFinite(Number(look?.wear_count)) ? Math.max(0, Number(look.wear_count)) : 0;
  return `
    <div class="featured-look-head">
      <div class="featured-look-head-main">
        <div class="featured-look-title-row">
          <h3>${escapeHtml(look.look_id || "")}</h3>
          <div class="featured-look-title-actions">
            <button type="button" class="ghost-btn featured-look-edit-btn" data-copy-featured-look="${look.id}">复制搭配</button>
            ${editable ? `<button type="button" class="ghost-btn featured-look-edit-btn" data-edit-look="${look.id}">编辑</button>` : ""}
          </div>
        </div>
        ${meta.length ? `<div class="muted-text">${meta.join(" · ")}</div>` : ""}
      </div>
      <div class="featured-look-head-side">
        <div class="muted-text">${escapeHtml(look.status || "")}</div>
        <div class="muted-text">穿着 ${escapeHtml(String(wearCount))} 次</div>
      </div>
    </div>
  `;
}

// Featured look item cards show wearing metadata instead of raw item code.
function buildFeaturedLookItemMetaText(entry) {
  const role = normalizedItemLayerRole(entry?.layer_role || entry?.role);
  const isWatch = role === "watch";
  const relax = formatMetricNumber(entry?.relax_index);
  const temperature = featuredLookItemTemperature(entry);
  const sceneTag = String(entry?.scene_tag || "").trim();
  return [
    relax ? `松弛指数 ${relax}` : "",
    temperature || "",
    !isWatch && sceneTag ? sceneTag : "",
  ].filter(Boolean).join(" · ");
}

function formatWearThresholdValue(item) {
  const wear = formatMetricNumber(item?.wear_maintenance);
  const threshold = formatMetricNumber(item?.wear_threshold);
  if (wear && threshold) return `${wear} / ${threshold}`;
  if (wear) return `${wear} / -`;
  if (threshold) return `- / ${threshold}`;
  return "";
}

function buildWearThresholdDetailField(item) {
  const value = formatWearThresholdValue(item);
  return value ? ["磨损指数", value] : null;
}

function buildMaintenanceCountDetailField(item) {
  const count = formatMetricNumber(item?.maint_count) || "0";
  return ["保养次数", `${count} 次`];
}

function showWearThresholdInDetail(item) {
  const role = normalizedItemLayerRole(item?.layer_role);
  if (["watch", "footwear"].includes(role)) {
    return false;
  }
  return (safeNumber(item?.wear_threshold) || 0) > 0;
}

function buildTotalYearDetailField(item) {
  const total = formatMetricNumber(item?.wear_total);
  const wearYear = formatMetricNumber(item?.wear_year);
  if (total && wearYear) return ["总穿着/2026", `${total} / ${wearYear}`];
  if (total) return ["总穿着/2026", `${total} / -`];
  if (wearYear) return ["总穿着/2026", `- / ${wearYear}`];
  return null;
}

function buildSeriesColorDetailField(item) {
  const series = String(item?.series || "").trim();
  const colorCode = String(item?.official_color_code || "").trim();
  if (series && colorCode) return ["系列/官方色号", `${series} / ${colorCode}`];
  if (series) return ["系列/官方色号", `${series} / -`];
  if (colorCode) return ["系列/官方色号", `- / ${colorCode}`];
  return null;
}

function buildPrimarySecondaryColorDetailField(item) {
  const primary = String(item?.primary_color || "").trim();
  const secondary = String(item?.secondary_color || "").trim();
  if (primary && secondary) return ["主/第二色系", `${primary} / ${secondary}`];
  if (primary) return ["主/第二色系", `${primary} / -`];
  if (secondary) return ["主/第二色系", `- / ${secondary}`];
  return null;
}

function formatWearSummaryLine(item) {
  const wearThreshold = formatWearThresholdValue(item);
  const total = formatMetricNumber(item?.wear_total) || "0";
  const wearYear = formatMetricNumber(item?.wear_year) || "0";
  return [
    `总穿着/2026: ${total} / ${wearYear}`,
    showWearThresholdInDetail(item) && wearThreshold ? `磨损指数/阈值: ${wearThreshold}` : "",
  ].filter(Boolean).join(" | ");
}

  function detailReadonlyFields(item) {
    const isWatch = item?.layer_role === "Watch";
    const showWearThreshold = showWearThresholdInDetail(item);
    return (isWatch
      ? [
          buildTotalYearDetailField(item),
          buildMaintenanceCountDetailField(item),
          ["Owner", item.owner],
          ["地点", item.loc],
          ["上次佩戴", formatBeijingDate(item.last_worn_on)],
        ]
    : [
        buildTotalYearDetailField(item),
        buildMaintenanceCountDetailField(item),
        showWearThreshold ? buildWearThresholdDetailField(item) : null,
        ["状态", displayWardrobeStatus(item)],
        ["上次穿着", formatBeijingDate(item.last_worn_on)],
      ]
  ).filter((field) => Array.isArray(field) && hasMeaningfulDetailValue(field[1]));
}

function compactDetailFields(fields = []) {
  return fields.filter((field) => Array.isArray(field) && hasMeaningfulDetailValue(field[1]));
}

function buildLastWornDetailValue(item, hostId) {
  const formattedDate = formatBeijingDate(item?.last_worn_on);
  if (!hasMeaningfulDetailValue(formattedDate)) {
    return formattedDate;
  }
  if (hostId !== "item-detail-view") {
    return formattedDate;
  }
  return {
    kind: "last-worn-link",
    itemId: Number(item?.id || 0),
    date: String(item?.last_worn_on || "").trim(),
    label: formattedDate,
  };
}

function renderDetailFieldValue(value) {
  if (value && typeof value === "object" && value.kind === "last-worn-link") {
    const itemId = Number(value.itemId || 0);
    const date = String(value.date || "").trim();
    const label = escapeHtml(String(detailValue(value.label)));
    if (itemId > 0 && date) {
      return `<button type="button" class="detail-value-link detail-value-link-highlight" data-open-last-worn="${itemId}" data-last-worn-date="${escapeHtml(date)}">${label}</button>`;
    }
    return label;
  }
  return renderPreservedDetailText(value);
}

function renderPreservedDetailText(value) {
  const normalized = String(detailValue(value));
  if (!/[\r\n]/.test(normalized)) {
    return escapeHtml(normalized);
  }
  return `<span class="detail-value-multiline">${escapeHtml(normalized)}</span>`;
}

function renderDetailFieldItems(fields = []) {
  return compactDetailFields(fields).map(([label, value]) => `
      <div class="detail-field${isCompactDetailLabel(label) ? " detail-field-compact" : " detail-field-wide"}">
        <div class="detail-label">${label}</div>
        <div class="detail-value">${renderDetailFieldValue(value)}</div>
      </div>
    `).join("");
}

function renderDetailSection(title, fields = []) {
  const rendered = renderDetailFieldItems(fields);
  if (!rendered) return "";
  return `
    <section class="detail-section">
      <div class="detail-grid detail-section-grid">
        ${rendered}
      </div>
    </section>
  `;
}

function buildDetailSections(item, hostId = "", priceFields = [], layerRoleDisplay = "", layerTemperature = "", standaloneTemperature = "") {
  const isWatch = item?.layer_role === "Watch";
  const showWearThreshold = showWearThresholdInDetail(item);
      if (isWatch) {
        return [
        {
          title: "基本信息",
          fields: [
            ["名称", item.section],
            ["Ref/品牌", [item.code, item.brand].filter((value) => hasMeaningfulDetailValue(value)).join(" / ")],
            ...priceFields,
            ["Owner", item.owner],
            ["地点", item.loc],
            ["状态", item.status],
            ["购买日期", formatBeijingDate(item.acquired_at)],
          ],
        },
          {
            title: "穿着统计",
            fields: [
              buildTotalYearDetailField(item),
              buildMaintenanceCountDetailField(item),
              ["上次佩戴", buildLastWornDetailValue(item, hostId)],
            ],
          },
        {
          title: "商品信息",
          fields: [
            ["规格", item.material],
            ["机芯", item.notes],
          ],
        },
      ];
    }
      return [
        {
          title: "基本信息",
          fields: [
            ["货号/品牌", [item.code, item.brand].filter((value) => hasMeaningfulDetailValue(value)).join(" / ")],
          ["Section", item.section],
          ...priceFields,
          ["Owner", item.owner],
          ["地点", item.loc],
          ["层级", layerRoleDisplay],
            ["状态", displayWardrobeStatus(item)],
            ["入库时间", formatBeijingDate(item.acquired_at)],
          ],
        },
          {
            title: "穿着统计",
          fields: [
            buildTotalYearDetailField(item),
            buildMaintenanceCountDetailField(item),
            showWearThreshold ? buildWearThresholdDetailField(item) : null,
              ["上次穿着", buildLastWornDetailValue(item, hostId)],
            ],
          },
        {
          title: "商品信息",
        fields: [
          ["场景", item.scene_tag],
          ["松弛指数", item.relax_index],
        ["温区", layerTemperature],
        ["外穿温区", standaloneTemperature],
        buildPrimarySecondaryColorDetailField(item),
        ["材质", item.material],
        ["洗护方式", item.care],
          buildSeriesColorDetailField(item),
          ["尺码", item.size],
        ],
      },
    ];
  }

function itemEditPayload(host, item = null) {
  const payload = {};
  host.querySelectorAll("[data-edit-field]").forEach((node) => {
    payload[node.dataset.editField] = node.value.trim();
  });
  const kind = item?.layer_role === "Watch" || normalizedItemLayerRole(payload.layer_role) === "watch" ? "watch" : "wardrobe";
  return normalizeItemDraftPayload(payload, { kind, preserveKind: true });
}

function renderSummary() {
  const cardHost = $("summary-cards");
  if (cardHost) {
    cardHost.innerHTML = "";
    cardHost.hidden = true;
  }
  renderAuthSummary();
}

function renderBrandShareChart() {
  const host = $("brand-share-chart");
  if (!host) return;
  const colors = ["#8b5e3c", "#b77b57", "#d4a373", "#718355", "#457b9d", "#a44a3f", "#6d597a", "#2a9d8f", "#bc6c25", "#5b8e7d"];
  const sourceItems = state.dashboardItems.length ? state.dashboardItems : state.items;
  const itemsWithAmount = sourceItems.filter((item) => {
    const amount = parsePrice(item.price_cny || item.price_original);
    return amount > 0;
  });
  const ownerEntriesRaw = state.options?.owners?.length
    ? [...state.options.owners]
    : [...new Set(sourceItems.map((item) => item.owner || "未知").filter(Boolean))];
  const ownerEntries = sortOwnersByAmount(ownerEntriesRaw, sourceItems);
  const defaultOwners = [state.authUser || "徐欣"];
  if (!state.brandShareOwnerSelectionInitialized) {
    state.brandShareSelectedOwners = defaultOwners.filter((owner) => ownerEntries.includes(owner));
    state.brandShareOwnerSelectionInitialized = true;
  } else {
    state.brandShareSelectedOwners = state.brandShareSelectedOwners.filter((owner) => ownerEntries.includes(owner));
  }
  const ownerFilteredItems = itemsWithAmount.filter((item) => state.brandShareSelectedOwners.includes(item.owner || "未知"));
  const grouped = new Map();
  ownerFilteredItems.forEach((item) => {
    const amount = parsePrice(item.price_cny || item.price_original);
    const brand = item.brand || "Unknown";
    if (isWatchItem(item)) return;
    grouped.set(brand, (grouped.get(brand) || 0) + amount);
  });
  const brandEntries = [...grouped.entries()]
    .map(([brand, amount]) => ({ brand, amount }))
    .sort((left, right) => right.amount - left.amount);
  const availableBrands = brandEntries.map((entry) => entry.brand);
  const defaultBrands = ["Zegna", "Loro Piana"];
  if (!state.brandShareSelectionInitialized) {
    state.brandShareSelectedBrands = defaultBrands.filter((brand) => availableBrands.includes(brand));
    state.brandShareSelectionInitialized = true;
  } else {
    state.brandShareSelectedBrands = state.brandShareSelectedBrands.filter((brand) => availableBrands.includes(brand));
  }
  const selectedEntries = brandEntries.filter((entry) => state.brandShareSelectedBrands.includes(entry.brand));
  const total = selectedEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const controls = `
    <div class="brand-share-control-groups">
      <div class="brand-share-filter-group">
        <button type="button" class="brand-share-filter-title brand-share-filter-toggle" data-filter-group="owner">Owner</button>
        <div class="brand-share-filters">
          ${ownerEntries.map((owner) => `
            <label class="brand-share-check">
              <input type="checkbox" data-filter-group="owner" value="${escapeHtml(owner)}" ${state.brandShareSelectedOwners.includes(owner) ? "checked" : ""}>
              <span>${escapeHtml(owner)}</span>
            </label>
          `).join("")}
        </div>
      </div>
      <div class="brand-share-filter-group">
        <button type="button" class="brand-share-filter-title brand-share-filter-toggle" data-filter-group="brand">品牌</button>
        <div class="brand-share-filters">
          ${brandEntries.map((entry) => `
            <label class="brand-share-check">
              <input type="checkbox" data-filter-group="brand" value="${escapeHtml(entry.brand)}" ${state.brandShareSelectedBrands.includes(entry.brand) ? "checked" : ""}>
              <span>${escapeHtml(entry.brand)}</span>
            </label>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  if (!itemsWithAmount.length) {
    host.innerHTML = `<div class="list-item">当前没有可用于统计的品牌金额数据。</div>`;
    return;
  }
  if (!state.brandShareSelectedOwners.length) {
    host.innerHTML = `
      ${controls}
      <div class="list-item">当前没有选中参与统计的 Owner。</div>
    `;
    bindBrandShareFilters(host);
    return;
  }
  if (!total) {
    host.innerHTML = `
      ${controls}
      <div class="list-item">当前没有选中参与统计的品牌。</div>
    `;
    bindBrandShareFilters(host);
    return;
  }
  let start = 0;
  const segments = selectedEntries.map((entry, index) => {
    const percent = (entry.amount / total) * 100;
    const end = start + percent;
    const segment = {
      ...entry,
      percent,
      color: colors[index % colors.length],
      start,
      end,
    };
    start = end;
    return segment;
  });
  const gradient = segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ");
  host.innerHTML = `
    ${controls}
    <div class="brand-share-layout">
      <div class="brand-share-chart-wrap">
        <div class="brand-share-donut" style="background: conic-gradient(${gradient});">
          <div class="brand-share-hole">
            <strong>${formatCurrency(total)}</strong>
            <span>总金额</span>
          </div>
        </div>
      </div>
      <div class="brand-share-legend">
        ${segments.map((segment) => `
          <div class="brand-share-row">
            <div class="brand-share-label">
              <span class="brand-share-dot" style="background:${segment.color};"></span>
              <span>${escapeHtml(segment.brand)}</span>
            </div>
            <div class="brand-share-meta">
              <strong>${formatPercent(segment.percent)}</strong>
              <span>${formatCurrency(segment.amount)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  bindBrandShareFilters(host);
}

function renderWearShareChart() {
  const host = $("wear-stats-chart");
  if (!host) return;
  const selectedOwner = wearStatsOwner();
  if (state.wearStatsCategory === "watch") {
    renderWatchWearShareChart(host, true);
    return;
  }
  const colors = ["#8b5e3c", "#b77b57", "#d4a373", "#718355", "#457b9d", "#a44a3f", "#6d597a", "#2a9d8f", "#bc6c25", "#5b8e7d"];
  const sourceItems = (state.dashboardItems.length ? state.dashboardItems : state.items)
    .filter((item) => !isWatchItem(item) && ownerMatchesRecord(item, selectedOwner));
  const period = state.wearSharePeriod === "2026" ? "2026" : "total";
  const metricField = period === "2026" ? "wear_year" : "wear_total";
  const centerLabel = period === "2026" ? "2026 穿着" : "总穿着";
  const metricItems = [...sourceItems];
  const availableRoles = sortRolesByAmount([...new Set(
    metricItems
      .map((item) => String(item.layer_role || "").trim())
      .filter((role) => role && role !== "Watch")
  )], metricItems, (item) => String(item.layer_role || "").trim());
  const groupedAllBrands = new Map();
  metricItems.forEach((item) => {
    const totalWear = safeNumber(item[metricField]) || 0;
    const brand = item.brand || "Unknown";
    groupedAllBrands.set(brand, (groupedAllBrands.get(brand) || 0) + totalWear);
  });
  const orderedWearBrands = sortBrandsByAmount([...groupedAllBrands.keys()], metricItems);
  const brandControlEntries = orderedWearBrands.map((brand) => ({
    brand,
    wearTotal: groupedAllBrands.get(brand) || 0,
  }));
  if (!state.wearShareRoleSelectionInitialized) {
    state.wearShareSelectedRoles = [...availableRoles];
    state.wearShareRoleSelectionInitialized = true;
  } else {
    state.wearShareSelectedRoles = state.wearShareSelectedRoles.filter((role) => availableRoles.includes(role));
  }
  const roleFilteredItems = metricItems.filter((item) => state.wearShareSelectedRoles.includes(String(item.layer_role || "").trim()));
  const grouped = new Map();
  roleFilteredItems.forEach((item) => {
    const totalWear = safeNumber(item[metricField]) || 0;
    const brand = item.brand || "Unknown";
    grouped.set(brand, (grouped.get(brand) || 0) + totalWear);
  });
  const wearEntries = [...grouped.entries()]
    .map(([brand, wearTotal]) => ({ brand, wearTotal }))
    .sort((left, right) => right.wearTotal - left.wearTotal);
  const availableBrands = brandControlEntries.map((entry) => entry.brand);
  if (!state.wearShareSelectionInitialized) {
    state.wearShareSelectedBrands = [...availableBrands];
    state.wearShareSelectionInitialized = true;
  } else {
    state.wearShareSelectedBrands = state.wearShareSelectedBrands.filter((brand) => availableBrands.includes(brand));
  }
  const activeFilterGroup = ["brand", "role"].includes(state.wearShareActiveFilterGroup) ? state.wearShareActiveFilterGroup : "brand";
  state.wearShareActiveFilterGroup = activeFilterGroup;
  const bulkLabel = activeFilterGroup === "brand"
    ? (brandControlEntries.length && brandControlEntries.every((entry) => state.wearShareSelectedBrands.includes(entry.brand)) ? "清空" : "全选")
    : (availableRoles.length && availableRoles.every((role) => state.wearShareSelectedRoles.includes(role)) ? "清空" : "全选");
  const controls = `
    <div class="brand-share-control-groups">
      <div class="wear-stats-category-switcher">
        <button type="button" class="wear-stats-category-btn ${state.wearStatsCategory === "wardrobe" ? "active" : ""}" data-wear-category="wardrobe">衣橱</button>
        <button type="button" class="wear-stats-category-btn ${state.wearStatsCategory === "watch" ? "active" : ""}" data-wear-category="watch">腕表</button>
      </div>
      ${renderChartFilterSwitcher([
        { key: "brand", label: "品牌" },
        { key: "role", label: "Role" },
      ], activeFilterGroup, bulkLabel)}
      <div class="brand-share-filter-group chart-filter-panel ${activeFilterGroup === "brand" ? "active" : ""}" data-filter-panel="brand">
        <div class="brand-share-filters">
          ${brandControlEntries.map((entry) => `
            <label class="brand-share-check inventory-check">
              <input type="checkbox" data-filter-group="brand" value="${escapeHtml(entry.brand)}" ${state.wearShareSelectedBrands.includes(entry.brand) ? "checked" : ""}>
              <span>${escapeHtml(entry.brand)}</span>
            </label>
          `).join("")}
        </div>
      </div>
      <div class="brand-share-filter-group chart-filter-panel ${activeFilterGroup === "role" ? "active" : ""}" data-filter-panel="role">
        <div class="brand-share-filters">
          ${availableRoles.map((role) => `
            <label class="brand-share-check inventory-check">
              <input type="checkbox" data-filter-group="role" value="${escapeHtml(role)}" ${state.wearShareSelectedRoles.includes(role) ? "checked" : ""}>
              <span>${escapeHtml(role)}</span>
            </label>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  if (!metricItems.length) {
    host.innerHTML = `${controls}<div class="list-item">当前没有可用于统计的穿着数据。</div>`;
    bindWearShareFilters(host);
    return;
  }
  if (!state.wearShareSelectedBrands.length) {
    host.innerHTML = `${controls}<div class="list-item">当前没有选中参与统计的品牌。</div>`;
    bindWearShareFilters(host);
    return;
  }
  if (!state.wearShareSelectedRoles.length) {
    host.innerHTML = `${controls}<div class="list-item">当前没有选中参与统计的 Role。</div>`;
    bindWearShareFilters(host);
    return;
  }
  const selectedEntries = brandControlEntries
    .filter((entry) => state.wearShareSelectedBrands.includes(entry.brand))
    .map((entry) => ({
      ...entry,
      wearTotal: wearEntries.find((wearEntry) => wearEntry.brand === entry.brand)?.wearTotal || 0,
    }));
  if (!selectedEntries.some((entry) => entry.brand === state.wearShareActiveBrand)) {
    state.wearShareActiveBrand = "";
  }
  const totalWear = selectedEntries.reduce((sum, entry) => sum + entry.wearTotal, 0);
  let start = 0;
  const segments = selectedEntries.map((entry, index) => {
    const percent = totalWear > 0 ? (entry.wearTotal / totalWear) * 100 : 0;
    const end = start + percent;
    const segment = { ...entry, percent, color: colors[index % colors.length], start, end };
    start = end;
    return segment;
  });
  const gradient = totalWear > 0
    ? segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ")
    : "#eadfce 0 100%";
  const drilldownHtml = state.wearShareActiveBrand
    ? `<div class="brand-drilldown"><div class="brand-drilldown-head"><strong>${escapeHtml(state.wearShareActiveBrand)}</strong><span>单品穿着明细</span></div>${buildWearBrandDetailHtml(roleFilteredItems, metricField, state.wearShareActiveBrand)}</div>`
    : "";
  host.innerHTML = `
    ${controls}
    <div class="brand-share-layout">
      <div class="brand-share-chart-wrap">
        <div class="brand-share-chart-top">
          <select id="wear-period-select-embedded" class="brand-share-period-select">
            <option value="total" ${period === "total" ? "selected" : ""}>Total</option>
            <option value="2026" ${period === "2026" ? "selected" : ""}>2026</option>
          </select>
        </div>
        <div class="brand-share-donut" style="background: conic-gradient(${gradient});">
          <div class="brand-share-hole">
            <strong>${totalWear}</strong>
            <span>${centerLabel}</span>
          </div>
        </div>
      </div>
      <div class="brand-share-legend">
        ${segments.map((segment) => `
          <div class="brand-share-row">
            <div class="brand-share-label">
              <span class="brand-share-dot" style="background:${segment.color};"></span>
              <button type="button" class="brand-share-brand-button" data-wear-brand-drilldown="${escapeHtml(segment.brand)}">${escapeHtml(segment.brand)}</button>
            </div>
            <div class="brand-share-meta">
              <strong>${formatPercent(segment.percent)}</strong>
              <span>${segment.wearTotal} 次</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
    ${drilldownHtml}
  `;
  bindWearShareFilters(host);
}

function bindWearShareFilters(host) {
  const syncSelections = () => {
    const brands = host.querySelectorAll('.brand-share-check input[data-filter-group="brand"]:checked');
    const roles = host.querySelectorAll('.brand-share-check input[data-filter-group="role"]:checked');
    state.wearShareSelectedBrands = Array.from(brands).map((node) => node.value);
    state.wearShareSelectedRoles = Array.from(roles).map((node) => node.value);
  };
  host.querySelectorAll(".brand-share-check input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      syncSelections();
      renderWearShareChart();
    });
  });
  host.querySelectorAll("[data-wear-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextCategory = button.dataset.wearCategory === "watch" ? "watch" : "wardrobe";
      if (state.wearStatsCategory === nextCategory) return;
      state.wearStatsCategory = nextCategory;
      state.wearShareActiveFilterGroup = "brand";
      state.watchWearShareActiveFilterGroup = "brand";
      renderWearShareChart();
    });
  });
  host.querySelector("#wear-period-select-embedded")?.addEventListener("change", () => {
    state.wearSharePeriod = host.querySelector("#wear-period-select-embedded").value === "2026" ? "2026" : "total";
    renderWearShareChart();
  });
  host.querySelectorAll(".chart-filter-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.wearShareActiveFilterGroup = button.dataset.filterTab || "brand";
      renderWearShareChart();
    });
  });
  host.querySelectorAll("[data-filter-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      const group = state.wearShareActiveFilterGroup || "brand";
      const checkboxes = Array.from(host.querySelectorAll(`.brand-share-check input[data-filter-group="${group}"]`));
      const shouldSelectAll = checkboxes.some((checkbox) => !checkbox.checked);
      checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldSelectAll;
      });
      syncSelections();
      renderWearShareChart();
    });
  });
  host.querySelectorAll("[data-wear-brand-drilldown]").forEach((button) => {
    button.addEventListener("click", () => {
      const brand = button.dataset.wearBrandDrilldown || "";
      if (!brand) return;
      state.wearShareSelectedBrands = [brand];
      state.wearShareActiveBrand = brand;
      renderWearShareChart();
    });
  });
}

function renderWatchWearShareChart(hostOverride = null, includeCategorySwitcher = false) {
  const host = hostOverride || $("wear-stats-chart");
  if (!host) return;
  const selectedOwner = wearStatsOwner();
  const colors = ["#8b5e3c", "#b77b57", "#d4a373", "#718355", "#457b9d", "#a44a3f", "#6d597a", "#2a9d8f", "#bc6c25", "#5b8e7d"];
  const sourceItems = watchSourceItems().filter((item) => ownerMatchesRecord(item, selectedOwner));
  const period = state.watchWearSharePeriod === "2026" ? "2026" : "total";
  const metricField = period === "2026" ? "wear_year" : "wear_total";
  const centerLabel = period === "2026" ? "2026 佩戴" : "总佩戴";
  const metricItems = [...sourceItems];
  const groupedAllBrands = new Map();
  metricItems.forEach((item) => {
    const totalWear = safeNumber(item[metricField]) || 0;
    const brand = item.brand || "Unknown";
    groupedAllBrands.set(brand, (groupedAllBrands.get(brand) || 0) + totalWear);
  });
  const orderedWatchBrands = sortBrandsByAmount([...groupedAllBrands.keys()], metricItems);
  const brandControlEntries = orderedWatchBrands.map((brand) => ({
    brand,
    wearTotal: groupedAllBrands.get(brand) || 0,
  }));
  const grouped = new Map();
  metricItems.forEach((item) => {
    const totalWear = safeNumber(item[metricField]) || 0;
    const brand = item.brand || "Unknown";
    grouped.set(brand, (grouped.get(brand) || 0) + totalWear);
  });
  const wearEntries = [...grouped.entries()]
    .map(([brand, wearTotal]) => ({ brand, wearTotal }))
    .sort((left, right) => right.wearTotal - left.wearTotal);
  const availableBrands = brandControlEntries.map((entry) => entry.brand);
  if (!state.watchWearShareSelectionInitialized) {
    state.watchWearShareSelectedBrands = [...availableBrands];
    state.watchWearShareSelectionInitialized = true;
  } else {
    state.watchWearShareSelectedBrands = state.watchWearShareSelectedBrands.filter((brand) => availableBrands.includes(brand));
  }
  state.watchWearShareActiveFilterGroup = "brand";
  const bulkLabel = brandControlEntries.length && brandControlEntries.every((entry) => state.watchWearShareSelectedBrands.includes(entry.brand))
    ? "清空"
    : "全选";
  const controls = `
    <div class="brand-share-control-groups">
      ${includeCategorySwitcher ? `
        <div class="wear-stats-category-switcher">
          <button type="button" class="wear-stats-category-btn ${state.wearStatsCategory === "wardrobe" ? "active" : ""}" data-wear-category="wardrobe">衣橱</button>
          <button type="button" class="wear-stats-category-btn ${state.wearStatsCategory === "watch" ? "active" : ""}" data-wear-category="watch">腕表</button>
        </div>
      ` : ""}
      ${renderChartFilterSwitcher([{ key: "brand", label: "品牌" }], "brand", bulkLabel)}
      <div class="brand-share-filter-group chart-filter-panel active" data-filter-panel="brand">
        <div class="brand-share-filters">
          ${brandControlEntries.map((entry) => `
            <label class="brand-share-check inventory-check">
              <input type="checkbox" data-filter-group="brand" value="${escapeHtml(entry.brand)}" ${state.watchWearShareSelectedBrands.includes(entry.brand) ? "checked" : ""}>
              <span>${escapeHtml(entry.brand)}</span>
            </label>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  if (!metricItems.length) {
    host.innerHTML = `
      ${controls}
      <div class="list-item">当前没有可用于统计的佩戴数据。</div>
    `;
    bindWatchWearShareFilters(host);
    return;
  }
  if (!state.watchWearShareSelectedBrands.length) {
    host.innerHTML = `
      ${controls}
      <div class="list-item">当前没有选中参与统计的品牌。</div>
    `;
    bindWatchWearShareFilters(host);
    return;
  }
  const selectedEntries = brandControlEntries
    .filter((entry) => state.watchWearShareSelectedBrands.includes(entry.brand))
    .map((entry) => ({
      ...entry,
      wearTotal: wearEntries.find((wearEntry) => wearEntry.brand === entry.brand)?.wearTotal || 0,
    }));
  if (!selectedEntries.some((entry) => entry.brand === state.watchWearShareActiveBrand)) {
    state.watchWearShareActiveBrand = "";
  }
  const totalWear = selectedEntries.reduce((sum, entry) => sum + entry.wearTotal, 0);
  let start = 0;
  const segments = selectedEntries.map((entry, index) => {
    const percent = totalWear > 0 ? (entry.wearTotal / totalWear) * 100 : 0;
    const end = start + percent;
    const segment = {
      ...entry,
      percent,
      color: colors[index % colors.length],
      start,
      end,
    };
    start = end;
    return segment;
  });
  const gradient = totalWear > 0
    ? segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ")
    : "#eadfce 0 100%";
  const drilldownHtml = state.watchWearShareActiveBrand
    ? `
      <div class="brand-drilldown">
        <div class="brand-drilldown-head">
          <strong>${escapeHtml(state.watchWearShareActiveBrand)}</strong>
          <span>单表佩戴明细</span>
        </div>
        ${buildWearBrandDetailHtml(metricItems, metricField, state.watchWearShareActiveBrand, "当前品牌下没有可显示的腕表统计。")}
      </div>
    `
    : "";
  host.innerHTML = `
    ${controls}
    <div class="brand-share-layout">
      <div class="brand-share-chart-wrap">
        <div class="brand-share-chart-top">
          <select id="watch-wear-period-select-embedded" class="brand-share-period-select">
            <option value="total" ${period === "total" ? "selected" : ""}>Total</option>
            <option value="2026" ${period === "2026" ? "selected" : ""}>2026</option>
          </select>
        </div>
        <div class="brand-share-donut" style="background: conic-gradient(${gradient});">
          <div class="brand-share-hole">
            <strong>${totalWear}</strong>
            <span>${centerLabel}</span>
          </div>
        </div>
      </div>
      <div class="brand-share-legend">
        ${segments.map((segment) => `
          <div class="brand-share-row">
            <div class="brand-share-label">
              <span class="brand-share-dot" style="background:${segment.color};"></span>
              <button type="button" class="brand-share-brand-button" data-watch-wear-brand-drilldown="${escapeHtml(segment.brand)}">${escapeHtml(segment.brand)}</button>
            </div>
            <div class="brand-share-meta">
              <strong>${formatPercent(segment.percent)}</strong>
              <span>${segment.wearTotal} 次</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
    ${drilldownHtml}
  `;
  bindWatchWearShareFilters(host);
}

function bindWatchWearShareFilters(host) {
  const syncSelections = () => {
    const brands = host.querySelectorAll('.brand-share-check input[data-filter-group="brand"]:checked');
    state.watchWearShareSelectedBrands = Array.from(brands).map((node) => node.value);
  };
  host.querySelectorAll(".brand-share-check input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      syncSelections();
      renderWearShareChart();
    });
  });
  host.querySelectorAll("[data-wear-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextCategory = button.dataset.wearCategory === "watch" ? "watch" : "wardrobe";
      if (state.wearStatsCategory === nextCategory) return;
      state.wearStatsCategory = nextCategory;
      state.wearShareActiveFilterGroup = "brand";
      state.watchWearShareActiveFilterGroup = "brand";
      renderWearShareChart();
    });
  });
  host.querySelector("#watch-wear-period-select-embedded")?.addEventListener("change", () => {
    state.watchWearSharePeriod = host.querySelector("#watch-wear-period-select-embedded").value === "2026" ? "2026" : "total";
    renderWearShareChart();
  });
  host.querySelectorAll("[data-filter-bulk]").forEach((button) => {
    button.addEventListener("click", () => {
      const checkboxes = Array.from(host.querySelectorAll('.brand-share-check input[data-filter-group="brand"]'));
      const shouldSelectAll = checkboxes.some((checkbox) => !checkbox.checked);
      checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldSelectAll;
      });
      syncSelections();
      renderWearShareChart();
    });
  });
  host.querySelectorAll("[data-watch-wear-brand-drilldown]").forEach((button) => {
    button.addEventListener("click", () => {
      const brand = button.dataset.watchWearBrandDrilldown || "";
      if (!brand) return;
      state.watchWearShareSelectedBrands = [brand];
      state.watchWearShareActiveBrand = brand;
      renderWearShareChart();
    });
  });
}

function bindBrandShareFilters(host) {
  const syncSelections = () => {
    const brands = host.querySelectorAll('.brand-share-check input[data-filter-group="brand"]:checked');
    const owners = host.querySelectorAll('.brand-share-check input[data-filter-group="owner"]:checked');
    state.brandShareSelectedBrands = Array.from(brands).map((node) => node.value);
    state.brandShareSelectedOwners = Array.from(owners).map((node) => node.value);
  };
  host.querySelectorAll(".brand-share-check input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      syncSelections();
      renderBrandShareChart();
    });
  });
  host.querySelectorAll(".brand-share-filter-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.filterGroup;
      const checkboxes = Array.from(host.querySelectorAll(`.brand-share-check input[data-filter-group="${group}"]`));
      const shouldSelectAll = checkboxes.some((checkbox) => !checkbox.checked);
      checkboxes.forEach((checkbox) => {
        checkbox.checked = shouldSelectAll;
      });
      syncSelections();
      renderBrandShareChart();
    });
  });
}

function renderImportDirectory() {
  const node = $("import-dir-inline");
  if (!node) return;
  const fullPath = state.importDirectory || "";
  node.textContent = compactDirectoryLabel(fullPath);
  node.title = fullPath || "未设置";
}

function renderAuthSummary() {
  const host = $("auth-summary-card");
  if (!host) return;
  renderSidebarRefreshButton();
  const passwordDraft = ensurePasswordChangeDraft();
  const sourceItems = state.dashboardItems.length ? state.dashboardItems : state.items;
  const owners = new Set(sourceItems.map((item) => item.owner).filter(Boolean));
  const photos = sourceItems.reduce((acc, item) => acc + (item.photo_count || 0), 0);
  const summaryStats = [
    { label: "衣物总数", value: sourceItems.length },
    { label: "Owner 数", value: owners.size },
    { label: "图片索引", value: photos },
    { label: "穿搭日志", value: state.outfits.length, tab: "outfits" },
  ];
  const installButton = state.installPromptAvailable
    ? `<button id="install-app-btn" type="button" class="ghost-btn">安装应用</button>`
    : "";
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const installStatus = state.installPromptAvailable ? "可安装" : "未触发安装";
  const displayStatus = isStandalone ? "独立窗口" : "浏览器标签";
  const swStatus = state.serviceWorkerReady ? "SW已注册" : "SW未注册";
  const installDetail = state.installStatusText ? ` · ${escapeHtml(state.installStatusText)}` : "";
  const dbSizeText = formatBytes(state.dashboardDbSizeBytes);
  const passwordNote = state.passwordChangeError || state.passwordChangeSuccess || passwordPolicyHint();
  const passwordNoteClass = state.passwordChangeError
    ? "auth-password-note error"
    : state.passwordChangeSuccess
      ? "auth-password-note success"
      : "auth-password-note";
  const passwordButtonLabel = state.passwordChangeSaving ? "保存中..." : "修改密码";
  const passwordToggleLabel = state.passwordChangeOpen ? "收起密码" : "修改密码";
  const selectedTheme = selectedThemePreference();
  const themeButtons = THEME_OPTIONS.map((option) => `
    <button
      type="button"
      class="theme-choice-btn ${option.value === selectedTheme ? "selected" : ""}"
      data-theme-choice="${option.value}"
      aria-pressed="${option.value === selectedTheme ? "true" : "false"}"
    >${escapeHtml(option.label)}</button>
  `).join("");
  host.innerHTML = `
    <div class="auth-summary-row">
      <div class="auth-summary-main">
        <div class="detail-eyebrow">当前登录</div>
        <div class="auth-summary-user">${escapeHtml(state.authUser || "-")}</div>
        <div class="muted auth-summary-meta">${displayStatus} · ${installStatus} · ${swStatus}${installDetail}</div>
        <div class="auth-summary-stats">
          <span class="inline-chip auth-summary-chip">
            <span class="inline-label">数据库大小</span>
            <span>${escapeHtml(dbSizeText)}</span>
          </span>
          <span class="inline-chip auth-summary-chip">
            <span class="inline-label">WearCount</span>
            <span id="wearcount-import-inline" class="muted" title=""></span>
          </span>
        </div>
        <div class="auth-summary-stats auth-summary-stats-secondary">
          ${summaryStats.map((stat) => `
            <button type="button" class="summary-pill ${stat.tab ? "clickable" : ""}" ${stat.tab ? `data-summary-tab="${stat.tab}"` : ""}>
              <span>${escapeHtml(stat.label)}</span>
              <strong>${escapeHtml(String(stat.value))}</strong>
            </button>
          `).join("")}
        </div>
      </div>
      <div class="auth-summary-actions">
        ${installButton}
        <button id="create-item-btn" type="button" class="ghost-btn">入库</button>
        <button id="password-change-toggle-btn" type="button" class="ghost-btn" ${state.passwordChangeSaving ? "disabled" : ""}>${passwordToggleLabel}</button>
        <button id="logout-btn" type="button" class="ghost-btn">注销</button>
      </div>
    </div>
    <div class="theme-settings-panel">
      <div class="theme-settings-copy">
        <div class="detail-eyebrow">显示主题</div>
        <div class="muted">主题保存在当前浏览器，跟随系统会按设备深色/浅色自动切换。</div>
      </div>
      <div class="theme-choice-group" role="group" aria-label="显示主题">
        ${themeButtons}
      </div>
    </div>
    ${state.passwordChangeOpen ? `
      <div class="auth-password-panel">
        <div class="detail-eyebrow">密码修改</div>
        <form id="password-change-form" class="auth-password-form">
          <label>
            <span>当前密码</span>
            <input
              type="password"
              autocomplete="current-password"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              data-password-change-field="current_password"
              value="${escapeHtml(passwordDraft.current_password)}"
            >
          </label>
          <label>
            <span>新密码</span>
            <input
              type="password"
              autocomplete="new-password"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              maxlength="${AUTH_PASSWORD_MAX_LENGTH}"
              data-password-change-field="new_password"
              value="${escapeHtml(passwordDraft.new_password)}"
            >
          </label>
          <label>
            <span>确认新密码</span>
            <input
              type="password"
              autocomplete="new-password"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              maxlength="${AUTH_PASSWORD_MAX_LENGTH}"
              data-password-change-field="confirm_password"
              value="${escapeHtml(passwordDraft.confirm_password)}"
            >
          </label>
          <div class="auth-password-actions">
            <button type="submit" class="ghost-btn" ${state.passwordChangeSaving ? "disabled" : ""}>${passwordButtonLabel}</button>
            <button id="password-change-reset-btn" type="button" class="ghost-btn" ${state.passwordChangeSaving ? "disabled" : ""}>清空</button>
          </div>
        </form>
        <div class="${passwordNoteClass}">${escapeHtml(passwordNote)}</div>
      </div>
    ` : ""}
  `;
  renderImports(state.dashboardImports || []);
  host.querySelectorAll("[data-summary-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTopLevelTab(button.dataset.summaryTab).catch((error) => console.error(error));
    });
  });
}

function renderImports(imports) {
  const wearcountEntry = (imports || [])
    .filter((entry) => {
      const type = String(entry.import_type || "").trim().toLowerCase();
      return type === "wearcount" || type === "wearcount_new";
    })
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))[0];
  const wearcountNode = $("wearcount-import-inline");
  if (!wearcountNode) return;
  if (!wearcountEntry) {
    wearcountNode.textContent = "未导入";
    wearcountNode.title = "尚未导入 WearCount";
    return;
  }
  const wearcountTime = formatBeijingDateTime(wearcountEntry.created_at || "");
  wearcountNode.textContent = wearcountTime || "未导入";
  wearcountNode.title = wearcountTime ? `最近一次 WearCount 自动或手动导入：${wearcountTime}` : "尚未导入 WearCount";
}

function createItemFields(kind) {
  if (kind === "watch") return WATCH_BASELINE_EDIT_FIELDS;
  const draft = ensureCreateItemDraft(kind);
  return clothingFieldsForRole(draft.layer_role);
}

function sceneTagOptions() {
  const optionValues = state.options?.scene_tags?.length
    ? state.options.scene_tags
    : inventorySourceItems().map((item) => String(item.scene_tag || "").trim());
  return [...new Set(optionValues.filter((value) => value && value !== "Watch"))]
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function relaxIndexOptions() {
  return Array.from({ length: 9 }, (_, index) => (1 + index * 0.5).toString().replace(/\.0$/, ""));
}

function catalogOptions(optionType) {
  if (optionType === "owner") {
    return [...new Set((state.options?.catalog_owners || []).filter(Boolean))];
  }
  if (optionType === "wardrobe_brand") {
    return [...new Set((state.options?.catalog_wardrobe_brands || []).filter(Boolean))];
  }
  if (optionType === "watch_brand") {
    return [...new Set((state.options?.catalog_watch_brands || []).filter(Boolean))];
  }
  return [];
}

function canManageCatalog() {
  return String(state.authUser || "").trim() === "徐欣";
}

function ownerOptionsForContext(sourceItems = [], currentValue = "", { create = false } = {}) {
  const normalizedUser = String(state.authUser || "").trim();
  if (canManageCatalog()) {
    const values = catalogOptions("owner").length
      ? catalogOptions("owner")
      : [...new Set(sourceItems.map((item) => item.owner).filter(Boolean))];
    return sortOwnersByAmount(values, sourceItems);
  }
  const values = create
    ? [normalizedUser]
    : [String(currentValue || "").trim(), normalizedUser].filter(Boolean);
  return [...new Set(values)];
}

function loggedInOwner() {
  return String(state.authUser || "").trim();
}

function ownerMatchesRecord(record, owner) {
  const normalizedOwner = String(owner || "").trim();
  if (!normalizedOwner) return true;
  return String(record?.owner || "").trim() === normalizedOwner;
}

function resolveOwnerScopedSelection(stateKey, sourceItems = [], fallbackOwner = "") {
  const options = ownerOptionsForContext(sourceItems, state[stateKey] || "", { create: true });
  const normalizedFallback = String(fallbackOwner || loggedInOwner() || "").trim();
  const preferred = String(state[stateKey] || "").trim();
  let selected = "";
  if (preferred && options.includes(preferred)) {
    selected = preferred;
  } else if (normalizedFallback && options.includes(normalizedFallback)) {
    selected = normalizedFallback;
  } else {
    selected = options[0] || normalizedFallback || "";
  }
  state[stateKey] = selected;
  return { options, selected };
}

function syncOwnerScopeSelect(selectId, options, selectedOwner) {
  const select = $(selectId);
  if (!select) return;
  const values = options.length ? options : [selectedOwner || loggedInOwner() || "徐欣"];
  select.innerHTML = values.map((owner) => `
    <option value="${escapeHtml(owner)}" ${owner === selectedOwner ? "selected" : ""}>${escapeHtml(owner)}</option>
  `).join("");
  select.value = selectedOwner || values[0] || "";
  select.disabled = values.length <= 1;
}

function resolveOutfitSelectedOwner() {
  return resolveOwnerScopedSelection("outfitSelectedOwner", inventorySourceItems(), loggedInOwner());
}

function outfitHasPhotos(outfit) {
  if (!outfit) return false;
  if (Array.isArray(outfit.photos) && outfit.photos.length) return true;
  return Number(outfit.photo_count || 0) > 0;
}

function filterVisibleOutfits(outfits, owner, photosOnly = state.outfitPhotosOnly) {
  return (outfits || [])
    .filter((outfit) => ownerMatchesRecord(outfit, owner))
    .filter((outfit) => !photosOnly || outfitHasPhotos(outfit));
}

function resolveFeaturedLookSelectedOwner() {
  return resolveOwnerScopedSelection("featuredLookSelectedOwner", inventorySourceItems(), loggedInOwner());
}

function wearStatsOwner() {
  return loggedInOwner() || "徐欣";
}

function createItemFieldOptions(field, kind) {
  if (kind === "watch" && field.key === "brand") {
    return sortBrandsByAmount(catalogOptions("watch_brand"), watchSourceItems());
  }
  if (kind === "watch" && field.key === "owner") {
    return ownerOptionsForContext(inventorySourceItems(), "", { create: true });
  }
  if (kind === "watch" && field.key === "loc") {
    const source = inventorySourceItems();
    const values = state.options?.locs?.length
      ? state.options.locs
      : [...new Set(source.map((item) => item.loc).filter(Boolean))];
    return sortLocsByAmount(values, source);
  }
  if (kind === "wardrobe" && field.key === "brand") {
    return sortBrandsByAmount(catalogOptions("wardrobe_brand"), inventorySourceItems());
  }
  if (kind === "wardrobe" && field.key === "owner") {
    return ownerOptionsForContext(inventorySourceItems(), "", { create: true });
  }
  if (kind === "wardrobe" && field.key === "loc") {
    const source = inventorySourceItems();
    const values = state.options?.locs?.length ? state.options.locs : [...new Set(source.map((item) => item.loc).filter(Boolean))];
    return sortLocsByAmount(values, source);
  }
  if (kind === "wardrobe" && field.key === "layer_role") {
    const source = inventorySourceItems();
    const values = state.options?.roles?.filter((value) => value !== "Watch") || [...new Set(source.map((item) => item.layer_role).filter(Boolean))];
    return sortRolesByAmount(values, source, (item) => inventoryRoleValue(item)).filter((value) => value && value !== "未分类");
  }
  if (kind === "wardrobe" && field.key === "scene_tag") {
    return sceneTagOptions();
  }
  if (kind === "wardrobe" && field.key === "relax_index") {
    return relaxIndexOptions();
  }
  if (kind === "wardrobe" && field.key === "outer_type") {
    const values = inventorySourceItems()
      .map((item) => String(item.outer_type || "").trim())
      .filter(Boolean);
    return [...new Set(values)].sort((left, right) => left.localeCompare(right, "zh-CN"));
  }
  return [];
}

function ensureCreateItemDraft(kind = state.createItemKind || "wardrobe") {
  const nextKind = kind === "watch" ? "watch" : "wardrobe";
  if (!state.createItemDraft || state.createItemKind !== nextKind) {
    state.createItemKind = nextKind;
    state.createItemDraft = defaultCreateItemDraft(nextKind);
  }
  if (!state.createItemDraft.owner) {
    state.createItemDraft.owner = state.authUser || "徐欣";
  }
  return state.createItemDraft;
}

function renderCreateItemField(field, kind, draft) {
  const value = String(draft?.[field.key] ?? "");
  const options = createItemFieldOptions(field, kind);
  if (options.length) {
    return `
      <label class="detail-edit-field">
        <span class="detail-label">${escapeHtml(field.label)}</span>
        <select data-create-field="${escapeHtml(field.key)}">
          <option value=""></option>
          ${options.map((option) => `
            <option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>
          `).join("")}
        </select>
      </label>
    `;
  }
  if (field.multiline) {
    return `
      <label class="detail-edit-field detail-edit-field-wide">
        <span class="detail-label">${escapeHtml(field.label)}</span>
        <textarea data-create-field="${escapeHtml(field.key)}" rows="3">${escapeHtml(value)}</textarea>
      </label>
    `;
  }
  const inputMode = field.inputMode ? ` inputmode="${escapeHtml(field.inputMode)}"` : "";
  return `
    <label class="detail-edit-field">
      <span class="detail-label">${escapeHtml(field.label)}</span>
      <input type="${field.type === "date" ? "date" : "text"}" data-create-field="${escapeHtml(field.key)}" value="${escapeHtml(value)}"${inputMode}>
    </label>
  `;
}

function createItemPayload(host) {
  const payload = { kind: state.createItemKind };
  host.querySelectorAll("[data-create-field]").forEach((node) => {
    payload[node.dataset.createField] = node.value.trim();
  });
  if (payload.kind === "watch") {
    payload.layer_role = "Watch";
  }
  return ensureRequiredItemFields(normalizeItemDraftPayload(payload, { kind: payload.kind }));
}

function renderSidebarRefreshButton() {
  const label = state.manualRefreshLoading ? "刷新中..." : "刷新数据";
  ["sidebar-refresh-btn", "page-menu-refresh-btn"].forEach((id) => {
    const button = $(id);
    if (!button) return;
    button.disabled = state.manualRefreshLoading;
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.classList.toggle("loading", state.manualRefreshLoading);
  });
}

function renderCreateItemPanel() {
  const host = $("create-item-panel");
  if (!host) return;
  if (!state.createItemMode) {
    host.innerHTML = "";
    return;
  }
  const kind = state.createItemKind || "wardrobe";
  const draft = ensureCreateItemDraft(kind);
  const title = kind === "watch" ? "新增腕表" : "新增衣物";
  host.innerHTML = `
    <div class="card item-create-card">
      <div class="item-create-head">
        <div>
          <div class="detail-eyebrow">低频操作</div>
          <div class="auth-summary-user">${title}</div>
        </div>
        <div class="item-create-kind-tabs">
          <button type="button" class="ghost-btn ${kind === "wardrobe" ? "active" : ""}" data-create-kind="wardrobe">衣物</button>
          <button type="button" class="ghost-btn ${kind === "watch" ? "active" : ""}" data-create-kind="watch">腕表</button>
        </div>
      </div>
      <div class="detail-edit-note item-create-note">保存会直接写入数据库，并同步导出默认目录中的 Excel 基线文件。</div>
      ${state.createItemError ? `<div class="detail-edit-error">${escapeHtml(state.createItemError)}</div>` : ""}
      ${state.createItemSuccess ? `<div class="item-create-success">${escapeHtml(state.createItemSuccess)}</div>` : ""}
      <div class="detail-edit-grid item-create-grid">
        ${createItemFields(kind).map((field) => renderCreateItemField(field, kind, draft)).join("")}
      </div>
      <div class="inline item-create-actions">
        <button id="create-item-save-btn" type="button" ${state.createItemSaving ? "disabled" : ""}>保存入库</button>
        <button id="create-item-cancel-btn" type="button" class="ghost-btn" ${state.createItemSaving ? "disabled" : ""}>取消</button>
      </div>
    </div>
  `;
}

function renderItems() {
  const tbody = $("items-table");
  tbody.innerHTML = sortedItems().map((item) => {
    const fullBrand = String(item.brand || "").trim();
    const displayBrand = inventoryTableBrandLabel(fullBrand);
    const brandTitle = displayBrand !== fullBrand && fullBrand
      ? ` title="${escapeHtml(fullBrand)}"`
      : "";
    return `
      <tr>
        <td class="col-section">${sectionLink(item)}</td>
        <td class="col-brand"${brandTitle}>${escapeHtml(displayBrand)}</td>
        <td class="col-price">${escapeHtml(item.price_cny || item.price_original || "")}</td>
        <td class="col-relax">${item.relax_index ?? ""}</td>
        <td class="col-total">${item.wear_total ?? 0}</td>
        <td class="col-scene">${escapeHtml(item.scene_tag || "")}</td>
        <td class="col-code">${formatBeijingDate(item.acquired_at)}</td>
      </tr>
    `;
  }).join("");
  renderSortHeaders("inventory", state.inventorySort);
}

function renderInventorySummary() {
  const host = $("inventory-summary");
  const displayItems = displayInventoryItems();
  const itemCount = displayItems.length;
  const totalPrice = displayItems.reduce((sum, item) => sum + parsePrice(item.price_cny || item.price_original), 0);
  const avgPrice = itemCount ? totalPrice / itemCount : 0;
  const stats = [
    ["件数", itemCount],
    ["均价", formatCurrency(avgPrice)],
  ];
  host.innerHTML = stats.map(([label, value]) => `
    <div class="stat">
      <div>${label}</div>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderInventoryBrandShareChart() {
  const host = $("inventory-brand-share-chart");
  if (!host) return;
  const colors = ["#8b5e3c", "#b77b57", "#d4a373", "#718355", "#457b9d", "#a44a3f", "#6d597a", "#2a9d8f", "#bc6c25", "#5b8e7d"];
  const itemsWithAmount = state.items.filter((item) => parsePrice(item.price_cny || item.price_original) > 0);
  const availableYears = [...new Set(itemsWithAmount.map((item) => itemAcquiredYear(item)).filter(Boolean))]
    .sort((left, right) => Number(right) - Number(left) || String(right).localeCompare(String(left), "zh-CN", { numeric: true }));
  const period = state.inventoryBrandShareYear !== "total" && availableYears.includes(state.inventoryBrandShareYear)
    ? state.inventoryBrandShareYear
    : "total";
  state.inventoryBrandShareYear = period;
  const periodFilteredItems = period === "total"
    ? itemsWithAmount
    : itemsWithAmount.filter((item) => itemAcquiredYear(item) === period);
  const periodControl = `
    <div class="brand-share-chart-top brand-share-chart-top-outer">
      <select id="inventory-brand-period-select" class="brand-share-period-select">
        <option value="total" ${period === "total" ? "selected" : ""}>Total</option>
        ${availableYears.map((year) => `
          <option value="${escapeHtml(year)}" ${year === period ? "selected" : ""}>${escapeHtml(year)}</option>
        `).join("")}
      </select>
    </div>
  `;
  if (!itemsWithAmount.length) {
    host.innerHTML = `${periodControl}<div class="list-item">当前筛选条件下没有可用于统计的品牌金额数据。</div>`;
    return;
  }
  const groupKey = ["brand", "owner", "loc", "role", "channel"].includes(state.inventoryActiveFilterGroup)
    ? state.inventoryActiveFilterGroup
    : "brand";
  const groupLabel = {
    brand: "品牌",
    owner: "Owner",
    loc: "地点",
    role: "Role",
    channel: "渠道",
  }[groupKey] || "品牌";
  const valueGetter = {
    brand: (item) => item.brand || "Unknown",
    owner: (item) => item.owner || "Unknown",
    loc: (item) => item.loc || "Unknown",
    role: (item) => inventoryRoleValue(item) || "Unknown",
    channel: (item) => inventoryChannelValue(item),
  }[groupKey];
  const metric = state.inventoryBrandShareMetric === "count" ? "count" : "amount";
  const grouped = new Map();
  periodFilteredItems.forEach((item) => {
    const brand = valueGetter ? valueGetter(item) : (item.brand || "Unknown");
    const amount = parsePrice(item.price_cny || item.price_original);
    const current = grouped.get(brand) || { amount: 0, count: 0 };
    current.amount += amount;
    current.count += 1;
    grouped.set(brand, current);
  });
  const entries = [...grouped.entries()]
    .map(([brand, values]) => ({ brand, amount: values.amount, count: values.count }))
    .sort((left, right) => {
      const diff = (metric === "count" ? right.count - left.count : right.amount - left.amount);
      if (diff !== 0) return diff;
      return String(left.brand).localeCompare(String(right.brand), "zh-CN", { sensitivity: "base", numeric: true });
    });
  const total = entries.reduce((sum, entry) => sum + (metric === "count" ? entry.count : entry.amount), 0);
  if (!total) {
    host.innerHTML = `${periodControl}<div class="list-item">当前筛选条件下没有可用于统计的品牌金额数据。</div>`;
    return;
  }
  let start = 0;
  const segments = entries.map((entry, index) => {
    const metricValue = metric === "count" ? entry.count : entry.amount;
    const percent = (metricValue / total) * 100;
    const end = start + percent;
    const segment = {
      ...entry,
      metricValue,
      percent,
      color: colors[index % colors.length],
      start,
      end,
    };
    start = end;
    return segment;
  });
  const gradient = segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ");
  host.innerHTML = `
    ${periodControl}
    <div class="brand-share-layout">
      <div class="brand-share-chart-wrap">
        <div class="brand-share-donut" style="background: conic-gradient(${gradient});">
          <div class="brand-share-hole brand-share-hole-toggle" data-inventory-brand-metric-toggle="${metric === "count" ? "amount" : "count"}" title="点击切换金额 / 件数">
            <strong>${metric === "count" ? total : formatCurrency(total)}</strong>
            <span>${metric === "count" ? "总件数" : "总金额"}</span>
          </div>
        </div>
      </div>
      <div class="brand-share-legend">
        ${segments.map((segment) => `
          <div class="brand-share-row">
            <div class="brand-share-label">
              <span class="brand-share-dot" style="background:${segment.color};"></span>
              <button type="button" class="brand-share-brand-button" data-inventory-share-focus="${escapeHtml(segment.brand)}" data-inventory-share-group="${groupKey}">${escapeHtml(segment.brand)}</button>
            </div>
            <div class="brand-share-meta">
              <strong>${formatPercent(segment.percent)}</strong>
              <span>${metric === "count" ? `${segment.count} 件` : formatCurrency(segment.amount)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  host.querySelectorAll("[data-inventory-brand-metric-toggle]").forEach((node) => {
    node.addEventListener("click", () => {
      const metricValue = node.dataset.inventoryBrandMetricToggle || "amount";
      state.inventoryBrandShareMetric = metricValue === "count" ? "count" : "amount";
      renderInventoryBrandShareChart();
    });
  });
  host.querySelector("#inventory-brand-period-select")?.addEventListener("change", () => {
    const nextValue = host.querySelector("#inventory-brand-period-select")?.value || "total";
    state.inventoryBrandShareYear = nextValue === "total" ? "total" : nextValue;
    renderInventoryBrandShareChart();
    renderInventorySummary();
    renderItems();
  });
  host.querySelectorAll("[data-inventory-share-focus]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.inventoryShareFocus || "";
      const group = button.dataset.inventoryShareGroup || "brand";
      if (!value) return;
      const map = {
        brand: { key: "brands", target: "#brand-filter" },
        owner: { key: "owners", target: "#owner-filter" },
        loc: { key: "locs", target: "#loc-filter" },
        role: { key: "roles", target: "#role-filter" },
        channel: { key: "channels", target: "#channel-filter" },
      }[group];
      if (!map) return;
      state.inventoryFilters[map.key] = [value];
      document.querySelectorAll(`${map.target} input[type="checkbox"]`).forEach((checkbox) => {
        checkbox.checked = checkbox.value === value;
      });
      await refreshItems();
    });
  });
}

function renderWatchItems() {
  const tbody = $("watch-items-table");
  if (!tbody) return;
  tbody.innerHTML = sortedWatchItems().map((item) => `
    <tr>
      <td>${sectionLink(item)}</td>
      <td>${item.price_cny || item.price_original || ""}</td>
      <td>${item.wear_total ?? 0}</td>
      <td>${item.loc || ""}</td>
      <td>${item.owner || ""}</td>
      <td>${formatBeijingDate(item.acquired_at)}</td>
    </tr>
  `).join("");
  renderSortHeaders("watch", state.watchSort);
}

function renderWatchBrandShareChart() {
  const host = $("watch-brand-share-chart");
  if (!host) return;
  const colors = ["#8b5e3c", "#b77b57", "#d4a373", "#718355", "#457b9d", "#a44a3f", "#6d597a", "#2a9d8f", "#bc6c25", "#5b8e7d"];
  const itemsWithAmount = filteredWatchItems().filter((item) => parsePrice(item.price_cny || item.price_original) > 0);
  const availableYears = [...new Set(itemsWithAmount.map((item) => itemAcquiredYear(item)).filter(Boolean))]
    .sort((left, right) => Number(right) - Number(left) || String(right).localeCompare(String(left), "zh-CN", { numeric: true }));
  const period = state.watchBrandShareYear !== "total" && availableYears.includes(state.watchBrandShareYear)
    ? state.watchBrandShareYear
    : "total";
  state.watchBrandShareYear = period;
  const periodFilteredItems = period === "total"
    ? itemsWithAmount
    : itemsWithAmount.filter((item) => itemAcquiredYear(item) === period);
  const periodControl = `
    <div class="brand-share-chart-top brand-share-chart-top-outer">
      <select id="watch-brand-period-select" class="brand-share-period-select">
        <option value="total" ${period === "total" ? "selected" : ""}>Total</option>
        ${availableYears.map((year) => `
          <option value="${escapeHtml(year)}" ${year === period ? "selected" : ""}>${escapeHtml(year)}</option>
        `).join("")}
      </select>
    </div>
  `;
  const group = state.watchActiveFilterGroup === "owner" ? "owner" : "brand";
  const groupLabel = group === "owner" ? "Owner" : "品牌";
  if (!itemsWithAmount.length) {
    host.innerHTML = `${periodControl}<div class="list-item">当前筛选条件下没有可用于统计的${groupLabel}金额数据。</div>`;
    return;
  }
  const metric = state.watchBrandShareMetric === "count" ? "count" : "amount";
  const grouped = new Map();
  periodFilteredItems.forEach((item) => {
    const groupValue = group === "owner" ? (item.owner || "Unknown") : (item.brand || "Unknown");
    const amount = parsePrice(item.price_cny || item.price_original);
    const current = grouped.get(groupValue) || { amount: 0, count: 0 };
    current.amount += amount;
    current.count += 1;
    grouped.set(groupValue, current);
  });
  const entries = [...grouped.entries()]
    .map(([label, values]) => ({ label, amount: values.amount, count: values.count }))
    .sort((left, right) => {
      const diff = (metric === "count" ? right.count - left.count : right.amount - left.amount);
      if (diff !== 0) return diff;
      return String(left.label).localeCompare(String(right.label), "zh-CN", { sensitivity: "base", numeric: true });
    });
  const total = entries.reduce((sum, entry) => sum + (metric === "count" ? entry.count : entry.amount), 0);
  if (!total) {
    host.innerHTML = `${periodControl}<div class="list-item">当前筛选条件下没有可用于统计的${groupLabel}金额数据。</div>`;
    return;
  }
  let start = 0;
  const segments = entries.map((entry, index) => {
    const metricValue = metric === "count" ? entry.count : entry.amount;
    const percent = (metricValue / total) * 100;
    const end = start + percent;
    const segment = {
      ...entry,
      metricValue,
      percent,
      color: colors[index % colors.length],
      start,
      end,
    };
    start = end;
    return segment;
  });
  const gradient = segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ");
  host.innerHTML = `
    ${periodControl}
    <div class="brand-share-layout">
      <div class="brand-share-chart-wrap">
        <div class="brand-share-donut" style="background: conic-gradient(${gradient});">
          <div class="brand-share-hole brand-share-hole-toggle" data-watch-brand-metric-toggle="${metric === "count" ? "amount" : "count"}" title="点击切换金额 / 件数">
            <strong>${metric === "count" ? total : formatCurrency(total)}</strong>
            <span>${metric === "count" ? "总件数" : "总金额"}</span>
          </div>
        </div>
      </div>
      <div class="brand-share-legend">
        ${segments.map((segment) => `
          <div class="brand-share-row">
            <div class="brand-share-label">
              <span class="brand-share-dot" style="background:${segment.color};"></span>
              <button type="button" class="brand-share-brand-button" data-watch-share-focus="${escapeHtml(segment.label)}" data-watch-share-group="${escapeHtml(group)}">${escapeHtml(segment.label)}</button>
            </div>
            <div class="brand-share-meta">
              <strong>${formatPercent(segment.percent)}</strong>
              <span>${metric === "count" ? `${segment.count} 件` : formatCurrency(segment.amount)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  host.querySelector("#watch-brand-period-select")?.addEventListener("change", () => {
    const nextValue = host.querySelector("#watch-brand-period-select")?.value || "total";
    state.watchBrandShareYear = nextValue === "total" ? "total" : nextValue;
    refreshWatchItems().catch((error) => console.error(error));
  });
  host.querySelectorAll("[data-watch-brand-metric-toggle]").forEach((node) => {
    node.addEventListener("click", () => {
      const metricValue = node.dataset.watchBrandMetricToggle || "amount";
      state.watchBrandShareMetric = metricValue === "count" ? "count" : "amount";
      renderWatchBrandShareChart();
    });
  });
  host.querySelectorAll("[data-watch-share-focus]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.watchShareFocus || "";
      const nextGroup = button.dataset.watchShareGroup === "owner" ? "owner" : "brand";
      if (!value) return;
      if (nextGroup === "owner") {
        state.watchFilters.owners = [value];
        document.querySelectorAll('#watch-owner-filter input[type="checkbox"]').forEach((checkbox) => {
          checkbox.checked = checkbox.value === value;
        });
      } else {
        state.watchFilters.brands = [value];
        document.querySelectorAll('#watch-brand-filter input[type="checkbox"]').forEach((checkbox) => {
          checkbox.checked = checkbox.value === value;
        });
      }
      state.watchActiveFilterGroup = nextGroup;
      updateWatchFilterUi();
      await refreshWatchItems();
    });
  });
}

function renderWatchSummary() {
  const host = $("watch-summary");
  if (!host) return;
  const items = displayWatchItems();
  const itemCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + parsePrice(item.price_cny || item.price_original), 0);
  const avgPrice = itemCount ? totalPrice / itemCount : 0;
  const stats = [
    ["件数", itemCount],
    ["均价", formatCurrency(avgPrice)],
  ];
  host.innerHTML = stats.map(([label, value]) => `
    <div class="stat">
      <div>${label}</div>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function buildMaintenanceEntry(item) {
  const threshold = safeNumber(item.wear_threshold);
  if (!(threshold > 0)) return null;
  const wear = safeNumber(item.wear_maintenance) || 0;
  const total = safeNumber(item.wear_total) || 0;
  const remaining = threshold !== null ? Number((threshold - wear).toFixed(1)) : null;
  const level = maintenanceLevelMeta(item);
  return {
    item,
    threshold,
    wear,
    total,
    remaining,
    level,
    typeLabel: maintenanceTypeLabel(item),
  };
}

function renderMaintenanceSummary() {
  const host = $("maintenance-summary");
  if (!host) return;
  const entries = filteredMaintenanceItems()
    .map(buildMaintenanceEntry)
    .filter(Boolean)
    .filter((entry) => !state.maintenanceActiveLevel || entry.level.key === state.maintenanceActiveLevel);
  const inProgressCount = entries.filter((entry) => entry.level.key === "in_progress").length;
  const expiredCount = entries.filter((entry) => entry.level.key === "expired").length;
  const redCount = entries.filter((entry) => entry.level.key === "red").length;
  const orangeCount = entries.filter((entry) => entry.level.key === "orange").length;
  const stats = [
    ["件数", entries.length],
    ["保养中", inProgressCount],
    ["已到期", expiredCount],
    ["红色级", redCount],
    ["橙色级", orangeCount],
    ["绿色级", entries.filter((entry) => entry.level.key === "green").length],
  ];
  host.innerHTML = stats.map(([label, value]) => `
    <div class="stat">
      <div>${label}</div>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderMaintenanceChart() {
  const host = $("maintenance-chart");
  if (!host) return;
  const entries = filteredMaintenanceItems().map(buildMaintenanceEntry).filter(Boolean);
  if (!entries.length) {
    host.innerHTML = `<div class="list-item">当前筛选条件下没有可用于保养规划的商品。</div>`;
    return;
  }
  const levelOrder = ["in_progress", "expired", "red", "orange", "green"];
  const grouped = new Map();
  entries.forEach((entry) => {
    const current = grouped.get(entry.level.key) || {
      key: entry.level.key,
      label: entry.level.label,
      color: entry.level.color,
      count: 0,
    };
    current.count += 1;
    grouped.set(entry.level.key, current);
  });
  const segments = levelOrder
    .map((key) => grouped.get(key))
    .filter(Boolean);
  const total = segments.reduce((sum, entry) => sum + entry.count, 0);
  if (!total) {
    host.innerHTML = `<div class="list-item">当前筛选条件下没有可用于保养规划的商品。</div>`;
    return;
  }
  let start = 0;
  const chartSegments = segments.map((entry) => {
    const percent = (entry.count / total) * 100;
    const end = start + percent;
    const next = { ...entry, percent, start, end };
    start = end;
    return next;
  });
  if (state.maintenanceActiveLevel && !chartSegments.some((segment) => segment.key === state.maintenanceActiveLevel)) {
    state.maintenanceActiveLevel = "";
  }
  const gradient = chartSegments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ");
  host.innerHTML = `
    <div class="brand-share-layout">
      <div class="brand-share-chart-wrap">
        <div class="brand-share-donut" style="background: conic-gradient(${gradient});">
          <div class="brand-share-hole">
            <strong>${total}</strong>
            <span>总件数</span>
          </div>
        </div>
      </div>
      <div class="brand-share-legend">
        ${chartSegments.map((segment) => `
          <div class="brand-share-row ${state.maintenanceActiveLevel === segment.key ? "active" : ""}">
            <div class="brand-share-label">
              <span class="brand-share-dot" style="background:${segment.color};"></span>
              <button type="button" class="brand-share-brand-button" data-maintenance-level-filter="${escapeHtml(segment.key)}">${escapeHtml(segment.label)}</button>
            </div>
            <div class="brand-share-meta">
              <strong>${formatPercent(segment.percent)}</strong>
              <span>${segment.count} 件</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  host.querySelectorAll("[data-maintenance-level-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextKey = button.dataset.maintenanceLevelFilter || "";
      state.maintenanceActiveLevel = state.maintenanceActiveLevel === nextKey ? "" : nextKey;
      refreshMaintenancePlanning();
    });
  });
}

function renderMaintenanceList() {
  const host = $("maintenance-list");
  if (!host) return;
  const entries = filteredMaintenanceItems()
    .map(buildMaintenanceEntry)
    .filter(Boolean)
    .filter((entry) => !state.maintenanceActiveLevel || entry.level.key === state.maintenanceActiveLevel)
    .sort((left, right) => {
      const levelDiff = left.level.priority - right.level.priority;
      if (levelDiff !== 0) return levelDiff;
      const remainingLeft = left.remaining === null ? Number.POSITIVE_INFINITY : left.remaining;
      const remainingRight = right.remaining === null ? Number.POSITIVE_INFINITY : right.remaining;
      if (remainingLeft !== remainingRight) return remainingLeft - remainingRight;
      return String(left.item.section || left.item.code || "").localeCompare(String(right.item.section || right.item.code || ""), "zh-CN");
    });
  if (!entries.length) {
    host.innerHTML = `<div class="list-item">当前筛选条件下没有可用于保养规划的商品。</div>`;
    return;
  }
  const groups = [
    ["in_progress", "保养中"],
    ["expired", "已到期"],
    ["red", "红色级"],
    ["orange", "橙色级"],
    ["green", "绿色级"],
  ].map(([key, label]) => ({
    key,
    label,
    items: entries.filter((entry) => entry.level.key === key),
  })).filter((group) => group.items.length);
  host.innerHTML = `
    <div class="maintenance-list">
      ${groups.map((group) => `
        <section class="maintenance-group">
          <div class="maintenance-group-title">${escapeHtml(group.label)} · ${group.items.length} 件</div>
          ${group.items.map((entry) => `
            <article class="maintenance-row">
              <div class="maintenance-main">
                <div class="maintenance-title-row">
                  <div class="maintenance-section">${sectionLink(entry.item, "section-link")}</div>
                  <span class="maintenance-level-badge level-${escapeHtml(entry.level.key)}">${escapeHtml(entry.level.label)}</span>
                </div>
                <div class="maintenance-meta">
                  <span>${escapeHtml(entry.item.brand || "")}</span>
                  <span>${escapeHtml(entry.typeLabel)}</span>
                  <span>${entry.threshold !== null ? `磨损指数/阈值 ${formatMetricNumber(entry.wear)} / ${formatMetricNumber(entry.threshold)}` : `磨损指数 ${formatMetricNumber(entry.wear)}`}</span>
                </div>
              </div>
              <div class="maintenance-side">
                ${canWriteOwnedRecord(entry.item) ? `
                  <button
                    type="button"
                    class="ghost-btn maintenance-action-btn"
                    data-maintenance-item-id="${entry.item.id}"
                    data-maintenance-action="${entry.level.key === "in_progress" ? "activate" : "maintain"}"
                  >${entry.level.key === "in_progress" ? "激活" : "保养"}</button>
                ` : ""}
              </div>
            </article>
          `).join("")}
        </section>
      `).join("")}
    </div>
  `;
}

function refreshMaintenancePlanning() {
  syncDynamicBrandFilters();
  renderMaintenanceSummary();
  renderMaintenanceChart();
  renderMaintenanceList();
}

async function sendItemToMaintenance(itemId) {
  const targetId = Number(itemId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) return;
  const confirmed = window.confirm("确认将这件商品标记为保养中？这会把磨损指数归零、保养次数加一，并单独标记为保养中。");
  if (!confirmed) return;
  await api(`/api/items/${targetId}/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  await Promise.all([
    refreshDashboardItems(),
    refreshItems(),
    refreshWatchItems(),
    refreshOptions(),
  ]);
  if (state.selectedItemId === targetId) {
    await selectItem(targetId);
  }
  refreshMaintenancePlanning();
}

async function activateMaintainedItem(itemId) {
  const targetId = Number(itemId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) return;
  const confirmed = window.confirm("确认将这件商品改回激活状态并重新开始使用？");
  if (!confirmed) return;
  await api(`/api/items/${targetId}/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  await Promise.all([
    refreshDashboardItems(),
    refreshItems(),
    refreshWatchItems(),
    refreshOptions(),
  ]);
  if (state.selectedItemId === targetId) {
    await selectItem(targetId);
  }
  refreshMaintenancePlanning();
}

function renderPhotos(item) {
  const host = $("photo-grid");
  if (!host) return;
  host.innerHTML = renderPhotoCardsHtml(item?.photos || [], "item", item?.id || "");
}

function fillItemForm(item) {
  if (!$("item-id")) return;
  $("item-id").value = item?.id || "";
  fields.forEach((key) => {
    $(key).value = item?.[key] ?? "";
  });
  renderPhotos(item);
}

function renderItemDetailPanel(hostId, item, message = "请选择一件产品查看详情。") {
  const host = $(hostId);
  if (!host) return;
  if (!item) {
    host.innerHTML = `<div class="card"><div class="list-item">${message}</div></div>`;
    return;
  }
  const isWatch = item.layer_role === "Watch";
  const originalPrice = String(item.price_original || "").trim();
  const originalCurrency = String(item.price_original_currency || "").trim().toUpperCase();
  const originalPriceDisplay = originalPrice && originalCurrency ? `${originalCurrency} ${originalPrice}` : originalPrice;
  const actualPrice = String(item.price_cny || "").trim();
  const originalPriceValue = parsePrice(originalPrice);
  const actualPriceValue = parsePrice(actualPrice);
  const samePriceValue = originalPriceValue > 0 && actualPriceValue > 0 && Math.abs(originalPriceValue - actualPriceValue) < 0.0001;
  const samePriceText = originalPrice && actualPrice && originalPrice === actualPrice;
  const originalCurrencyDiffers = Boolean(originalCurrency && originalCurrency !== "CNY");
  const priceFields = actualPrice
    ? (
        originalPrice && ((!samePriceValue && !samePriceText) || originalCurrencyDiffers)
          ? [
              ["原始价格", originalPriceDisplay],
              ["实际价格", actualPrice],
            ]
          : [["实际价格", actualPrice]]
      )
    : (originalPrice ? [["原始价格", originalPriceDisplay]] : []);
  const normalizedRole = normalizedItemLayerRole(item.layer_role);
  const showStandaloneTemperature = roleUsesStandaloneTemperature(normalizedRole);
  const showLayerTemperature = roleUsesLayerTemperature(normalizedRole);
  const layerTemperature = showLayerTemperature ? formatLayerTemperature(item) : "";
  const standaloneTemperature = showStandaloneTemperature ? formatStandaloneTemperature(item) : "";
  const normalizedLayerRoleText = String(item.layer_role || "").trim();
  const normalizedOuterTypeText = String(item.outer_type || "").trim();
  const layerRoleDisplay = roleAllowsOuterType(normalizedRole)
    ? (normalizedOuterTypeText || normalizedLayerRoleText)
    : normalizedLayerRoleText;
  const detailSections = buildDetailSections(item, hostId, priceFields, layerRoleDisplay, layerTemperature, standaloneTemperature)
      .map((section) => ({ ...section, fields: compactDetailFields(section.fields) }))
      .filter((section) => section.fields.length);
  const readonlyFields = detailReadonlyFields(item);
  const descriptionBlock = hasMeaningfulDetailValue(item.official_desc) ? `
      <div class="detail-block detail-collapsible-group">
        <div class="detail-label">${isWatch ? "功能" : "官网描述"}</div>
        <div class="detail-value">${renderPreservedDetailText(item.official_desc)}</div>
      </div>
    ` : "";
    const notesBlock = !isWatch && hasMeaningfulDetailValue(item.notes) ? `
        <div class="detail-block">
          <div class="detail-label">备注</div>
          <div class="detail-value">${renderPreservedDetailText(item.notes)}</div>
        </div>
      ` : "";
  const metaChips = [
    item.brand,
    item.owner,
    item.loc,
    isWatch ? "Watch" : item.layer_role,
  ].filter((value) => hasMeaningfulDetailValue(value));
  const canEdit = hostId === "item-detail-view" && canEditItemBaseline(item);
  const isFullDetailView = hostId === "item-detail-view";
  const activeSubview = isFullDetailView ? (state.itemDetailSubtab || "detail") : "detail";
  const photoBlock = hostId === "item-detail-view" && activeSubview === "detail" ? `
      ${renderEntityPhotoSection(item.photos || [], "item", item.id, `/api/items/${item.id}/photos`)}
    ` : "";
  const isEditing = canEdit && state.itemDetailEditMode;
  const editSource = isEditing ? normalizeItemDraftPayload({
    ...item,
    ...(state.itemDetailEditDraft || {}),
  }, {
    kind: item.layer_role === "Watch" ? "watch" : "wardrobe",
    preserveKind: true,
  }) : item;
  const detailBody = isEditing
    ? `
      <div class="detail-edit-note">
        保存会直接写入数据库，并同步导出默认目录中的 Excel 基线文件。
      </div>
      ${state.itemDetailEditError ? `<div class="detail-edit-error">${escapeHtml(state.itemDetailEditError)}</div>` : ""}
      <div class="detail-edit-grid">
        ${itemBaselineEditFields(editSource).map((field) => renderItemEditField(editSource, field)).join("")}
      </div>
      ${readonlyFields.length ? `
        <div class="detail-readonly-grid">
          ${renderDetailSection("穿着统计", readonlyFields)}
        </div>
      ` : ""}
    `
    : `
      <div class="detail-sections">
        ${detailSections.map((section) => renderDetailSection(section.title, section.fields)).join("")}
      </div>
      ${descriptionBlock}
      ${notesBlock}
    `;
  const subtabBody = !isFullDetailView || isEditing
    ? detailBody
    : (activeSubview === "outfits"
        ? buildItemDetailOutfitTabHtml(item)
        : (activeSubview === "featured-looks"
            ? buildItemDetailFeaturedLookTabHtml(item)
            : detailBody));
  host.innerHTML = `
    <div class="card detail-page-shell">
      <div class="detail-head">
        <div class="detail-hero">
          <div class="detail-title-row">
            <h3 class="detail-title">${item.section || item.code || "-"}</h3>
            ${hostId === "item-detail-view" && !isEditing ? `<button id="item-detail-copy-btn" type="button" class="ghost-btn detail-edit-inline" data-copy-item-detail="${item.id}">复制</button>` : ""}
            ${canEdit && !isEditing ? `<button id="item-detail-edit-btn" type="button" class="ghost-btn detail-edit-inline">编辑</button>` : ""}
          </div>
              ${(metaChips.length || (canEdit && !isEditing) || hostId === "item-detail-view") ? `
                <div class="chips detail-meta-chips">
                  ${metaChips.map((value) => `<span class="chip">${detailValue(value)}</span>`).join("")}
                </div>
            ` : ""}
          </div>
          ${canEdit ? `
            <div class="detail-actions">
              ${isEditing
                ? `
                  <button id="item-detail-save-btn" type="button" class="ghost-btn" ${state.itemDetailEditSaving ? "disabled" : ""}>${state.itemDetailEditSaving ? "保存中" : "保存"}</button>
                  <button id="item-detail-cancel-btn" type="button" class="ghost-btn" ${state.itemDetailEditSaving ? "disabled" : ""}>取消</button>
                `
                : `
                  <button type="button" class="detail-link-btn detail-subtab-btn ${activeSubview === "detail" ? "active" : ""}" data-item-detail-subtab="detail">详情</button>
                  <button type="button" class="detail-link-btn detail-subtab-btn ${activeSubview === "outfits" ? "active" : ""}" data-item-detail-subtab="outfits">记录</button>
                  <button type="button" class="detail-link-btn detail-subtab-btn ${activeSubview === "featured-looks" ? "active" : ""}" data-item-detail-subtab="featured-looks">套装</button>
                `}
            </div>
          ` : ""}
        </div>
      ${photoBlock}
      ${subtabBody}
    </div>
  `;
  host.querySelectorAll("[data-item-detail-subtab]").forEach((button) => {
    button.addEventListener("click", async () => {
      const nextSubview = button.dataset.itemDetailSubtab || "detail";
      if (nextSubview === activeSubview) return;
      state.itemDetailSubtab = nextSubview;
      if (nextSubview === "outfits") {
        await refreshRelatedOutfits(item.id);
        renderItemDetail(item);
        void ensureSelectedRelatedOutfitDetailLoaded(() => {
          if (state.selectedItemDetail?.id === item.id) {
            renderItemDetail(state.selectedItemDetail);
          }
        });
      } else if (nextSubview === "featured-looks") {
        await refreshRelatedFeaturedLooks(item.id);
        renderItemDetail(item);
        return;
      }
      renderItemDetail(item);
    });
  });
  host.querySelectorAll("[data-open-last-worn]").forEach((button) => {
    button.addEventListener("click", async () => {
      const itemId = Number(button.dataset.openLastWorn || "0");
      const targetDate = String(button.dataset.lastWornDate || "").trim();
      if (!Number.isFinite(itemId) || itemId <= 0 || !targetDate) return;
      const targetItem = state.selectedItemDetail?.id === itemId
        ? state.selectedItemDetail
        : (findKnownItemById(itemId) || await ensureKnownItemLoaded(itemId));
      if (!targetItem) return;
      await openRelatedOutfitsForItem(targetItem, targetDate);
    });
  });
  host.querySelectorAll(".outfit-month-input, [data-outfit-month-select]").forEach((input) => {
    const applyMonthSelection = () => {
      const monthValue = String(input.value || "").trim();
      if (!monthValue) return;
      const monthMatches = (state.relatedOutfitEntries || [])
        .filter((entry) => !state.relatedOutfitYear || String(entry.wear_date || "").startsWith(state.relatedOutfitYear))
        .filter((entry) => String(entry.wear_date || "").startsWith(monthValue))
        .sort((left, right) => String(left.wear_date || "").localeCompare(String(right.wear_date || ""), "zh-CN"));
      state.relatedOutfitMonth = monthValue;
      state.selectedOutfitDate = monthMatches[0]?.wear_date || `${monthValue}-01`;
      renderItemDetail(item);
      void ensureSelectedRelatedOutfitDetailLoaded(() => {
        if (state.selectedItemDetail?.id === item.id) {
          renderItemDetail(state.selectedItemDetail);
        }
      });
    };
    input.addEventListener("input", applyMonthSelection);
    input.addEventListener("change", applyMonthSelection);
    input.addEventListener("blur", applyMonthSelection);
  });
  host.querySelectorAll("[data-item-detail-outfit-year]").forEach((button) => {
    button.addEventListener("click", () => {
      state.relatedOutfitYear = button.dataset.itemDetailOutfitYear || "";
      const yearMatches = (state.relatedOutfitEntries || [])
        .filter((entry) => !state.relatedOutfitYear || String(entry.wear_date || "").startsWith(state.relatedOutfitYear))
        .sort((left, right) => String(left.wear_date || "").localeCompare(String(right.wear_date || ""), "zh-CN"));
      state.relatedOutfitMonth = yearMatches[0] ? String(yearMatches[0].wear_date || "").slice(0, 7) : "";
      state.selectedOutfitDate = yearMatches[0]?.wear_date || state.selectedOutfitDate;
      renderItemDetail(item);
      void ensureSelectedRelatedOutfitDetailLoaded(() => {
        if (state.selectedItemDetail?.id === item.id) {
          renderItemDetail(state.selectedItemDetail);
        }
      });
    });
  });
  host.querySelectorAll("[data-outfit-date-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      applySelectedOutfitDate(button.dataset.outfitDateChip || state.selectedOutfitDate);
      renderItemDetail(item);
      void ensureSelectedRelatedOutfitDetailLoaded(() => {
        if (state.selectedItemDetail?.id === item.id) {
          renderItemDetail(state.selectedItemDetail);
        }
      });
    });
  });
  host.querySelectorAll("[data-outfit-date-latest]").forEach((button) => {
    button.addEventListener("click", () => {
      applySelectedOutfitDate(button.dataset.outfitDateLatest || state.selectedOutfitDate);
      renderItemDetail(item);
      void ensureSelectedRelatedOutfitDetailLoaded(() => {
        if (state.selectedItemDetail?.id === item.id) {
          renderItemDetail(state.selectedItemDetail);
        }
      });
    });
  });
  host.querySelectorAll("[data-edit-outfit]").forEach((button) => {
    button.addEventListener("click", () => {
      const outfitId = Number(button.dataset.editOutfit || 0);
      const outfit = state.outfitDetailsById[String(outfitId)] || null;
      if (!outfit) return;
      openOutfitEdit(outfit);
      renderItemDetail(item);
    });
  });
  host.querySelectorAll("[data-cancel-outfit-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      closeOutfitEdit();
      renderItemDetail(item);
    });
  });
  host.querySelectorAll("[data-save-outfit-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      await saveOutfitEdit(host);
    });
  });
  bindOutfitFormInteractions(host, "edit", () => renderItemDetail(item));
  host.querySelectorAll("[data-delete-outfit]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteSelectedOutfit(Number(button.dataset.deleteOutfit || 0));
    });
  });
  host.querySelectorAll("[data-save-outfit-look]").forEach((button) => {
    button.addEventListener("click", async () => {
      await saveSelectedOutfitAsLook(Number(button.dataset.saveOutfitLook || 0));
    });
  });
  host.querySelectorAll("[data-open-featured-look]").forEach((button) => {
    button.addEventListener("click", async () => {
      await openFeaturedLookByIdentifier(button.dataset.openFeaturedLook || "");
    });
  });
  host.querySelector("[data-item-detail-look-select]")?.addEventListener("change", (event) => {
    state.selectedRelatedFeaturedLookId = event.target.value || "";
    renderItemDetail(item);
  });
  host.querySelector("#item-detail-copy-btn")?.addEventListener("click", async () => {
    try {
      await copyItemDetailSummary(host.querySelector("#item-detail-copy-btn"), Number(item.id || 0));
    } catch (_) {
      window.alert("复制到剪贴板失败。");
    }
  });
  host.querySelector("#item-detail-edit-btn")?.addEventListener("click", () => {
    state.itemDetailSubtab = "detail";
    state.itemDetailEditMode = true;
    state.itemDetailEditDraft = normalizeItemDraftPayload({ ...item }, {
      kind: item.layer_role === "Watch" ? "watch" : "wardrobe",
      preserveKind: true,
    });
    state.itemDetailEditError = "";
    renderItemDetail(item);
  });
  host.querySelector("#item-detail-cancel-btn")?.addEventListener("click", () => {
    state.itemDetailEditMode = false;
    state.itemDetailEditDraft = null;
    state.itemDetailEditSaving = false;
    state.itemDetailEditError = "";
    renderItemDetail(item);
  });
  host.querySelector("#item-detail-save-btn")?.addEventListener("click", () => {
    saveItemDetailEdits().catch((error) => console.error(error));
  });
  host.querySelectorAll("[data-edit-field]").forEach((node) => {
    const eventName = node.tagName === "SELECT" ? "change" : "input";
    node.addEventListener(eventName, () => {
      state.itemDetailEditDraft = normalizeItemDraftPayload(
        { ...(state.itemDetailEditDraft || item), ...itemEditPayload(host, item) },
        { kind: item.layer_role === "Watch" ? "watch" : "wardrobe", preserveKind: true }
      );
      if (node.dataset.editField === "layer_role") {
        renderItemDetail(item);
      }
    });
  });
}

function renderItemDetail(item, message = "请选择一件产品查看详情。") {
  renderItemDetailPanel("item-detail-view", item, message);
}

function renderInventoryItemDetail(item, message = "请选择列表中的一件产品查看详情。") {
  const host = $("inventory-item-view");
  if (!host) return;
  if (!item) {
    host.innerHTML = "";
    return;
  }
  renderItemDetailPanel("inventory-item-view", item, message);
}

async function selectItem(id) {
  const item = await api(`/api/items/${id}`);
  state.selectedItemId = id;
  state.selectedItemDetail = item;
  state.itemDetailSubtab = "detail";
  state.itemDetailEditMode = false;
  state.itemDetailEditDraft = null;
  state.itemDetailEditSaving = false;
  state.itemDetailEditError = "";
  renderItemDetail(item);
  renderInventoryItemDetail(item);
  renderPhotos(item);
  renderItems();
  return item;
}

async function saveItemDetailEdits() {
  const host = $("item-detail-view");
  const item = state.selectedItemDetail;
  if (!host || !item) return;
  try {
    const payload = ensureRequiredItemFields(itemEditPayload(host, item));
    state.itemDetailEditSaving = true;
    state.itemDetailEditError = "";
    state.itemDetailEditDraft = { ...(state.itemDetailEditDraft || item), ...payload };
    renderItemDetail({ ...item, ...payload });
    const updated = await api(`/api/items/${item.id}/baseline-save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    state.itemDetailEditMode = false;
    state.itemDetailEditDraft = null;
    state.itemDetailEditSaving = false;
    state.itemDetailEditError = "";
    state.selectedItemId = updated.id;
    state.selectedItemDetail = updated;
    if (window.location.hash.startsWith("#item-") && Number(updated.id) !== Number(item.id)) {
      history.replaceState(null, "", `#item-${updated.id}`);
    }
    await refreshDashboardItems();
    await refreshOptions();
    await refreshItems();
    await refreshWatchItems();
    await refreshOutfits();
    await refreshFeaturedLooks();
    renderItemDetail(updated);
    renderInventoryItemDetail(updated);
  } catch (error) {
    state.itemDetailEditSaving = false;
    state.itemDetailEditError = String(error?.message || error || "保存失败");
    renderItemDetail(item);
  }
}

async function openItemDetail(id) {
  await selectItem(id);
  setTab("item-detail");
  setSidebarOpen(false);
}

async function handleRoute() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [hash, hashQuery = ""] = rawHash.split("?");
  const hashParams = new URLSearchParams(hashQuery);
  if (!hash) {
    clearRelatedOutfitFilter();
    clearRelatedFeaturedLookFilter();
    setTab("inventory");
    setSidebarOpen(false);
    return;
  }
  if (hash === "recommend") {
    history.replaceState(null, "", "#featured-looks");
    await handleRoute();
    return;
  }
  if (hash.startsWith("item-")) {
    clearRelatedOutfitFilter();
    clearRelatedFeaturedLookFilter();
    const itemId = Number(hash.slice(5));
    if (Number.isFinite(itemId) && itemId > 0) {
      await openItemDetail(itemId);
      return;
    }
  }
  if (hash === "outfits") {
    const relatedItemId = Number(hashParams.get("item") || "0");
    state.relatedOutfitItemId = Number.isFinite(relatedItemId) && relatedItemId > 0 ? relatedItemId : null;
    if (state.relatedOutfitItemId) {
      await ensureKnownItemLoaded(state.relatedOutfitItemId);
      await refreshRelatedOutfits(state.relatedOutfitItemId);
    } else {
      state.relatedOutfitEntries = [];
    }
    if (!state.outfits.length) {
      await refreshOutfits();
    }
  } else {
    clearRelatedOutfitFilter();
    state.relatedOutfitEntries = [];
  }
  if (hash === "featured-looks") {
    const relatedItemId = Number(hashParams.get("item") || "0");
    const targetLookId = String(hashParams.get("look") || "").trim();
    state.relatedFeaturedLookItemId = Number.isFinite(relatedItemId) && relatedItemId > 0 ? relatedItemId : null;
    if (state.relatedFeaturedLookItemId) {
      await ensureKnownItemLoaded(state.relatedFeaturedLookItemId);
      await refreshRelatedFeaturedLooks(state.relatedFeaturedLookItemId);
    } else {
      state.relatedFeaturedLookEntries = [];
    }
    if (!state.featuredLooks.length) {
      await refreshFeaturedLooks();
    }
    if (targetLookId) {
      const relatedAvailableIds = new Set(state.relatedFeaturedLookEntries.map((look) => String(look.look_id || look.id || "")));
      const globalAvailableIds = new Set(state.featuredLooks.map((look) => String(look.look_id || look.id || "")));
      if (relatedAvailableIds.has(targetLookId)) {
        state.selectedRelatedFeaturedLookId = targetLookId;
      } else if (globalAvailableIds.has(targetLookId)) {
        clearRelatedFeaturedLookFilter();
        state.relatedFeaturedLookEntries = [];
        state.selectedRelatedFeaturedLookId = targetLookId;
      }
      renderFeaturedLooks();
    }
  } else {
    clearRelatedFeaturedLookFilter();
    state.relatedFeaturedLookEntries = [];
  }
  if (["dashboard", "wear-stats", "maintenance-planning", "inventory", "watch-collection", "item-detail", "outfits", "featured-looks"].includes(hash)) {
    setTab(hash);
    if (hash === "item-detail" && state.selectedItemId) {
      await selectItem(state.selectedItemId);
    } else if (hash === "item-detail") {
      renderItemDetail(null);
    }
  }
  if (hash === "outfits" || hash === "featured-looks" || hash === "item-detail") {
    await refreshAiAnalysisData({ forceVisible: true });
  }
  setSidebarOpen(false);
}

async function refreshOptions() {
  state.options = await api("/api/meta/options");
  const clothingItems = inventorySourceItems();
  const watches = watchSourceItems();
  const orderedBrands = sortBrandsByAmount([...new Set(clothingItems.map((item) => item.brand).filter(Boolean))], clothingItems);
  const orderedOwners = sortOwnersByAmount(state.options.owners, clothingItems);
  const orderedLocs = sortLocsByAmount(state.options.locs, clothingItems);
  const orderedChannels = sortValuesByAmount(["折扣", "正价"], clothingItems, inventoryChannelValue);
  const watchBrands = sortBrandsByAmount([...new Set(watches.map((item) => item.brand).filter(Boolean))], watches);
  const maintenanceItems = maintenanceSourceItems();
  const maintenanceBrands = sortBrandsByAmount([...new Set(maintenanceItems.map((item) => item.brand).filter(Boolean))], maintenanceItems);
  const hasUncategorizedMaintenanceRole = maintenanceItems.some((item) => maintenanceRoleValue(item) === "未分类");
  const maintenanceRoles = sortRolesByAmount(
    [
      ...(hasUncategorizedMaintenanceRole ? ["未分类"] : []),
      ...[...new Set(maintenanceItems.map((item) => maintenanceRoleValue(item)).filter(Boolean))].filter((value) => value !== "未分类"),
    ],
    maintenanceItems,
    (item) => maintenanceRoleValue(item),
  );
  const watchOwnerValues = state.options?.owners?.length
    ? state.options.owners.filter((value) => watches.some((item) => (item.owner || "") === value))
    : [...new Set(watches.map((item) => item.owner).filter(Boolean))];
  const watchOwners = sortOwnersByAmount(watchOwnerValues, watches);
  const hasUncategorizedRole = clothingItems.some((item) => inventoryRoleValue(item) === "未分类");
  const inventoryRoles = sortRolesByAmount([
    ...(hasUncategorizedRole ? ["未分类"] : []),
    ...state.options.roles.filter((value) => value !== "Watch"),
  ], clothingItems, (item) => inventoryRoleValue(item));
  state.inventoryFilters.brands = state.inventoryFilters.brands.filter((value) => orderedBrands.includes(value));
  state.inventoryFilters.owners = state.inventoryFilters.owners.filter((value) => orderedOwners.includes(value));
  state.inventoryFilters.locs = state.inventoryFilters.locs.filter((value) => orderedLocs.includes(value));
  state.inventoryFilters.roles = state.inventoryFilters.roles.filter((value) => inventoryRoles.includes(value));
  state.inventoryFilters.channels = state.inventoryFilters.channels.filter((value) => orderedChannels.includes(value));
  state.watchFilters.brands = state.watchFilters.brands.filter((value) => watchBrands.includes(value));
  state.watchFilters.owners = state.watchFilters.owners.filter((value) => watchOwners.includes(value));
  state.maintenanceFilters.brands = state.maintenanceFilters.brands.filter((value) => maintenanceBrands.includes(value));
  if (!state.inventoryBrandInitialized) {
    state.inventoryFilters.brands = [...orderedBrands];
    state.inventoryBrandInitialized = true;
  }
  const defaultOwner = state.authUser && orderedOwners.includes(state.authUser) ? state.authUser : "徐欣";
  if (!state.inventoryOwnerInitialized) {
    state.inventoryFilters.owners = orderedOwners.includes(defaultOwner) ? [defaultOwner] : [...orderedOwners];
    state.inventoryOwnerInitialized = true;
  }
  if (!state.brandShareOwnerSelectionInitialized) {
    state.brandShareSelectedOwners = orderedOwners.includes(defaultOwner) ? [defaultOwner] : [...orderedOwners];
    state.brandShareOwnerSelectionInitialized = true;
  }
  if (!state.inventoryLocInitialized) {
    state.inventoryFilters.locs = [...orderedLocs];
    state.inventoryLocInitialized = true;
  }
  if (!state.inventoryRoleInitialized) {
    state.inventoryFilters.roles = [...inventoryRoles];
    state.inventoryRoleInitialized = true;
  }
  if (!state.inventoryChannelInitialized) {
    state.inventoryFilters.channels = [...orderedChannels];
    state.inventoryChannelInitialized = true;
  }
  if (!state.watchBrandInitialized) {
    state.watchFilters.brands = [...watchBrands];
    state.watchBrandInitialized = true;
  }
  const defaultWatchOwner = state.authUser && watchOwners.includes(state.authUser) ? state.authUser : "徐欣";
  if (!state.watchOwnerInitialized) {
    state.watchFilters.owners = watchOwners.includes(defaultWatchOwner) ? [defaultWatchOwner] : [...watchOwners];
    state.watchOwnerInitialized = true;
  }
  if (!state.maintenanceRoleInitialized) {
    state.maintenanceFilters.roles = [...maintenanceRoles];
    state.maintenanceRoleInitialized = true;
  } else {
    state.maintenanceFilters.roles = mergeTrackedSelections(
      state.maintenanceFilters.roles,
      maintenanceRoles,
      state.maintenanceKnownRoles,
    );
  }
  state.maintenanceKnownRoles = [...maintenanceRoles];
  renderCheckboxGroup("owner-filter", orderedOwners, state.inventoryFilters.owners, "owner");
  renderCheckboxGroup("loc-filter", orderedLocs, state.inventoryFilters.locs, "loc");
  renderCheckboxGroup("role-filter", inventoryRoles, state.inventoryFilters.roles, "role");
  renderCheckboxGroup("channel-filter", orderedChannels, state.inventoryFilters.channels, "channel");
  renderCheckboxGroup("watch-owner-filter", watchOwners, state.watchFilters.owners, "owner");
  renderCheckboxGroup("maintenance-role-filter", maintenanceRoles, state.maintenanceFilters.roles, "role");
  syncDynamicBrandFilters();
  syncInventoryFiltersFromDom();
  syncWatchFiltersFromDom();
  syncMaintenanceFiltersFromDom();
  updateInventoryFilterUi();
  updateWatchFilterUi();
  updateMaintenanceFilterUi();
  bindInventoryFilterEvents();
  bindWatchFilterEvents();
  bindMaintenanceFilterEvents();
  refreshMaintenancePlanning();
  renderCatalogManager();
}

async function refreshItems() {
  syncDynamicBrandFilters();
  state.items = inventoryCandidateItems().filter((item) => {
    if (state.options.owners.length && state.inventoryFilters.owners.length === 0) return false;
    if (state.options.locs.length && state.inventoryFilters.locs.length === 0) return false;
    if (state.options.roles.length && state.inventoryFilters.roles.length === 0 && shouldApplyInventoryRoleFilter(item)) return false;
    if (state.inventoryFilters.channels.length === 0) return false;
    return true;
  });
  renderItems();
  renderInventorySummary();
  renderInventoryBrandShareChart();
  refreshMaintenancePlanning();
  updateInventoryFilterUi();
  updateInventorySearchUi();
  renderOutfitItemOptions();
}

async function refreshWatchItems() {
  syncDynamicBrandFilters();
  state.watchItems = filteredWatchItems();
  renderWatchItems();
  renderWatchSummary();
  renderWatchBrandShareChart();
  refreshMaintenancePlanning();
  updateWatchFilterUi();
  updateWatchSearchUi();
}

function renderOutfitItemOptions() {
  const select = $("outfit_item_ids");
  if (!select) return;
  const values = new Set(Array.from(select.selectedOptions).map((option) => Number(option.value)));
  select.innerHTML = state.items.map((item) => `
    <option value="${item.id}" ${values.has(item.id) ? "selected" : ""}>
      ${item.layer_role || "-"} | ${item.code} | ${item.section}
    </option>
  `).join("");
}

function selectedOutfit() {
  const { selected: selectedOwner } = resolveOutfitSelectedOwner();
  const ownerScopedOutfits = filterVisibleOutfits(state.outfits || [], selectedOwner);
  if (!ownerScopedOutfits.length) return null;
  return ownerScopedOutfits.find((outfit) => outfit.wear_date === state.selectedOutfitDate) || ownerScopedOutfits[0] || null;
}

function selectedOutfitDetail() {
  const summary = selectedOutfit();
  if (!summary?.id) return null;
  return state.outfitDetailsById[String(summary.id)] || null;
}

async function ensureSelectedOutfitDetailLoaded(force = false) {
  if (state.relatedOutfitItemId) return null;
  const summary = selectedOutfit();
  if (!summary?.id) return null;
  const key = String(summary.id);
  if (!force && state.outfitDetailsById[key]) return state.outfitDetailsById[key];
  if (!force && state.outfitDetailErrorsById[key]) return null;
  if (state.outfitDetailLoadingId === summary.id) return null;
  state.outfitDetailLoadingId = summary.id;
  delete state.outfitDetailErrorsById[key];
  renderSelectedOutfit();
  try {
    const detail = await api(`/api/outfits/${summary.id}`);
    state.outfitDetailsById[key] = detail;
    delete state.outfitDetailErrorsById[key];
    return detail;
  } catch (error) {
    const message = parseApiErrorMessage(error) || "详情加载失败。";
    if (message.includes("outfit_not_found")) {
      pruneInvalidOutfitSummary(summary.id, { related: false });
      return null;
    }
    state.outfitDetailErrorsById[key] = message;
    return null;
  } finally {
    if (state.outfitDetailLoadingId === summary.id) {
      state.outfitDetailLoadingId = null;
    }
    renderSelectedOutfit();
    renderSummary();
  }
}

function selectedRelatedOutfitSummary() {
  const { selected: selectedOwner } = resolveOutfitSelectedOwner();
  const filteredOutfits = filterVisibleOutfits(state.relatedOutfitEntries || [], selectedOwner);
  if (!filteredOutfits.length) return null;
  const yearFilteredOutfits = state.relatedOutfitYear
    ? filteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(state.relatedOutfitYear))
    : filteredOutfits;
  const monthFilteredOutfits = state.relatedOutfitMonth
    ? yearFilteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(state.relatedOutfitMonth))
    : yearFilteredOutfits;
  const selectedDate = state.selectedOutfitDate || monthFilteredOutfits[0]?.wear_date || yearFilteredOutfits[0]?.wear_date || filteredOutfits[0]?.wear_date || "";
  return monthFilteredOutfits.find((entry) => entry.wear_date === selectedDate) || monthFilteredOutfits[0] || yearFilteredOutfits[0] || filteredOutfits[0] || null;
}

function pruneInvalidOutfitSummary(outfitId, { related = false } = {}) {
  const targetId = Number(outfitId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) return false;
  const key = String(targetId);
  const source = related ? (state.relatedOutfitEntries || []) : (state.outfits || []);
  const nextSource = source.filter((entry) => Number(entry?.id || 0) !== targetId);
  if (nextSource.length === source.length) return false;
  if (related) {
    state.relatedOutfitEntries = nextSource;
  } else {
    state.outfits = nextSource;
  }
  delete state.outfitDetailsById[key];
  delete state.outfitDetailErrorsById[key];
  const stillExists = nextSource.some((entry) => String(entry?.wear_date || "") === state.selectedOutfitDate);
  if (!stillExists) {
    applySelectedOutfitDate(nextSource[0]?.wear_date || "");
  }
  return true;
}

async function ensureSelectedRelatedOutfitDetailLoaded(onChange, force = false) {
  const summary = selectedRelatedOutfitSummary();
  if (!summary?.id) return null;
  const key = String(summary.id);
  if (!force && state.outfitDetailsById[key]) return state.outfitDetailsById[key];
  if (!force && state.outfitDetailErrorsById[key]) return null;
  if (state.relatedOutfitDetailLoadingId === summary.id) return null;
  state.relatedOutfitDetailLoadingId = summary.id;
  delete state.outfitDetailErrorsById[key];
  onChange?.();
  try {
    const detail = await api(`/api/outfits/${summary.id}`);
    state.outfitDetailsById[key] = detail;
    delete state.outfitDetailErrorsById[key];
    return detail;
  } catch (error) {
    const message = parseApiErrorMessage(error) || "详情加载失败。";
    if (message.includes("outfit_not_found")) {
      pruneInvalidOutfitSummary(summary.id, { related: true });
      return null;
    }
    state.outfitDetailErrorsById[key] = message;
    return null;
  } finally {
    if (state.relatedOutfitDetailLoadingId === summary.id) {
      state.relatedOutfitDetailLoadingId = null;
    }
    onChange?.();
  }
}

function normalizedOutfitLayerRole(item) {
  return String(item.layer_role || item.role || "").trim().toLowerCase();
}

function outfitItemSortRank(item) {
  const role = normalizedOutfitLayerRole(item);
  const order = {
    outer: 0,
    inner: 1,
    middle: 2,
    bottom: 3,
    footwear: 4,
    watch: 5,
  };
  return order[role] ?? 99;
}

function renderOutfitDateList() {
  return;
}

function formatOutfitTemperature(outfit) {
  const exact = safeNumber(outfit?.temp_value);
  const low = safeNumber(outfit?.temp_low);
  const high = safeNumber(outfit?.temp_high);
  if (exact !== null) return `${exact.toFixed(1)}°C`;
  if (low !== null && high !== null) return `${low.toFixed(1)}–${high.toFixed(1)}°C`;
  if (low !== null) return `${low.toFixed(1)}°C+`;
  if (high !== null) return `≤${high.toFixed(1)}°C`;
  if (outfit?.avg_temp_label) {
    const raw = String(outfit.avg_temp_label || "").trim();
    const compact = raw
      .replace(/（.*?）/g, "")
      .replace(/\(.*?\)/g, "")
      .split(/[，,]/)[0]
      .trim();
    if (compact) {
      return /°C|℃/.test(compact) ? compact.replace(/℃/g, "°C") : `${compact}°C`;
    }
  }
  return "-";
}

function formatOutfitLocation(value) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const compact = raw
    .replace(/（.*?）/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  const aliases = {
    "上海": "SH",
    "杭州": "HZ",
    "香港": "HK",
  };
  return aliases[compact] || compact || "-";
}

function formatMonthLabel(monthText) {
  const value = String(monthText || "").trim();
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value || "当前月份";
  return `${match[1]}年${Number(match[2])}月`;
}

function formatMonthShortLabel(monthText) {
  const value = String(monthText || "").trim();
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value || "月份";
  return `${Number(match[2])}月`;
}

function formatMonthShortLabelWithCount(monthText, count) {
  const label = formatMonthShortLabel(monthText);
  const normalizedCount = Number(count || 0);
  return normalizedCount > 0 ? `${label} (${normalizedCount})` : label;
}

function renderExpandableText(label, text, className = "") {
  const content = String(text || "").trim();
  if (!content) return "";
  const extraClass = className ? ` ${className}` : "";
  return `
    <details class="expandable-text${extraClass}">
      <summary class="expandable-text-toggle">${escapeHtml(label)}</summary>
      <div class="expandable-text-body">${escapeHtml(content)}</div>
    </details>
  `;
}

function currentLoadedAppVersion() {
  try {
    const url = new URL(window.location.href);
    return String(url.searchParams.get("_appv") || "").trim() || CLIENT_BUILD_VERSION;
  } catch (error) {
    return CLIENT_BUILD_VERSION;
  }
}

function renderAppUpdateBanner() {
  const host = $("app-update-banner");
  if (!host) return;
  if (!state.appUpdateAvailable || !state.appUpdateVersion) {
    host.hidden = true;
    host.innerHTML = "";
    return;
  }
  host.hidden = false;
  host.innerHTML = `
    <span class="app-update-banner-text">发现新版本</span>
    <button id="app-update-refresh-btn" type="button" class="ghost-btn app-update-refresh-btn">刷新</button>
  `;
  $("app-update-refresh-btn")?.addEventListener("click", () => {
    reloadWithFreshVersion(state.appUpdateVersion);
  });
}

function renderCatalogManager() {
  const host = $("catalog-manager-panel");
  if (!host) return;
  if (!canManageCatalog()) {
    host.innerHTML = "";
    return;
  }
  const rows = [
    { optionType: "owner", label: "新增 Owner", placeholder: "例如：儿子" },
    { optionType: "wardrobe_brand", label: "新增衣橱品牌", placeholder: "例如：New Brand" },
    { optionType: "watch_brand", label: "新增腕表品牌", placeholder: "例如：Independent Watch" },
  ];
  const chips = {
    owner: catalogOptions("owner"),
    wardrobe_brand: catalogOptions("wardrobe_brand"),
    watch_brand: catalogOptions("watch_brand"),
  };
  host.innerHTML = `
    <div class="card option-catalog-card">
      <div class="detail-eyebrow">设置</div>
      <div class="auth-summary-user">选项字典</div>
      <div class="detail-edit-note item-create-note">用于提前维护 Owner、衣橱品牌、腕表品牌，下次入库或编辑时可直接选择。</div>
      ${state.catalogManagerError ? `<div class="detail-edit-error">${escapeHtml(state.catalogManagerError)}</div>` : ""}
      ${state.catalogManagerSuccess ? `<div class="item-create-success">${escapeHtml(state.catalogManagerSuccess)}</div>` : ""}
      <div class="option-catalog-grid">
        ${rows.map((row) => `
          <div class="option-catalog-row">
            <label class="detail-edit-field detail-edit-field-wide">
              <span class="detail-label">${escapeHtml(row.label)}</span>
              <div class="option-catalog-input-wrap">
                <input id="catalog-input-${escapeHtml(row.optionType)}" type="text" placeholder="${escapeHtml(row.placeholder)}">
                <button type="button" class="ghost-btn" data-catalog-save="${escapeHtml(row.optionType)}" ${state.catalogManagerSavingType === row.optionType ? "disabled" : ""}>添加</button>
              </div>
            </label>
            <div class="option-catalog-chips">
              ${chips[row.optionType].map((value) => `<span class="inline-chip auth-summary-chip"><span>${escapeHtml(value)}</span></span>`).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function buildOutfitDatePickerHtml(selectedDate, sourceOutfits = state.outfits || [], options = {}) {
  const hideMonthSelect = Boolean(options.hideMonthSelect);
  const normalizedDate = String(selectedDate || today);
  const availableMonthEntries = Array.from(
    new Set((sourceOutfits || []).map((entry) => String(entry.wear_date || "").slice(0, 7)).filter(Boolean))
  )
    .sort((left, right) => right.localeCompare(left, "zh-CN"))
    .map((month) => ({
      month,
      count: (sourceOutfits || []).filter((entry) => String(entry.wear_date || "").startsWith(month)).length,
    }));
  const fallbackMonth = normalizedDate.slice(0, 7);
  const currentMonth = availableMonthEntries.some((entry) => entry.month === fallbackMonth)
    ? fallbackMonth
    : (availableMonthEntries[0]?.month || fallbackMonth);
  const latestDate = (sourceOutfits || [])
    .map((entry) => String(entry.wear_date || "").trim())
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left, "zh-CN"))[0] || "";
  const monthOutfits = (sourceOutfits || [])
      .filter((entry) => String(entry.wear_date || "").startsWith(currentMonth))
      .sort((left, right) => String(left.wear_date || "").localeCompare(String(right.wear_date || ""), "zh-CN"));
  const monthLabel = formatMonthLabel(currentMonth);
  const dayChips = monthOutfits.map((entry) => {
    const dateText = String(entry.wear_date || "");
    const dayLabel = (formatBeijingDate(dateText) || dateText).slice(-2);
    const detailLabel = entry.inventory_loc || "有记录";
    return `
      <button
        type="button"
        class="outfit-date-chip ${dateText === normalizedDate ? "active" : ""}"
        data-outfit-date-chip="${escapeHtml(dateText)}"
        title="${escapeHtml(`${formatBeijingDate(dateText)} · ${detailLabel}`)}"
      >
        ${escapeHtml(dayLabel)}
      </button>
    `;
    }).join("");
    const latestChip = latestDate ? `
        <button
          type="button"
          class="outfit-date-chip outfit-date-chip-latest ${latestDate === normalizedDate ? "active" : ""}"
          data-outfit-date-latest="${escapeHtml(latestDate)}"
          title="${escapeHtml(`回到最新日期：${formatBeijingDate(latestDate) || latestDate}`)}"
        >
          最新
        </button>
      ` : "";
    return `
      <div class="outfit-date-picker-wrap">
        ${hideMonthSelect ? "" : `
          <select class="related-choice-select" data-outfit-month-select>
            ${availableMonthEntries.map((entry) => `
              <option value="${escapeHtml(entry.month)}" ${entry.month === currentMonth ? "selected" : ""}>
                ${escapeHtml(formatMonthShortLabelWithCount(entry.month, entry.count))}
              </option>
            `).join("")}
          </select>
        `}
        <div class="outfit-date-presets">
          <div class="outfit-date-presets-list">
            ${dayChips || `<span class="muted-text">本月暂无历史记录</span>`}
            ${latestChip}
          </div>
        </div>
      </div>
    `;
}

function buildOutfitSummaryMetaHtml(outfit, selectedDate, relatedItem, locationText, sourceOutfits = state.outfits || [], options = {}) {
  const hideDatePicker = Boolean(options.hideDatePicker);
  const sceneTagText = outfit?.scene_tag || "-";
  if (relatedItem) {
    const metaItems = [
      ["场景", `<strong>${escapeHtml(sceneTagText)}</strong>`],
      ["温度", `<strong>${escapeHtml(formatOutfitTemperature(outfit))}</strong>`],
      ["地点", `<strong>${escapeHtml(locationText)}</strong>`],
      ["松弛指数", `<strong>${escapeHtml(String(outfit?.avg_relax ?? "-"))}</strong>`],
    ];
    return `
      <div class="outfit-summary-grid">
        ${metaItems.map(([label, value]) => `
          <div class="outfit-summary-item${label === "场景" || label === "温度" ? " outfit-summary-item-accent" : ""}">
            <span class="muted-text">${label}</span>
            ${value}
          </div>
        `).join("")}
      </div>
    `;
  }
  return `
    <div class="outfit-summary-stack">
      ${hideDatePicker ? "" : `
        <div class="outfit-summary-item outfit-summary-item-date outfit-summary-item-date-full">
          ${buildOutfitDatePickerHtml(selectedDate, sourceOutfits)}
        </div>
      `}
      <div class="outfit-summary-line">
        <div class="outfit-summary-line-item outfit-summary-line-item-accent"><span class="muted-text">场景</span><strong>${escapeHtml(sceneTagText)}</strong></div>
        <div class="outfit-summary-line-item outfit-summary-line-item-accent"><span class="muted-text">温度</span><strong>${escapeHtml(formatOutfitTemperature(outfit))}</strong></div>
        <div class="outfit-summary-line-item"><span class="muted-text">地点</span><strong>${escapeHtml(locationText)}</strong></div>
        <div class="outfit-summary-line-item"><span class="muted-text">松弛指数</span><strong>${escapeHtml(String(outfit?.avg_relax ?? "-"))}</strong></div>
      </div>
    </div>
  `;
}

function latestOutfitId(owner = "") {
  const latest = (state.outfits || []).find((outfit) => ownerMatchesRecord(outfit, owner));
  return Number(latest?.id || 0) || null;
}

function todayOutfitSummary(owner = "") {
  return state.outfits.find((outfit) =>
    String(outfit?.wear_date || "") === today
    && ownerMatchesRecord(outfit, owner)) || null;
}

function canEditOutfit(outfit) {
  const owner = String(outfit?.owner || "").trim();
  return Boolean(outfit && canWriteOwnedRecord(outfit) && Number(outfit.id) > 0 && Number(outfit.id) === latestOutfitId(owner));
}

function canEditFeaturedLook(look) {
  return Boolean(look && canWriteOwnedRecord(look));
}

function normalizeOutfitEditRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "bottom") return "Bottom";
  if (value === "footwear") return "Footwear";
  if (value === "watch") return "Watch";
  if (value === "outer") return "Outer";
  if (value === "middle") return "Middle";
  if (value === "inner") return "Inner";
  return String(role || "").trim();
}

function outfitNeedsBaseLayerFlag(role) {
  return ["Inner", "Middle", "Bottom"].includes(normalizeOutfitEditRole(role));
}

const OUTFIT_EDIT_ROLE_ORDER = [
  { role: "Inner", label: "Inner" },
  { role: "Middle", label: "Middle" },
  { role: "Outer", label: "Outer" },
  { role: "Bottom", label: "Bottom" },
  { role: "Footwear", label: "Footwear" },
  { role: "Watch", label: "Watch" },
];

function outfitSelectableItemsByRole(role, owner = "") {
  const normalizedRole = normalizeOutfitEditRole(role);
  const normalizedOwner = String(owner || "").trim();
  const source = normalizedRole === "Watch"
    ? allKnownWatchItems().filter((item) =>
        normalizeOutfitEditRole(item.layer_role) === "Watch"
        && /^active$/i.test(String(item.status || "").trim())
        && maintenanceStateValue(item) !== 1)
    : allKnownWardrobeItems().filter((item) => normalizeOutfitEditRole(item.layer_role) === normalizedRole);
  const ownerScoped = normalizedOwner
    ? source.filter((item) => String(item.owner || "").trim() === normalizedOwner)
    : source;
  return [...ownerScoped].sort((left, right) => String(left.section || left.code || "").localeCompare(String(right.section || right.code || ""), "zh-CN"));
}

function outfitSelectableBrandsByRole(role, owner = "") {
  return [...new Set(outfitSelectableItemsByRole(role, owner).map((item) => String(item.brand || "").trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function outfitSelectableItemsByRoleAndBrand(role, brand, owner = "") {
  const normalizedBrand = String(brand || "").trim();
  const items = outfitSelectableItemsByRole(role, owner);
  if (!normalizedBrand) return [];
  return items.filter((item) => String(item.brand || "").trim() === normalizedBrand);
}

function outfitItemSelectLabel(item) {
  return item.section || item.code || "";
}

function buildOutfitRoleDraftEntry(role, label, item = null) {
  return {
    role,
    label,
    brand: item?.brand || "",
    item_id: item?.id || "",
    has_base_layer: Boolean(item?.has_base_layer),
    search_query: "",
  };
}

function applyAiOutfitSelectionsToDraft(draft, selections) {
  if (!draft?.roles?.length || !Array.isArray(selections)) return 0;
  const roleMap = new Map(
    draft.roles.map((entry) => [normalizeOutfitEditRole(entry.role), entry]),
  );
  let changedCount = 0;
  selections.forEach((selection) => {
    const role = normalizeOutfitEditRole(selection?.role || "");
    const entry = roleMap.get(role);
    const itemId = Number(selection?.item_id || 0);
    const item = findKnownItemById(itemId);
    if (!entry || !item) return;
    if (normalizeOutfitEditRole(item.layer_role) !== role) return;
    const nextItemId = String(itemId);
    const nextHasBaseLayer = outfitNeedsBaseLayerFlag(role)
      ? Boolean(selection?.has_base_layer)
      : false;
    const changed = String(entry.item_id || "") !== nextItemId
      || Boolean(entry.has_base_layer) !== nextHasBaseLayer;
    entry.item_id = nextItemId;
    entry.brand = item.brand || entry.brand || "";
    entry.search_query = "";
    if (outfitNeedsBaseLayerFlag(role)) {
      entry.has_base_layer = nextHasBaseLayer;
    } else {
      entry.has_base_layer = false;
    }
    if (changed) {
      changedCount += 1;
    }
  });
  normalizeOutfitDraftSelections(draft);
  return changedCount;
}

function buildOutfitEditDraft(outfit) {
  const currentByRole = new Map();
  (outfit.items || []).forEach((item) => {
    const role = normalizeOutfitEditRole(item.role || item.layer_role || "");
    if (!currentByRole.has(role)) {
      currentByRole.set(role, item);
    }
  });
  return {
    id: outfit.id,
    wear_date: outfit.wear_date || "",
    city: outfit.city || "",
    inventory_loc: outfit.inventory_loc || "",
    owner: outfit.owner || state.authUser || "徐欣",
    wear_mode: outfit.wear_mode || "normal",
    scene_tag: outfit.scene_tag || "",
    temp_value: outfit.temp_value ?? "",
    temp_low: outfit.temp_low ?? "",
    temp_high: outfit.temp_high ?? "",
    notes: outfit.notes || "",
    selection_mode: "brand",
    roles: OUTFIT_EDIT_ROLE_ORDER.map(({ role, label }) => buildOutfitRoleDraftEntry(role, label, currentByRole.get(role) || null)),
  };
}

function buildOutfitCreateDraft() {
  const owner = loggedInOwner() || "徐欣";
  const latest = state.outfits.find((outfit) => ownerMatchesRecord(outfit, owner)) || state.outfits[0] || null;
  return {
    wear_date: today,
    city: latest?.city || latest?.inventory_loc || "",
    inventory_loc: latest?.inventory_loc || latest?.city || "",
    owner,
    wear_mode: "normal",
    scene_tag: "",
    temp_value: "",
    temp_low: "",
    temp_high: "",
    notes: "",
    selection_mode: "brand",
    roles: OUTFIT_EDIT_ROLE_ORDER.map(({ role, label }) => buildOutfitRoleDraftEntry(role, label)),
  };
}

function normalizeOutfitDraftSelections(draft) {
  if (!draft?.roles) return;
  const owner = String(draft.owner || "").trim();
  draft.roles.forEach((entry) => {
    const roleItems = outfitSelectableItemsByRole(entry.role, owner);
    const availableRoleIds = new Set(roleItems.map((item) => Number(item.id || 0)));
    if (!availableRoleIds.has(Number(entry.item_id || 0))) {
      entry.item_id = "";
    }
    const availableBrands = new Set(roleItems.map((item) => String(item.brand || "").trim()).filter(Boolean));
    if (!availableBrands.has(String(entry.brand || "").trim())) {
      entry.brand = "";
    }
    const selectedItem = findKnownItemById(Number(entry.item_id || 0));
    if (selectedItem?.brand) {
      entry.brand = selectedItem.brand;
    }
  });
}

function normalizeOutfitEditDraftSelections() {
  normalizeOutfitDraftSelections(state.outfitEditDraft);
}

function normalizeOutfitCreateDraftSelections() {
  normalizeOutfitDraftSelections(state.outfitCreateDraft);
}

function resetOutfitAiState() {
  state.outfitAiLoading = false;
  state.outfitAiError = "";
  state.outfitAiResult = "";
  state.outfitAiApplyMessage = "";
  state.outfitAiPanelOpen = false;
  setAiPromptPanelOpen("outfit-draft", 0, false);
}

function openOutfitCreate() {
  closeOutfitEdit();
  state.outfitCreateMode = true;
  state.outfitCreateSaving = false;
  state.outfitCreateError = "";
  resetOutfitAiState();
  state.outfitCreateDraft = buildOutfitCreateDraft();
}

function closeOutfitCreate() {
  state.outfitCreateMode = false;
  state.outfitCreateSaving = false;
  state.outfitCreateError = "";
  resetOutfitAiState();
  state.outfitCreateDraft = null;
}

function openOutfitEdit(outfit) {
  if (!outfit || !canEditOutfit(outfit)) return;
  closeOutfitCreate();
  state.outfitEditMode = true;
  state.outfitEditSaving = false;
  state.outfitEditError = "";
  resetOutfitAiState();
  state.outfitEditDraft = buildOutfitEditDraft(outfit);
}

function closeOutfitEdit() {
  state.outfitEditMode = false;
  state.outfitEditSaving = false;
  state.outfitEditError = "";
  resetOutfitAiState();
  state.outfitEditDraft = null;
}

function outfitActionBarHtml(outfit, showSaveAsLook = true) {
  if (!outfit) return "";
  const editable = canEditOutfit(outfit);
  const writable = canWriteOwnedRecord(outfit);
  const alreadySavedAsLook = Boolean(outfit.featured_look_exists);
  const savedLookLabel = outfit.featured_look_id || "套装";
  const lockedMessage = !writable ? "仅本人 owner 可编辑或删除" : "";
  return `
    <div class="related-record-actions">
      <button type="button" class="ghost-btn" data-copy-outfit="${outfit.id}">复制搭配</button>
      ${showSaveAsLook && writable ? (alreadySavedAsLook
        ? `<button type="button" class="chip related-record-signature related-record-signature-btn" data-open-featured-look="${escapeHtml(savedLookLabel)}" title="查看套装详情">${escapeHtml(savedLookLabel)}</button>`
        : `<button type="button" class="ghost-btn" data-save-outfit-look="${outfit.id}">保存为套装</button>`) : ""}
      ${editable ? `<button type="button" class="ghost-btn" data-edit-outfit="${outfit.id}">编辑</button>` : ""}
      ${!editable ? `<span class="muted-text">${escapeHtml(lockedMessage)}</span>` : ""}
    </div>
  `;
}

function outfitItemSearchText(item) {
  return [
    item?.brand,
    item?.section,
    item?.code,
    item?.material,
    item?.outer_type,
    item?.scene_tag,
  ].filter(Boolean).join(" ").toLowerCase();
}

function outfitItemSearchLabel(item) {
  const sectionText = String(item?.section || item?.code || "").trim();
  const codeText = String(item?.code || "").trim();
  return [
    String(item?.brand || "").trim(),
    sectionText,
    codeText && codeText !== sectionText ? codeText : "",
  ].filter(Boolean).join(" | ");
}

function outfitSelectableItemsForEntry(role, { owner = "", brand = "", searchQuery = "", selectedItemId = "" } = {}) {
  const allItems = outfitSelectableItemsByRole(role, owner);
  const normalizedBrand = String(brand || "").trim();
  const normalizedQuery = String(searchQuery || "").trim().toLowerCase();
  let filteredItems = normalizedBrand
    ? allItems.filter((item) => String(item.brand || "").trim() === normalizedBrand)
    : allItems;
  if (normalizedQuery) {
    filteredItems = filteredItems.filter((item) => outfitItemSearchText(item).includes(normalizedQuery));
  }
  if (!normalizedBrand && !normalizedQuery) {
    filteredItems = [];
  }
  const selectedId = Number(selectedItemId || 0);
  if (selectedId > 0 && !filteredItems.some((item) => Number(item.id || 0) === selectedId)) {
    const selectedItem = allItems.find((item) => Number(item.id || 0) === selectedId) || findKnownItemById(selectedId);
    if (selectedItem) {
      filteredItems = [selectedItem, ...filteredItems];
    }
  }
  return filteredItems;
}

function renderOutfitItemOptionList(
  items,
  selectedItemId,
  { emptyLabel = "未选择", noResultLabel = "暂无可选项", labelBuilder = outfitItemSelectLabel } = {},
) {
  const normalizedSelectedId = Number(selectedItemId || 0);
  return `
    <option value="">${escapeHtml(items.length ? emptyLabel : noResultLabel)}</option>
    ${items.map((item) => `
      <option value="${item.id}" ${Number(item.id || 0) === normalizedSelectedId ? "selected" : ""}>${escapeHtml(labelBuilder(item))}</option>
    `).join("")}
  `;
}

function renderOutfitRoleSelectionRow(entry, index, draft, mode) {
  const brandOptions = outfitSelectableBrandsByRole(entry.role, draft.owner);
  const filteredItems = outfitSelectableItemsForEntry(entry.role, {
    owner: draft.owner,
    brand: entry.brand,
    searchQuery: entry.search_query,
    selectedItemId: entry.item_id,
  });
  const attrPrefix = `data-outfit-${mode}`;
  const hasSearch = Boolean(String(entry.search_query || "").trim());
  const hasBrand = Boolean(String(entry.brand || "").trim());
  const itemPlaceholder = hasSearch || hasBrand ? "未选择" : "先选品牌或直接搜索";
  const noResultLabel = hasSearch ? "暂无匹配结果" : (hasBrand ? "暂无可选项" : "先选品牌或直接搜索");
  return `
    <label class="outfit-edit-item-row">
      <span class="outfit-edit-item-main">
        <strong class="outfit-edit-role-label">${escapeHtml(entry.label || entry.role || "")}</strong>
        <select ${attrPrefix}-brand="${index}">
          <option value="">全部品牌</option>
          ${brandOptions.map((brand) => `
            <option value="${escapeHtml(brand)}" ${brand === String(entry.brand || "") ? "selected" : ""}>${escapeHtml(brand)}</option>
          `).join("")}
        </select>
        <div class="search-input-wrap outfit-inline-search">
          <input type="text" ${attrPrefix}-search="${index}" value="${escapeHtml(entry.search_query || "")}" placeholder="直接搜索品牌 / Section / 货号">
        </div>
        <select ${attrPrefix}-item="${index}" ${filteredItems.length ? "" : "disabled"}>
          ${renderOutfitItemOptionList(filteredItems, entry.item_id, {
            emptyLabel: itemPlaceholder,
            noResultLabel,
            labelBuilder: outfitItemSearchLabel,
          })}
        </select>
      </span>
      ${outfitNeedsBaseLayerFlag(entry.role) ? `
        <span class="outfit-base-toggle">
          <input type="checkbox" ${attrPrefix}-base-layer="${index}" ${entry.has_base_layer ? "checked" : ""}>
          <span>有打底</span>
        </span>
      ` : ``}
    </label>
  `;
}

function renderOutfitDraftAiPanel(mode) {
  return "";
}

function hasPendingAiAnalysis(entries = []) {
  return (entries || []).some((entry) => String(entry?.ai_analysis_status || "").trim().toLowerCase() === "pending");
}

function currentHashName() {
  return window.location.hash.replace(/^#/, "").split("?")[0] || "";
}

function shouldForceVisibleOutfitAiRefresh() {
  const hash = currentHashName();
  if (hash === "outfits") {
    return !state.outfitCreateMode && !state.outfitEditMode;
  }
  return hash === "item-detail" && state.itemDetailSubtab === "outfits";
}

function shouldForceVisibleFeaturedLookAiRefresh() {
  const hash = currentHashName();
  return hash === "featured-looks" || (hash === "item-detail" && state.itemDetailSubtab === "featured-looks");
}

async function refreshAiAnalysisData({ forceVisible = false } = {}) {
  return;
}

function startAiAnalysisMonitor() {
  refreshAiAnalysisData({ forceVisible: true }).catch(() => undefined);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshAiAnalysisData({ forceVisible: true }).catch(() => undefined);
    }
  });
}

function renderOutfitForm(draft, {
  mode = "edit",
  title = "",
  saving = false,
  error = "",
  createMode = false,
} = {}) {
  if (!draft) return "";
  const outfitSceneTags = [...new Set([...sceneTagOptions(), draft.scene_tag].filter(Boolean))];
  const low = safeNumber(draft.temp_low);
  const high = safeNumber(draft.temp_high);
  const avgTemperature = low !== null && high !== null
    ? ((low + high) / 2).toFixed(1)
    : (low !== null ? low.toFixed(1) : (high !== null ? high.toFixed(1) : ""));
  const createOwner = loggedInOwner() || draft.owner || "徐欣";
  const ownerOptions = createMode
    ? [createOwner]
    : ownerOptionsForContext(state.items || [], draft.owner || "", { create: false });
  return `
    <div class="list-item outfit-edit-panel">
      ${title ? `<div class="outfit-form-heading"><strong>${escapeHtml(title)}</strong><span class="muted-text">按 WearCount_new 方式录入今日穿搭</span></div>` : ""}
      ${createMode ? renderOutfitDraftAiPanel(mode) : ""}
      <div class="form-grid">
        <label>
          <span>日期</span>
          <input type="date" data-outfit-${mode}-field="wear_date" value="${escapeHtml(draft.wear_date || "")}">
        </label>
        <label>
          <span>地点</span>
          <select data-outfit-${mode}-field="inventory_loc">
            <option value=""></option>
            ${[...(state.options.locs || []), draft.inventory_loc].filter((value, index, values) => value && values.indexOf(value) === index).map((value) => `
              <option value="${escapeHtml(value)}" ${value === draft.inventory_loc ? "selected" : ""}>${escapeHtml(value)}</option>
            `).join("")}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <select data-outfit-${mode}-field="owner" ${createMode ? "disabled" : ""}>
            ${ownerOptions.map((owner) => `
              <option value="${escapeHtml(owner)}" ${owner === draft.owner ? "selected" : ""}>${escapeHtml(owner)}</option>
            `).join("")}
          </select>
        </label>
        <label>
          <span>穿着模式</span>
          <select data-outfit-${mode}-field="wear_mode">
            <option value="normal" ${String(draft.wear_mode || "normal") === "normal" ? "selected" : ""}>正常</option>
            <option value="home" ${String(draft.wear_mode || "") === "home" ? "selected" : ""}>居家 / 低磨损</option>
          </select>
        </label>
        <label>
          <span>场景</span>
          <select data-outfit-${mode}-field="scene_tag">
            <option value="">未设置</option>
            ${outfitSceneTags.map((value) => `
              <option value="${escapeHtml(value)}" ${value === draft.scene_tag ? "selected" : ""}>${escapeHtml(value)}</option>
            `).join("")}
          </select>
        </label>
        <label>
          <span>平均温度</span>
          <input type="text" value="${escapeHtml(avgTemperature ? `${avgTemperature}°C` : "-")}" disabled>
        </label>
        <label class="temperature-range-field">
          <span>温度范围</span>
          <span class="temperature-range-inputs">
            <input type="number" step="0.1" data-outfit-${mode}-field="temp_low" value="${escapeHtml(draft.temp_low ?? "")}" placeholder="最低温">
            <span class="temperature-range-sep">-</span>
            <input type="number" step="0.1" data-outfit-${mode}-field="temp_high" value="${escapeHtml(draft.temp_high ?? "")}" placeholder="最高温">
          </span>
        </label>
        <label class="span-2">
          <span>备注</span>
          <textarea rows="3" data-outfit-${mode}-field="notes">${escapeHtml(draft.notes || "")}</textarea>
        </label>
      </div>
      <div class="outfit-edit-items">
        ${(draft.roles || []).map((entry, index) => renderOutfitRoleSelectionRow(entry, index, draft, mode)).join("")}
      </div>
      ${error ? `<div class="login-note locked">${escapeHtml(error)}</div>` : ""}
      <div class="actions">
        ${createMode
          ? `
            <button type="button" class="ghost-btn" data-save-outfit-create="1" ${saving ? "disabled" : ""}>${saving ? "录入中..." : "录入"}</button>
            <button type="button" class="ghost-btn" data-cancel-outfit-create="1" ${saving ? "disabled" : ""}>取消</button>
          `
          : `
            <button type="button" class="ghost-btn" data-save-outfit-edit="${draft.id}" ${saving ? "disabled" : ""}>${saving ? "保存中..." : "保存"}</button>
            <button type="button" class="ghost-btn" data-cancel-outfit-edit="1" ${saving ? "disabled" : ""}>取消</button>
            <button type="button" class="ghost-btn danger-lite" data-delete-outfit="${draft.id}" ${saving ? "disabled" : ""}>删除</button>
          `}
      </div>
    </div>
  `;
}

function renderOutfitEditForm() {
  return renderOutfitForm(state.outfitEditDraft, {
    mode: "edit",
    saving: state.outfitEditSaving,
    error: state.outfitEditError,
    createMode: false,
  });
}

function renderOutfitCreateForm() {
  return renderOutfitForm(state.outfitCreateDraft, {
    mode: "create",
    title: "录入今日穿搭",
    saving: state.outfitCreateSaving,
    error: state.outfitCreateError,
    createMode: true,
  });
}

function outfitDraftForMode(mode) {
  return mode === "create" ? state.outfitCreateDraft : state.outfitEditDraft;
}

function normalizeOutfitDraftForMode(mode) {
  if (mode === "create") {
    normalizeOutfitCreateDraftSelections();
    return;
  }
  normalizeOutfitEditDraftSelections();
}

function outfitFormHost(mode, preferredHost = null) {
  const selector = `[data-outfit-${mode}-field='wear_date']`;
  const hosts = [preferredHost, $("item-detail-view"), $("outfit-detail")]
    .filter((host, index, entries) => host && entries.indexOf(host) === index && host.querySelector(selector));
  const activeElement = document.activeElement;
  if (activeElement) {
    const activeHost = hosts.find((host) => host.contains(activeElement));
    if (activeHost) return activeHost;
  }
  if (preferredHost?.querySelector(selector)) return preferredHost;
  if (hosts.length) return hosts[0];
  return null;
}

function syncOutfitGeneralDraftFields(host, mode) {
  const draft = outfitDraftForMode(mode);
  if (!draft || !host) return draft;
  const readFieldValue = (field) => host.querySelector(`[data-outfit-${mode}-field='${field}']`)?.value;
  const inventoryLoc = readFieldValue("inventory_loc");
  const tempLow = safeNumber(readFieldValue("temp_low") ?? draft.temp_low);
  const tempHigh = safeNumber(readFieldValue("temp_high") ?? draft.temp_high);
  draft.wear_date = readFieldValue("wear_date") || draft.wear_date || "";
  draft.inventory_loc = inventoryLoc || "";
  draft.city = inventoryLoc || draft.city || "";
  draft.owner = readFieldValue("owner") || draft.owner || "";
  draft.wear_mode = readFieldValue("wear_mode") || draft.wear_mode || "normal";
  draft.scene_tag = readFieldValue("scene_tag") || "";
  draft.temp_low = tempLow;
  draft.temp_high = tempHigh;
  if (tempLow !== null && tempHigh !== null) {
    draft.temp_value = ((tempLow + tempHigh) / 2).toFixed(1);
  }
  draft.notes = readFieldValue("notes") ?? draft.notes ?? "";
  return draft;
}

function collectOutfitFormPayload(mode, draft, host) {
  if (!draft || !host) return null;
  const syncedDraft = syncOutfitGeneralDraftFields(host, mode) || draft;
  const inventoryLoc = syncedDraft.inventory_loc || "";
  const tempLow = safeNumber(syncedDraft.temp_low);
  const tempHigh = safeNumber(syncedDraft.temp_high);
  return {
    wear_date: syncedDraft.wear_date,
    city: inventoryLoc || syncedDraft.city || "",
    inventory_loc: inventoryLoc,
    owner: syncedDraft.owner,
    wear_mode: syncedDraft.wear_mode || "normal",
    scene_tag: syncedDraft.scene_tag || "",
    temp_value: (() => {
      if (tempLow !== null && tempHigh !== null) return ((tempLow + tempHigh) / 2).toFixed(1);
      return syncedDraft.temp_value ?? null;
    })(),
    temp_low: tempLow,
    temp_high: tempHigh,
    notes: syncedDraft.notes || "",
    items: (draft.roles || []).map((entry, index) => ({
      item_id: Number(host.querySelector(`[data-outfit-${mode}-item='${index}']`)?.value || 0),
      role: entry.role,
      has_base_layer: outfitNeedsBaseLayerFlag(entry.role)
        ? Boolean(host.querySelector(`[data-outfit-${mode}-base-layer='${index}']`)?.checked)
        : false,
    })).filter((entry) => Number(entry.item_id) > 0),
  };
}

async function refreshAfterOutfitMutation() {
  await refreshOutfits();
  await refreshDashboardItems();
  await refreshItems();
  await refreshWatchItems();
  await refreshFeaturedLooks();
  if (Number(state.relatedOutfitItemId || 0) > 0) {
    await refreshRelatedOutfits(state.relatedOutfitItemId);
  }
}

async function runOutfitAiAnalysis(outfitId) {
  return;
}

async function runFeaturedLookAiAnalysis(lookId) {
  return;
}

async function runOutfitDraftAiAnalysis(mode, formHost = null) {
  return;
}

async function saveAiAnalysisEdit(kind, entityId) {
  return;
}

async function saveAiPromptTemplate(kind) {
  return;
}

async function saveOutfitEdit(formHost = null) {
  const draft = state.outfitEditDraft;
  if (!draft) return;
  const host = outfitFormHost("edit", formHost);
  if (!host) return;
  const payload = collectOutfitFormPayload("edit", draft, host);
  if (!payload) return;
  state.outfitEditSaving = true;
  state.outfitEditError = "";
  if (state.itemDetailSubtab === "outfits" && state.selectedItemDetail) {
    renderItemDetail(state.selectedItemDetail);
  } else {
    renderSelectedOutfit();
  }
  try {
    await api(`/api/outfits/${draft.id}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    applySelectedOutfitDate(payload.wear_date);
    closeOutfitEdit();
    await refreshAfterOutfitMutation();
    if (state.itemDetailSubtab === "outfits" && state.selectedItemDetail) {
      renderItemDetail(state.selectedItemDetail);
    }
  } catch (error) {
    state.outfitEditSaving = false;
    state.outfitEditError = error.message || "save_failed";
    if (state.itemDetailSubtab === "outfits" && state.selectedItemDetail) {
      renderItemDetail(state.selectedItemDetail);
    } else {
      renderSelectedOutfit();
    }
  }
}

async function saveOutfitCreate(formHost = null) {
  const draft = state.outfitCreateDraft;
  if (!draft) return;
  const host = outfitFormHost("create", formHost);
  if (!host) return;
  const payload = collectOutfitFormPayload("create", draft, host);
  if (!payload) return;
  state.outfitCreateSaving = true;
  state.outfitCreateError = "";
  renderSelectedOutfit();
  try {
    const response = await api("/api/outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const savedOutfit = response?.outfit || response || null;
    applySelectedOutfitDate(savedOutfit?.wear_date || payload.wear_date);
    closeOutfitCreate();
    await refreshAfterOutfitMutation();
  } catch (error) {
    state.outfitCreateSaving = false;
    state.outfitCreateError = error.message || "create_failed";
    renderSelectedOutfit();
  }
}

function showAppLoading(message = "正在加载...") {
  const overlay = $("app-loading");
  const text = $("app-loading-text");
  if (text) text.textContent = message;
  if (overlay) overlay.hidden = false;
}

function hideAppLoading() {
  const overlay = $("app-loading");
  if (overlay) overlay.hidden = true;
}

async function deleteSelectedOutfit(outfitId) {
  if (!window.confirm("确认删除最近一条历史记录？这会回滚对应的累计穿着次数。")) return;
  try {
    await api(`/api/outfits/${outfitId}`, { method: "DELETE" });
    closeOutfitEdit();
    await refreshAfterOutfitMutation();
    if (state.itemDetailSubtab === "outfits" && state.selectedItemDetail) {
      renderItemDetail(state.selectedItemDetail);
    }
  } catch (error) {
    window.alert(error.message || "delete_failed");
  }
}

async function saveSelectedOutfitAsLook(outfitId) {
  try {
    await api(`/api/outfits/${outfitId}/save-as-featured-look`, { method: "POST" });
    await refreshOutfits();
    if (Number(state.relatedOutfitItemId || 0) > 0) {
      await refreshRelatedOutfits(state.relatedOutfitItemId);
      if (state.itemDetailSubtab === "outfits" && state.selectedItemDetail) {
        renderItemDetail(state.selectedItemDetail);
      }
    } else {
      renderSelectedOutfit();
    }
    await refreshFeaturedLooks();
  } catch (error) {
    window.alert(error.message || "save_as_featured_look_failed");
  }
}

function openFeaturedLookEdit(look) {
  if (!look) return;
  state.featuredLookEditId = Number(look.id || 0) || null;
  state.featuredLookEditSaving = false;
  state.featuredLookEditError = "";
  state.featuredLookEditDraft = {
    look_id: look.look_id || "",
    use_case: look.use_case || "",
    status: look.status || "Active",
    owner: look.owner || state.authUser || "徐欣",
    temp_min: look.temp_min ?? "",
    temp_max: look.temp_max ?? "",
    scene_tag_target: look.scene_tag_target || "",
    relax_center: look.relax_center ?? "",
    relax_span: look.relax_span ?? "",
    notes: look.notes || "",
  };
}

function closeFeaturedLookEdit() {
  state.featuredLookEditId = null;
  state.featuredLookEditSaving = false;
  state.featuredLookEditError = "";
  state.featuredLookEditDraft = null;
}

function renderFeaturedLookEditForm(look) {
  const draft = state.featuredLookEditDraft;
  if (!draft || Number(state.featuredLookEditId) !== Number(look.id)) return "";
  return `
    <div class="list-item featured-look-edit-panel">
      <div class="form-grid">
        <label><span>Look ID</span><input type="text" data-look-edit-field="look_id" value="${escapeHtml(draft.look_id)}"></label>
        <label><span>Status</span><input type="text" data-look-edit-field="status" value="${escapeHtml(draft.status)}"></label>
        <label><span>Owner</span><input type="text" data-look-edit-field="owner" value="${escapeHtml(draft.owner)}"></label>
        <label><span>Temp Min</span><input type="number" step="0.1" data-look-edit-field="temp_min" value="${escapeHtml(draft.temp_min ?? "")}"></label>
        <label><span>Temp Max</span><input type="number" step="0.1" data-look-edit-field="temp_max" value="${escapeHtml(draft.temp_max ?? "")}"></label>
        <label><span>松弛中枢</span><input type="text" value="${escapeHtml(draft.relax_center ?? "")}" readonly disabled></label>
        <label><span>松弛跨度</span><input type="text" value="${escapeHtml(draft.relax_span ?? "")}" readonly disabled></label>
        <label class="span-2"><span>Notes</span><textarea rows="3" data-look-edit-field="notes">${escapeHtml(draft.notes)}</textarea></label>
      </div>
      ${state.featuredLookEditError ? `<div class="login-note locked">${escapeHtml(state.featuredLookEditError)}</div>` : ""}
      <div class="actions">
        <button type="button" class="ghost-btn" data-save-look-edit="${look.id}" ${state.featuredLookEditSaving ? "disabled" : ""}>${state.featuredLookEditSaving ? "保存中..." : "保存"}</button>
        <button type="button" class="ghost-btn" data-cancel-look-edit="1" ${state.featuredLookEditSaving ? "disabled" : ""}>取消</button>
        <button type="button" class="ghost-btn danger-lite" data-delete-look="${look.id}" ${state.featuredLookEditSaving ? "disabled" : ""}>删除</button>
      </div>
    </div>
  `;
}

async function saveFeaturedLookEdit(lookId) {
  const draft = state.featuredLookEditDraft;
  if (!draft) return;
  const host = $("featured-looks-list");
  if (!host) return;
  const read = (field) => host.querySelector(`[data-look-edit-field='${field}']`)?.value ?? draft[field];
  state.featuredLookEditSaving = true;
  state.featuredLookEditError = "";
  renderFeaturedLooks();
  try {
    await api(`/api/featured-looks/${lookId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        look_id: read("look_id"),
        use_case: read("use_case"),
        status: read("status"),
        owner: read("owner"),
        temp_min: read("temp_min"),
        temp_max: read("temp_max"),
        scene_tag_target: read("scene_tag_target"),
        notes: read("notes"),
      }),
    });
    closeFeaturedLookEdit();
    await refreshFeaturedLooks();
  } catch (error) {
    state.featuredLookEditSaving = false;
    state.featuredLookEditError = error.message || "save_failed";
    renderFeaturedLooks();
  }
}

async function deleteFeaturedLook(lookId) {
  if (!window.confirm("确认删除这套精选套装？")) return;
  try {
    await api(`/api/featured-looks/${lookId}`, { method: "DELETE" });
    closeFeaturedLookEdit();
    await refreshFeaturedLooks();
    if (Number(state.relatedFeaturedLookItemId || 0) > 0) {
      await refreshRelatedFeaturedLooks(state.relatedFeaturedLookItemId);
    }
  } catch (error) {
    window.alert(error.message || "delete_featured_look_failed");
  }
}

function syncOutfitCreateButtonUi() {
  const button = $("outfit-create-today-btn");
  if (!button) return;
  button.hidden = false;
  button.disabled = false;
  if (state.outfitCreateMode) {
    button.textContent = "返回历史记录";
    return;
  }
  const todaySummary = todayOutfitSummary(loggedInOwner());
  if (!todaySummary) {
    button.textContent = "录入今日穿搭";
    return;
  }
  button.hidden = true;
}

function syncOutfitSearchSelect(host, mode, index) {
  const draft = outfitDraftForMode(mode);
  if (!draft?.roles?.[index]) return;
  const select = host.querySelector(`[data-outfit-${mode}-item='${index}']`);
  if (!select) return;
  const entry = draft.roles[index];
  const searchItems = outfitSelectableItemsForEntry(entry.role, {
    owner: draft.owner,
    brand: entry.brand,
    searchQuery: entry.search_query,
    selectedItemId: entry.item_id,
  });
  const hasSearch = Boolean(String(entry.search_query || "").trim());
  const hasBrand = Boolean(String(entry.brand || "").trim());
  select.innerHTML = renderOutfitItemOptionList(searchItems, entry.item_id, {
    emptyLabel: hasSearch || hasBrand ? "未选择" : "先选品牌或直接搜索",
    noResultLabel: hasSearch ? "暂无匹配结果" : (hasBrand ? "暂无可选项" : "先选品牌或直接搜索"),
    labelBuilder: outfitItemSearchLabel,
  });
  select.disabled = !searchItems.length;
}

function bindOutfitFormInteractions(host, mode, rerender = renderSelectedOutfit) {
  const draft = outfitDraftForMode(mode);
  if (!draft) return;
  const syncGeneralFields = () => {
    syncOutfitGeneralDraftFields(host, mode);
  };
  host.querySelectorAll(`[data-outfit-${mode}-brand]`).forEach((select) => {
    select.addEventListener("change", () => {
      const activeDraft = outfitDraftForMode(mode);
      const index = Number(select.getAttribute(`data-outfit-${mode}-brand`) || -1);
      if (!activeDraft || index < 0 || !activeDraft.roles?.[index]) return;
      const nextBrand = select.value || "";
      const entry = activeDraft.roles[index];
      entry.brand = nextBrand;
      syncOutfitSearchSelect(host, mode, index);
    });
  });
  host.querySelectorAll(`[data-outfit-${mode}-item]`).forEach((select) => {
    select.addEventListener("change", () => {
      const activeDraft = outfitDraftForMode(mode);
      const index = Number(select.getAttribute(`data-outfit-${mode}-item`) || -1);
      if (!activeDraft || index < 0 || !activeDraft.roles?.[index]) return;
      const entry = activeDraft.roles[index];
      entry.item_id = select.value || "";
      const selectedItem = findKnownItemById(Number(entry.item_id || 0));
      if (selectedItem?.brand) {
        entry.brand = selectedItem.brand;
      }
    });
  });
  host.querySelectorAll(`[data-outfit-${mode}-search]`).forEach((input) => {
    const updateSearch = () => {
      const activeDraft = outfitDraftForMode(mode);
      const index = Number(input.getAttribute(`data-outfit-${mode}-search`) || -1);
      if (!activeDraft || index < 0 || !activeDraft.roles?.[index]) return;
      activeDraft.roles[index].search_query = input.value || "";
      syncOutfitSearchSelect(host, mode, index);
    };
    input.addEventListener("input", updateSearch);
    input.addEventListener("change", updateSearch);
  });
  host.querySelectorAll(`[data-outfit-${mode}-field='owner']`).forEach((select) => {
    select.addEventListener("change", () => {
      syncGeneralFields();
      const activeDraft = outfitDraftForMode(mode);
      if (!activeDraft) return;
      activeDraft.owner = select.value || "";
      normalizeOutfitDraftForMode(mode);
      rerender();
    });
  });
  host.querySelectorAll(`[data-outfit-${mode}-field]`).forEach((field) => {
    const fieldName = field.getAttribute(`data-outfit-${mode}-field`) || "";
    if (fieldName === "owner") return;
    field.addEventListener("input", syncGeneralFields);
    field.addEventListener("change", syncGeneralFields);
  });
}

function renderSelectedOutfit() {
  const host = $("outfit-detail");
  if (!host) return;
  const { options: ownerOptions, selected: selectedOwner } = resolveOutfitSelectedOwner();
  syncOwnerScopeSelect("outfit-owner-select", ownerOptions, selectedOwner);
  const photosOnlyToggle = $("outfit-photos-only");
  if (photosOnlyToggle) {
    photosOnlyToggle.checked = Boolean(state.outfitPhotosOnly);
  }
  syncOutfitCreateButtonUi();
  const relatedItemId = Number(state.relatedOutfitItemId || 0);
  const relatedItem = findKnownItemById(relatedItemId);
  const showCreateForm = Boolean(state.outfitCreateMode && !relatedItem);
  const ownerScopedSourceOutfits = filterVisibleOutfits(
    relatedItemId > 0 ? state.relatedOutfitEntries : state.outfits,
    selectedOwner,
  );
  const allFilteredOutfits = ownerScopedSourceOutfits;
  const yearEntries = Array.from(new Set(allFilteredOutfits.map((outfit) => String(outfit.wear_date || "").slice(0, 4)).filter(Boolean)))
    .map((year) => ({
      year,
      count: allFilteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(year)).length,
    }));
  if (yearEntries.length && !yearEntries.some((entry) => entry.year === state.relatedOutfitYear)) {
    state.relatedOutfitYear = yearEntries[0].year;
  }
  const yearFilteredOutfits = state.relatedOutfitYear
    ? allFilteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(state.relatedOutfitYear))
    : allFilteredOutfits;
  const monthEntries = Array.from(new Set(yearFilteredOutfits.map((outfit) => String(outfit.wear_date || "").slice(0, 7)).filter(Boolean)))
    .map((month) => ({
      month,
      count: yearFilteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(month)).length,
    }));
  if (monthEntries.length && !monthEntries.some((entry) => entry.month === state.relatedOutfitMonth)) {
    state.relatedOutfitMonth = monthEntries[0].month;
  }
  const filteredOutfits = state.relatedOutfitMonth
    ? yearFilteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(state.relatedOutfitMonth))
    : yearFilteredOutfits;
  const availableDates = new Set(filteredOutfits.map((outfit) => outfit.wear_date).filter(Boolean));
  if (filteredOutfits.length && !availableDates.has(state.selectedOutfitDate)) {
    state.selectedOutfitDate = filteredOutfits[0].wear_date;
  }
  const selectedDate = state.selectedOutfitDate || filteredOutfits[0]?.wear_date || today;
  const selectedSummary = filteredOutfits.find((entry) => entry.wear_date === selectedDate) || filteredOutfits[0] || null;
  const outfit = selectedSummary?.id ? state.outfitDetailsById[String(selectedSummary.id)] || null : null;
  const detailError = selectedSummary?.id ? state.outfitDetailErrorsById[String(selectedSummary.id)] || "" : "";
  if (!showCreateForm && !relatedItemId && selectedSummary?.id && !outfit && state.outfitDetailLoadingId !== selectedSummary.id) {
    void ensureSelectedOutfitDetailLoaded();
  }
  if (!showCreateForm && relatedItemId > 0 && selectedSummary?.id && !outfit && state.relatedOutfitDetailLoadingId !== selectedSummary.id) {
    void ensureSelectedRelatedOutfitDetailLoaded(() => renderSelectedOutfit());
  }
  const outfitMeta = outfit || selectedSummary;
  const sortedItems = [...(outfit?.items || [])].sort((a, b) => {
    const rankDiff = outfitItemSortRank(a) - outfitItemSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.section || a.code || "").localeCompare((b.section || b.code || ""), "zh-CN");
  });
  const locationText = outfitMeta ? formatOutfitLocation(outfitMeta.inventory_loc || outfitMeta.city || "-") : "-";
  const loadingDetail = Boolean(selectedSummary?.id) && !outfit;
  const relatedBanner = relatedItem ? `
    <div class="related-filter-banner">
      <div class="related-filter-copy">
        <span class="inline-chip auth-summary-chip"><span>${escapeHtml(relatedItem?.section || relatedItem?.code || `商品 ${relatedItemId}`)}</span></span>
      </div>
      <button type="button" class="secondary small" data-clear-related-filter="outfits">清除</button>
    </div>
  ` : "";
  const selectorCard = showCreateForm
    ? ""
    : (allFilteredOutfits.length ? `
      <div class="related-selector-card">
        <div class="related-year-list">
          ${yearEntries.map((entry) => `
            <button type="button" class="related-year-chip ${entry.year === state.relatedOutfitYear ? "active" : ""}" data-related-outfit-year="${escapeHtml(entry.year)}">
              ${escapeHtml(entry.year)} (${entry.count})
            </button>
          `).join("")}
        </div>
        <select class="related-choice-select" data-related-outfit-month>
          ${monthEntries.map((entry) => `
            <option value="${escapeHtml(entry.month)}" ${entry.month === state.relatedOutfitMonth ? "selected" : ""}>
              ${escapeHtml(formatMonthShortLabelWithCount(entry.month, entry.count))}
            </option>
          `).join("")}
        </select>
        ${buildOutfitDatePickerHtml(selectedDate, yearFilteredOutfits, { hideMonthSelect: true })}
      </div>
    ` : `<div class="list-item">当前没有${relatedItem ? "包含该商品的" : ""}${state.outfitPhotosOnly ? "带图片的" : ""}历史记录。</div>`);
  host.innerHTML = `
    ${relatedBanner}
    ${showCreateForm
      ? renderOutfitCreateForm()
      : `
        ${selectorCard}
        <div class="list-item">
          ${buildOutfitSummaryMetaHtml(outfitMeta, selectedDate, relatedItem, locationText, filteredOutfits, { hideDatePicker: true })}
        </div>
        ${outfit ? outfitActionBarHtml(outfit, true) : ""}
        ${outfit && state.outfitEditMode && Number(state.outfitEditDraft?.id) === Number(outfit.id) ? renderOutfitEditForm() : ""}
        ${state.outfitLoading && !filteredOutfits.length ? `<div class="list-item outfit-empty-state">正在加载历史记录...</div>` : ""}
        ${detailError ? `<div class="list-item outfit-empty-state">${escapeHtml(detailError)}</div>` : ""}
        ${!detailError && loadingDetail ? `<div class="list-item outfit-empty-state">正在加载 ${escapeHtml(formatBeijingDate(selectedDate) || selectedDate || "")} 的详情...</div>` : ""}
        ${outfit
          ? `
            ${renderEntityPhotoSection(outfit.photos || [], "outfit", outfit.id, `/api/outfits/${outfit.id}/photos`)}
            ${renderRecordExpandableRow("outfit", outfitMeta, outfit.notes, "outfit-expandable-text")}
            <div class="list-item">
              <strong>产品 Section</strong>
              <div class="outfit-section-list">
                ${sortedItems.map((item) => `
                  <div class="outfit-section-item">
                    <div><strong>${[
                      item.brand || "-",
                      item.layer_role || item.role || "-",
                      (item.role === "Outer" || item.layer_role === "Outer") && item.outer_type ? item.outer_type : "",
                    ].filter(Boolean).join(" | ")}</strong></div>
                    <div class="outfit-section-name">${sectionLink(item, "section-link outfit-section-link")}</div>
                    <div class="muted-text">货号: ${item.code || ""}</div>
                    <div class="muted-text">${escapeHtml(formatWearSummaryLine(item))}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          `
          : `${!state.outfitLoading && !loadingDetail ? `
            <div class="list-item outfit-empty-state">该日期暂无历史记录。</div>
          ` : ""}`}
      `}
  `;
  syncOutfitCreateButtonUi();
  host.querySelectorAll("[data-clear-related-filter='outfits']").forEach((button) => {
    button.addEventListener("click", () => {
      clearRelatedOutfitFilter();
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-related-outfit-year]").forEach((button) => {
    button.addEventListener("click", () => {
      state.relatedOutfitYear = button.dataset.relatedOutfitYear || "";
      state.relatedOutfitMonth = "";
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-related-outfit-month]").forEach((select) => {
    select.addEventListener("change", () => {
      state.relatedOutfitMonth = select.value || "";
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-related-outfit-select]").forEach((select) => {
    select.addEventListener("change", () => {
      state.selectedOutfitDate = select.value || "";
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-outfit-month-select]").forEach((select) => {
    const applyMonthSelection = () => {
      const monthValue = String(select.value || "").trim();
      if (!monthValue) return;
      const source = allFilteredOutfits;
      const monthMatches = source
        .filter((entry) => String(entry.wear_date || "").startsWith(monthValue))
        .sort((left, right) => String(left.wear_date || "").localeCompare(String(right.wear_date || ""), "zh-CN"));
      state.relatedOutfitMonth = monthValue;
      applySelectedOutfitDate(monthMatches[0]?.wear_date || `${monthValue}-01`);
      renderSelectedOutfit();
    };
    select.addEventListener("change", applyMonthSelection);
  });
  host.querySelectorAll("[data-outfit-date-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      applySelectedOutfitDate(button.dataset.outfitDateChip || state.selectedOutfitDate);
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-outfit-date-latest]").forEach((button) => {
    button.addEventListener("click", () => {
      applySelectedOutfitDate(button.dataset.outfitDateLatest || state.selectedOutfitDate);
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-edit-outfit]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!outfit) return;
      openOutfitEdit(outfit);
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-cancel-outfit-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      closeOutfitEdit();
      renderSelectedOutfit();
    });
  });
  host.querySelectorAll("[data-save-outfit-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      await saveOutfitEdit(host);
    });
  });
  host.querySelectorAll("[data-save-outfit-create]").forEach((button) => {
    button.addEventListener("click", async () => {
      await saveOutfitCreate(host);
    });
  });
  host.querySelectorAll("[data-cancel-outfit-create]").forEach((button) => {
    button.addEventListener("click", () => {
      closeOutfitCreate();
      renderSelectedOutfit();
    });
  });
  bindOutfitFormInteractions(host, "edit");
  bindOutfitFormInteractions(host, "create");
  host.querySelectorAll("[data-delete-outfit]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteSelectedOutfit(Number(button.dataset.deleteOutfit || 0));
    });
  });
  host.querySelectorAll("[data-save-outfit-look]").forEach((button) => {
    button.addEventListener("click", async () => {
      await saveSelectedOutfitAsLook(Number(button.dataset.saveOutfitLook || 0));
    });
  });
  host.querySelectorAll("[data-open-featured-look]").forEach((button) => {
    button.addEventListener("click", async () => {
      await openFeaturedLookByIdentifier(button.dataset.openFeaturedLook || "");
    });
  });
}

async function refreshOutfits() {
  state.outfitLoading = true;
  renderSelectedOutfit();
  state.outfits = await api("/api/outfits?summary=1");
  state.outfitDetailsById = {};
  if (!state.selectedOutfitDate) {
    state.selectedOutfitDate = state.outfits[0]?.wear_date || today;
  }
  state.outfitLoading = false;
  renderSelectedOutfit();
  renderSummary();
}

async function refreshRelatedOutfits(itemId) {
  const targetId = Number(itemId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    state.relatedOutfitEntries = [];
    state.relatedOutfitYear = "";
    state.relatedOutfitMonth = "";
    state.relatedOutfitDetailLoadingId = null;
    renderSelectedOutfit();
    return;
  }
  state.relatedOutfitEntries = await api(`/api/items/${targetId}/outfits?summary=1`);
  const availableYears = [...new Set(state.relatedOutfitEntries.map((outfit) => String(outfit.wear_date || "").slice(0, 4)).filter(Boolean))];
  if (!availableYears.includes(state.relatedOutfitYear)) {
    state.relatedOutfitYear = availableYears[0] || "";
  }
  const monthCandidates = state.relatedOutfitEntries
    .filter((outfit) => !state.relatedOutfitYear || String(outfit.wear_date || "").startsWith(state.relatedOutfitYear))
    .map((outfit) => String(outfit.wear_date || "").slice(0, 7))
    .filter(Boolean);
  const availableMonths = [...new Set(monthCandidates)];
  if (!availableMonths.includes(state.relatedOutfitMonth)) {
    state.relatedOutfitMonth = availableMonths[0] || "";
  }
  if (!state.relatedOutfitEntries.some((outfit) => outfit.wear_date === state.selectedOutfitDate)) {
    state.selectedOutfitDate = state.relatedOutfitEntries[0]?.wear_date || today;
  }
  state.relatedOutfitDetailLoadingId = null;
  renderSelectedOutfit();
}

function featuredLookSlotLabel(slot) {
  return {
    anchor: "锚点",
    inner: "Inner",
    middle: "Middle",
    outer: "Outer",
    bottom: "Bottom",
    footwear: "Footwear",
    watch: "Watch",
  }[slot] || slot;
}

function renderFeaturedLooks() {
  const host = $("featured-looks-list");
  const summaryHost = $("featured-looks-summary");
  if (!host || !summaryHost) return;
  const { options: ownerOptions, selected: selectedOwner } = resolveFeaturedLookSelectedOwner();
  syncOwnerScopeSelect("featured-look-owner-select", ownerOptions, selectedOwner);
  const searchText = $("featured-looks-search-input")?.value.trim().toLowerCase() || "";
  const relatedItemId = Number(state.relatedFeaturedLookItemId || 0);
  const relatedItem = findKnownItemById(relatedItemId);
  const routeLookId = currentFeaturedLookRouteId();
  const sortLooksByCreatedAtDesc = (entries) => [...(entries || [])].sort((left, right) => {
    const leftCreated = String(left?.created_at || "");
    const rightCreated = String(right?.created_at || "");
    if (leftCreated !== rightCreated) {
      return rightCreated.localeCompare(leftCreated, "zh-CN");
    }
    return Number(right?.id || 0) - Number(left?.id || 0);
  });
  if (!state.featuredLooks.length) {
    summaryHost.innerHTML = `<div class="card"><div class="list-item">当前没有可展示的精选套装。</div></div>`;
    host.innerHTML = "";
    return;
  }
  const baseLooks = sortLooksByCreatedAtDesc(relatedItemId > 0 ? state.relatedFeaturedLookEntries : state.featuredLooks)
    .filter((look) => ownerMatchesRecord(look, selectedOwner));
  const filteredLooks = baseLooks.filter((look) => {
    if (!searchText) return true;
    const haystack = [
      look.look_id,
      look.status,
      look.use_case,
      look.notes,
      ...(look.items || []).flatMap((item) => [
        item.section,
        item.source_section,
        item.code,
        item.source_code,
        item.brand,
        item.slot,
      ]),
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(searchText);
  });
  const selectedRelatedLookId = String(state.selectedRelatedFeaturedLookId || "");
  const visibleLooks = relatedItemId > 0
    ? (() => {
        const availableIds = new Set(filteredLooks.map((look) => String(look.look_id || look.id || "")));
        if (!availableIds.has(selectedRelatedLookId)) {
          state.selectedRelatedFeaturedLookId = String(filteredLooks[0]?.look_id || filteredLooks[0]?.id || "");
        }
        return filteredLooks.filter((look) => String(look.look_id || look.id || "") === state.selectedRelatedFeaturedLookId);
      })()
    : routeLookId
      ? (() => {
          const availableIds = new Set(filteredLooks.map((look) => String(look.look_id || look.id || "")));
          if (!availableIds.has(routeLookId)) {
            return filteredLooks;
          }
          state.selectedRelatedFeaturedLookId = routeLookId;
          return filteredLooks.filter((look) => String(look.look_id || look.id || "") === routeLookId);
        })()
      : filteredLooks;
  if (!filteredLooks.length) {
    summaryHost.innerHTML = `
      <div class="card">
        ${relatedItem ? `
          <div class="related-filter-inline">
            <strong>套装筛选</strong>
            <span>仅显示包含 ${escapeHtml(relatedItem?.section || relatedItem?.code || `商品 ${relatedItemId}`)} 的套装</span>
            <button type="button" class="secondary small" data-clear-related-filter="featured-looks">清除</button>
          </div>
        ` : routeLookId ? `
          <div class="related-filter-inline">
            <strong>套装详情</strong>
            <span>${escapeHtml(routeLookId)}</span>
            <button type="button" class="secondary small" data-clear-featured-look-focus="1">返回全部</button>
          </div>
        ` : ""}
        <div class="list-item">${relatedItem ? "当前没有包含该商品的精选套装。" : "当前搜索条件下没有匹配的精选套装。"}</div>
      </div>
    `;
    host.innerHTML = "";
    summaryHost.querySelectorAll("[data-clear-related-filter='featured-looks']").forEach((button) => {
      button.addEventListener("click", () => {
        clearRelatedFeaturedLookFilter();
        renderFeaturedLooks();
      });
    });
    return;
  }
  summaryHost.innerHTML = `
    <div class="card featured-looks-meta">
      ${relatedItem ? `
        <div class="related-filter-inline">
          <strong>套装筛选</strong>
          <span>仅显示包含 ${escapeHtml(relatedItem?.section || relatedItem?.code || `商品 ${relatedItemId}`)} 的套装</span>
          <button type="button" class="secondary small" data-clear-related-filter="featured-looks">清除</button>
        </div>
      ` : routeLookId ? `
        <div class="related-filter-inline">
          <strong>套装详情</strong>
          <span>${escapeHtml(routeLookId)}</span>
          <button type="button" class="secondary small" data-clear-featured-look-focus="1">返回全部</button>
        </div>
      ` : ""}
      <div>套装数 ${filteredLooks.length}${searchText ? ` / ${baseLooks.length}` : ""}</div>
      ${relatedItem ? `
        <label class="related-selector-label">
          <span>选择套装</span>
          <select class="related-choice-select" data-related-look-select>
            ${filteredLooks.map((look) => `
              <option value="${escapeHtml(String(look.look_id || look.id || ""))}" ${String(look.look_id || look.id || "") === state.selectedRelatedFeaturedLookId ? "selected" : ""}>
                ${escapeHtml([look.look_id || "", look.status || ""].filter(Boolean).join(" · "))}
              </option>
            `).join("")}
          </select>
        </label>
      ` : ""}
    </div>
  `;
  host.innerHTML = visibleLooks.map((look) => {
    const editable = canEditFeaturedLook(look);
    const seenKeys = new Set();
    const dedupedItems = (look.items || []).filter((item) => {
      const dedupeKey = item.id
        ? `id:${item.id}`
        : `src:${item.source_code || ""}|${item.source_section || ""}`;
      if (seenKeys.has(dedupeKey)) {
        return false;
      }
      seenKeys.add(dedupeKey);
      return true;
    });
    const items = dedupedItems.map((item) => {
      const linked = Number.isFinite(Number(item.id)) && Number(item.id) > 0;
      const isAnchor = String(item.slot || "").trim() === "anchor";
      const label = item.section
        ? sectionLink(item, "section-link featured-look-section-link")
        : escapeHtml(item.source_section || item.source_code || "未匹配");
      const metaText = buildFeaturedLookItemMetaText(item);
      return `
        <div class="featured-look-item ${linked ? "" : "is-missing"} ${isAnchor ? "is-anchor" : ""}">
          ${isAnchor ? "" : `<div class="featured-look-slot">${escapeHtml(featuredLookSlotLabel(item.slot || ""))}</div>`}
          <div class="featured-look-section">${label}</div>
          ${metaText ? `<div class="muted-text featured-look-item-meta">${escapeHtml(metaText)}</div>` : ""}
          ${!linked ? `<div class="muted-text">未在当前数据库中定位到对应商品</div>` : ""}
        </div>
      `;
    }).join("");
    return `
      <article class="card featured-look-card">
        ${renderFeaturedLookHeadHtml(look, { editable })}
        ${Number(state.featuredLookEditId) === Number(look.id) ? renderFeaturedLookEditForm(look) : ""}
        ${renderEntityPhotoSection(look.photos || [], "featured-look", look.id, `/api/featured-looks/${look.id}/photos`)}
        ${renderRecordExpandableRow("featured-look", look, look.notes, "featured-look-expandable-text")}
        <div class="featured-look-items">${items}</div>
      </article>
    `;
  }).join("");
  summaryHost.querySelectorAll("[data-clear-related-filter='featured-looks']").forEach((button) => {
    button.addEventListener("click", () => {
      clearRelatedFeaturedLookFilter();
      state.selectedRelatedFeaturedLookId = "";
      renderFeaturedLooks();
    });
  });
  summaryHost.querySelectorAll("[data-clear-featured-look-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRelatedFeaturedLookId = "";
      history.replaceState(null, "", "#featured-looks");
      renderFeaturedLooks();
    });
  });
  summaryHost.querySelectorAll("[data-related-look-select]").forEach((select) => {
    select.addEventListener("change", () => {
      state.selectedRelatedFeaturedLookId = select.value || "";
      renderFeaturedLooks();
    });
  });
  host.querySelectorAll("[data-edit-look]").forEach((button) => {
    button.addEventListener("click", () => {
      const look = filteredLooks.find((entry) => Number(entry.id) === Number(button.dataset.editLook || 0));
      if (!look) return;
      openFeaturedLookEdit(look);
      renderFeaturedLooks();
    });
  });
  host.querySelectorAll("[data-cancel-look-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      closeFeaturedLookEdit();
      renderFeaturedLooks();
    });
  });
  host.querySelectorAll("[data-save-look-edit]").forEach((button) => {
    button.addEventListener("click", async () => {
      await saveFeaturedLookEdit(Number(button.dataset.saveLookEdit || 0));
    });
  });
  host.querySelectorAll("[data-delete-look]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteFeaturedLook(Number(button.dataset.deleteLook || 0));
    });
  });
}

async function refreshFeaturedLooks() {
  state.featuredLooks = await api("/api/featured-looks");
  renderFeaturedLooks();
}

async function refreshRelatedFeaturedLooks(itemId) {
  const targetId = Number(itemId || 0);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    state.relatedFeaturedLookEntries = [];
    state.selectedRelatedFeaturedLookId = "";
    renderFeaturedLooks();
    return;
  }
  state.relatedFeaturedLookEntries = await api(`/api/items/${targetId}/featured-looks`);
  const availableIds = new Set(state.relatedFeaturedLookEntries.map((look) => String(look.look_id || look.id || "")));
  if (!availableIds.has(state.selectedRelatedFeaturedLookId)) {
    state.selectedRelatedFeaturedLookId = String(state.relatedFeaturedLookEntries[0]?.look_id || state.relatedFeaturedLookEntries[0]?.id || "");
  }
  renderFeaturedLooks();
}

function buildItemDetailOutfitTabHtml(item) {
  const relatedItemId = Number(item?.id || 0);
  const filteredOutfits = state.relatedOutfitEntries || [];
  const yearEntries = Array.from(new Set(filteredOutfits.map((outfit) => String(outfit.wear_date || "").slice(0, 4)).filter(Boolean)))
    .map((year) => ({
      year,
      count: filteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(year)).length,
    }));
  if (yearEntries.length && !yearEntries.some((entry) => entry.year === state.relatedOutfitYear)) {
    state.relatedOutfitYear = yearEntries[0].year;
  }
  const yearFilteredOutfits = state.relatedOutfitYear
    ? filteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(state.relatedOutfitYear))
    : filteredOutfits;
  const monthCandidates = yearFilteredOutfits
    .map((outfit) => String(outfit.wear_date || "").slice(0, 7))
    .filter(Boolean);
  const availableMonths = [...new Set(monthCandidates)];
  if (availableMonths.length && !availableMonths.includes(state.relatedOutfitMonth)) {
    state.relatedOutfitMonth = availableMonths[0] || "";
  }
  const monthFilteredOutfits = state.relatedOutfitMonth
    ? yearFilteredOutfits.filter((outfit) => String(outfit.wear_date || "").startsWith(state.relatedOutfitMonth))
    : yearFilteredOutfits;
  const availableDates = new Set(monthFilteredOutfits.map((outfit) => outfit.wear_date).filter(Boolean));
  if (monthFilteredOutfits.length && !availableDates.has(state.selectedOutfitDate)) {
    state.selectedOutfitDate = monthFilteredOutfits[0].wear_date;
  }
  const selectedDate = state.selectedOutfitDate || monthFilteredOutfits[0]?.wear_date || yearFilteredOutfits[0]?.wear_date || filteredOutfits[0]?.wear_date || today;
  const selectedSummary = monthFilteredOutfits.find((entry) => entry.wear_date === selectedDate) || monthFilteredOutfits[0] || yearFilteredOutfits[0] || filteredOutfits[0] || null;
  const outfit = selectedSummary?.id ? state.outfitDetailsById[String(selectedSummary.id)] || null : null;
  const detailError = selectedSummary?.id ? state.outfitDetailErrorsById[String(selectedSummary.id)] || "" : "";
  if (selectedSummary?.id && !outfit && !detailError && state.relatedOutfitDetailLoadingId !== selectedSummary.id) {
    void ensureSelectedRelatedOutfitDetailLoaded(() => {
      if (state.selectedItemDetail?.id === relatedItemId) {
        renderItemDetail(state.selectedItemDetail);
      }
    });
  }
  if (!filteredOutfits.length) {
    return `
      <div class="related-tab-shell">
        <div class="list-item related-tab-empty">当前没有包含这件商品的记录。</div>
      </div>
    `;
  }
  const sortedItems = [...(outfit?.items || [])].sort((a, b) => {
    const rankDiff = outfitItemSortRank(a) - outfitItemSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.section || a.code || "").localeCompare((b.section || b.code || ""), "zh-CN");
  });
  const outfitMeta = outfit || selectedSummary;
  const locationText = outfitMeta ? formatOutfitLocation(outfitMeta.inventory_loc || outfitMeta.city || "-") : "-";
  return `
    <div class="related-tab-shell">
      <div class="related-selector-card">
        <div class="related-year-list">
          ${yearEntries.map((entry) => `
            <button type="button" class="related-year-chip ${entry.year === state.relatedOutfitYear ? "active" : ""}" data-item-detail-outfit-year="${escapeHtml(entry.year)}">
              ${escapeHtml(entry.year)} (${entry.count})
            </button>
          `).join("")}
        </div>
        ${buildOutfitDatePickerHtml(selectedDate, yearFilteredOutfits)}
      </div>
      ${outfitMeta ? `
        <div class="list-item">
          ${buildOutfitSummaryMetaHtml(outfitMeta, selectedDate, null, locationText, yearFilteredOutfits, { hideDatePicker: true })}
        </div>
        ${outfit ? outfitActionBarHtml(outfit, true) : ""}
        ${outfit && state.outfitEditMode && Number(state.outfitEditDraft?.id) === Number(outfit.id) ? renderOutfitEditForm() : ""}
        ${detailError ? `<div class="list-item outfit-empty-state">${escapeHtml(detailError)}</div>` : ""}
        ${!detailError && !outfit && selectedSummary?.id ? `<div class="list-item outfit-empty-state">正在加载 ${escapeHtml(formatBeijingDate(selectedDate) || selectedDate || "")} 的详情...</div>` : ""}
        ${outfit ? renderEntityPhotoSection(outfit.photos || [], "outfit", outfit.id, `/api/outfits/${outfit.id}/photos`) : ""}
        ${outfit ? `
          ${renderRecordExpandableRow("outfit", outfitMeta, outfit.notes, "outfit-expandable-text")}
          <div class="list-item">
            <strong>产品 Section</strong>
            <div class="outfit-section-list">
              ${sortedItems.map((entry) => `
                <div class="outfit-section-item">
                  <div><strong>${[
                    entry.brand || "-",
                    entry.layer_role || entry.role || "-",
                    (entry.role === "Outer" || entry.layer_role === "Outer") && entry.outer_type ? entry.outer_type : "",
                  ].filter(Boolean).join(" | ")}</strong></div>
                  <div class="outfit-section-name">${sectionLink(entry, "section-link outfit-section-link")}</div>
                  <div class="muted-text">货号: ${entry.code || ""}</div>
                  <div class="muted-text">${escapeHtml(formatWearSummaryLine(entry))}</div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}
      ` : `<div class="list-item">当前没有可显示的日期详情。</div>`}
    </div>
  `;
}

function buildItemDetailFeaturedLookTabHtml(item) {
  const looks = state.relatedFeaturedLookEntries || [];
  if (!looks.length) {
    return `
      <div class="related-tab-shell">
        <div class="list-item related-tab-empty">当前没有包含这件商品的套装。</div>
      </div>
    `;
  }
  const availableIds = new Set(looks.map((look) => String(look.look_id || look.id || "")));
  if (!availableIds.has(state.selectedRelatedFeaturedLookId)) {
    state.selectedRelatedFeaturedLookId = String(looks[0]?.look_id || looks[0]?.id || "");
  }
  const visibleLook = looks.find((look) => String(look.look_id || look.id || "") === state.selectedRelatedFeaturedLookId) || looks[0];
  const seenKeys = new Set();
  const dedupedItems = (visibleLook.items || []).filter((entry) => {
    const dedupeKey = entry.id ? `id:${entry.id}` : `src:${entry.source_code || ""}|${entry.source_section || ""}`;
    if (seenKeys.has(dedupeKey)) return false;
    seenKeys.add(dedupeKey);
    return true;
  });
  const itemsHtml = dedupedItems.map((entry) => {
    const linked = Number.isFinite(Number(entry.id)) && Number(entry.id) > 0;
    const isAnchor = String(entry.slot || "").trim() === "anchor";
    const label = entry.section ? sectionLink(entry, "section-link featured-look-section-link") : escapeHtml(entry.source_section || entry.source_code || "未匹配");
    const metaText = buildFeaturedLookItemMetaText(entry);
    return `
      <div class="featured-look-item ${linked ? "" : "is-missing"} ${isAnchor ? "is-anchor" : ""}">
        ${isAnchor ? "" : `<div class="featured-look-slot">${escapeHtml(featuredLookSlotLabel(entry.slot || ""))}</div>`}
        <div class="featured-look-section">${label}</div>
        ${metaText ? `<div class="muted-text featured-look-item-meta">${escapeHtml(metaText)}</div>` : ""}
        ${!linked ? `<div class="muted-text">未在当前数据库中定位到对应商品</div>` : ""}
      </div>
    `;
  }).join("");
  return `
    <div class="related-tab-shell">
      <div class="related-filter-banner">
        <div class="related-filter-copy">
          <strong>套装</strong>
          <span>当前商品共匹配 ${looks.length} 套</span>
        </div>
      </div>
      <div class="related-selector-card">
        <label class="related-selector-label">
          <span>选择套装</span>
          <select class="related-choice-select" data-item-detail-look-select>
            ${looks.map((look) => `
              <option value="${escapeHtml(String(look.look_id || look.id || ""))}" ${String(look.look_id || look.id || "") === state.selectedRelatedFeaturedLookId ? "selected" : ""}>
                ${escapeHtml([look.look_id || "", look.status || ""].filter(Boolean).join(" · "))}
              </option>
            `).join("")}
          </select>
        </label>
      </div>
      <article class="card featured-look-card">
        ${renderFeaturedLookHeadHtml(visibleLook)}
        ${renderEntityPhotoSection(visibleLook.photos || [], "featured-look", visibleLook.id, `/api/featured-looks/${visibleLook.id}/photos`)}
        ${renderRecordExpandableRow("featured-look", visibleLook, visibleLook.notes, "featured-look-expandable-text")}
        <div class="featured-look-items">${itemsHtml}</div>
      </article>
    </div>
  `;
}

function resetItemForm() {
  if (!$("item-form")) return;
  state.selectedItemId = null;
  state.selectedItemDetail = null;
  state.relatedOutfitItemId = null;
  state.relatedFeaturedLookItemId = null;
  $("item-form").reset();
  $("item-id").value = "";
  $("owner").value = "徐欣";
  $("loc").value = "SH";
  renderPhotos(null);
  renderItemDetail(null);
  renderInventoryItemDetail(null);
  renderItems();
}

function applySelectedOutfitDate(dateValue) {
  const normalizedDate = String(dateValue || "").trim();
  if (!normalizedDate) return false;
  state.selectedOutfitDate = normalizedDate;
  state.relatedOutfitYear = normalizedDate.slice(0, 4) || state.relatedOutfitYear;
  state.relatedOutfitMonth = normalizedDate.slice(0, 7) || state.relatedOutfitMonth;
  return true;
}

async function loadDashboard() {
  const status = await api("/api/bootstrap-status");
  state.importDirectory = status.default_import_dir || "";
  state.dashboardImports = status.imports || [];
  state.dashboardDbSizeBytes = Number(status.db_size_bytes || 0);
  state.lastImportFingerprint = JSON.stringify(status.imports?.[0] || null);
  renderAuthSummary();
  renderCreateItemPanel();
}

async function refreshDashboardItems() {
  state.dashboardItems = await api("/api/items");
  renderSummary();
  refreshMaintenancePlanning();
}

function openCreateItemPanel() {
  state.createItemMode = true;
  state.createItemError = "";
  state.createItemSuccess = "";
  state.createItemDraft = defaultCreateItemDraft(state.createItemKind || "wardrobe");
  renderCreateItemPanel();
  window.requestAnimationFrame(() => {
    const host = $("create-item-panel");
    host?.scrollIntoView({ behavior: "smooth", block: "start" });
    host?.querySelector("[data-create-field]")?.focus?.();
  });
}

function applyInitialPluginActionAfterBootstrap() {
  if (!initialPluginActionRoute || initialPluginActionApplied) return;
  initialPluginActionApplied = true;
  if (initialPluginActionRoute === "add_item") {
    state.createItemKind = "wardrobe";
    setTab("inventory");
    openCreateItemPanel();
  }
}

function currentStartupRouteKey() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [hash] = rawHash.split("?");
  if (!hash) return "inventory";
  if (hash === "recommend") return "featured-looks";
  if (hash.startsWith("item-")) return "item-detail";
  if (["dashboard", "wear-stats", "maintenance-planning", "inventory", "watch-collection", "outfits", "featured-looks"].includes(hash)) {
    return hash;
  }
  return "inventory";
}

async function refreshCurrentStartupRouteData(routeKey) {
  if (routeKey === "inventory") {
    await refreshItems();
    return;
  }
  if (routeKey === "watch-collection") {
    await refreshWatchItems();
    return;
  }
  if (routeKey === "wear-stats" || routeKey === "maintenance-planning") {
    await Promise.all([refreshItems(), refreshWatchItems()]);
  }
}

function scheduleDeferredStartupRefresh(primaryRouteKey) {
  if (state.startupDeferredRefreshScheduled || state.startupDeferredRefreshRunning) return;
  state.startupDeferredRefreshScheduled = true;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      refreshDeferredStartupData(primaryRouteKey).catch((error) => console.error("deferred_startup_refresh_failed", error));
    });
  });
}

async function refreshDeferredStartupData(primaryRouteKey) {
  if (state.startupDeferredRefreshRunning) return;
  state.startupDeferredRefreshRunning = true;
  try {
    const tasks = [];
    if (primaryRouteKey !== "inventory") {
      tasks.push(refreshItems());
    }
    if (primaryRouteKey !== "watch-collection") {
      tasks.push(refreshWatchItems());
    }
    if (primaryRouteKey !== "outfits" && !state.outfits.length) {
      tasks.push(refreshOutfits());
    }
    if (primaryRouteKey !== "featured-looks" && !state.featuredLooks.length) {
      tasks.push(refreshFeaturedLooks());
    }
    const results = await Promise.allSettled(tasks);
    results
      .filter((result) => result.status === "rejected")
      .forEach((result) => console.error("deferred_startup_refresh_task_failed", result.reason));
    renderWearShareChart();
    refreshMaintenancePlanning();
  } finally {
    state.startupDeferredRefreshRunning = false;
  }
}

function closeCreateItemPanel() {
  state.createItemMode = false;
  state.createItemSaving = false;
  state.createItemError = "";
  state.createItemSuccess = "";
  renderCreateItemPanel();
}

function switchCreateItemKind(kind) {
  state.createItemKind = kind === "watch" ? "watch" : "wardrobe";
  state.createItemDraft = defaultCreateItemDraft(state.createItemKind);
  state.createItemError = "";
  state.createItemSuccess = "";
  renderCreateItemPanel();
}

async function saveCreateItem() {
  const host = $("create-item-panel");
  if (!host) return;
  try {
    const payload = createItemPayload(host);
    state.createItemSaving = true;
    state.createItemError = "";
    state.createItemSuccess = "";
    state.createItemDraft = { ...payload };
    renderCreateItemPanel();
    const created = await api("/api/items/baseline-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    state.createItemSaving = false;
    state.createItemError = "";
    state.createItemSuccess = `${created.section || created.code || "新商品"} 已入库`;
    state.createItemDraft = defaultCreateItemDraft(state.createItemKind);
    state.selectedItemId = created.id;
    state.selectedItemDetail = created;
    await loadDashboard();
    await refreshDashboardItems();
    await refreshOptions();
    renderWearShareChart();
    await refreshItems();
    await refreshWatchItems();
    await refreshOutfits();
    await refreshFeaturedLooks();
    state.createItemMode = false;
    renderCreateItemPanel();
    const detailHash = `#item-${created.id}`;
    if (window.location.hash !== detailHash) {
      history.replaceState(null, "", detailHash);
    }
    await handleRoute();
  } catch (error) {
    state.createItemSaving = false;
    state.createItemError = String(error?.message || error || "入库失败");
    renderCreateItemPanel();
  }
}

async function saveCatalogOption(optionType) {
  if (!canManageCatalog()) return;
  const input = $(`catalog-input-${optionType}`);
  const value = String(input?.value || "").trim();
  if (!value) return;
  state.catalogManagerSavingType = optionType;
  state.catalogManagerError = "";
  state.catalogManagerSuccess = "";
  renderCatalogManager();
  try {
    await api("/api/meta/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option_type: optionType, value }),
    });
    state.catalogManagerSavingType = "";
    state.catalogManagerError = "";
    state.catalogManagerSuccess = `${value} 已加入选项字典`;
    await refreshOptions();
    renderCreateItemPanel();
    if (state.selectedItemDetail) {
      renderItemDetail(state.selectedItemDetail);
    }
  } catch (error) {
    state.catalogManagerSavingType = "";
    state.catalogManagerError = String(error?.message || error || "保存失败");
    state.catalogManagerSuccess = "";
    renderCatalogManager();
  }
}

async function pollAutoImports() {
  if (!state.authenticated) return;
  const status = await api("/api/bootstrap-status");
  state.dashboardImports = status.imports || state.dashboardImports;
  state.dashboardDbSizeBytes = Number(status.db_size_bytes || 0);
  renderAuthSummary();
  const fingerprint = JSON.stringify(status.imports?.[0] || null);
  if (fingerprint === state.lastImportFingerprint) return;
  state.importDirectory = status.default_import_dir || state.importDirectory;
  state.lastImportFingerprint = fingerprint;
  await refreshDashboardItems();
  await refreshOptions();
  renderWearShareChart();
  await refreshItems();
  await refreshWatchItems();
  await refreshOutfits();
  await refreshFeaturedLooks();
}

function ensureAutoImportPolling() {
  if (state.autoImportTimer) return;
  state.autoImportTimer = window.setInterval(() => {
    pollAutoImports().catch((error) => console.error(error));
  }, 20000);
}

function stopAutoImportPolling() {
  if (!state.autoImportTimer) return;
  window.clearInterval(state.autoImportTimer);
  state.autoImportTimer = null;
}

async function bootstrapAuthenticatedApp() {
  ensureAutoImportPolling();
  const startupRouteKey = currentStartupRouteKey();
  showAppLoading("正在加载首页...");
  try {
    try {
      await loadDashboard();
      await refreshDashboardItems();
    } catch (error) {
      throw new Error(`加载首页数据: ${error?.message || error || "failed"}`);
    }
    try {
      await refreshOptions();
    } catch (error) {
      throw new Error(`加载筛选选项: ${error?.message || error || "failed"}`);
    }
    try {
      await refreshCurrentStartupRouteData(startupRouteKey);
    } catch (error) {
      throw new Error(`加载当前页面: ${error?.message || error || "failed"}`);
    }
    renderPhotos(null);
    renderItemDetail(null);
    renderInventoryItemDetail(null);
    updateInventorySearchUi();
    updateWatchSearchUi();
    updateFeaturedLooksSearchUi();
    await handleRoute();
    applyInitialPluginActionAfterBootstrap();
  } finally {
    hideAppLoading();
  }
  scheduleDeferredStartupRefresh(startupRouteKey);
}

async function submitPasswordChange() {
  const draft = ensurePasswordChangeDraft();
  const currentPassword = draft.current_password || "";
  const newPassword = draft.new_password || "";
  const confirmPassword = draft.confirm_password || "";
  if (!currentPassword) {
    state.passwordChangeError = "请输入当前密码。";
    state.passwordChangeSuccess = "";
    renderAuthSummary();
    return;
  }
  if (!newPassword) {
    state.passwordChangeError = "请输入新密码。";
    state.passwordChangeSuccess = "";
    renderAuthSummary();
    return;
  }
  if (newPassword !== confirmPassword) {
    state.passwordChangeError = "两次输入的新密码不一致。";
    state.passwordChangeSuccess = "";
    renderAuthSummary();
    return;
  }
  if (currentPassword === newPassword) {
    state.passwordChangeError = "新密码不能与当前密码相同。";
    state.passwordChangeSuccess = "";
    renderAuthSummary();
    return;
  }
  const policyError = passwordPolicyError(newPassword);
  if (policyError) {
    state.passwordChangeError = policyError;
    state.passwordChangeSuccess = "";
    renderAuthSummary();
    return;
  }
  state.passwordChangeSaving = true;
  state.passwordChangeError = "";
  state.passwordChangeSuccess = "";
  renderAuthSummary();
  try {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || payload.error || `修改失败(${response.status})`);
    }
    state.passwordChangeDraft = blankPasswordChangeDraft();
    state.passwordChangeSuccess = "密码已更新。";
    state.passwordChangeError = "";
  } catch (error) {
    state.passwordChangeError = error?.message || "密码修改失败。";
    state.passwordChangeSuccess = "";
  } finally {
    state.passwordChangeSaving = false;
    renderAuthSummary();
  }
}

async function refreshAppData({ showOverlay = true } = {}) {
  if (!state.authenticated || state.manualRefreshLoading) return;
  state.manualRefreshLoading = true;
  renderAuthSummary();
  if (showOverlay) {
    showAppLoading("正在刷新数据...");
  }
  try {
    await loadDashboard();
    await refreshDashboardItems();
    await refreshOptions();
    await Promise.all([
      refreshItems(),
      refreshWatchItems(),
      refreshOutfits(),
      refreshFeaturedLooks(),
    ]);
    if (state.selectedItemId) {
      try {
        await selectItem(state.selectedItemId);
      } catch (error) {
        state.selectedItemId = null;
        state.selectedItemDetail = null;
        renderItemDetail(null, "当前商品已不存在或无法加载。");
        renderInventoryItemDetail(null);
        renderPhotos(null);
      }
    }
    if (Number(state.relatedOutfitItemId || 0) > 0) {
      await refreshRelatedOutfits(state.relatedOutfitItemId);
    }
    if (Number(state.relatedFeaturedLookItemId || 0) > 0) {
      await refreshRelatedFeaturedLooks(state.relatedFeaturedLookItemId);
    }
    await handleRoute();
  } catch (error) {
    console.error(error);
    window.alert(`刷新失败: ${error?.message || error || "unknown_error"}`);
  } finally {
    state.manualRefreshLoading = false;
    renderAuthSummary();
    if (showOverlay) {
      hideAppLoading();
    }
  }
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  clearPluginSessionToken();
  stopAutoImportPolling();
  state.authenticated = false;
  state.authUser = "";
  state.authIsAdmin = false;
  state.aiPromptTemplates = { outfit: "", outfit_draft: "", featured_look: "" };
  state.aiPromptDrafts = {};
  state.aiPromptPanelsOpen = {};
  state.aiPromptSavingKind = "";
  state.aiPromptErrorKind = "";
  state.aiPromptError = "";
  state.aiPromptSuccessKind = "";
  if (state.aiPromptSuccessTimer) {
    window.clearTimeout(state.aiPromptSuccessTimer);
    state.aiPromptSuccessTimer = 0;
  }
  state.selectedItemId = null;
  state.selectedItemDetail = null;
  state.itemDetailEditDraft = null;
  state.relatedItems = {};
  state.relatedOutfitItemId = null;
  state.relatedFeaturedLookItemId = null;
  state.relatedOutfitEntries = [];
  state.relatedFeaturedLookEntries = [];
  state.dashboardItems = [];
  state.items = [];
  state.watchItems = [];
  state.outfits = [];
  state.featuredLooks = [];
  state.maintenanceFilters.brands = [];
  state.maintenanceFilters.roles = [];
  state.maintenanceKnownBrands = [];
  state.maintenanceKnownRoles = [];
  state.inventoryOwnerInitialized = false;
  state.watchOwnerInitialized = false;
  state.maintenanceBrandInitialized = false;
  state.maintenanceRoleInitialized = false;
  state.brandShareOwnerSelectionInitialized = false;
  state.createItemMode = false;
  state.createItemDraft = null;
  state.createItemError = "";
  state.createItemSuccess = "";
  state.aiPanelsOpen = {};
  closeAiAnalysisEditor();
  state.aiAutoRefreshLoading = false;
  resetPasswordChangeState();
  renderPhotos(null);
  renderItemDetail(null);
  renderInventoryItemDetail(null);
  showLoginOverlay();
}

async function fetchAppVersion() {
  const response = await fetch("/api/app-version", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`version_${response.status}`);
  }
  const payload = await response.json();
  return String(payload.version || "").trim();
}

function reloadWithFreshVersion(version) {
  const url = new URL(window.location.href);
  url.searchParams.set("_appv", version || String(Date.now()));
  window.location.replace(url.toString());
}

async function checkForAppUpdate({ reloadIfChanged = true } = {}) {
  try {
    const version = await fetchAppVersion();
    if (!version) return;
    const previous = localStorage.getItem(APP_VERSION_KEY);
    const activeVersion = currentLoadedAppVersion();
    if (!previous) {
      localStorage.setItem(APP_VERSION_KEY, version);
    }
    if (activeVersion !== version) {
      localStorage.setItem(APP_VERSION_KEY, version);
      state.appUpdateAvailable = true;
      state.appUpdateVersion = version;
      renderAppUpdateBanner();
      announcePluginRefreshRequired("app_version_changed", {
        appVersion: activeVersion,
        nextAppVersion: version,
      });
      if (reloadIfChanged) {
        reloadWithFreshVersion(version);
      }
      return;
    }
    state.appUpdateAvailable = false;
    state.appUpdateVersion = version;
    if (previous !== version) {
      localStorage.setItem(APP_VERSION_KEY, version);
    }
    renderAppUpdateBanner();
  } catch (error) {
    console.warn("version_check_failed", error);
  }
}

const PHOTO_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
const PHOTO_UPLOAD_MAX_FILES = 8;

async function refreshEntityPhotos(entityType, entityId) {
  if (entityType === "item") {
    await selectItem(entityId);
    await refreshItems();
    return;
  }
  if (entityType === "outfit") {
    await refreshOutfits();
    return;
  }
  if (entityType === "featured-look") {
    await refreshFeaturedLooks();
  }
}

async function reorderItemPhoto(entityId, photoId, action) {
  const itemId = Number(entityId || 0);
  const targetPhotoId = Number(photoId || 0);
  if (!Number.isFinite(itemId) || itemId <= 0 || !Number.isFinite(targetPhotoId) || targetPhotoId <= 0) {
    return;
  }
  if (action !== "first") return;
  await api(`/api/items/${itemId}/photos/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_photo_id: targetPhotoId }),
  });
  await selectItem(itemId);
  await refreshItems();
}

function uploadErrorMessage(errorCode, status, index) {
  const prefix = `第 ${index + 1} 张图片`;
  if (errorCode === "file_too_large" || status === 413) {
    return `${prefix}不能超过 20MB。`;
  }
  if (errorCode === "invalid_file_type") {
    return `${prefix}格式不支持，只支持 JPG、PNG、WEBP、GIF、HEIC 图片。`;
  }
  return `${prefix}上传失败。`;
}

async function uploadSelectedEntityPhotos(uploadUrl, entityType, entityId, files) {
  const selectedFiles = Array.from(files || []);
  if (!uploadUrl || !entityType || !entityId || !selectedFiles.length) {
    return;
  }
  if (selectedFiles.length > PHOTO_UPLOAD_MAX_FILES) {
    throw new Error(`一次最多上传 ${PHOTO_UPLOAD_MAX_FILES} 张图片。`);
  }
  for (let index = 0; index < selectedFiles.length; index += 1) {
    const file = selectedFiles[index];
    if (file.size > PHOTO_UPLOAD_MAX_BYTES) {
      throw new Error(`第 ${index + 1} 张图片不能超过 20MB。`);
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(uploadUrl, { method: "POST", body: formData });
    if (!response.ok) {
      let errorCode = "";
      try {
        const payload = await response.json();
        errorCode = String(payload?.error || "");
      } catch (error) {
        errorCode = "";
      }
      throw new Error(uploadErrorMessage(errorCode, response.status, index));
    }
  }
  await refreshEntityPhotos(entityType, entityId);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    state.serviceWorkerReady = true;
    renderAuthSummary();
    registration.update().catch(() => undefined);
  } catch (error) {
    state.serviceWorkerReady = false;
    renderAuthSummary();
    console.warn("service_worker_register_failed", error);
  }
}

async function promptInstallApp() {
  if (!state.installPromptEvent) return false;
  const promptEvent = state.installPromptEvent;
  state.installPromptEvent = null;
  state.installPromptAvailable = false;
  state.installStatusText = "安装请求已发出";
  renderAuthSummary();
  try {
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice?.outcome !== "accepted") {
      state.installPromptEvent = promptEvent;
      state.installPromptAvailable = true;
      state.installStatusText = "已取消，可重试";
      renderAuthSummary();
      return false;
    }
    if (state.installRetryTimer) {
      window.clearTimeout(state.installRetryTimer);
    }
    state.installRetryTimer = window.setTimeout(() => {
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        state.installPromptEvent = promptEvent;
        state.installPromptAvailable = true;
        state.installStatusText = "安装未完成，可重试";
        renderAuthSummary();
      }
    }, 30000);
    return true;
  } catch (error) {
    state.installPromptEvent = promptEvent;
    state.installPromptAvailable = true;
    state.installStatusText = "安装失败，可重试";
    renderAuthSummary();
    console.warn("install_prompt_failed", error);
    return false;
  }
}

function startAppVersionMonitor() {
  checkForAppUpdate({ reloadIfChanged: false }).catch(() => undefined);
  window.setInterval(() => {
    checkForAppUpdate({ reloadIfChanged: false }).catch(() => undefined);
  }, APP_VERSION_POLL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkForAppUpdate({ reloadIfChanged: false }).catch(() => undefined);
    }
  });
}

async function init() {
  updateViewportMode();
  applyPluginViewportState("init");
  renderSidebarRefreshButton();

  const handleViewportLayoutChange = () => {
    updateViewportMode();
    applyPluginViewportState("viewport-change");
  };
  window.addEventListener("resize", handleViewportLayoutChange);
  window.addEventListener("orientationchange", handleViewportLayoutChange);
  window.visualViewport?.addEventListener("resize", () => applyPluginViewportState("visual-resize"));
  window.visualViewport?.addEventListener("scroll", () => applyPluginViewportState("visual-scroll"));
  window.addEventListener("pageshow", () => reapplyPluginAppearance("pageshow"));
  window.addEventListener("focus", () => reapplyPluginAppearance("focus"));
  document.addEventListener("focusin", (event) => {
    if (isFocusedTextControl(event.target)) applyPluginViewportState("focus");
  });
  document.addEventListener("focusout", () => {
    window.setTimeout(() => applyPluginViewportState("blur"), 80);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      reapplyPluginAppearance("visible");
      applyPluginViewportState("visible");
    }
  });
  if (isHermesPluginEmbed()) {
    window.setInterval(syncPluginHostAppearance, 1500);
  }
  if (window.matchMedia) {
    const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (systemThemeQuery.addEventListener) {
      systemThemeQuery.addEventListener("change", syncSystemThemeChrome);
    } else if (systemThemeQuery.addListener) {
      systemThemeQuery.addListener(syncSystemThemeChrome);
    }
  }
  startAppVersionMonitor();
  startAiAnalysisMonitor();
  registerServiceWorker().catch((error) => console.warn(error));

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", async () => {
      const tab = button.dataset.tab;
      setPageActionMenuOpen(false);
      if (tab === "item-detail" && state.selectedItemId) {
        window.location.hash = `item-${state.selectedItemId}`;
        return;
      }
      if (window.location.hash === `#${tab}`) {
        await handleRoute();
        return;
      }
      await navigateTopLevelTab(tab);
    });
  });

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[data-item-id]");
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    const itemId = Number(link.dataset.itemId);
    if (!Number.isFinite(itemId) || itemId <= 0) return;
    if (window.location.hash === `#item-${itemId}`) {
      await handleRoute();
      return;
    }
    window.location.hash = `item-${itemId}`;
  });

  document.addEventListener("click", async (event) => {
    const photoMapLink = event.target.closest("[data-photo-map-link]");
    if (photoMapLink) {
      return;
    }
    const copyOutfitButton = event.target.closest("[data-copy-outfit]");
    if (copyOutfitButton) {
      event.preventDefault();
      event.stopPropagation();
      try {
        await copyOutfitSummary(copyOutfitButton, Number(copyOutfitButton.dataset.copyOutfit || 0));
      } catch (error) {
        window.alert("复制到剪贴板失败。");
      }
      return;
    }
    const copyFeaturedLookButton = event.target.closest("[data-copy-featured-look]");
    if (copyFeaturedLookButton) {
      event.preventDefault();
      event.stopPropagation();
      try {
        await copyFeaturedLookSummary(copyFeaturedLookButton, Number(copyFeaturedLookButton.dataset.copyFeaturedLook || 0));
      } catch (error) {
        window.alert("复制到剪贴板失败。");
      }
      return;
    }
    const photoOrderButton = event.target.closest("[data-photo-order-action][data-photo-id][data-photo-owner-id]");
    if (photoOrderButton) {
      event.preventDefault();
      event.stopPropagation();
      try {
        await reorderItemPhoto(
          photoOrderButton.dataset.photoOwnerId || "0",
          photoOrderButton.dataset.photoId || "0",
          photoOrderButton.dataset.photoOrderAction || "",
        );
      } catch (error) {
        alert(parseApiErrorMessage(error) || "图片顺序调整失败。");
      }
      return;
    }
    const photoCard = event.target.closest(".photo-card[data-photo-entity][data-photo-owner-id][data-photo-index]");
    if (photoCard) {
      const entityType = photoCard.dataset.photoEntity || "";
      const entityId = Number(photoCard.dataset.photoOwnerId || "");
      const photoIndex = Number(photoCard.dataset.photoIndex || "0");
      const photos = photosForContext(entityType, entityId);
      if (photos.length) {
        openPhotoLightbox(photos, photoIndex, { entityType, entityId });
      }
      return;
    }
    const relatedButton = event.target.closest("[data-detail-related-tab][data-detail-item-id]");
    if (relatedButton) {
      event.preventDefault();
      event.stopPropagation();
      const itemId = Number(relatedButton.dataset.detailItemId || "0");
      const item = findKnownItemById(itemId);
      if (!item) return;
      const tab = relatedButton.dataset.detailRelatedTab || "";
      if (tab === "outfits") {
        await openRelatedOutfitsForItem(item);
        return;
      }
      if (tab === "featured-looks") {
        await openRelatedFeaturedLooksForItem(item);
        return;
      }
    }
    const themeButton = event.target.closest("[data-theme-choice]");
    if (themeButton) {
      event.preventDefault();
      event.stopPropagation();
      applyThemePreference(themeButton.dataset.themeChoice || "system");
      renderAuthSummary();
      return;
    }
    const createToggle = event.target.closest("#create-item-btn");
    if (createToggle) {
      if (state.createItemMode) {
        closeCreateItemPanel();
      } else {
        openCreateItemPanel();
      }
      return;
    }
    const passwordToggleButton = event.target.closest("#password-change-toggle-btn");
    if (passwordToggleButton) {
      setPasswordChangeOpen(!state.passwordChangeOpen);
      renderAuthSummary();
      if (state.passwordChangeOpen) {
        window.requestAnimationFrame(() => {
          $("auth-summary-card")?.querySelector('[data-password-change-field="current_password"]')?.focus?.();
        });
      }
      return;
    }
    const createKindButton = event.target.closest("[data-create-kind]");
    if (createKindButton) {
      switchCreateItemKind(createKindButton.dataset.createKind || "wardrobe");
      return;
    }
    const createSaveButton = event.target.closest("#create-item-save-btn");
    if (createSaveButton) {
      await saveCreateItem();
      return;
    }
    const createCancelButton = event.target.closest("#create-item-cancel-btn");
    if (createCancelButton) {
      closeCreateItemPanel();
      return;
    }
    const catalogSaveButton = event.target.closest("[data-catalog-save]");
    if (catalogSaveButton) {
      await saveCatalogOption(catalogSaveButton.dataset.catalogSave || "");
      return;
    }
    const maintenanceButton = event.target.closest("[data-maintenance-item-id]");
    if (maintenanceButton) {
      const action = maintenanceButton.dataset.maintenanceAction || "maintain";
      if (action === "activate") {
        await activateMaintainedItem(maintenanceButton.dataset.maintenanceItemId || "0");
      } else {
        await sendItemToMaintenance(maintenanceButton.dataset.maintenanceItemId || "0");
      }
      return;
    }
    const installButton = event.target.closest("#install-app-btn");
    if (installButton) {
      await promptInstallApp();
      return;
    }
    const refreshButton = event.target.closest("#manual-refresh-btn, #sidebar-refresh-btn, #page-menu-refresh-btn");
    if (refreshButton) {
      setPageActionMenuOpen(false);
      await refreshAppData({ showOverlay: true });
      return;
    }
    const passwordResetButton = event.target.closest("#password-change-reset-btn");
    if (passwordResetButton) {
      resetPasswordChangeState();
      renderAuthSummary();
      return;
    }
    const logoutButton = event.target.closest("#logout-btn");
    if (!logoutButton) return;
    await logout();
  });

  document.addEventListener("change", async (event) => {
    const input = event.target;
    if (input instanceof HTMLSelectElement && input.id === "login-username") {
      state.loginSelectedUser = input.value;
      showLoginOverlay();
      return;
    }
    if (input instanceof HTMLInputElement && input.matches("[data-create-field]")) {
      ensureCreateItemDraft(state.createItemKind);
      state.createItemDraft[input.dataset.createField] = input.value;
      return;
    }
    if (input instanceof HTMLInputElement && input.matches("[data-password-change-field]")) {
      ensurePasswordChangeDraft();
      state.passwordChangeDraft[input.dataset.passwordChangeField] = input.value;
      state.passwordChangeError = "";
      state.passwordChangeSuccess = "";
      return;
    }
    if (input instanceof HTMLSelectElement && input.matches("[data-create-field]")) {
      ensureCreateItemDraft(state.createItemKind);
      state.createItemDraft[input.dataset.createField] = input.value;
      state.createItemDraft = normalizeItemDraftPayload(state.createItemDraft, { kind: state.createItemKind });
      if (input.dataset.createField === "layer_role") {
        renderCreateItemPanel();
      }
      return;
    }
    if (!(input instanceof HTMLInputElement) || !input.classList.contains("entity-photo-input")) return;
    const uploadUrl = input.dataset.uploadUrl || "";
    const entityType = input.dataset.entityType || "";
    const entityId = Number(input.dataset.entityId || "");
    const files = input.files;
    if (!uploadUrl || !entityType || !entityId || !files?.length) return;
    try {
      await uploadSelectedEntityPhotos(uploadUrl, entityType, entityId, files);
    } catch (error) {
      alert(error?.message || "图片上传失败。");
    } finally {
      input.value = "";
    }
  });

  document.addEventListener("input", (event) => {
    return;
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === "password-change-form") {
      event.preventDefault();
      await submitPasswordChange();
      return;
    }
    if (form.id !== "login-form") return;
    event.preventDefault();
    const username = $("login-username")?.value || state.loginSelectedUser;
    const password = $("login-password")?.value || "";
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = await response.json();
    state.authAccounts = payload.accounts || state.authAccounts;
    state.loginSelectedUser = username;
    if (payload.authenticated) {
      state.authenticated = true;
      state.authUser = payload.username || username;
      state.authIsAdmin = Boolean(payload.is_admin);
      setCookie(LAST_LOGIN_USER_COOKIE, state.authUser);
      state.inventoryOwnerInitialized = false;
      state.brandShareOwnerSelectionInitialized = false;
      state.maintenanceFilters.brands = [];
      state.maintenanceFilters.roles = [];
      state.maintenanceKnownBrands = [];
      state.maintenanceKnownRoles = [];
      state.maintenanceBrandInitialized = false;
      state.maintenanceRoleInitialized = false;
      resetPasswordChangeState();
      hideLoginOverlay();
      await bootstrapAuthenticatedApp();
      return;
    }
    state.authenticated = false;
    state.authUser = "";
    state.authIsAdmin = false;
    const note = payload.locked
      ? "密码错误三次，当前用户名已锁定。"
      : payload.remaining_attempts >= 0
        ? `密码错误，还剩 ${payload.remaining_attempts} 次机会。`
        : "登录失败。";
    showLoginOverlay(note);
  });

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.matches("[data-password-change-field]")) {
      ensurePasswordChangeDraft();
      state.passwordChangeDraft[input.dataset.passwordChangeField] = input.value;
      state.passwordChangeError = "";
      state.passwordChangeSuccess = "";
      return;
    }
    if (!(input instanceof HTMLTextAreaElement) || !input.matches("[data-create-field]")) return;
    ensureCreateItemDraft(state.createItemKind);
    state.createItemDraft[input.dataset.createField] = input.value;
  });

  window.addEventListener("hashchange", () => {
    handleRoute().catch((error) => console.error(error));
  });
  window.addEventListener("message", (event) => {
    if (event.source && event.source !== window.parent) return;
    if (handlePluginViewportMessage(event.data)) return;
    if (!isPluginBackMessage(event.data)) return;
    handlePluginBackRequest()
      .then((handled) => {
        if (!isHermesPluginEmbed() || window.parent === window) return;
        window.parent.postMessage({
          source: "wardrobe-plugin",
          plugin_id: PLUGIN_ID,
          type: "wardrobe.plugin.back_result",
          version: PLUGIN_NAVIGATION_MESSAGE_VERSION,
          handled: Boolean(handled),
          route: currentPluginRouteSummary(),
          navigation: pluginNavigationState(),
        }, "*");
      })
      .catch((error) => {
        console.error(error);
        announcePluginNavigationState();
      });
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPromptEvent = event;
    state.installPromptAvailable = true;
    state.installStatusText = "";
    renderAuthSummary();
  });
  window.addEventListener("appinstalled", () => {
    if (state.installRetryTimer) {
      window.clearTimeout(state.installRetryTimer);
      state.installRetryTimer = null;
    }
    state.installPromptEvent = null;
    state.installPromptAvailable = false;
    state.installStatusText = "已安装";
    renderAuthSummary();
  });

  $("nav-toggle-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    togglePageActionMenu();
  });
  $("sidebar-close-btn")?.addEventListener("click", () => setSidebarOpen(false));
  $("sidebar-overlay")?.addEventListener("click", () => setSidebarOpen(false));
  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("page-action-menu-open")) return;
    if (event.target.closest("#page-action-menu, #nav-toggle-btn")) return;
    setPageActionMenuOpen(false);
  });
  $("photo-lightbox")?.addEventListener("click", (event) => {
    if (event.target === $("photo-lightbox")) closePhotoLightbox();
  });
  $("photo-lightbox-close")?.addEventListener("click", closePhotoLightbox);
  $("photo-lightbox-delete")?.addEventListener("click", async (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (state.photoLightboxDeleting) return;
    const currentPhoto = state.photoLightboxPhotos[state.photoLightboxIndex];
    const deletePath = currentPhoto?.delete_path;
    const context = state.photoLightboxContext;
    if (!deletePath || !context) return;
    if (!confirmPhotoDelete(currentPhoto, context)) return;
    state.photoLightboxDeleting = true;
    updatePhotoLightbox();
    try {
      await api(deletePath, { method: "DELETE" });
      if (context.entityType === "item") {
        const item = await selectItem(context.entityId);
        await refreshItems();
        if (!item?.photos?.length) {
          closePhotoLightbox();
          return;
        }
        if (state.photoLightboxIndex >= item.photos.length) {
          state.photoLightboxIndex = item.photos.length - 1;
        }
        openPhotoLightbox(item.photos, state.photoLightboxIndex, context);
        return;
      }
      if (context.entityType === "outfit") {
        await refreshOutfits();
      } else if (context.entityType === "featured-look") {
        await refreshFeaturedLooks();
      }
      const photos = photosForContext(context.entityType, context.entityId);
      if (!photos.length) {
        closePhotoLightbox();
        return;
      }
      if (state.photoLightboxIndex >= photos.length) {
        state.photoLightboxIndex = photos.length - 1;
      }
      openPhotoLightbox(photos, state.photoLightboxIndex, context);
    } catch (error) {
      window.alert(parseApiErrorMessage(error) || "图片删除失败。");
    } finally {
      state.photoLightboxDeleting = false;
      if ((state.photoLightboxPhotos || []).length) {
        updatePhotoLightbox();
      }
    }
  });
  $("photo-lightbox-prev")?.addEventListener("click", (event) => {
    event.stopPropagation();
    movePhotoLightbox(-1);
  });
  $("photo-lightbox-next")?.addEventListener("click", (event) => {
    event.stopPropagation();
    movePhotoLightbox(1);
  });
  $("photo-lightbox-stage")?.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch) return;
    state.photoLightboxTouchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  $("photo-lightbox-stage")?.addEventListener("touchend", (event) => {
    const touch = event.changedTouches?.[0];
    const start = state.photoLightboxTouchStart;
    state.photoLightboxTouchStart = null;
    if (!touch || !start) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 24 && Math.abs(deltaY) < 24) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      movePhotoLightbox(deltaX < 0 ? 1 : -1);
      return;
    }
    closePhotoLightbox();
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("page-action-menu-open")) {
      setPageActionMenuOpen(false);
      return;
    }
    if ($("photo-lightbox")?.hidden) return;
    if (event.key === "Escape") closePhotoLightbox();
    if (event.key === "ArrowLeft") movePhotoLightbox(-1);
    if (event.key === "ArrowRight") movePhotoLightbox(1);
  });
  document.querySelectorAll(".sort-header").forEach((button) => {
    button.addEventListener("click", () => {
      const table = button.dataset.sortTable || "inventory";
      const sortState = table === "watch" ? state.watchSort : state.inventorySort;
      const key = button.dataset.sortKey;
      if (sortState.key === key) {
        sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
      } else {
        sortState.key = key;
        sortState.direction = "asc";
      }
      if (table === "watch") {
        renderWatchItems();
      } else {
        renderItems();
      }
    });
  });

  $("search-input").addEventListener("input", refreshItems);
  $("search-input").addEventListener("change", refreshItems);
  $("search-input").addEventListener("input", updateInventorySearchUi);
  $("search-clear-btn")?.addEventListener("click", async () => {
    $("search-input").value = "";
    updateInventorySearchUi();
    await refreshItems();
  });
  $("watch-search-input")?.addEventListener("input", refreshWatchItems);
  $("watch-search-input")?.addEventListener("change", refreshWatchItems);
  $("watch-search-input")?.addEventListener("input", updateWatchSearchUi);
  $("watch-search-clear-btn")?.addEventListener("click", async () => {
    $("watch-search-input").value = "";
    updateWatchSearchUi();
    await refreshWatchItems();
  });
  $("featured-looks-search-input")?.addEventListener("input", () => {
    updateFeaturedLooksSearchUi();
    renderFeaturedLooks();
  });
  $("featured-looks-search-input")?.addEventListener("change", renderFeaturedLooks);
  $("featured-looks-search-clear-btn")?.addEventListener("click", () => {
    $("featured-looks-search-input").value = "";
    updateFeaturedLooksSearchUi();
    renderFeaturedLooks();
  });
  $("featured-look-owner-select")?.addEventListener("change", () => {
    state.featuredLookSelectedOwner = $("featured-look-owner-select").value || "";
    closeFeaturedLookEdit();
    renderFeaturedLooks();
  });
  $("maintenance-search-input")?.addEventListener("input", () => {
    updateMaintenanceSearchUi();
    refreshMaintenancePlanning();
  });
  $("maintenance-search-input")?.addEventListener("change", refreshMaintenancePlanning);
  $("maintenance-search-clear-btn")?.addEventListener("click", () => {
    $("maintenance-search-input").value = "";
    updateMaintenanceSearchUi();
    refreshMaintenancePlanning();
  });
  $("outfit-create-today-btn")?.addEventListener("click", async () => {
    if (state.outfitCreateMode) {
      closeOutfitCreate();
      renderSelectedOutfit();
      return;
    }
    if (todayOutfitSummary(loggedInOwner())) {
      return;
    }
    clearRelatedOutfitFilter();
    state.outfitSelectedOwner = loggedInOwner() || state.outfitSelectedOwner;
    openOutfitCreate();
    renderSelectedOutfit();
  });
  $("outfit-owner-select")?.addEventListener("change", () => {
    state.outfitSelectedOwner = $("outfit-owner-select").value || "";
    closeOutfitEdit();
    renderSelectedOutfit();
  });
  $("outfit-photos-only")?.addEventListener("change", () => {
    state.outfitPhotosOnly = Boolean($("outfit-photos-only")?.checked);
    closeOutfitEdit();
    renderSelectedOutfit();
  });

  $("new-item-btn")?.addEventListener("click", resetItemForm);
  $("reset-item-btn")?.addEventListener("click", resetItemForm);

  $("item-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = itemPayload();
      if ($("item-id").value) {
        await api(`/api/items/${$("item-id").value}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const created = await api("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        state.selectedItemId = created.id;
        $("item-id").value = created.id;
      }
      await refreshOptions();
      await refreshItems();
      if (state.selectedItemId) await selectItem(state.selectedItemId);
    } catch (error) {
      window.alert(error?.message || "保存失败");
    }
  });

  $("delete-item-btn")?.addEventListener("click", async () => {
    const id = $("item-id").value;
    if (!id) return;
    await api(`/api/items/${id}`, { method: "DELETE" });
    resetItemForm();
    if (window.location.hash === `#item-${id}`) {
      window.location.hash = "inventory";
    }
    await refreshOptions();
    await refreshItems();
  });

  $("detail-back-btn")?.addEventListener("click", () => {
    window.location.hash = "inventory";
  });

  const authenticated = await ensureAuthenticated();
  if (!authenticated) return;
  await bootstrapAuthenticatedApp();
}

function disableMobileZoom() {
  let lastTouchEnd = 0;
  document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
  }, { passive: false });
  document.addEventListener("gesturechange", (event) => {
    event.preventDefault();
  }, { passive: false });
  document.addEventListener("gestureend", (event) => {
    event.preventDefault();
  }, { passive: false });
  document.addEventListener("touchend", (event) => {
    if (shouldAllowHostEdgeSwipe(event)) return;
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

disableMobileZoom();

init().catch((error) => {
  console.error(error);
  alert(`初始化失败: ${error.message}`);
});
