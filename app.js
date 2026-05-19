const STORAGE_KEY = "warenherstellung_calculator_v4_empty";
const ADMIN_FLAG_KEY = "warenherstellung_calculator_edit_unlocked";
const BUNDLED_DATA_URL = "waren-daten.json";
const EDIT_CONFIRMATION_TEXT = [
  "Bearbeitung auf eigene Gefahr freischalten?",
  "",
  "Änderungen werden lokal im Browser gespeichert und können bestehende Material-, Rezept- und Preisdaten überschreiben.",
  "Vor größeren Änderungen sollte vorher über Daten > Daten exportieren eine Sicherung erstellt werden.",
  "",
  "Dieser Schalter ist kein echter Zugriffsschutz, sondern verhindert nur versehentliche Bearbeitung auf einer statischen GitHub-Pages-Seite."
].join("\n");

const FACTORIES = {
  steel: "Stahlfabrik",
  vehicle: "Fahrzeugfabrik",
  clothing: "Kleidungsfabrik",
  aircraft: "Luftfahrzeugsfabrik",
  boat: "Bootsfabrik",
  oil: "Ölfabrik",
  goods: "Warenfabrik",
  food: "Essensfabrik",
  chemistry: "Chemiefabrik",
  illegalWeapons: "Illegale Waffenfabrik"
};

const DEFAULT_RAW_MATERIALS = [
  "Aluminiumerz",
  "Kohleerz",
  "Rohöl",
  "Smaragderz",
  "Eisenerz",
  "Saphirerz",
  "Vivianiterz"
];

let state = loadState();
let adminUnlocked = localStorage.getItem(ADMIN_FLAG_KEY) === "1";
let materialSearchQuery = "";
let tradeSearchQuery = "";
const productSearchQueries = {};
let inventoryDraftRows = [];
let materialDialogMode = "create";
let materialDialogOriginalName = null;
let materialDialogRecipe = [];
let productDialogMode = "create";
let productDialogFactory = null;
let productDialogProductId = null;
let productDialogRecipe = [];
let tradeDraftRows = [];
let tradeDialogMode = "create";
let tradeDialogOriginalName = null;
let farmSearchQuery = "";
let farmDialogMode = "create";
let farmDialogOriginalName = null;

const els = {
  tabs: document.querySelector("#tabs"),
  factoryPanels: document.querySelector("#factoryPanels"),
  materialsTableBody: document.querySelector("#materialsTable tbody"),
  planTableBody: document.querySelector("#planTable tbody"),
  inventoryTableBody: document.querySelector("#inventoryTable tbody"),
  inventoryItemOptions: document.querySelector("#inventoryItemOptions"),
  addInventoryItemBtn: document.querySelector("#addInventoryItemBtn"),
  resetInventoryBtn: document.querySelector("#resetInventoryBtn"),
  requirementsTableBody: document.querySelector("#requirementsTable tbody"),
  rawRequirementsTableBody: document.querySelector("#rawRequirementsTable tbody"),
  rawRequirementsHint: document.querySelector("#rawRequirementsHint"),
  economyTableBody: document.querySelector("#economyTable tbody"),
  economyHint: document.querySelector("#economyHint"),
  standardMarginInput: document.querySelector("#standardMarginInput"),
  addPlanRowBtn: document.querySelector("#addPlanRowBtn"),
  clearPlanBtn: document.querySelector("#clearPlanBtn"),
  addMaterialBtn: document.querySelector("#addMaterialBtn"),
  materialSearchInput: document.querySelector("#materialSearchInput"),
  tradeTableBody: document.querySelector("#tradeTable tbody"),
  tradeSearchInput: document.querySelector("#tradeSearchInput"),
  tradeSearchCount: document.querySelector("#tradeSearchCount"),
  addTradeItemBtn: document.querySelector("#addTradeItemBtn"),
  tradeItemOptions: document.querySelector("#tradeItemOptions"),
  laborHourlyValueInput: document.querySelector("#laborHourlyValueInput"),
  farmTableBody: document.querySelector("#farmTable tbody"),
  farmItemOptions: document.querySelector("#farmItemOptions"),
  farmSearchInput: document.querySelector("#farmSearchInput"),
  farmSearchCount: document.querySelector("#farmSearchCount"),
  addFarmProfileBtn: document.querySelector("#addFarmProfileBtn"),
  farmDialog: document.querySelector("#farmDialog"),
  farmForm: document.querySelector("#farmForm"),
  farmDialogEyebrow: document.querySelector("#farmDialogEyebrow"),
  farmDialogTitle: document.querySelector("#farmDialogTitle"),
  farmDialogIntro: document.querySelector("#farmDialogIntro"),
  farmDialogSubmitBtn: document.querySelector("#farmDialogSubmitBtn"),
  farmDialogName: document.querySelector("#farmDialogName"),
  farmDialogEnabled: document.querySelector("#farmDialogEnabled"),
  farmDialogRate: document.querySelector("#farmDialogRate"),
  farmDialogUnitCost: document.querySelector("#farmDialogUnitCost"),
  closeFarmDialogBtn: document.querySelector("#closeFarmDialogBtn"),
  cancelFarmDialogBtn: document.querySelector("#cancelFarmDialogBtn"),
  tradeDialog: document.querySelector("#tradeDialog"),
  tradeForm: document.querySelector("#tradeForm"),
  tradeDialogEyebrow: document.querySelector("#tradeDialogEyebrow"),
  tradeDialogTitle: document.querySelector("#tradeDialogTitle"),
  tradeDialogIntro: document.querySelector("#tradeDialogIntro"),
  tradeDialogSubmitBtn: document.querySelector("#tradeDialogSubmitBtn"),
  tradeDialogName: document.querySelector("#tradeDialogName"),
  tradeDialogImport: document.querySelector("#tradeDialogImport"),
  tradeDialogExport: document.querySelector("#tradeDialogExport"),
  tradeDialogMarket: document.querySelector("#tradeDialogMarket"),
  closeTradeDialogBtn: document.querySelector("#closeTradeDialogBtn"),
  cancelTradeDialogBtn: document.querySelector("#cancelTradeDialogBtn"),
  copyMaterialsBtn: document.querySelector("#copyMaterialsBtn"),
  copyRawMaterialsBtn: document.querySelector("#copyRawMaterialsBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  resetDataBtn: document.querySelector("#resetDataBtn"),
  loadBundledDataBtn: document.querySelector("#loadBundledDataBtn"),
  adminAccessBtn: document.querySelector("#adminAccessBtn"),
  backToTopBtn: document.querySelector("#backToTopBtn"),
  floatingAddBtn: document.querySelector("#floatingAddBtn"),
  addMaterialDialog: document.querySelector("#addMaterialDialog"),
  addMaterialForm: document.querySelector("#addMaterialForm"),
  closeMaterialDialogBtn: document.querySelector("#closeMaterialDialogBtn"),
  cancelMaterialDialogBtn: document.querySelector("#cancelMaterialDialogBtn"),
  materialDialogTitle: document.querySelector("#materialDialogTitle"),
  materialDialogEyebrow: document.querySelector("#materialDialogEyebrow"),
  materialDialogIntro: document.querySelector("#materialDialogIntro"),
  materialDialogSubmitBtn: document.querySelector("#materialDialogSubmitBtn"),
  newMaterialName: document.querySelector("#newMaterialName"),
  newMaterialOutput: document.querySelector("#newMaterialOutput"),
  newMaterialUnitPrice: document.querySelector("#newMaterialUnitPrice"),
  materialHasRecipeCheckbox: document.querySelector("#materialHasRecipeCheckbox"),
  materialRecipeEditor: document.querySelector("#materialRecipeEditor"),
  addMaterialDialogRecipeRowBtn: document.querySelector("#addMaterialDialogRecipeRowBtn"),
  materialDialogRecipeTableBody: document.querySelector("#materialDialogRecipeTable tbody"),
  productDialog: document.querySelector("#productDialog"),
  productForm: document.querySelector("#productForm"),
  closeProductDialogBtn: document.querySelector("#closeProductDialogBtn"),
  cancelProductDialogBtn: document.querySelector("#cancelProductDialogBtn"),
  productDialogTitle: document.querySelector("#productDialogTitle"),
  productDialogEyebrow: document.querySelector("#productDialogEyebrow"),
  productDialogIntro: document.querySelector("#productDialogIntro"),
  productDialogSubmitBtn: document.querySelector("#productDialogSubmitBtn"),
  productFactoryLabel: document.querySelector("#productFactoryLabel"),
  newProductName: document.querySelector("#newProductName"),
  newProductOutput: document.querySelector("#newProductOutput"),
  productTradeAlias: document.querySelector("#productTradeAlias"),
  productTradeAliasOptions: document.querySelector("#productTradeAliasOptions"),
  addProductDialogRecipeRowBtn: document.querySelector("#addProductDialogRecipeRowBtn"),
  productDialogRecipeTableBody: document.querySelector("#productDialogRecipeTable tbody"),
  kpiPositions: document.querySelector("#kpiPositions"),
  kpiRuns: document.querySelector("#kpiRuns"),
  kpiMaterials: document.querySelector("#kpiMaterials"),
  factoryPanelTemplate: document.querySelector("#factoryPanelTemplate"),
  productTemplate: document.querySelector("#productTemplate"),
  planRowTemplate: document.querySelector("#planRowTemplate"),
  materialDialogRecipeRowTemplate: document.querySelector("#materialDialogRecipeRowTemplate"),
  productDialogRecipeRowTemplate: document.querySelector("#productDialogRecipeRowTemplate")
};

init();

async function init() {
  bindStaticEvents();
  await bootstrapBundledData(false);
  renderAll();
}

function bindStaticEvents() {
  els.tabs.addEventListener("click", (event) => {
    const menuToggle = event.target.closest(".factory-menu-toggle");
    if (menuToggle) {
      toggleFactoryMenu();
      return;
    }

    const navItem = event.target.closest("[data-target]");
    if (!navItem) return;

    activateTab(navItem.dataset.target);
    closeFactoryMenu();
  });

  document.addEventListener("click", (event) => {
    if (!els.tabs.contains(event.target)) closeFactoryMenu();

    const dataActions = document.querySelector(".data-actions");
    if (dataActions && !dataActions.contains(event.target)) dataActions.removeAttribute("open");
  });

  els.addMaterialBtn.addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    openMaterialDialogCreate();
  });
  els.addPlanRowBtn.addEventListener("click", addPlanRow);
  if (els.clearPlanBtn) els.clearPlanBtn.addEventListener("click", clearPlan);
  if (els.addInventoryItemBtn) els.addInventoryItemBtn.addEventListener("click", addInventoryItem);
  if (els.resetInventoryBtn) els.resetInventoryBtn.addEventListener("click", resetInventory);
  if (els.materialSearchInput) {
    els.materialSearchInput.addEventListener("input", () => {
      materialSearchQuery = cleanText(els.materialSearchInput.value);
      renderMaterials();
      applyResponsiveTableLabels();
    });
  }
  if (els.tradeSearchInput) {
    els.tradeSearchInput.addEventListener("input", () => {
      tradeSearchQuery = cleanText(els.tradeSearchInput.value);
      renderTrade();
      applyResponsiveTableLabels();
    });
  }
  if (els.addTradeItemBtn) els.addTradeItemBtn.addEventListener("click", openTradeDialogCreate);
  if (els.laborHourlyValueInput) {
    els.laborHourlyValueInput.addEventListener("change", () => {
      if (!requireAdminAccess()) {
        els.laborHourlyValueInput.value = formatInputNumber(positiveNumber(state.labor?.hourlyValue, 0));
        return;
      }
      state.labor ??= {};
      state.labor.hourlyValue = positiveNumber(els.laborHourlyValueInput.value, 0);
      renderAll();
      activateTab("farmrates");
    });
  }
  if (els.farmSearchInput) {
    els.farmSearchInput.addEventListener("input", () => {
      farmSearchQuery = cleanText(els.farmSearchInput.value);
      renderFarmRates();
      applyResponsiveTableLabels();
    });
  }
  if (els.addFarmProfileBtn) els.addFarmProfileBtn.addEventListener("click", openFarmDialogCreate);
  els.copyMaterialsBtn.addEventListener("click", copyRequirementsTable);
  els.copyRawMaterialsBtn.addEventListener("click", copyRawRequirementsTable);
  els.exportDataBtn.addEventListener("click", exportData);
  els.importDataInput.addEventListener("change", importData);
  els.resetDataBtn.addEventListener("click", resetData);
  if (els.loadBundledDataBtn) els.loadBundledDataBtn.addEventListener("click", loadBundledDataFromMenu);
  if (els.adminAccessBtn) els.adminAccessBtn.addEventListener("click", toggleAdminAccess);
  if (els.backToTopBtn) {
    els.backToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    updateBackToTopVisibility();
  }
  if (els.floatingAddBtn) {
    els.floatingAddBtn.addEventListener("click", handleFloatingAdd);
  }
  els.standardMarginInput.addEventListener("change", () => {
    if (!requireAdminAccess()) {
      els.standardMarginInput.value = formatInputNumber(state.pricing.standardMarginPercent);
      return;
    }
    state.pricing.standardMarginPercent = positiveNumber(els.standardMarginInput.value, 0);
    renderAll();
  });

  els.addMaterialForm.addEventListener("submit", saveMaterialFromDialog);
  els.closeMaterialDialogBtn.addEventListener("click", closeMaterialDialog);
  els.cancelMaterialDialogBtn.addEventListener("click", closeMaterialDialog);
  els.materialHasRecipeCheckbox.addEventListener("change", handleMaterialRecipeCheckboxChange);
  els.addMaterialDialogRecipeRowBtn.addEventListener("click", addMaterialDialogRecipeRow);
  document.addEventListener("mousedown", preventNonInputCaret);
  els.addMaterialDialog.addEventListener("click", (event) => {
    if (event.target === els.addMaterialDialog) closeMaterialDialog();
  });

  els.productForm.addEventListener("submit", saveProductFromDialog);
  els.closeProductDialogBtn.addEventListener("click", closeProductDialog);
  els.cancelProductDialogBtn.addEventListener("click", closeProductDialog);
  els.addProductDialogRecipeRowBtn.addEventListener("click", addProductDialogRecipeRow);
  els.productDialog.addEventListener("click", (event) => {
    if (event.target === els.productDialog) closeProductDialog();
  });

  if (els.tradeForm) els.tradeForm.addEventListener("submit", handleTradeDialogSubmit);
  if (els.closeTradeDialogBtn) els.closeTradeDialogBtn.addEventListener("click", closeTradeDialog);
  if (els.cancelTradeDialogBtn) els.cancelTradeDialogBtn.addEventListener("click", closeTradeDialog);
  if (els.tradeDialog) {
    els.tradeDialog.addEventListener("click", (event) => {
      if (event.target === els.tradeDialog) closeTradeDialog();
    });
  }

  if (els.farmForm) els.farmForm.addEventListener("submit", handleFarmDialogSubmit);
  if (els.closeFarmDialogBtn) els.closeFarmDialogBtn.addEventListener("click", closeFarmDialog);
  if (els.cancelFarmDialogBtn) els.cancelFarmDialogBtn.addEventListener("click", closeFarmDialog);
  if (els.farmDialogRate) els.farmDialogRate.addEventListener("input", updateFarmDialogUnitCost);
  if (els.farmDialogEnabled) els.farmDialogEnabled.addEventListener("change", updateFarmDialogUnitCost);
  if (els.farmDialog) {
    els.farmDialog.addEventListener("click", (event) => {
      if (event.target === els.farmDialog) closeFarmDialog();
    });
  }
}

function renderAll() {
  normalizeState();
  updateAdminUi();
  renderFactoryNavigation();
  renderFactoryPanels();
  renderMaterials();
  renderTrade();
  renderFarmRates();
  renderPlan();
  renderInventory();
  renderRequirements();
  renderEconomy();
  if (els.standardMarginInput) els.standardMarginInput.value = formatInputNumber(state.pricing.standardMarginPercent);
  applyResponsiveTableLabels();
  saveState();
}

function renderFactoryNavigation() {
  const activeTarget = document.querySelector(".panel.active")?.id || "calculator";
  els.tabs.innerHTML = "";

  const primaryRow = document.createElement("div");
  primaryRow.className = "primary-tab-row";

  const calculatorButton = createPrimaryTab("calculator", "Calculator", activeTarget === "calculator");

  const factoryGroup = document.createElement("div");
  factoryGroup.className = "nav-dropdown";
  const factoryButton = document.createElement("button");
  factoryButton.className = "tab factory-menu-toggle";
  factoryButton.type = "button";
  factoryButton.setAttribute("aria-expanded", "false");
  factoryButton.textContent = "Fabriken";
  if (Object.hasOwn(FACTORIES, activeTarget)) factoryButton.classList.add("active");

  const factoryMenu = document.createElement("div");
  factoryMenu.className = "factory-menu";
  factoryMenu.setAttribute("aria-label", "Fabriken auswählen");

  for (const [target, label] of Object.entries(FACTORIES)) {
    const button = document.createElement("button");
    button.className = "factory-menu-item";
    button.dataset.target = target;
    button.type = "button";
    button.textContent = label;
    if (target === activeTarget) button.classList.add("active");
    factoryMenu.appendChild(button);
  }

  factoryGroup.append(factoryButton, factoryMenu);

  const materialsButton = createPrimaryTab("materials", "Materialien", activeTarget === "materials");
  const tradeButton = createPrimaryTab("trade", "Handel", activeTarget === "trade");
  const farmRatesButton = createPrimaryTab("farmrates", "Farmraten", activeTarget === "farmrates");

  primaryRow.append(calculatorButton, factoryGroup, materialsButton, tradeButton, farmRatesButton);
  els.tabs.append(primaryRow);
}

function createPrimaryTab(target, label, isActive) {
  const button = document.createElement("button");
  button.className = "tab";
  button.dataset.target = target;
  button.type = "button";
  button.textContent = label;
  if (isActive) button.classList.add("active");
  return button;
}

function toggleFactoryMenu() {
  const menu = els.tabs.querySelector(".factory-menu");
  const toggle = els.tabs.querySelector(".factory-menu-toggle");
  if (!menu || !toggle) return;
  const willOpen = !menu.classList.contains("open");
  menu.classList.toggle("open", willOpen);
  toggle.setAttribute("aria-expanded", String(willOpen));
}

function closeFactoryMenu() {
  const menu = els.tabs.querySelector(".factory-menu");
  const toggle = els.tabs.querySelector(".factory-menu-toggle");
  if (!menu || !toggle) return;
  menu.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}

function renderFactoryPanels() {
  const activeTarget = document.querySelector(".panel.active")?.id || document.querySelector(".tab.active")?.dataset.target || "calculator";
  els.factoryPanels.innerHTML = "";

  for (const [factory, label] of Object.entries(FACTORIES)) {
    const panel = els.factoryPanelTemplate.content.firstElementChild.cloneNode(true);
    panel.id = factory;
    panel.querySelector(".factory-title").textContent = `${label}-Rezepte`;
    const addButton = panel.querySelector(".add-product-btn");
    addButton.addEventListener("click", () => {
      if (!requireAdminAccess()) return;
      openProductDialogCreate(factory);
    });
    addButton.hidden = !adminUnlocked;

    const searchInput = panel.querySelector(".product-search-input");
    const searchCount = panel.querySelector(".product-search-count");
    const factoryQuery = productSearchQueries[factory] || "";
    if (searchInput) {
      searchInput.value = factoryQuery;
      searchInput.addEventListener("input", () => {
        productSearchQueries[factory] = cleanText(searchInput.value);
        renderProductListForFactory(panel, factory);
      });
    }

    renderProductListForFactory(panel, factory);
    if (searchCount) searchCount.hidden = !adminUnlocked;

    els.factoryPanels.appendChild(panel);
  }

  activateTab(document.getElementById(activeTarget) ? activeTarget : "calculator");
}

function renderProductListForFactory(panel, factory) {
  const container = panel.querySelector(".product-list");
  const searchCount = panel.querySelector(".product-search-count");
  if (!container) return;

  const allProducts = (state.products[factory] ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
  const query = productSearchQueries[factory] || "";
  const visibleProducts = adminUnlocked && query ? allProducts.filter((product) => productMatchesSearch(factory, product, query)) : allProducts;

  container.innerHTML = "";
  if (!allProducts.length) {
    container.innerHTML = `<div class="empty-state">Noch keine Waren vorhanden.</div>`;
  } else if (!visibleProducts.length) {
    container.innerHTML = `<div class="empty-state">Keine Ware passend zur Suche gefunden.</div>`;
  } else {
    visibleProducts.forEach((product) => container.appendChild(createProductCard(factory, product)));
  }

  if (searchCount) {
    searchCount.textContent = query
      ? `${visibleProducts.length.toLocaleString("de-DE")} von ${allProducts.length.toLocaleString("de-DE")} Waren`
      : `${allProducts.length.toLocaleString("de-DE")} Waren`;
  }
}

function productMatchesSearch(factory, product, query) {
  const haystack = [
    FACTORIES[factory],
    product.name,
    product.output,
    getTradeImportPrice(product.name),
    getTradeExportPrice(product.name),
    getTradeMarketValue(product.name),
    getExplicitTradeAlias(product.name),
    resolveTradeKey(product.name),
    ...(product.recipe ?? []).flatMap((item) => [item.material, item.amount])
  ].map((value) => cleanText(value)).join(" ").toLocaleLowerCase("de-DE");
  return haystack.includes(cleanText(query).toLocaleLowerCase("de-DE"));
}

function createProductCard(factory, product) {
  const node = els.productTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.productId = product.id;
  node.classList.toggle("locked-entry", !adminUnlocked);
  node.querySelector(".product-name-display").textContent = product.name;
  node.querySelector(".product-output-display").textContent = positiveInteger(product.output, 1).toLocaleString("de-DE");
  const baseCost = calculateProductUnitCostWithOptimalInputs(product, new Set());
  const sale = getSalePrice(product, baseCost.complete ? baseCost.unitCost : null);
  const priceDisplay = node.querySelector(".product-price-display");
  if (priceDisplay) priceDisplay.textContent = sale.price > 0 ? `${formatMoney(sale.price)} · ${sale.source}` : "nicht gesetzt";

  const recipeBody = node.querySelector(".recipe-table tbody");
  if (!product.recipe.length) {
    recipeBody.innerHTML = `<tr><td colspan="2" class="empty-state">Kein Rezept hinterlegt.</td></tr>`;
  } else {
    product.recipe
      .slice()
      .sort((a, b) => cleanText(a.material).localeCompare(cleanText(b.material), "de", { sensitivity: "base" }))
      .forEach((recipeItem) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${escapeHtml(recipeItem.material)}</td><td>${positiveInteger(recipeItem.amount, 0).toLocaleString("de-DE")}</td>`;
        recipeBody.appendChild(row);
      });
  }

  const productActions = node.querySelector(".product-actions");
  if (productActions) productActions.hidden = !adminUnlocked;
  node.querySelector(".edit-product").addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    openProductDialogEdit(factory, product.id);
  });
  node.querySelector(".remove-product").addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    if (!confirm(`Ware "${product.name}" wirklich entfernen?`)) return;
    state.products[factory] = state.products[factory].filter((item) => item.id !== product.id);
    state.plan = state.plan.filter((item) => item.productId !== product.id);
    removeAutoRecipeForProduct(product.id);
    deleteTradeAlias(product.name);
    renderAll();
    activateTab(factory);
  });

  return node;
}

function activateTab(targetId) {
  document.querySelectorAll(".tab[data-target]").forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));
  document.querySelectorAll(".factory-menu-item").forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));

  const factoryToggle = document.querySelector(".factory-menu-toggle");
  if (factoryToggle) factoryToggle.classList.toggle("active", Object.hasOwn(FACTORIES, targetId));

  document.querySelectorAll(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === targetId));
  updateFloatingAddButton();
}

function renderMaterials() {
  els.materialsTableBody.innerHTML = "";
  const allMaterials = getManualMaterials();
  const visibleMaterials = adminUnlocked && materialSearchQuery ? allMaterials.filter((material) => materialMatchesSearch(material, materialSearchQuery)) : allMaterials;

  updateMaterialSearchCount(visibleMaterials.length, allMaterials.length);

  if (!allMaterials.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" class="empty-state">Noch keine manuell angelegten Materialien vorhanden. Waren aus Fabriken werden intern als Zwischenprodukte geführt, aber hier nicht als manuelle Materialien angezeigt.</td>`;
    els.materialsTableBody.appendChild(row);
    return;
  }

  if (!visibleMaterials.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" class="empty-state">Kein Material passend zur Suche gefunden.</td>`;
    els.materialsTableBody.appendChild(row);
    return;
  }

  visibleMaterials.forEach((material) => {
    const recipeDef = getMaterialRecipe(material);
    const row = document.createElement("tr");
    row.className = "material-row";
    row.innerHTML = `
      <td><strong>${escapeHtml(material)}</strong></td>
      <td>${positiveInteger(recipeDef.output, 1).toLocaleString("de-DE")}</td>
      <td>${formatOptionalMoney(getMaterialManualPrice(material))}</td>
      <td>${formatOptionalMoney(getMaterialImportPrice(material))}</td>
      <td>${formatOptionalMoney(getMaterialExportPrice(material))}</td>
      <td><div class="nested-recipe"></div></td>
      <td class="row-actions">
        <button class="button button-secondary edit-material" type="button">Bearbeiten</button>
        <button class="button button-danger remove-material" type="button" aria-label="Material entfernen">Entfernen</button>
      </td>
    `;

    const nested = row.querySelector(".nested-recipe");
    if (!recipeDef.recipe.length) {
      nested.innerHTML = `<span class="raw-material-badge">Rohmaterial</span>`;
    } else {
      const table = document.createElement("table");
      table.className = "data-table compact nested-recipe-table";
      table.innerHTML = `
        <thead><tr><th>Material</th><th>Benötigte Menge pro Produktionszyklus</th></tr></thead>
        <tbody></tbody>
      `;
      const body = table.querySelector("tbody");
      recipeDef.recipe
        .slice()
        .sort((a, b) => cleanText(a.material).localeCompare(cleanText(b.material), "de", { sensitivity: "base" }))
        .forEach((recipeItem) => {
          const itemRow = document.createElement("tr");
          itemRow.innerHTML = `<td>${escapeHtml(recipeItem.material)}</td><td>${positiveInteger(recipeItem.amount, 0).toLocaleString("de-DE")}</td>`;
          body.appendChild(itemRow);
        });
      nested.appendChild(table);
    }

    const rowActions = row.querySelector(".row-actions");
    if (rowActions) rowActions.hidden = !adminUnlocked;
    row.querySelector(".edit-material").addEventListener("click", () => {
      if (!requireAdminAccess()) return;
      openMaterialDialogEdit(material);
    });
    row.querySelector(".remove-material").addEventListener("click", () => {
      if (!requireAdminAccess()) return;
      if (isMaterialInUse(material)) {
        alert(`Das Material "${material}" wird noch in Rezepten verwendet und kann nicht gelöscht werden.`);
        return;
      }
      if (!confirm(`Material "${material}" wirklich entfernen?`)) return;
      state.materials = state.materials.filter((item) => item !== material);
      delete state.materialRecipes[material];
      delete state.materialPrices[material];
      deleteTradePrice(material);
      deleteTradeAlias(material);
      delete state.inventory?.[material];
      renderAll();
      activateTab("materials");
    });

    els.materialsTableBody.appendChild(row);
  });
}

function materialMatchesSearch(material, query) {
  const recipeDef = getMaterialRecipe(material);
  const haystack = [
    material,
    recipeDef.output,
    getMaterialManualPrice(material),
    getMaterialImportPrice(material),
    getMaterialExportPrice(material),
    getExplicitTradeAlias(material),
    resolveTradeKey(material),
    ...(recipeDef.recipe ?? []).flatMap((item) => [item.material, item.amount])
  ].map((value) => cleanText(value)).join(" ").toLocaleLowerCase("de-DE");
  return haystack.includes(cleanText(query).toLocaleLowerCase("de-DE"));
}

function updateMaterialSearchCount(visibleCount, totalCount) {
  const count = document.querySelector("#materialSearchCount");
  if (!count) return;
  count.textContent = materialSearchQuery
    ? `${visibleCount.toLocaleString("de-DE")} von ${totalCount.toLocaleString("de-DE")} Materialien`
    : `${totalCount.toLocaleString("de-DE")} Materialien`;
}

function renderTrade() {
  if (!els.tradeTableBody) return;
  els.tradeTableBody.innerHTML = "";
  renderTradeDatalist();

  const rows = [...Object.entries(state.tradePrices ?? {})]
    .map(([name, record]) => ({ name, record }))
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));

  const query = cleanText(tradeSearchQuery).toLocaleLowerCase("de-DE");
  const visibleRows = query
    ? rows.filter(({ name, record }) => [name, record.importPrice, record.exportPrice, record.marketValue].map(cleanText).join(" ").toLocaleLowerCase("de-DE").includes(query))
    : rows;

  if (els.tradeSearchCount) {
    els.tradeSearchCount.textContent = query
      ? `${visibleRows.length.toLocaleString("de-DE")} von ${rows.length.toLocaleString("de-DE")} Handelseinträgen`
      : `${rows.length.toLocaleString("de-DE")} Handelseinträge`;
  }

  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="empty-state">Noch keine zentralen Handelsdaten vorhanden.</td>`;
    els.tradeTableBody.appendChild(row);
    return;
  }

  for (const { name, record } of visibleRows) {
    els.tradeTableBody.appendChild(createTradeRow(name, record));
  }
}

function createTradeRow(name, record) {
  const row = document.createElement("tr");
  row.className = "trade-row";
  const currentName = cleanText(name);
  const importPrice = optionalNumber(record?.importPrice);
  const exportPrice = optionalNumber(record?.exportPrice);
  const marketValue = optionalNumber(record?.marketValue);

  row.innerHTML = `
    <td><strong>${escapeHtml(currentName)}</strong></td>
    <td>${formatOptionalMoney(importPrice)}</td>
    <td>${formatOptionalMoney(exportPrice)}</td>
    <td>${formatOptionalMoney(marketValue)}</td>
    <td class="row-actions">
      <button class="button button-secondary edit-trade-row" type="button">Bearbeiten</button>
      <button class="button button-danger remove-trade-row" type="button">Entfernen</button>
    </td>
  `;

  const rowActions = row.querySelector(".row-actions");
  if (rowActions) rowActions.hidden = !adminUnlocked;

  row.querySelector(".edit-trade-row")?.addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    openTradeDialogEdit(currentName);
  });

  row.querySelector(".remove-trade-row")?.addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    if (!confirm(`Handelseintrag "${currentName}" wirklich entfernen?`)) return;
    deleteTradePrice(currentName);
    renderAll();
    activateTab("trade");
  });

  return row;
}

function openTradeDialogCreate() {
  if (!requireAdminAccess()) return;
  tradeDialogMode = "create";
  tradeDialogOriginalName = null;
  renderTradeDatalist();
  els.tradeDialogEyebrow.textContent = "Handel";
  els.tradeDialogTitle.textContent = "Handelseintrag hinzufügen";
  els.tradeDialogIntro.textContent = "Import-, Export- und Marktwerte werden zentral gespeichert.";
  els.tradeDialogSubmitBtn.textContent = "Handelseintrag speichern";
  els.tradeForm.reset();
  els.tradeDialogName.value = "";
  els.tradeDialogImport.value = "";
  els.tradeDialogExport.value = "";
  els.tradeDialogMarket.value = "";
  els.tradeDialog.showModal();
  setTimeout(() => els.tradeDialogName.focus(), 0);
}

function openTradeDialogEdit(name) {
  if (!requireAdminAccess()) return;
  const currentName = cleanText(name);
  const record = state.tradePrices?.[currentName] ?? {};
  tradeDialogMode = "edit";
  tradeDialogOriginalName = currentName;
  renderTradeDatalist();
  els.tradeDialogEyebrow.textContent = "Handel bearbeiten";
  els.tradeDialogTitle.textContent = currentName;
  els.tradeDialogIntro.textContent = "Änderungen werden automatisch in Fabriken, Materialien und Calculator übernommen.";
  els.tradeDialogSubmitBtn.textContent = "Änderungen speichern";
  els.tradeDialogName.value = currentName;
  els.tradeDialogImport.value = formatInputNumber(optionalNumber(record.importPrice));
  els.tradeDialogExport.value = formatInputNumber(optionalNumber(record.exportPrice));
  els.tradeDialogMarket.value = formatInputNumber(optionalNumber(record.marketValue));
  els.tradeDialog.showModal();
  setTimeout(() => els.tradeDialogName.focus(), 0);
}

function closeTradeDialog() {
  els.tradeDialog?.close();
}

function handleTradeDialogSubmit(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;

  const nextName = cleanText(els.tradeDialogName.value);
  const nextValues = {
    importPrice: optionalNumber(els.tradeDialogImport.value),
    exportPrice: optionalNumber(els.tradeDialogExport.value),
    marketValue: optionalNumber(els.tradeDialogMarket.value)
  };

  if (!nextName) {
    alert("Bitte einen Artikelnamen angeben.");
    return;
  }

  if (nextValues.importPrice === null && nextValues.exportPrice === null && nextValues.marketValue === null) {
    alert("Bitte mindestens einen Importpreis, Exportpreis oder Marktwert eintragen.");
    return;
  }

  if (tradeDialogMode === "edit" && tradeDialogOriginalName && tradeDialogOriginalName !== nextName) {
    renameTradePrice(tradeDialogOriginalName, nextName);
  }

  setTradePrice(nextName, nextValues);
  ensureMaterial(nextName);
  closeTradeDialog();
  renderAll();
  activateTab("trade");
}

function renderTradeDatalist() {
  if (!els.tradeItemOptions) return;
  els.tradeItemOptions.innerHTML = "";
  for (const option of getAllItemNames()) {
    const node = document.createElement("option");
    node.value = option;
    els.tradeItemOptions.appendChild(node);
  }
}

function renderProductTradeAliasDatalist() {
  if (!els.productTradeAliasOptions) return;
  els.productTradeAliasOptions.innerHTML = "";
  for (const option of getTradableItemNames()) {
    const node = document.createElement("option");
    node.value = option;
    els.productTradeAliasOptions.appendChild(node);
  }
}

function getTradableItemNames() {
  return Object.entries(state.tradePrices ?? {})
    .filter(([name, record]) => {
      const itemName = cleanText(name);
      if (!itemName || !record || typeof record !== "object") return false;
      return optionalNumber(record.importPrice) !== null
        || optionalNumber(record.exportPrice) !== null
        || optionalNumber(record.marketValue) !== null;
    })
    .map(([name]) => cleanText(name))
    .sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" }));
}

function getAllItemNames() {
  return unique([
    ...(state.materials ?? []),
    ...Object.values(state.products ?? {}).flat().map((product) => product.name),
    ...Object.keys(state.tradePrices ?? {})
  ].map(cleanText).filter(Boolean)).sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" }));
}


function renderFarmRates() {
  if (!els.farmTableBody) return;
  state.labor ??= {};
  state.farmProfiles ??= {};
  renderFarmDatalist();
  if (els.laborHourlyValueInput) els.laborHourlyValueInput.value = formatInputNumber(positiveNumber(state.labor.hourlyValue, 0));

  const rows = Object.entries(state.farmProfiles)
    .map(([name, profile]) => ({ name: cleanText(name), profile }))
    .filter(({ name }) => name)
    .sort((a, b) => {
      const aCreated = positiveNumber(a.profile?.createdAt, 0);
      const bCreated = positiveNumber(b.profile?.createdAt, 0);
      if (aCreated || bCreated) return bCreated - aCreated;
      return a.name.localeCompare(b.name, "de", { sensitivity: "base" });
    });

  const query = cleanText(farmSearchQuery).toLocaleLowerCase("de-DE");
  const visibleRows = query
    ? rows.filter(({ name, profile }) => [name, profile?.amountPerHour, getFarmUnitCost(name)].map(cleanText).join(" ").toLocaleLowerCase("de-DE").includes(query))
    : rows;

  if (els.farmSearchCount) {
    els.farmSearchCount.textContent = query
      ? `${visibleRows.length.toLocaleString("de-DE")} von ${rows.length.toLocaleString("de-DE")} Farmprofilen`
      : `${rows.length.toLocaleString("de-DE")} Farmprofile`;
  }

  els.farmTableBody.innerHTML = "";
  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="empty-state">Noch keine Farmraten hinterlegt. Lege Rohstoffe an, die du selbst farmen kannst.</td>`;
    els.farmTableBody.appendChild(row);
    return;
  }

  if (!visibleRows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="empty-state">Kein Farmprofil passend zur Suche gefunden.</td>`;
    els.farmTableBody.appendChild(row);
    return;
  }

  for (const { name, profile } of visibleRows) {
    els.farmTableBody.appendChild(createFarmProfileRow(name, profile));
  }
}

function renderFarmDatalist() {
  if (!els.farmItemOptions) return;
  els.farmItemOptions.innerHTML = "";
  for (const option of getAllItemNames()) {
    const node = document.createElement("option");
    node.value = option;
    els.farmItemOptions.appendChild(node);
  }
}

function createFarmProfileRow(name, profile) {
  const row = document.createElement("tr");
  row.className = "farm-row";
  const currentName = cleanText(name);
  const amountPerHour = positiveNumber(profile?.amountPerHour, 0);
  const unitCost = getFarmUnitCost(currentName);
  const enabled = profile?.enabled !== false;

  row.innerHTML = `
    <td><strong>${escapeHtml(currentName)}</strong></td>
    <td><span class="source-badge ${enabled ? "" : "assessment-neutral"}">${enabled ? "Farmbar" : "Deaktiviert"}</span></td>
    <td>${amountPerHour > 0 ? amountPerHour.toLocaleString("de-DE") : "—"}</td>
    <td>${formatOptionalMoney(unitCost)}</td>
    <td class="row-actions">
      <button class="button button-secondary edit-farm-profile" type="button">Bearbeiten</button>
      <button class="button button-danger remove-farm-profile" type="button">Entfernen</button>
    </td>
  `;

  const rowActions = row.querySelector(".row-actions");
  if (rowActions) rowActions.hidden = !adminUnlocked;

  row.querySelector(".edit-farm-profile")?.addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    openFarmDialogEdit(currentName);
  });

  row.querySelector(".remove-farm-profile")?.addEventListener("click", () => {
    if (!requireAdminAccess()) return;
    if (!confirm(`Farmprofil für "${currentName}" wirklich entfernen?`)) return;
    delete state.farmProfiles[currentName];
    renderAll();
    activateTab("farmrates");
  });

  return row;
}

function openFarmDialogCreate() {
  if (!requireAdminAccess()) return;
  farmDialogMode = "create";
  farmDialogOriginalName = null;
  renderFarmDatalist();
  els.farmDialogEyebrow.textContent = "Farmrate";
  els.farmDialogTitle.textContent = "Farmprofil hinzufügen";
  els.farmDialogIntro.textContent = "Lege fest, welche Rohstoffe du farmen kannst und wie viele Einheiten du pro Stunde schaffst.";
  els.farmDialogSubmitBtn.textContent = "Farmprofil speichern";
  els.farmForm.reset();
  els.farmDialogName.value = "";
  els.farmDialogEnabled.checked = true;
  els.farmDialogRate.value = "";
  updateFarmDialogUnitCost();
  els.farmDialog.showModal();
  setTimeout(() => els.farmDialogName.focus(), 0);
}

function openFarmDialogEdit(name) {
  if (!requireAdminAccess()) return;
  const currentName = cleanText(name);
  const profile = state.farmProfiles?.[currentName] ?? {};
  farmDialogMode = "edit";
  farmDialogOriginalName = currentName;
  renderFarmDatalist();
  els.farmDialogEyebrow.textContent = "Farmrate bearbeiten";
  els.farmDialogTitle.textContent = currentName;
  els.farmDialogIntro.textContent = "Änderungen wirken sich direkt auf die Kostenkalkulation aus.";
  els.farmDialogSubmitBtn.textContent = "Änderungen speichern";
  els.farmDialogName.value = currentName;
  els.farmDialogEnabled.checked = profile.enabled !== false;
  const rate = positiveNumber(profile.amountPerHour, 0);
  els.farmDialogRate.value = rate > 0 ? formatInputNumber(rate) : "";
  updateFarmDialogUnitCost();
  els.farmDialog.showModal();
  setTimeout(() => els.farmDialogName.focus(), 0);
}

function closeFarmDialog() {
  els.farmDialog?.close();
}

function updateFarmDialogUnitCost() {
  if (!els.farmDialogUnitCost) return;
  const enabled = Boolean(els.farmDialogEnabled?.checked);
  const rate = positiveNumber(els.farmDialogRate?.value, 0);
  const hourly = getLaborHourlyValue();
  if (!enabled) {
    els.farmDialogUnitCost.textContent = "deaktiviert";
    return;
  }
  if (rate <= 0) {
    els.farmDialogUnitCost.textContent = "—";
    return;
  }
  els.farmDialogUnitCost.textContent = formatMoney(hourly / rate);
}

function handleFarmDialogSubmit(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;

  const nextName = cleanText(els.farmDialogName.value);
  const nextRate = positiveNumber(els.farmDialogRate.value, 0);
  const enabled = Boolean(els.farmDialogEnabled.checked);

  if (!nextName) {
    alert("Bitte einen Material-/Rohstoffnamen angeben.");
    queueFocus("#farmDialogName");
    return;
  }

  const exists = Object.keys(state.farmProfiles ?? {}).some((name) => name.toLocaleLowerCase("de-DE") === nextName.toLocaleLowerCase("de-DE"));
  if (farmDialogMode === "create" && exists) {
    alert(`Für "${nextName}" existiert bereits ein Farmprofil.`);
    queueFocus("#farmDialogName");
    return;
  }

  if (farmDialogMode === "edit" && farmDialogOriginalName && farmDialogOriginalName !== nextName) {
    delete state.farmProfiles[farmDialogOriginalName];
  }

  ensureMaterial(nextName);
  const previous = state.farmProfiles?.[nextName] ?? {};
  state.farmProfiles[nextName] = {
    enabled,
    amountPerHour: nextRate,
    createdAt: farmDialogMode === "create" ? Date.now() : positiveNumber(previous.createdAt, 0)
  };

  closeFarmDialog();
  renderAll();
  activateTab("farmrates");
}

function addFarmProfile() {
  openFarmDialogCreate();
}

function renderPlan() {
  els.planTableBody.innerHTML = "";

  if (!state.plan.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="empty-state">Noch keine Produktionspositionen vorhanden.</td>`;
    els.planTableBody.appendChild(row);
    return;
  }

  state.plan.forEach((item) => {
    const row = els.planRowTemplate.content.firstElementChild.cloneNode(true);
    const factorySelect = row.querySelector(".plan-factory");
    const productSelect = row.querySelector(".plan-product");
    const quantityInput = row.querySelector(".plan-quantity");
    const outputCell = row.querySelector(".plan-output");
    const runsCell = row.querySelector(".plan-runs");

    fillSelect(factorySelect, Object.entries(FACTORIES).map(([value, label]) => ({ value, label })), item.factory);
    updatePlanProductOptions(productSelect, item.factory, item.productId);

    const product = findProduct(item.productId);
    const output = product ? positiveInteger(product.output, 1) : 0;
    const quantity = positiveInteger(item.quantity, 0);
    const runs = product && quantity > 0 ? Math.ceil(quantity / output) : 0;

    quantityInput.value = quantity;
    outputCell.textContent = output.toLocaleString("de-DE");
    runsCell.textContent = runs.toLocaleString("de-DE");

    factorySelect.addEventListener("change", () => {
      item.factory = factorySelect.value;
      item.productId = state.products[item.factory][0]?.id ?? null;
      sortPlanAlphabetically();
      renderAll();
    });

    productSelect.addEventListener("change", () => {
      item.productId = productSelect.value || null;
      sortPlanAlphabetically();
      renderAll();
    });

    quantityInput.addEventListener("change", () => {
      item.quantity = positiveInteger(quantityInput.value, 0);
      sortPlanAlphabetically();
      renderAll();
    });

    row.querySelector(".remove-plan-row").addEventListener("click", () => {
      state.plan = state.plan.filter((planItem) => planItem.id !== item.id);
      renderAll();
    });

    els.planTableBody.appendChild(row);
  });
}

function clearPlan() {
  if (!state.plan.length) return;
  state.plan = [];
  renderAll();
}

function resetInventory() {
  const hasInventory = Object.values(state.inventory ?? {}).some((amount) => positiveInteger(amount, 0) > 0) || inventoryDraftRows.length > 0;
  if (!hasInventory) return;

  const confirmed = confirm([
    "Eigenes Inventar wirklich zurücksetzen?",
    "",
    "Alle eingetragenen Inventarwerte werden aus dieser lokalen Kalkulation entfernt.",
    "Produktionsplan, Materialien, Waren und Preise bleiben erhalten."
  ].join("\n"));

  if (!confirmed) return;
  state.inventory = {};
  inventoryDraftRows = [];
  renderAll();
}

function renderRequirements() {
  const directRequirements = calculateRequirements();
  const rawResult = calculateRawRequirements();
  renderRequirementTable(els.requirementsTableBody, directRequirements, "Keine Materialien benötigt.");
  renderRequirementTable(els.rawRequirementsTableBody, rawResult.totals, "Keine Rohmaterialien benötigt.");

  if (rawResult.warnings.length) {
    els.rawRequirementsHint.textContent = `Hinweis: ${unique(rawResult.warnings).join(" ")}`;
    els.rawRequirementsHint.hidden = false;
  } else {
    els.rawRequirementsHint.hidden = true;
  }

  const directEntries = Object.entries(directRequirements);
  const totalRuns = state.plan.reduce((sum, item) => {
    const product = findProduct(item.productId);
    if (!product) return sum;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    return sum + (quantity > 0 ? Math.ceil(quantity / output) : 0);
  }, 0);

  els.kpiPositions.textContent = state.plan.length.toLocaleString("de-DE");
  els.kpiRuns.textContent = totalRuns.toLocaleString("de-DE");
  els.kpiMaterials.textContent = directEntries.length.toLocaleString("de-DE");
}


function renderEconomy() {
  els.economyTableBody.innerHTML = "";
  const rows = [];
  const warnings = [];
  const planCosting = calculatePlanMaterialCostAllocation();

  for (const item of state.plan) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;
    const produced = runs * output;
    if (!runs || !produced) continue;

    const cost = calculateProductAllocatedPlanCost(product, runs, planCosting);
    const unitCost = cost.complete ? cost.totalCost / produced : null;
    const baseCost = calculateProductUnitCostWithOptimalInputs(product, new Set());
    const craftUnitCost = baseCost.complete ? baseCost.unitCost : null;
    const buyUnitCost = getProductBuyUnitCost(product);
    const recommendationCost = craftUnitCost ?? (unitCost !== null && unitCost > 0 ? unitCost : null);
    const sale = getSalePrice(product, recommendationCost);
    const unitProfit = unitCost !== null && sale.price !== null ? sale.price - unitCost : null;
    const totalProfit = unitProfit !== null ? unitProfit * produced : null;
    const totalCost = unitCost !== null ? unitCost * produced : null;
    const totalRevenue = sale.price !== null ? sale.price * produced : null;
    const assessment = getProcurementAssessment(craftUnitCost, buyUnitCost);
    const procurementSummary = summarizeProcurementActions(cost.actions ?? []);

    if (!cost.complete) warnings.push(`${product.name}: ${cost.missing.length ? `fehlende Materialpreise für persönliche Kosten (${cost.missing.join(", ")})` : "Kosten unvollständig"}.`);
    if (sale.price === null && !baseCost.complete) warnings.push(`${product.name}: keine Preisempfehlung möglich, da Produktionskosten unvollständig sind (${baseCost.missing.join(", ")}).`);

    rows.push({ product, quantity, produced, runs, unitCost, craftUnitCost, buyUnitCost, sale, unitProfit, totalProfit, totalCost, totalRevenue, assessment, procurementSummary });
  }

  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="8" class="empty-state">Noch keine Wirtschaftsdaten vorhanden. Lege im Produktionsplan mindestens eine Position an.</td>`;
    els.economyTableBody.appendChild(row);
    els.economyHint.hidden = true;
    return;
  }

  for (const item of rows) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.product.name)}<br><span class="muted-inline">Produktion: ${formatOptionalMoney(item.craftUnitCost)} · Direktkauf: ${formatOptionalMoney(item.buyUnitCost)}</span></td>
      <td>${item.produced.toLocaleString("de-DE")} <span class="muted-inline">(${item.runs.toLocaleString("de-DE")} Läufe)</span></td>
      <td>${formatOptionalMoney(item.unitCost)}</td>
      <td>${formatOptionalMoney(item.sale.price)}</td>
      <td><span class="source-badge">${escapeHtml(item.sale.source)}</span></td>
      <td>${formatProfit(item.unitProfit)}</td>
      <td>${formatProfit(item.totalProfit)}</td>
      <td><span class="assessment-badge ${item.assessment.className}">${escapeHtml(item.assessment.text)}</span>${item.procurementSummary ? `<br><span class="muted-inline procurement-summary">${escapeHtml(item.procurementSummary)}</span>` : ""}</td>
    `;
    els.economyTableBody.appendChild(row);
  }

  if (warnings.length) {
    els.economyHint.textContent = `Hinweis: ${unique(warnings).join(" ")}`;
    els.economyHint.hidden = false;
  } else {
    els.economyHint.hidden = true;
  }
}

function calculatePlanMaterialCostAllocation() {
  const requirements = calculateRequirements();
  const inventoryPool = createInventoryPool();
  const materialCosts = {};
  const missing = [];
  const actions = [];

  for (const [material, amount] of Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }))) {
    const required = positiveInteger(amount, 0);
    if (!material || required <= 0) continue;
    const result = calculateMaterialBatchCostWithInventory(material, required, inventoryPool, new Set());
    if (!result.complete) {
      materialCosts[material] = { complete: false, unitCost: null, totalCost: null, missing: result.missing ?? [material], actions: [] };
      missing.push(...(result.missing ?? [material]));
      continue;
    }
    materialCosts[material] = {
      complete: true,
      unitCost: result.totalCost / required,
      totalCost: result.totalCost,
      missing: [],
      actions: result.actions ?? []
    };
    actions.push(...(result.actions ?? []));
  }

  return { requirements, materialCosts, missing: unique(missing), actions: mergeProcurementActions(actions) };
}

function calculateProductAllocatedPlanCost(product, runs, planCosting) {
  let totalCost = 0;
  const missing = [];
  const actions = [];

  for (const item of product.recipe ?? []) {
    const material = cleanText(item.material);
    const required = positiveInteger(item.amount, 0) * positiveInteger(runs, 0);
    if (!material || required <= 0) continue;
    const costInfo = planCosting.materialCosts?.[material];
    if (!costInfo?.complete) {
      missing.push(...(costInfo?.missing ?? [material]));
      continue;
    }
    totalCost += costInfo.unitCost * required;
    actions.push(...scaleProcurementActions(costInfo.actions ?? [], required / positiveInteger(planCosting.requirements?.[material], 1)));
  }

  if (missing.length) return { complete: false, totalCost: null, missing: unique(missing), actions: [] };
  return { complete: true, totalCost, missing: [], actions: mergeProcurementActions(actions) };
}

function scaleProcurementActions(actions, factor) {
  const multiplier = Number.isFinite(factor) && factor > 0 ? factor : 0;
  return (actions ?? []).map((action) => ({
    ...action,
    amount: Math.round(positiveNumber(action.amount, 0) * multiplier * 100) / 100
  })).filter((action) => action.amount > 0);
}

function createInventoryPool() {
  const pool = {};
  for (const [material, amount] of Object.entries(state.inventory ?? {})) {
    const name = cleanText(material);
    const value = positiveInteger(amount, 0);
    if (name && value > 0) pool[name] = value;
  }
  return pool;
}

function consumeInventory(pool, materialName, requiredAmount) {
  const name = cleanText(materialName);
  const required = positiveInteger(requiredAmount, 0);
  const available = positiveInteger(pool[name], 0);
  const consumed = Math.min(required, available);
  if (consumed > 0) pool[name] = available - consumed;
  return { consumed, remaining: required - consumed };
}

function calculateProductBatchCostWithInventory(product, runs, inventoryPool, stack = new Set()) {
  const productKey = `product:${product.id}`;
  if (stack.has(productKey)) return { complete: false, totalCost: null, missing: [product.name] };
  const nextStack = new Set(stack);
  nextStack.add(productKey);

  let totalCost = 0;
  const missing = [];
  const actions = [];
  for (const item of product.recipe ?? []) {
    const requiredAmount = positiveInteger(item.amount, 0) * positiveInteger(runs, 0);
    const result = calculateMaterialBatchCostWithInventory(item.material, requiredAmount, inventoryPool, nextStack);
    if (!result.complete) missing.push(...result.missing);
    else {
      totalCost += result.totalCost;
      actions.push(...(result.actions ?? []));
    }
  }
  if (missing.length) return { complete: false, totalCost: null, missing: unique(missing), actions: [] };
  return { complete: true, totalCost, missing: [], actions: mergeProcurementActions(actions) };
}

function calculateMaterialBatchCostWithInventory(materialName, requiredAmount, inventoryPool, stack = new Set()) {
  const name = cleanText(materialName);
  const materialKey = `material:${name.toLocaleLowerCase("de-DE")}`;
  if (stack.has(materialKey)) return { complete: false, totalCost: null, missing: [name] };

  const inventory = consumeInventory(inventoryPool, name, requiredAmount);
  const inventoryActions = inventory.consumed > 0 ? [createProcurementAction("inventory", name, inventory.consumed)] : [];
  if (inventory.remaining <= 0) return { complete: true, totalCost: 0, missing: [], actions: inventoryActions };

  const buyUnitCost = getMaterialBuyUnitCost(name);
  const buyOption = buyUnitCost !== null
    ? { complete: true, totalCost: buyUnitCost * inventory.remaining, missing: [], actions: [createProcurementAction("import", name, inventory.remaining)], kind: "import" }
    : null;
  const farmUnitCost = getFarmUnitCost(name);
  const farmOption = farmUnitCost !== null
    ? { complete: true, totalCost: farmUnitCost * inventory.remaining, missing: [], actions: [createProcurementAction("farm", name, inventory.remaining)], kind: "farm" }
    : null;
  const craftOption = calculateMaterialCraftBatchCostWithInventory(name, inventory.remaining, inventoryPool, stack);

  const selected = chooseCheapestBatchOptionFromList([buyOption, farmOption, craftOption], name);
  return selected.complete ? { ...selected, actions: mergeProcurementActions([...inventoryActions, ...(selected.actions ?? [])]) } : selected;
}

function calculateMaterialCraftBatchCostWithInventory(materialName, requiredAmount, inventoryPool, stack = new Set()) {
  const name = cleanText(materialName);
  const materialKey = `material:${name.toLocaleLowerCase("de-DE")}`;
  if (stack.has(materialKey)) return { complete: false, totalCost: null, missing: [name] };

  const nextStack = new Set(stack);
  nextStack.add(materialKey);
  const required = positiveInteger(requiredAmount, 0);
  const options = [];
  const missing = [];
  const recipeDef = getExistingMaterialRecipe(name);

  const addBatchOption = (factory) => {
    const optionPool = cloneInventoryPool(inventoryPool);
    const result = factory(optionPool);
    if (result.complete) options.push({ ...result, actions: mergeProcurementActions(result.actions ?? []), inventoryPool: optionPool });
    else missing.push(...result.missing);
  };

  if (recipeDef?.recipe?.length && !recipeDef.autoProductId) {
    addBatchOption((optionPool) => calculateRecipeDefinitionBatchCostWithInventory(recipeDef, required, optionPool, nextStack));
  }

  for (const product of findProductsProvidingName(name).filter((item) => item.recipe?.length)) {
    const productKey = `product:${product.id}`;
    if (nextStack.has(productKey)) continue;
    const output = positiveInteger(product.output, 1);
    const runs = Math.ceil(required / output);
    addBatchOption((optionPool) => {
      const result = calculateProductBatchCostWithInventory(product, runs, optionPool, nextStack);
      if (result.complete) { result.actions = [...(result.actions ?? []), createProcurementAction("craft", product.name, runs * output)]; result.kind = "craft"; }
      return result;
    });
  }

  if (recipeDef?.recipe?.length && recipeDef.autoProductId && !findProductsProvidingName(name).some((product) => product.id === recipeDef.autoProductId)) {
    addBatchOption((optionPool) => calculateRecipeDefinitionBatchCostWithInventory(recipeDef, required, optionPool, nextStack));
  }

  if (options.length) {
    const best = options.reduce((currentBest, current) => current.totalCost < currentBest.totalCost ? current : currentBest);
    replaceInventoryPool(inventoryPool, best.inventoryPool);
    return { complete: true, totalCost: best.totalCost, missing: [], actions: mergeProcurementActions(best.actions ?? []) };
  }

  const materialCost = getMaterialManualPrice(name);
  if (materialCost !== null) return { complete: true, totalCost: materialCost * required, missing: [], actions: [createProcurementAction("provide", name, required)], kind: "provide" };
  return { complete: false, totalCost: null, missing: unique(missing.length ? missing : [name]), actions: [] };
}

function cloneInventoryPool(pool) {
  return Object.fromEntries(Object.entries(pool ?? {}).map(([name, amount]) => [name, positiveInteger(amount, 0)]));
}

function replaceInventoryPool(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  for (const [key, value] of Object.entries(source ?? {})) target[key] = value;
}

function calculateRecipeDefinitionBatchCostWithInventory(recipeDef, requiredAmount, inventoryPool, stack = new Set()) {
  const runs = Math.ceil(positiveInteger(requiredAmount, 0) / positiveInteger(recipeDef.output, 1));
  let totalCost = 0;
  const missing = [];
  const actions = [];
  for (const item of recipeDef.recipe ?? []) {
    const result = calculateMaterialBatchCostWithInventory(item.material, positiveInteger(item.amount, 0) * runs, inventoryPool, stack);
    if (!result.complete) missing.push(...result.missing);
    else {
      totalCost += result.totalCost;
      actions.push(...(result.actions ?? []));
    }
  }
  if (missing.length) return { complete: false, totalCost: null, missing: unique(missing), actions: [] };
  return { complete: true, totalCost, missing: [], actions: mergeProcurementActions(actions), kind: "craft" };
}

function chooseCheapestBatchOption(buyOption, craftOption, fallbackName) {
  if (buyOption?.complete && craftOption?.complete) {
    return buyOption.totalCost <= craftOption.totalCost ? buyOption : craftOption;
  }
  if (craftOption?.complete) return craftOption;
  if (buyOption?.complete) return buyOption;
  return { complete: false, totalCost: null, missing: unique([...(craftOption?.missing ?? []), fallbackName].filter(Boolean)), actions: [] };
}

function createProcurementAction(type, itemName, amount) {
  return { type, item: cleanText(itemName), amount: positiveInteger(amount, 0) };
}

function mergeProcurementActions(actions) {
  const merged = new Map();
  for (const action of actions ?? []) {
    const amount = positiveInteger(action?.amount, 0);
    const item = cleanText(action?.item);
    const type = cleanText(action?.type);
    if (!type || !item || amount <= 0) continue;
    const key = `${type}::${item}`;
    const current = merged.get(key) ?? { type, item, amount: 0 };
    current.amount += amount;
    merged.set(key, current);
  }
  return [...merged.values()].sort((a, b) => {
    const order = { inventory: 0, farm: 1, import: 2, craft: 3, provide: 4 };
    const delta = (order[a.type] ?? 99) - (order[b.type] ?? 99);
    return delta || a.item.localeCompare(b.item, "de", { sensitivity: "base" });
  });
}

function summarizeProcurementActions(actions) {
  const merged = mergeProcurementActions(actions);
  if (!merged.length) return "";
  const labels = { inventory: "Inventar", import: "Import", farm: "Farmen", craft: "Craft", provide: "Wert" };
  const parts = merged.slice(0, 4).map((action) => `${labels[action.type] ?? action.type}: ${action.amount.toLocaleString("de-DE")}× ${action.item}`);
  const remaining = merged.length - parts.length;
  return remaining > 0 ? `${parts.join(" · ")} · +${remaining} weitere` : parts.join(" · ");
}


function renderInventory() {
  if (!els.inventoryTableBody) return;
  els.inventoryTableBody.innerHTML = "";
  state.inventory ??= {};
  renderInventoryDatalist();

  const entries = Object.entries(state.inventory)
    .filter(([, amount]) => positiveInteger(amount, 0) > 0)
    .sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }));

  const hasRows = entries.length || inventoryDraftRows.length;
  if (!hasRows) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3" class="empty-state">Noch kein eigenes Inventar eingetragen.</td>`;
    els.inventoryTableBody.appendChild(row);
    return;
  }

  entries.forEach(([material, amount]) => {
    els.inventoryTableBody.appendChild(createInventoryRow({ material, amount, isDraft: false }));
  });

  inventoryDraftRows.forEach((draft) => {
    els.inventoryTableBody.appendChild(createInventoryRow({ material: draft.material ?? "", amount: draft.amount ?? "", isDraft: true, draftId: draft.id }));
  });
}

function renderInventoryDatalist() {
  if (!els.inventoryItemOptions) return;
  els.inventoryItemOptions.innerHTML = "";
  getMaterialOptionsForDialog().forEach((option) => {
    const node = document.createElement("option");
    node.value = option.value;
    node.label = option.label;
    els.inventoryItemOptions.appendChild(node);
  });
}

function createInventoryRow(config) {
  const { material, amount, isDraft, draftId } = config;
  const row = document.createElement("tr");
  if (isDraft) row.classList.add("draft-row");
  row.innerHTML = `
    <td><input class="inventory-material" name="inventoryMaterial" type="text" list="inventoryItemOptions" autocomplete="off" placeholder="Item auswählen oder suchen" value="${escapeHtml(material)}" /></td>
    <td><input class="inventory-amount" name="inventoryAmount" type="number" min="0" step="1" placeholder="0" value="${isDraft && (amount === "" || amount === null || amount === undefined) ? "" : positiveInteger(amount, 0)}" /></td>
    <td><button class="icon-button remove-inventory-row" type="button" aria-label="Inventarzeile entfernen">×</button></td>
  `;

  const materialInput = row.querySelector(".inventory-material");
  const amountInput = row.querySelector(".inventory-amount");

  const commitInventoryRow = () => {
    const oldMaterial = cleanText(material);
    const newMaterial = cleanText(materialInput.value);
    const currentAmount = positiveInteger(amountInput.value, 0);
    if (!newMaterial) return;

    if (isDraft && currentAmount <= 0) {
      const draft = inventoryDraftRows.find((item) => item.id === draftId);
      if (draft) {
        draft.material = newMaterial;
        draft.amount = "";
      }
      return;
    }

    ensureMaterial(newMaterial);

    if (isDraft) {
      inventoryDraftRows = inventoryDraftRows.filter((item) => item.id !== draftId);
      state.inventory[newMaterial] = (positiveInteger(state.inventory[newMaterial], 0) || 0) + currentAmount;
      renderAll();
      return;
    }

    if (oldMaterial && oldMaterial !== newMaterial) delete state.inventory[oldMaterial];
    if (currentAmount <= 0) delete state.inventory[newMaterial];
    else state.inventory[newMaterial] = currentAmount;
    renderAll();
  };

  materialInput.addEventListener("change", commitInventoryRow);
  materialInput.addEventListener("blur", commitInventoryRow);
  amountInput.addEventListener("change", commitInventoryRow);

  row.querySelector(".remove-inventory-row").addEventListener("click", () => {
    if (isDraft) inventoryDraftRows = inventoryDraftRows.filter((item) => item.id !== draftId);
    else delete state.inventory[material];
    renderAll();
  });

  return row;
}

function renderRequirementTable(tbody, requirements, emptyText) {
  tbody.innerHTML = "";
  const entries = Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }));
  if (!entries.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4" class="empty-state">${escapeHtml(emptyText)}</td>`;
    tbody.appendChild(row);
    return;
  }

  entries.forEach(([material, amount]) => {
    const inventoryAmount = Math.min(positiveInteger(getInventoryAmount(material), 0), positiveInteger(amount, 0));
    const purchaseAmount = Math.max(positiveInteger(amount, 0) - inventoryAmount, 0);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(material)}</td>
      <td>${amount.toLocaleString("de-DE")}</td>
      <td>${inventoryAmount ? inventoryAmount.toLocaleString("de-DE") : "—"}</td>
      <td>${purchaseAmount.toLocaleString("de-DE")}</td>
    `;
    tbody.appendChild(row);
  });
}

function addInventoryItem() {
  const options = getMaterialOptionsForDialog();
  if (!options.length) {
    alert("Lege zuerst mindestens ein Material oder eine Ware an.");
    return;
  }
  inventoryDraftRows.push({ id: cryptoId(), material: "", amount: "" });
  renderAll();
  activateTab("calculator");
  queueFocus("#inventoryTable tbody tr:last-child .inventory-material");
}

function getInventoryAmount(materialName) {
  return positiveInteger(state.inventory?.[cleanText(materialName)], 0);
}

function applyResponsiveTableLabels(root = document) {
  root.querySelectorAll("table.data-table").forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (!(cell instanceof HTMLElement)) return;
        if (cell.hasAttribute("colspan")) {
          cell.removeAttribute("data-label");
          return;
        }
        const label = headers[index] || "";
        if (label) cell.dataset.label = label;
      });
    });
  });
}

function calculateRequirements() {
  const totals = {};
  for (const item of state.plan) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;
    for (const recipeItem of product.recipe) {
      const material = cleanText(recipeItem.material);
      const amount = positiveInteger(recipeItem.amount, 0);
      if (!material || amount <= 0) continue;
      totals[material] = (totals[material] ?? 0) + amount * runs;
    }
  }
  return totals;
}

function calculateRawRequirements() {
  const totals = {};
  const warnings = [];
  const directRequirements = calculateRequirements();
  for (const [material, amount] of Object.entries(directRequirements)) {
    const name = cleanText(material);
    const required = positiveInteger(amount, 0);
    if (!name || required <= 0) continue;
    expandRawMaterial(name, required, totals, warnings, new Set());
  }
  return { totals, warnings };
}

function expandRawMaterial(material, requiredAmount, totals, warnings, stack) {
  const materialRecipe = getExistingMaterialRecipe(material);
  if (materialRecipe?.recipe?.length) {
    const materialKey = `material:${material.toLocaleLowerCase("de-DE")}`;
    if (stack.has(materialKey)) {
      addTotal(totals, material, requiredAmount);
      warnings.push(`Zyklisches Unterrezept bei "${material}" erkannt; dieser Eintrag wurde als Rohmaterial behandelt.`);
      return;
    }
    const output = positiveInteger(materialRecipe.output, 1);
    const runs = Math.ceil(requiredAmount / output);
    const nextStack = new Set(stack);
    nextStack.add(materialKey);
    for (const recipeItem of materialRecipe.recipe) {
      const childMaterial = cleanText(recipeItem.material);
      const amount = positiveInteger(recipeItem.amount, 0) * runs;
      if (!childMaterial || amount <= 0) continue;
      expandRawMaterial(childMaterial, amount, totals, warnings, nextStack);
    }
    return;
  }

  const craftableProduct = selectCraftableProductForExpansion(material, stack);
  if (!craftableProduct || !craftableProduct.recipe.length) {
    addTotal(totals, material, requiredAmount);
    return;
  }

  const productKey = `product:${craftableProduct.id}`;
  if (stack.has(productKey)) {
    addTotal(totals, material, requiredAmount);
    warnings.push(`Zyklisches Warenrezept bei "${material}" erkannt; dieser Eintrag wurde als Rohmaterial behandelt.`);
    return;
  }

  const output = positiveInteger(craftableProduct.output, 1);
  const runs = Math.ceil(requiredAmount / output);
  const nextStack = new Set(stack);
  nextStack.add(productKey);
  for (const recipeItem of craftableProduct.recipe) {
    const childMaterial = cleanText(recipeItem.material);
    const amount = positiveInteger(recipeItem.amount, 0) * runs;
    if (!childMaterial || amount <= 0) continue;
    expandRawMaterial(childMaterial, amount, totals, warnings, nextStack);
  }
}

function addTotal(totals, material, amount) {
  totals[material] = (totals[material] ?? 0) + amount;
}

function openMaterialDialogCreate() {
  if (!requireAdminAccess()) return;
  materialDialogMode = "create";
  materialDialogOriginalName = null;
  materialDialogRecipe = [];
  els.materialDialogEyebrow.textContent = "Material";
  els.materialDialogTitle.textContent = "Material hinzufügen";
  els.materialDialogIntro.textContent = "Materialien ohne Unterrezept werden im Calculator als Rohmaterial behandelt.";
  els.materialDialogSubmitBtn.textContent = "Material speichern";
  els.newMaterialName.value = "";
  els.newMaterialOutput.value = 1;
  els.newMaterialUnitPrice.value = "";
  setMaterialRecipeEditorEnabled(false);
  renderMaterialDialogRecipeRows();
  showDialog(els.addMaterialDialog, "#newMaterialName");
}

function openMaterialDialogEdit(materialName) {
  if (!requireAdminAccess()) return;
  materialDialogMode = "edit";
  materialDialogOriginalName = materialName;
  const recipeDef = getMaterialRecipe(materialName);
  materialDialogRecipe = (recipeDef.recipe ?? []).map((item) => ({ material: item.material, amount: item.amount }));
  els.materialDialogEyebrow.textContent = "Material bearbeiten";
  els.materialDialogTitle.textContent = materialName;
  els.materialDialogIntro.textContent = "Änderungen werden auf alle Rezeptreferenzen übertragen.";
  els.materialDialogSubmitBtn.textContent = "Änderungen speichern";
  els.newMaterialName.value = materialName;
  els.newMaterialOutput.value = positiveInteger(recipeDef.output, 1);
  els.newMaterialUnitPrice.value = formatInputNumber(getMaterialManualPrice(materialName));
  setMaterialRecipeEditorEnabled(materialDialogRecipe.length > 0);
  renderMaterialDialogRecipeRows();
  showDialog(els.addMaterialDialog, "#newMaterialName");
}

function closeMaterialDialog() {
  els.addMaterialDialog.close();
}

function saveMaterialFromDialog(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;
  const name = cleanText(els.newMaterialName.value);
  const output = positiveInteger(els.newMaterialOutput.value, 1);
  const unitPrice = optionalNumber(els.newMaterialUnitPrice.value);
  const recipe = els.materialHasRecipeCheckbox.checked
    ? materialDialogRecipe
        .map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) }))
        .filter((item) => item.material && item.amount > 0)
    : [];

  if (!name) {
    alert("Bitte einen Materialnamen eintragen.");
    queueFocus("#newMaterialName");
    return;
  }

  const existing = state.materials.find((material) => material.toLocaleLowerCase("de-DE") === name.toLocaleLowerCase("de-DE"));
  const existingProduct = findProductByName(name);
  const ownAutoRecipe = materialDialogMode === "edit" && getExistingMaterialRecipe(materialDialogOriginalName)?.autoProductId === existingProduct?.id;

  if (materialDialogMode === "create" && existing) {
    const origin = getAutoMaterialOrigin(existing);
    alert(origin ? `"${name}" existiert bereits als Ware aus der ${origin.factoryLabel} und kann nicht zusätzlich als manuelles Material angelegt werden.` : `Das Material "${name}" existiert bereits.`);
    queueFocus("#newMaterialName");
    return;
  }
  if (materialDialogMode === "edit" && existing && existing !== materialDialogOriginalName) {
    const origin = getAutoMaterialOrigin(existing);
    alert(origin ? `"${name}" existiert bereits als Ware aus der ${origin.factoryLabel} und kann nicht zusätzlich als manuelles Material verwendet werden.` : `Das Material "${name}" existiert bereits.`);
    queueFocus("#newMaterialName");
    return;
  }
  if (existingProduct && !ownAutoRecipe) {
    const origin = getProductOrigin(existingProduct.id);
    alert(`"${name}" ist bereits eine Ware${origin ? ` aus der ${origin.factoryLabel}` : ""}. Fabrik-Waren werden automatisch als Zwischenprodukte geführt und können nicht zusätzlich als manuelles Material angelegt werden.`);
    queueFocus("#newMaterialName");
    return;
  }

  if (materialDialogMode === "create") {
    ensureMaterial(name);
    if (recipe.length) state.materialRecipes[name] = { output, recipe };
  } else {
    if (materialDialogOriginalName !== name) renameMaterial(materialDialogOriginalName, name, false);
    state.materialRecipes[name] = { output, recipe };
  }

  setMaterialManualPrice(name, unitPrice);
  clearAutoRecipeFlag(name);
  closeMaterialDialog();
  renderAll();
  activateTab("materials");
  queueFocusMaterialRow(name);
}

function handleMaterialRecipeCheckboxChange() {
  if (!els.materialHasRecipeCheckbox.checked) {
    materialDialogRecipe = [];
    setMaterialRecipeEditorEnabled(false);
    renderMaterialDialogRecipeRows();
    return;
  }

  const available = getMaterialOptionsForDialog(materialDialogOriginalName);
  if (!available.length) {
    alert("Lege zuerst mindestens ein Rohmaterial an, bevor du ein Unterrezept erstellst.");
    els.materialHasRecipeCheckbox.checked = false;
    setMaterialRecipeEditorEnabled(false);
    return;
  }

  setMaterialRecipeEditorEnabled(true);
  if (!materialDialogRecipe.length) {
    materialDialogRecipe.push({ material: available[0].value, amount: 1 });
  }
  renderMaterialDialogRecipeRows();
}

function setMaterialRecipeEditorEnabled(enabled) {
  const isEnabled = Boolean(enabled);
  els.materialHasRecipeCheckbox.checked = isEnabled;
  els.materialRecipeEditor.hidden = !isEnabled;
  els.addMaterialDialogRecipeRowBtn.hidden = !isEnabled;
}

function addMaterialDialogRecipeRow() {
  const available = getMaterialOptionsForDialog(materialDialogOriginalName);
  if (!available.length) {
    alert("Lege zuerst mindestens ein Basismaterial an, bevor du ein Unterrezept erstellst.");
    return;
  }
  materialDialogRecipe.push({ material: available[0].value, amount: 1 });
  renderMaterialDialogRecipeRows();
}

function renderMaterialDialogRecipeRows() {
  renderDialogRecipeRows({
    tbody: els.materialDialogRecipeTableBody,
    template: els.materialDialogRecipeRowTemplate,
    recipe: materialDialogRecipe,
    materialSelector: ".material-dialog-recipe-material",
    amountSelector: ".material-dialog-recipe-amount",
    removeSelector: ".remove-material-dialog-recipe-row",
    emptyText: "Kein Unterrezept. Das Material wird als Rohmaterial behandelt."
  });
}

function openProductDialogCreate(factory) {
  if (!requireAdminAccess()) return;
  productDialogMode = "create";
  productDialogFactory = factory;
  productDialogProductId = null;
  productDialogRecipe = [];
  els.productDialogEyebrow.textContent = "Ware";
  els.productDialogTitle.textContent = "Ware hinzufügen";
  els.productDialogIntro.textContent = "Die Ware wird automatisch als Material/Zwischenprodukt übernommen.";
  els.productDialogSubmitBtn.textContent = "Ware speichern";
  els.productFactoryLabel.value = FACTORIES[factory];
  els.newProductName.value = "";
  els.newProductOutput.value = 1;
  if (els.productTradeAlias) els.productTradeAlias.value = "";
  renderTradeDatalist();
  renderProductTradeAliasDatalist();
  renderProductDialogRecipeRows();
  showDialog(els.productDialog, "#newProductName");
}

function openProductDialogEdit(factory, productId) {
  if (!requireAdminAccess()) return;
  const product = state.products[factory].find((item) => item.id === productId);
  if (!product) return;
  productDialogMode = "edit";
  productDialogFactory = factory;
  productDialogProductId = productId;
  productDialogRecipe = (product.recipe ?? []).map((item) => ({ material: item.material, amount: item.amount }));
  els.productDialogEyebrow.textContent = "Ware bearbeiten";
  els.productDialogTitle.textContent = product.name;
  els.productDialogIntro.textContent = "Änderungen werden im Calculator und im automatischen Material-Unterrezept berücksichtigt.";
  els.productDialogSubmitBtn.textContent = "Änderungen speichern";
  els.productFactoryLabel.value = FACTORIES[factory];
  els.newProductName.value = product.name;
  els.newProductOutput.value = positiveInteger(product.output, 1);
  if (els.productTradeAlias) els.productTradeAlias.value = getExplicitTradeAlias(product.name) ?? "";
  renderTradeDatalist();
  renderProductTradeAliasDatalist();
  renderProductDialogRecipeRows();
  showDialog(els.productDialog, "#newProductName");
}

function closeProductDialog() {
  els.productDialog.close();
}

function saveProductFromDialog(event) {
  event.preventDefault();
  if (!requireAdminAccess()) return;
  const name = cleanText(els.newProductName.value);
  const output = positiveInteger(els.newProductOutput.value, 1);
  const tradeAlias = cleanText(els.productTradeAlias?.value ?? "");
  const recipe = productDialogRecipe
    .map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) }))
    .filter((item) => item.material && item.amount > 0);

  if (!name) {
    alert("Bitte einen Warennamen eintragen.");
    queueFocus("#newProductName");
    return;
  }

  const factoryProducts = state.products[productDialogFactory];
  const duplicate = factoryProducts.find((product) => product.name.toLocaleLowerCase("de-DE") === name.toLocaleLowerCase("de-DE") && product.id !== productDialogProductId);
  if (duplicate) {
    alert(`In dieser Fabrik existiert bereits eine Ware namens "${name}".`);
    queueFocus("#newProductName");
    return;
  }

  const existingMaterial = state.materials.find((material) => material.toLocaleLowerCase("de-DE") === name.toLocaleLowerCase("de-DE"));
  const existingRecipe = existingMaterial ? getExistingMaterialRecipe(existingMaterial) : null;
  if (existingMaterial && existingRecipe && !existingRecipe.autoProductId) {
    alert(`"${name}" existiert bereits als manuelles Material. Lege die Ware bitte unter einem anderen Namen an oder benenne das Material vorher um.`);
    queueFocus("#newProductName");
    return;
  }

  if (productDialogMode === "create") {
    const product = { id: cryptoId(), name, output, recipe };
    factoryProducts.unshift(product);
    ensureMaterial(name);
    recipe.forEach((item) => ensureMaterial(item.material));
    setTradeAlias(name, tradeAlias);
    syncSingleProductRecipeToMaterial(product);
    closeProductDialog();
    renderAll();
    activateTab(productDialogFactory);
    queueFocusProductCard(product.id);
    return;
  }

  const product = factoryProducts.find((item) => item.id === productDialogProductId);
  if (!product) return;
  const oldName = product.name;
  product.name = name;
  product.output = output;
  product.recipe = recipe;
  ensureMaterial(name);
  recipe.forEach((item) => ensureMaterial(item.material));
  if (oldName !== name) replaceProductMaterialName(oldName, name, product.id);
  setTradeAlias(name, tradeAlias);
  syncSingleProductRecipeToMaterial(product);
  closeProductDialog();
  renderAll();
  activateTab(productDialogFactory);
  queueFocusProductCard(product.id);
}

function addProductDialogRecipeRow() {
  const available = getMaterialOptionsForDialog();
  if (!available.length) {
    alert("Lege zuerst mindestens ein Material oder eine Ware an, bevor du eine Rezeptzeile erstellst.");
    return;
  }
  productDialogRecipe.push({ material: available[0].value, amount: 1 });
  renderProductDialogRecipeRows();
}

function renderProductDialogRecipeRows() {
  renderDialogRecipeRows({
    tbody: els.productDialogRecipeTableBody,
    template: els.productDialogRecipeRowTemplate,
    recipe: productDialogRecipe,
    materialSelector: ".product-dialog-recipe-material",
    amountSelector: ".product-dialog-recipe-amount",
    removeSelector: ".remove-product-dialog-recipe-row",
    emptyText: "Noch keine Materialien im Rezept."
  });
}

function renderDialogRecipeRows(config) {
  const { tbody, template, recipe, materialSelector, amountSelector, removeSelector, emptyText } = config;
  tbody.innerHTML = "";
  if (!recipe.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="3" class="empty-state">${escapeHtml(emptyText)}</td>`;
    tbody.appendChild(row);
    return;
  }

  recipe.forEach((item, index) => {
    const row = template.content.firstElementChild.cloneNode(true);
    const materialSelect = row.querySelector(materialSelector);
    const amountInput = row.querySelector(amountSelector);
    fillSelect(materialSelect, getMaterialOptionsForDialog(materialDialogMode === "edit" && recipe === materialDialogRecipe ? materialDialogOriginalName : null), item.material);
    amountInput.value = positiveInteger(item.amount, 1);
    materialSelect.addEventListener("change", () => {
      recipe[index].material = materialSelect.value;
    });
    amountInput.addEventListener("change", () => {
      recipe[index].amount = positiveInteger(amountInput.value, 0);
    });
    row.querySelector(removeSelector).addEventListener("click", () => {
      recipe.splice(index, 1);
      if (recipe === materialDialogRecipe) renderMaterialDialogRecipeRows();
      if (recipe === productDialogRecipe) renderProductDialogRecipeRows();
    });
    tbody.appendChild(row);
  });
}

function showDialog(dialog, focusSelector) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    queueFocus(focusSelector);
  } else {
    alert("Dein Browser unterstützt Dialogfenster nicht vollständig.");
  }
}

function addPlanRow() {
  const factory = firstFactoryWithProduct() || Object.keys(FACTORIES)[0];
  state.plan.push({
    id: cryptoId(),
    factory,
    productId: state.products[factory][0]?.id ?? null,
    quantity: 1
  });
  renderAll();
  activateTab("calculator");
  queueFocus("#planTable tbody tr:last-child .plan-product");
}

function sortPlanAlphabetically() {
  state.plan.sort((a, b) => {
    const productA = findProduct(a.productId);
    const productB = findProduct(b.productId);
    const nameA = productA?.name || "";
    const nameB = productB?.name || "";
    const productCompare = nameA.localeCompare(nameB, "de", { sensitivity: "base" });
    if (productCompare !== 0) return productCompare;
    return (FACTORIES[a.factory] || a.factory).localeCompare(FACTORIES[b.factory] || b.factory, "de", { sensitivity: "base" });
  });
}

async function copyRequirementsTable() {
  const requirements = calculateRequirements();
  const lines = [["Material", "Gesamtbedarf", "Aus Inventar", "Zukaufbedarf"], ...Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" })).map(([material, amount]) => {
    const inventoryAmount = Math.min(getInventoryAmount(material), positiveInteger(amount, 0));
    return [material, amount, inventoryAmount, Math.max(positiveInteger(amount, 0) - inventoryAmount, 0)];
  })].map((row) => row.join("\t"));
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    temporaryButtonText(els.copyMaterialsBtn, "Kopiert", "Tabelle kopieren");
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

async function copyRawRequirementsTable() {
  const rawRequirements = calculateRawRequirements().totals;
  const lines = [["Rohmaterial", "Gesamtbedarf", "Aus Inventar", "Zukaufbedarf"], ...Object.entries(rawRequirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" })).map(([material, amount]) => {
    const inventoryAmount = Math.min(getInventoryAmount(material), positiveInteger(amount, 0));
    return [material, amount, inventoryAmount, Math.max(positiveInteger(amount, 0) - inventoryAmount, 0)];
  })].map((row) => row.join("\t"));
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    temporaryButtonText(els.copyRawMaterialsBtn, "Kopiert", "Tabelle kopieren");
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

function temporaryButtonText(button, text, originalText) {
  button.textContent = text;
  setTimeout(() => (button.textContent = originalText), 1400);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "waren-daten.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  if (!requireAdminAccess()) {
    event.target.value = "";
    return;
  }
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      validateImportedState(imported);
      state = imported;
      renderAll();
    } catch (error) {
      alert(`Import fehlgeschlagen: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function resetData() {
  if (!requireAdminAccess()) return;
  if (!confirm("Alle lokal gespeicherten Daten werden gelöscht und durch die mitgelieferten Standarddaten ersetzt. Fortfahren?")) return;
  localStorage.removeItem(STORAGE_KEY);
  inventoryDraftRows = [];
  state = createDefaultState();
  await bootstrapBundledData(true);
  renderAll();
}

async function loadBundledDataFromMenu() {
  if (!requireAdminAccess()) return;
  if (!confirm("Lokale Daten durch die mitgelieferte waren-daten.json ersetzen?")) return;
  await bootstrapBundledData(true);
  renderAll();
}


async function bootstrapBundledData(force) {
  if (!force && localStorage.getItem(STORAGE_KEY)) return false;
  try {
    const response = await fetch(BUNDLED_DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bundled = await response.json();
    validateImportedState(bundled);
    state = bundled;
    normalizeState();
    saveState();
    return true;
  } catch (error) {
    console.warn(`Standarddaten konnten nicht geladen werden: ${error.message}`);
    return false;
  }
}

function toggleAdminAccess() {
  if (adminUnlocked) {
    adminUnlocked = false;
    localStorage.removeItem(ADMIN_FLAG_KEY);
    renderAll();
    return;
  }

  if (!confirm(EDIT_CONFIRMATION_TEXT)) return;
  adminUnlocked = true;
  localStorage.setItem(ADMIN_FLAG_KEY, "1");
  renderAll();
}

function requireAdminAccess() {
  if (adminUnlocked) return true;
  alert("Bearbeiten ist gesperrt. Öffne im Daten-Menü den Bearbeitungsmodus und bestätige den Hinweis.");
  return false;
}

function updateAdminUi() {
  document.body.classList.toggle("admin-unlocked", adminUnlocked);
  document.body.classList.toggle("admin-locked", !adminUnlocked);
  if (els.adminAccessBtn) els.adminAccessBtn.textContent = adminUnlocked ? "Bearbeitung sperren" : "Bearbeitung aktivieren";
  if (els.standardMarginInput) els.standardMarginInput.disabled = !adminUnlocked;
  if (els.laborHourlyValueInput) els.laborHourlyValueInput.disabled = !adminUnlocked;
  if (!adminUnlocked) {
    materialSearchQuery = "";
    tradeSearchQuery = "";
    farmSearchQuery = "";
    if (els.materialSearchInput) els.materialSearchInput.value = "";
    if (els.tradeSearchInput) els.tradeSearchInput.value = "";
    if (els.farmSearchInput) els.farmSearchInput.value = "";
    Object.keys(productSearchQueries).forEach((key) => { productSearchQueries[key] = ""; });
  }
  document.querySelectorAll(".admin-only").forEach((item) => {
    item.hidden = !adminUnlocked;
  });
  updateFloatingAddButton();
}

function getActiveTarget() {
  return document.querySelector(".panel.active")?.id || "calculator";
}

function updateFloatingAddButton() {
  if (!els.floatingAddBtn) return;
  const activeTarget = getActiveTarget();
  const isFactory = Object.hasOwn(FACTORIES, activeTarget);
  const shouldShow = adminUnlocked && (activeTarget === "materials" || activeTarget === "trade" || isFactory);
  els.floatingAddBtn.hidden = !shouldShow;
  if (!shouldShow) {
    els.floatingAddBtn.removeAttribute("data-target");
    return;
  }

  els.floatingAddBtn.dataset.target = activeTarget;
  els.floatingAddBtn.textContent = activeTarget === "materials" ? "Material hinzufügen" : activeTarget === "trade" ? "Handelseintrag hinzufügen" : "Ware hinzufügen";
}

function handleFloatingAdd() {
  if (!requireAdminAccess()) return;
  const target = els.floatingAddBtn?.dataset.target || getActiveTarget();
  if (target === "materials") {
    openMaterialDialogCreate();
    return;
  }
  if (target === "trade") {
    openTradeDialogCreate();
    activateTab("trade");
    return;
  }
  if (Object.hasOwn(FACTORIES, target)) {
    openProductDialogCreate(target);
  }
}

function updateBackToTopVisibility() {
  if (!els.backToTopBtn) return;
  els.backToTopBtn.classList.toggle("visible", window.scrollY > 520);
}

function updatePlanProductOptions(select, factory, selectedProductId) {
  const products = (state.products[factory] ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }));
  const options = products.length ? products.map((product) => ({ value: product.id, label: product.name })) : [{ value: "", label: "Keine Ware vorhanden" }];
  fillSelect(select, options, selectedProductId);
}

function fillSelect(select, options, selectedValue) {
  select.innerHTML = "";
  options
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, "de", { sensitivity: "base" }))
    .forEach((option) => {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      select.appendChild(node);
    });
  if (selectedValue && options.some((option) => option.value === selectedValue)) select.value = selectedValue;
}
function getManualMaterials() {
  return state.materials
    .filter((material) => !getExistingMaterialRecipe(material)?.autoProductId)
    .sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" }));
}

function getMaterialOptionsForDialog(excludeMaterial = null) {
  return state.materials
    .filter((material) => material !== excludeMaterial)
    .map((material) => {
      const origin = getAutoMaterialOrigin(material);
      return {
        value: material,
        label: origin ? `${material} — Ware aus ${origin.factoryLabel}` : material
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "de", { sensitivity: "base" }));
}

function getAutoMaterialOrigin(materialName) {
  const recipeDef = getExistingMaterialRecipe(materialName);
  if (!recipeDef?.autoProductId) return null;
  return getProductOrigin(recipeDef.autoProductId);
}

function getProductOrigin(productId) {
  for (const [factory, products] of Object.entries(state.products ?? {})) {
    const product = products.find((item) => item.id === productId);
    if (product) return { factory, factoryLabel: FACTORIES[factory], product };
  }
  return null;
}


function findProduct(productId) {
  if (!productId) return null;
  return Object.values(state.products).flat().find((product) => product.id === productId) ?? null;
}

function findProductByName(productName) {
  return findProductsByName(productName)[0] ?? null;
}

function findProductsByName(productName) {
  const normalizedName = cleanText(productName).toLocaleLowerCase("de-DE");
  if (!normalizedName) return [];
  return Object.values(state.products ?? {}).flat().filter((product) => cleanText(product.name).toLocaleLowerCase("de-DE") === normalizedName);
}

function findProductsProvidingName(itemName) {
  const normalizedName = cleanText(itemName).toLocaleLowerCase("de-DE");
  if (!normalizedName) return [];
  return Object.values(state.products ?? {}).flat().filter((product) => {
    const productName = cleanText(product.name).toLocaleLowerCase("de-DE");
    const outputIdentity = cleanText(getProductOutputIdentityName(product)).toLocaleLowerCase("de-DE");
    return productName === normalizedName || outputIdentity === normalizedName;
  });
}

function productNameIsUsedByAnotherProduct(name, excludedProductId = null) {
  const normalizedName = cleanText(name).toLocaleLowerCase("de-DE");
  if (!normalizedName) return false;
  return Object.values(state.products ?? {}).flat().some((product) => product.id !== excludedProductId && cleanText(product.name).toLocaleLowerCase("de-DE") === normalizedName);
}

function selectCraftableProductForExpansion(productName, stack = new Set()) {
  const candidates = findProductsProvidingName(productName).filter((product) => product.recipe?.length && !stack.has(`product:${product.id}`));
  if (!candidates.length) return null;

  const scored = candidates
    .map((product) => ({ product, cost: calculateProductUnitCostWithOptimalInputs(product, new Set(stack)) }))
    .filter((item) => item.cost.complete);

  if (scored.length) return scored.reduce((best, current) => current.cost.unitCost < best.cost.unitCost ? current : best).product;
  return candidates[0];
}

function getMaterialRecipe(materialName) {
  const name = cleanText(materialName);
  state.materialRecipes ??= {};
  state.materialPrices ??= {};
  state.tradePrices ??= {};
  state.tradeAliases ??= {};
  state.inventory ??= {};
  state.labor ??= {};
  state.farmProfiles ??= {};
  state.pricing ??= {};
  state.pricing.standardMarginPercent = positiveNumber(state.pricing.standardMarginPercent, 30);
  state.labor.hourlyValue = positiveNumber(state.labor.hourlyValue, 0);
  state.materialRecipes[name] ??= { output: 1, recipe: [] };
  state.materialRecipes[name].output = positiveInteger(state.materialRecipes[name].output, 1);
  state.materialRecipes[name].recipe = Array.isArray(state.materialRecipes[name].recipe) ? state.materialRecipes[name].recipe : [];
  return state.materialRecipes[name];
}

function getExistingMaterialRecipe(materialName) {
  const name = cleanText(materialName);
  if (!name || !state.materialRecipes) return null;
  return state.materialRecipes[name] ?? null;
}

function ensureMaterial(name) {
  const cleaned = cleanText(name);
  if (!cleaned) return;
  const exists = state.materials.some((material) => material.toLocaleLowerCase("de-DE") === cleaned.toLocaleLowerCase("de-DE"));
  if (!exists) state.materials.push(cleaned);
}

function renameMaterial(oldName, newName, shouldRender = true) {
  if (oldName === newName) return;
  if (state.materials.some((material) => material === newName)) {
    alert(`Das Material "${newName}" existiert bereits.`);
    if (shouldRender) renderAll();
    return;
  }
  state.materials = state.materials.map((material) => (material === oldName ? newName : material));
  if (state.materialRecipes?.[oldName]) {
    state.materialRecipes[newName] = state.materialRecipes[oldName];
    delete state.materialRecipes[oldName];
  }
  if (state.materialPrices?.[oldName] !== undefined) {
    state.materialPrices[newName] = state.materialPrices[oldName];
    delete state.materialPrices[oldName];
  }
  renameTradeAliasKey(oldName, newName);
  renameTradePrice(oldName, newName);
  if (state.inventory?.[oldName] !== undefined) {
    state.inventory[newName] = (positiveInteger(state.inventory[newName], 0) || 0) + positiveInteger(state.inventory[oldName], 0);
    delete state.inventory[oldName];
  }
  replaceRecipeMaterialReferences(oldName, newName);
  if (shouldRender) renderAll();
}

function replaceProductMaterialName(oldName, newName, productId) {
  const oldNameStillUsed = productNameIsUsedByAnotherProduct(oldName, productId);
  if (state.materials.includes(oldName) && !oldNameStillUsed) renameMaterial(oldName, newName, false);
  else ensureMaterial(newName);

  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    if (recipeDef.autoProductId === productId && materialName !== newName) {
      delete state.materialRecipes[materialName];
    }
  }
}

function replaceRecipeMaterialReferences(oldName, newName) {
  for (const product of Object.values(state.products).flat()) {
    for (const recipeItem of product.recipe) {
      if (recipeItem.material === oldName) recipeItem.material = newName;
    }
  }
  for (const recipeDef of Object.values(state.materialRecipes ?? {})) {
    for (const recipeItem of recipeDef.recipe ?? []) {
      if (recipeItem.material === oldName) recipeItem.material = newName;
    }
  }
}

function isMaterialInUse(materialName) {
  const usedInProducts = Object.values(state.products).flat().some((product) => product.recipe.some((recipeItem) => recipeItem.material === materialName));
  const usedInMaterialRecipes = Object.entries(state.materialRecipes ?? {}).some(([name, recipeDef]) => name !== materialName && (recipeDef.recipe ?? []).some((recipeItem) => recipeItem.material === materialName));
  const matchingProduct = Object.values(state.products).flat().some((product) => product.name === materialName);
  return usedInProducts || usedInMaterialRecipes || matchingProduct;
}

function clearAutoRecipeFlag(materialName) {
  const recipeDef = getExistingMaterialRecipe(materialName);
  if (recipeDef?.autoProductId) delete recipeDef.autoProductId;
}

function syncSingleProductRecipeToMaterial(product) {
  ensureMaterial(product.name);
  const existing = getExistingMaterialRecipe(product.name);
  if (!existing || existing.autoProductId === product.id || !existing.recipe?.length) {
    state.materialRecipes[product.name] = {
      output: positiveInteger(product.output, 1),
      autoProductId: product.id,
      recipe: (product.recipe ?? []).map((item) => ({ material: item.material, amount: positiveInteger(item.amount, 0) }))
    };
  }
}

function syncProductRecipesToMaterials() {
  const validProductIds = new Set(Object.values(state.products).flat().map((product) => product.id));
  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    if (recipeDef.autoProductId && !validProductIds.has(recipeDef.autoProductId)) delete state.materialRecipes[materialName];
  }
  for (const product of Object.values(state.products).flat()) syncSingleProductRecipeToMaterial(product);
}

function removeAutoRecipeForProduct(productId) {
  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    if (recipeDef.autoProductId === productId) delete state.materialRecipes[materialName];
  }
}

function sortMaterials() {
  state.materials = unique(state.materials).sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" }));
}

function normalizeTradePricesFromState() {
  const normalized = {};
  const add = (itemName, values) => {
    const name = cleanText(itemName);
    if (!name) return;
    const record = {
      importPrice: optionalNumber(values?.importPrice),
      exportPrice: optionalNumber(values?.exportPrice),
      marketValue: optionalNumber(values?.marketValue)
    };
    if (record.importPrice === null && record.exportPrice === null && record.marketValue === null) return;
    normalized[name] = mergeTradeRecord(normalized[name], record);
  };

  for (const [name, record] of Object.entries(state.tradePrices ?? {})) add(name, record);
  for (const [name, price] of Object.entries(state.materialImportPrices ?? {})) add(name, { importPrice: price });
  for (const [name, price] of Object.entries(state.materialExportPrices ?? {})) add(name, { exportPrice: price });

  for (const product of Object.values(state.products ?? {}).flat()) {
    add(product.name, {
      importPrice: product.importPrice,
      exportPrice: product.exportPrice,
      marketValue: product.marketValue
    });
    delete product.importPrice;
    delete product.exportPrice;
    delete product.marketValue;
  }

  return Object.fromEntries(Object.entries(normalized).sort(([a], [b]) => a.localeCompare(b, "de", { sensitivity: "base" })));
}


function normalizeTradeAliasesFromState() {
  const normalized = {};
  const knownNames = new Set([
    ...(state.materials ?? []),
    ...Object.values(state.products ?? {}).flat().map((product) => product.name),
    ...Object.keys(state.tradePrices ?? {})
  ].map(cleanText).filter(Boolean));

  for (const [itemName, aliasName] of Object.entries(state.tradeAliases ?? {})) {
    const item = cleanText(itemName);
    const alias = cleanText(aliasName);
    if (!item || !alias || item === alias) continue;
    if (!knownNames.has(item)) continue;
    normalized[item] = alias;
  }

  return Object.fromEntries(Object.entries(normalized).sort(([a], [b]) => a.localeCompare(b, "de", { sensitivity: "base" })));
}

function mergeTradeRecord(base, extra) {
  return {
    importPrice: optionalNumber(extra?.importPrice) ?? optionalNumber(base?.importPrice),
    exportPrice: optionalNumber(extra?.exportPrice) ?? optionalNumber(base?.exportPrice),
    marketValue: optionalNumber(extra?.marketValue) ?? optionalNumber(base?.marketValue)
  };
}

function normalizeState() {
  state.materials = unique((state.materials ?? []).map(cleanText).filter(Boolean));
  state.products ??= {};
  state.plan ??= [];
  state.materialRecipes ??= {};
  state.materialPrices ??= {};
  state.tradePrices ??= {};
  state.tradeAliases ??= {};
  state.inventory ??= {};
  state.labor ??= {};
  state.farmProfiles ??= {};
  state.pricing ??= {};
  state.pricing.standardMarginPercent = positiveNumber(state.pricing.standardMarginPercent, 30);
  state.labor.hourlyValue = positiveNumber(state.labor.hourlyValue, 0);
  DEFAULT_RAW_MATERIALS.forEach(ensureMaterial);

  for (const factory of Object.keys(FACTORIES)) {
    state.products[factory] ??= [];
    state.products[factory] = state.products[factory].map((product) => ({
      id: product.id || cryptoId(),
      name: cleanText(product.name) || "Unbenannte Ware",
      output: positiveInteger(product.output, 1),
      importPrice: optionalNumber(product.importPrice),
      exportPrice: optionalNumber(product.exportPrice),
      marketValue: optionalNumber(product.marketValue),
      recipe: Array.isArray(product.recipe)
        ? product.recipe.map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) })).filter((item) => item.material)
        : []
    }));
  }

  for (const product of Object.values(state.products).flat()) {
    ensureMaterial(product.name);
    product.recipe.forEach((item) => ensureMaterial(item.material));
  }

  const normalizedMaterialRecipes = {};
  for (const [materialName, recipeDef] of Object.entries(state.materialRecipes ?? {})) {
    const name = cleanText(materialName);
    if (!name) continue;
    ensureMaterial(name);
    normalizedMaterialRecipes[name] = {
      output: positiveInteger(recipeDef?.output, 1),
      autoProductId: cleanText(recipeDef?.autoProductId) || undefined,
      recipe: Array.isArray(recipeDef?.recipe)
        ? recipeDef.recipe.map((item) => ({ material: cleanText(item.material), amount: positiveInteger(item.amount, 0) })).filter((item) => item.material)
        : []
    };
    normalizedMaterialRecipes[name].recipe.forEach((item) => ensureMaterial(item.material));
  }
  const normalizedMaterialPrices = {};
  for (const [materialName, price] of Object.entries(state.materialPrices ?? {})) {
    const name = cleanText(materialName);
    const value = optionalNumber(price);
    if (name && value !== null) normalizedMaterialPrices[name] = value;
  }
  const normalizedTradePrices = normalizeTradePricesFromState();
  state.tradePrices = normalizedTradePrices;
  const normalizedTradeAliases = normalizeTradeAliasesFromState();
  const normalizedInventory = {};
  for (const [materialName, amount] of Object.entries(state.inventory ?? {})) {
    const name = cleanText(materialName);
    const value = positiveInteger(amount, 0);
    if (name && value > 0) {
      ensureMaterial(name);
      normalizedInventory[name] = (normalizedInventory[name] ?? 0) + value;
    }
  }
  state.materialRecipes = normalizedMaterialRecipes;
  state.materialPrices = normalizedMaterialPrices;
  state.tradePrices = normalizedTradePrices;
  state.tradeAliases = normalizedTradeAliases;
  const normalizedFarmProfiles = {};
  for (const [materialName, profile] of Object.entries(state.farmProfiles ?? {})) {
    const name = cleanText(materialName);
    if (!name || !profile || typeof profile !== "object") continue;
    const amountPerHour = positiveNumber(profile.amountPerHour, 0);
    const enabled = profile.enabled !== false;
    const createdAt = positiveNumber(profile.createdAt, 0);
    ensureMaterial(name);
    normalizedFarmProfiles[name] = { enabled, amountPerHour, createdAt };
  }
  state.farmProfiles = Object.fromEntries(Object.entries(normalizedFarmProfiles).sort(([a, av], [b, bv]) => {
    const aCreated = positiveNumber(av?.createdAt, 0);
    const bCreated = positiveNumber(bv?.createdAt, 0);
    if (aCreated || bCreated) return bCreated - aCreated;
    return a.localeCompare(b, "de", { sensitivity: "base" });
  }));
  delete state.materialImportPrices;
  delete state.materialExportPrices;
  state.inventory = normalizedInventory;
  syncProductRecipesToMaterials();
  sortMaterials();

  state.plan = state.plan.map((item) => {
    const factory = FACTORIES[item.factory] ? item.factory : Object.keys(FACTORIES)[0];
    const validProduct = state.products[factory].some((product) => product.id === item.productId);
    return {
      id: item.id || cryptoId(),
      factory,
      productId: validProduct ? item.productId : state.products[factory][0]?.id ?? null,
      quantity: positiveInteger(item.quantity, 0)
    };
  });
}

function validateImportedState(value) {
  if (!value || typeof value !== "object") throw new Error("Datei enthält kein gültiges Objekt.");
  if (!Array.isArray(value.materials)) throw new Error("Feld 'materials' fehlt oder ist ungültig.");
  if (!value.products || typeof value.products !== "object") throw new Error("Feld 'products' fehlt oder ist ungültig.");
  for (const factory of Object.keys(FACTORIES)) {
    if (value.products[factory] !== undefined && !Array.isArray(value.products[factory])) throw new Error(`Feld 'products.${factory}' ist ungültig.`);
  }
  if (!Array.isArray(value.plan)) throw new Error("Feld 'plan' fehlt oder ist ungültig.");
  if (value.materialRecipes !== undefined && (typeof value.materialRecipes !== "object" || Array.isArray(value.materialRecipes))) throw new Error("Feld 'materialRecipes' ist ungültig.");
  if (value.materialPrices !== undefined && (typeof value.materialPrices !== "object" || Array.isArray(value.materialPrices))) throw new Error("Feld 'materialPrices' ist ungültig.");
  if (value.materialImportPrices !== undefined && (typeof value.materialImportPrices !== "object" || Array.isArray(value.materialImportPrices))) throw new Error("Feld 'materialImportPrices' ist ungültig.");
  if (value.materialExportPrices !== undefined && (typeof value.materialExportPrices !== "object" || Array.isArray(value.materialExportPrices))) throw new Error("Feld 'materialExportPrices' ist ungültig.");
  if (value.tradePrices !== undefined && (typeof value.tradePrices !== "object" || Array.isArray(value.tradePrices))) throw new Error("Feld 'tradePrices' ist ungültig.");
  if (value.tradeAliases !== undefined && (typeof value.tradeAliases !== "object" || Array.isArray(value.tradeAliases))) throw new Error("Feld 'tradeAliases' ist ungültig.");
  if (value.inventory !== undefined && (typeof value.inventory !== "object" || Array.isArray(value.inventory))) throw new Error("Feld 'inventory' ist ungültig.");
  if (value.labor !== undefined && (typeof value.labor !== "object" || Array.isArray(value.labor))) throw new Error("Feld 'labor' ist ungültig.");
  if (value.farmProfiles !== undefined && (typeof value.farmProfiles !== "object" || Array.isArray(value.farmProfiles))) throw new Error("Feld 'farmProfiles' ist ungültig.");
  if (value.pricing !== undefined && (typeof value.pricing !== "object" || Array.isArray(value.pricing))) throw new Error("Feld 'pricing' ist ungültig.");
}

function loadState() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createDefaultState();
    const parsed = JSON.parse(saved);
    validateImportedState(parsed);
    return parsed;
  } catch {
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function firstFactoryWithProduct() {
  return Object.keys(FACTORIES).find((factory) => state.products[factory]?.length);
}

function createDefaultState() {
  const products = {};
  for (const factory of Object.keys(FACTORIES)) products[factory] = [];
  return { materials: [], materialRecipes: {}, materialPrices: {}, tradePrices: {}, tradeAliases: {}, inventory: {}, labor: { hourlyValue: 0 }, farmProfiles: {}, pricing: { standardMarginPercent: 30 }, products, plan: [] };
}


function optionalNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number.parseFloat(String(value).replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) return null;
  return number;
}

function positiveNumber(value, fallback) {
  const number = Number.parseFloat(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}

function formatInputNumber(value) {
  const number = optionalNumber(value);
  return number === null ? "" : String(number);
}

function getMaterialManualPrice(materialName) {
  const value = state.materialPrices?.[cleanText(materialName)];
  return optionalNumber(value);
}

function setMaterialManualPrice(materialName, value) {
  state.materialPrices ??= {};
  const name = cleanText(materialName);
  if (!name) return;
  const price = optionalNumber(value);
  if (price === null) delete state.materialPrices[name];
  else state.materialPrices[name] = price;
}

function getTradeRecord(itemName, options = {}) {
  const key = resolveTradeKey(itemName, options);
  const record = key ? state.tradePrices?.[key] : null;
  if (!record || typeof record !== "object") return null;
  return record;
}

function getExactTradeRecord(itemName) {
  const key = cleanText(itemName);
  const record = key ? state.tradePrices?.[key] : null;
  if (!record || typeof record !== "object") return null;
  return record;
}

function resolveTradeKey(itemName, options = {}) {
  const name = cleanText(itemName);
  if (!name) return null;

  if (options.exact) return name;

  const explicitAlias = getExplicitTradeAlias(name);
  if (explicitAlias && state.tradePrices?.[explicitAlias]) return explicitAlias;

  if (state.tradePrices?.[name]) return name;

  const automaticAlias = inferAutomaticTradeAlias(name);
  if (automaticAlias && state.tradePrices?.[automaticAlias]) return automaticAlias;

  return explicitAlias || name;
}

function getExplicitTradeAlias(itemName) {
  const name = cleanText(itemName);
  const alias = cleanText(state.tradeAliases?.[name]);
  return alias && alias !== name ? alias : null;
}

function inferAutomaticTradeAlias(itemName) {
  const name = cleanText(itemName);
  const paletteSuffix = " (aus Palette)";
  if (name.endsWith(paletteSuffix)) return cleanText(name.slice(0, -paletteSuffix.length));
  return null;
}

function getTradeSourceLabel(source, itemName) {
  const name = cleanText(itemName);
  const key = resolveTradeKey(name);
  return key && key !== name ? `${source} (${key})` : source;
}

function getProductOutputIdentityName(productOrName) {
  const name = typeof productOrName === "object" ? cleanText(productOrName?.name) : cleanText(productOrName);
  return getExplicitTradeAlias(name) || inferAutomaticTradeAlias(name) || name;
}

function setTradeAlias(itemName, aliasName) {
  state.tradeAliases ??= {};
  const name = cleanText(itemName);
  const alias = cleanText(aliasName);
  if (!name) return;
  if (!alias || alias === name) delete state.tradeAliases[name];
  else state.tradeAliases[name] = alias;
}

function deleteTradeAlias(itemName) {
  const name = cleanText(itemName);
  if (name && state.tradeAliases) delete state.tradeAliases[name];
}

function renameTradeAliasKey(oldName, newName) {
  const oldKey = cleanText(oldName);
  const newKey = cleanText(newName);
  if (!oldKey || !newKey || oldKey === newKey || !state.tradeAliases?.[oldKey]) return;
  state.tradeAliases[newKey] = state.tradeAliases[oldKey];
  delete state.tradeAliases[oldKey];
}

function renameTradeAliasTargets(oldName, newName) {
  const oldKey = cleanText(oldName);
  const newKey = cleanText(newName);
  if (!oldKey || !newKey || oldKey === newKey || !state.tradeAliases) return;
  for (const [item, alias] of Object.entries(state.tradeAliases)) {
    if (cleanText(alias) === oldKey) state.tradeAliases[item] = newKey;
  }
}

function setTradePrice(itemName, values) {
  state.tradePrices ??= {};
  const name = cleanText(itemName);
  if (!name) return;
  const record = {
    importPrice: optionalNumber(values?.importPrice),
    exportPrice: optionalNumber(values?.exportPrice),
    marketValue: optionalNumber(values?.marketValue)
  };
  if (record.importPrice === null && record.exportPrice === null && record.marketValue === null) {
    delete state.tradePrices[name];
    return;
  }
  state.tradePrices[name] = record;
}

function deleteTradePrice(itemName) {
  const name = cleanText(itemName);
  if (name && state.tradePrices) delete state.tradePrices[name];
}

function renameTradePrice(oldName, newName) {
  const oldKey = cleanText(oldName);
  const newKey = cleanText(newName);
  if (!oldKey || !newKey || oldKey === newKey || !state.tradePrices?.[oldKey]) return;
  state.tradePrices[newKey] = mergeTradeRecord(state.tradePrices[newKey], state.tradePrices[oldKey]);
  delete state.tradePrices[oldKey];
  renameTradeAliasTargets(oldKey, newKey);
}

function getTradeImportPrice(itemName) {
  return optionalNumber(getTradeRecord(itemName)?.importPrice);
}

function getExactTradeImportPrice(itemName) {
  return optionalNumber(getExactTradeRecord(itemName)?.importPrice);
}

function getTradeExportPrice(itemName) {
  return optionalNumber(getTradeRecord(itemName)?.exportPrice);
}

function getTradeMarketValue(itemName) {
  return optionalNumber(getTradeRecord(itemName)?.marketValue);
}

function getMaterialImportPrice(materialName) {
  return getExactTradeImportPrice(materialName);
}

function getMaterialExportPrice(materialName) {
  return getTradeExportPrice(materialName);
}

function getMaterialCostPrice(materialName) {
  return getExactTradeImportPrice(materialName) ?? getMaterialManualPrice(materialName);
}

function getProductBuyUnitCost(product) {
  return getExactTradeImportPrice(product?.name);
}

function getMaterialBuyUnitCost(materialName) {
  return getExactTradeImportPrice(materialName);
}


function getLaborHourlyValue() {
  state.labor ??= {};
  return positiveNumber(state.labor.hourlyValue, 0);
}

function getFarmProfile(materialName) {
  const name = cleanText(materialName);
  const profile = state.farmProfiles?.[name];
  if (!profile || typeof profile !== "object" || profile.enabled === false) return null;
  const amountPerHour = positiveNumber(profile.amountPerHour, 0);
  if (amountPerHour <= 0) return null;
  return { amountPerHour };
}

function getFarmUnitCost(materialName) {
  const profile = getFarmProfile(materialName);
  if (!profile) return null;
  return getLaborHourlyValue() / profile.amountPerHour;
}

function createFarmUnitOption(materialName) {
  const unitCost = getFarmUnitCost(materialName);
  return unitCost !== null ? { complete: true, unitCost, missing: [], kind: "farm" } : null;
}

function getProcurementOptionPriority(option) {
  const kind = cleanText(option?.kind || option?.actions?.[0]?.type);
  const priorities = { inventory: 0, farm: 1, craft: 2, import: 3, provide: 4, material: 4 };
  return priorities[kind] ?? 9;
}

function chooseCheapestUnitOptionFromList(options, fallbackName) {
  const complete = (options ?? []).filter((option) => option?.complete);
  if (complete.length) {
    return complete.reduce((best, current) => {
      if (current.unitCost < best.unitCost) return current;
      if (current.unitCost === best.unitCost && getProcurementOptionPriority(current) < getProcurementOptionPriority(best)) return current;
      return best;
    });
  }
  const missing = (options ?? []).flatMap((option) => option?.missing ?? []);
  return { complete: false, unitCost: null, missing: unique([...(missing ?? []), fallbackName].filter(Boolean)) };
}

function chooseCheapestBatchOptionFromList(options, fallbackName) {
  const complete = (options ?? []).filter((option) => option?.complete);
  if (complete.length) {
    return complete.reduce((best, current) => {
      if (current.totalCost < best.totalCost) return current;
      if (current.totalCost === best.totalCost && getProcurementOptionPriority(current) < getProcurementOptionPriority(best)) return current;
      return best;
    });
  }
  const missing = (options ?? []).flatMap((option) => option?.missing ?? []);
  return { complete: false, totalCost: null, missing: unique([...(missing ?? []), fallbackName].filter(Boolean)), actions: [] };
}

function calculateMaterialUnitCost(materialName, stack = new Set()) {
  const name = cleanText(materialName);
  const materialKey = `material:${name.toLocaleLowerCase("de-DE")}`;
  if (stack.has(materialKey)) return { complete: false, unitCost: null, missing: [name] };

  const nextStack = new Set(stack);
  nextStack.add(materialKey);
  const craftOption = calculateNamedMaterialCraftUnitCost(name, nextStack, false);
  if (craftOption.complete) return craftOption;

  const materialCost = getMaterialCostPrice(name);
  const materialOption = materialCost !== null ? { complete: true, unitCost: materialCost, missing: [], kind: "material" } : null;
  const farmOption = createFarmUnitOption(name);
  return chooseCheapestUnitOptionFromList([craftOption, materialOption, farmOption], name);
}

function calculateMaterialUnitCostWithOptimalInputs(materialName, stack = new Set()) {
  const name = cleanText(materialName);
  const materialKey = `material-optimal:${name.toLocaleLowerCase("de-DE")}`;
  if (stack.has(materialKey)) return { complete: false, unitCost: null, missing: [name] };

  const buyUnitCost = getMaterialBuyUnitCost(name);
  const buyOption = buyUnitCost !== null
    ? { complete: true, unitCost: buyUnitCost, missing: [], kind: "import" }
    : null;
  const farmOption = createFarmUnitOption(name);

  const nextStack = new Set(stack);
  nextStack.add(materialKey);
  const craftOption = calculateMaterialCraftUnitCostWithOptimalInputs(name, nextStack);

  return chooseCheapestUnitOptionFromList([buyOption, farmOption, craftOption], name);
}

function calculateMaterialCraftUnitCostWithOptimalInputs(materialName, stack = new Set()) {
  const name = cleanText(materialName);
  const materialKey = `material-craft:${name.toLocaleLowerCase("de-DE")}`;
  if (stack.has(materialKey)) return { complete: false, unitCost: null, missing: [name] };

  const nextStack = new Set(stack);
  nextStack.add(materialKey);
  const craftOption = calculateNamedMaterialCraftUnitCost(name, nextStack, true);
  if (craftOption.complete) return craftOption;

  const manualCost = getMaterialManualPrice(name);
  if (manualCost !== null) return { complete: true, unitCost: manualCost, missing: [], kind: "material" };
  return { complete: false, unitCost: null, missing: unique([...(craftOption.missing ?? []), name]) };
}

function calculateNamedMaterialCraftUnitCost(materialName, stack = new Set(), optimalInputs = true) {
  const name = cleanText(materialName);
  const options = [];
  const missing = [];
  const recipeDef = getExistingMaterialRecipe(name);

  if (recipeDef?.recipe?.length && !recipeDef.autoProductId) {
    const result = calculateRecipeDefinitionUnitCost(recipeDef, stack, optimalInputs);
    if (result.complete) options.push(result);
    else missing.push(...result.missing);
  }

  for (const product of findProductsProvidingName(name).filter((item) => item.recipe?.length)) {
    const productKey = `${optimalInputs ? "product-optimal" : "product"}:${product.id}`;
    if (stack.has(productKey)) continue;
    const result = optimalInputs ? calculateProductUnitCostWithOptimalInputs(product, stack) : calculateProductUnitCost(product, stack);
    if (result.complete) options.push(result);
    else missing.push(...result.missing);
  }

  if (recipeDef?.recipe?.length && recipeDef.autoProductId && !findProductsProvidingName(name).some((product) => product.id === recipeDef.autoProductId)) {
    const result = calculateRecipeDefinitionUnitCost(recipeDef, stack, optimalInputs);
    if (result.complete) options.push(result);
    else missing.push(...result.missing);
  }

  if (options.length) return options.reduce((best, current) => current.unitCost < best.unitCost ? current : best);
  return { complete: false, unitCost: null, missing: unique(missing.length ? missing : [name]) };
}

function calculateRecipeDefinitionUnitCost(recipeDef, stack = new Set(), optimalInputs = true) {
  let total = 0;
  const missing = [];
  for (const item of recipeDef.recipe ?? []) {
    const child = optimalInputs ? calculateMaterialUnitCostWithOptimalInputs(item.material, stack) : calculateMaterialUnitCost(item.material, stack);
    if (!child.complete) missing.push(...child.missing);
    else total += child.unitCost * positiveInteger(item.amount, 0);
  }
  if (missing.length) return { complete: false, unitCost: null, missing: unique(missing) };
  return { complete: true, unitCost: total / positiveInteger(recipeDef.output, 1), missing: [] };
}

function calculateProductUnitCost(product, stack = new Set()) {
  const productKey = `product:${product.id}`;
  if (stack.has(productKey)) return { complete: false, unitCost: null, missing: [product.name] };
  const nextStack = new Set(stack);
  nextStack.add(productKey);

  let totalCost = 0;
  const missing = [];
  for (const item of product.recipe ?? []) {
    const materialCost = calculateMaterialUnitCost(item.material, nextStack);
    if (!materialCost.complete) missing.push(...materialCost.missing);
    else totalCost += materialCost.unitCost * positiveInteger(item.amount, 0);
  }
  if (missing.length) return { complete: false, unitCost: null, missing: unique(missing) };
  return { complete: true, unitCost: totalCost / positiveInteger(product.output, 1), missing: [] };
}

function calculateProductUnitCostWithOptimalInputs(product, stack = new Set()) {
  const productKey = `product-optimal:${product.id}`;
  if (stack.has(productKey)) return { complete: false, unitCost: null, missing: [product.name] };
  const nextStack = new Set(stack);
  nextStack.add(productKey);

  let totalCost = 0;
  const missing = [];
  for (const item of product.recipe ?? []) {
    const materialCost = calculateMaterialUnitCostWithOptimalInputs(item.material, nextStack);
    if (!materialCost.complete) missing.push(...materialCost.missing);
    else totalCost += materialCost.unitCost * positiveInteger(item.amount, 0);
  }
  if (missing.length) return { complete: false, unitCost: null, missing: unique(missing) };
  return { complete: true, unitCost: totalCost / positiveInteger(product.output, 1), missing: [] };
}

function chooseCheapestUnitOption(buyOption, craftOption, fallbackName) {
  if (buyOption?.complete && craftOption?.complete) {
    return buyOption.unitCost <= craftOption.unitCost ? buyOption : craftOption;
  }
  if (craftOption?.complete) return craftOption;
  if (buyOption?.complete) return buyOption;
  return { complete: false, unitCost: null, missing: unique([...(craftOption?.missing ?? []), fallbackName].filter(Boolean)) };
}

function getSalePrice(product, unitCost) {
  const exportPrice = getTradeExportPrice(product?.name);
  if (exportPrice !== null) return { price: exportPrice, source: getTradeSourceLabel("Exportpreis", product?.name) };
  const marketValue = getTradeMarketValue(product?.name);
  if (marketValue !== null) return { price: marketValue, source: getTradeSourceLabel("Marktwert", product?.name) };
  if (unitCost !== null) {
    const margin = positiveNumber(state.pricing?.standardMarginPercent, 30);
    return { price: unitCost * (1 + margin / 100), source: "Kosten + Marge" };
  }
  return { price: null, source: "Unvollständig" };
}

function getProcurementAssessment(craftUnitCost, buyUnitCost) {
  if (craftUnitCost === null && buyUnitCost === null) return { text: "Keine Daten", className: "assessment-neutral" };
  if (craftUnitCost === null) return { text: "Einkaufen", className: "assessment-warning" };
  if (buyUnitCost === null) return { text: "Farmen/Craften", className: "assessment-good" };

  const delta = buyUnitCost - craftUnitCost;
  if (Math.abs(delta) <= 0.01) return { text: "Gleichstand", className: "assessment-neutral" };
  if (delta > 0) return { text: `Craften spart ${formatMoney(delta)}`, className: "assessment-good" };
  return { text: `Einkaufen spart ${formatMoney(Math.abs(delta))}`, className: "assessment-warning" };
}

function formatMoney(value) {
  const number = optionalNumber(value);
  if (number === null) return "—";
  return `${number.toLocaleString("de-DE", { minimumFractionDigits: number % 1 ? 2 : 0, maximumFractionDigits: 2 })} $`;
}

function formatOptionalMoney(value) {
  return optionalNumber(value) === null ? "—" : formatMoney(value);
}

function formatProfit(value) {
  const number = Number.parseFloat(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number)) return "—";
  const sign = number > 0 ? "+" : "";
  const abs = Math.abs(number);
  return `${sign}${number < 0 ? "-" : ""}${formatMoney(abs)}`;
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return number;
}

function preventNonInputCaret(event) {
  const interactive = event.target.closest('input, select, textarea, button, label, a, summary, details, [contenteditable="true"]');
  if (interactive) return;
  if (event.target.closest('.app-header, .card, .product-card, .modal-card, .tabs, .data-actions')) {
    event.preventDefault();
    if (document.activeElement && !['BODY', 'HTML'].includes(document.activeElement.tagName)) {
      document.activeElement.blur();
    }
  }
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function unique(values) {
  return [...new Set(values)];
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cryptoId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function queueFocus(selector) {
  window.setTimeout(() => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    element.focus();
    if (typeof element.select === "function") element.select();
  }, 0);
}

function queueFocusMaterialRow(materialName) {
  window.setTimeout(() => {
    const rows = [...document.querySelectorAll("#materialsTable tbody tr")];
    const row = rows.find((item) => item.querySelector("td")?.textContent?.trim() === materialName);
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
}

function queueFocusProductCard(productId) {
  window.setTimeout(() => {
    const element = document.querySelector(`.product-card[data-product-id="${cssEscape(productId)}"]`);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
