(function bindWardrobePluginActionRoutes(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = contract;
  }
  root.WardrobePluginActionRoutes = contract;
})(typeof globalThis !== "undefined" ? globalThis : window, function buildWardrobePluginActionRoutes() {
  const routes = Object.freeze({
    style: "#featured-looks?mode=style",
    today: "#outfits?mode=today",
    add_item: "#inventory?mode=add_item",
    inventory: "#inventory",
    outfit_history: "#outfits?mode=history",
    packing: "#featured-looks?mode=packing",
  });

  function normalizeActionRoute(route) {
    return String(route || "").trim().toLowerCase();
  }

  function routeForPluginAction(route) {
    return routes[normalizeActionRoute(route)] || "";
  }

  function actionStateForHash(rawHash) {
    const cleanHash = String(rawHash || "").replace(/^#/, "");
    const [tab = "", rawQuery = ""] = cleanHash.split("?");
    const params = new URLSearchParams(rawQuery);
    const mode = String(params.get("mode") || "").trim().toLowerCase();
    const normalizedTab = tab === "recommend" ? "featured-looks" : tab;
    const featuredLookMode = normalizedTab === "featured-looks" && (mode === "style" || mode === "packing")
      ? mode
      : "";

    return Object.freeze({
      tab: normalizedTab || "inventory",
      mode,
      opensCreateItem: normalizedTab === "inventory" && mode === "add_item",
      opensTodayOutfit: normalizedTab === "outfits" && mode === "today",
      featuredLookMode,
    });
  }

  return Object.freeze({
    version: "20260624-action-routes",
    routes,
    normalizeActionRoute,
    routeForPluginAction,
    actionStateForHash,
  });
});
