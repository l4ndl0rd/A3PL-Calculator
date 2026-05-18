const STORAGE_KEY = "fg2_warenherstellung_calculator_v4_empty";
const ADMIN_FLAG_KEY = "fg2_warenherstellung_calculator_admin_unlocked";
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
  chemistry: "Chemiefabrik",
  illegalWeapons: "Illegale Waffenfabrik"
};

let state = loadState();
let adminUnlocked = localStorage.getItem(ADMIN_FLAG_KEY) === "1";
let materialDialogMode = "create";
let materialDialogOriginalName = null;
let materialDialogRecipe = [];
let productDialogMode = "create";
let productDialogFactory = null;
let productDialogProductId = null;
let productDialogRecipe = [];

const els = {
  tabs: document.querySelector("#tabs"),
  factoryPanels: document.querySelector("#factoryPanels"),
  materialsTableBody: document.querySelector("#materialsTable tbody"),
  planTableBody: document.querySelector("#planTable tbody"),
  requirementsTableBody: document.querySelector("#requirementsTable tbody"),
  rawRequirementsTableBody: document.querySelector("#rawRequirementsTable tbody"),
  rawRequirementsHint: document.querySelector("#rawRequirementsHint"),
  economyTableBody: document.querySelector("#economyTable tbody"),
  economyHint: document.querySelector("#economyHint"),
  standardMarginInput: document.querySelector("#standardMarginInput"),
  addPlanRowBtn: document.querySelector("#addPlanRowBtn"),
  addMaterialBtn: document.querySelector("#addMaterialBtn"),
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
  newProductImportPrice: document.querySelector("#newProductImportPrice"),
  newProductExportPrice: document.querySelector("#newProductExportPrice"),
  newProductMarketValue: document.querySelector("#newProductMarketValue"),
  newProductRunCost: document.querySelector("#newProductRunCost"),
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
}

function renderAll() {
  normalizeState();
  updateAdminUi();
  renderFactoryNavigation();
  renderFactoryPanels();
  renderMaterials();
  renderPlan();
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

  primaryRow.append(calculatorButton, factoryGroup, materialsButton);
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

    const container = panel.querySelector(".product-list");
    if (!state.products[factory].length) {
      container.innerHTML = `<div class="empty-state">Noch keine Waren vorhanden.</div>`;
    } else {
      state.products[factory]
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: "base" }))
        .forEach((product) => container.appendChild(createProductCard(factory, product)));
    }

    els.factoryPanels.appendChild(panel);
  }

  activateTab(document.getElementById(activeTarget) ? activeTarget : "calculator");
}

function createProductCard(factory, product) {
  const node = els.productTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.productId = product.id;
  node.classList.toggle("locked-entry", !adminUnlocked);
  node.querySelector(".product-name-display").textContent = product.name;
  node.querySelector(".product-output-display").textContent = positiveInteger(product.output, 1).toLocaleString("de-DE");
  const sale = getSalePrice(product, null);
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
  const visibleMaterials = getManualMaterials();

  if (!visibleMaterials.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" class="empty-state">Noch keine manuell angelegten Materialien vorhanden. Waren aus Fabriken werden intern als Zwischenprodukte geführt, aber hier nicht als manuelle Materialien angezeigt.</td>`;
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
      renderAll();
      activateTab("materials");
    });

    els.materialsTableBody.appendChild(row);
  });
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
      renderAll();
    });

    productSelect.addEventListener("change", () => {
      item.productId = productSelect.value || null;
      renderAll();
    });

    quantityInput.addEventListener("change", () => {
      item.quantity = positiveInteger(quantityInput.value, 0);
      renderAll();
    });

    row.querySelector(".remove-plan-row").addEventListener("click", () => {
      state.plan = state.plan.filter((planItem) => planItem.id !== item.id);
      renderAll();
    });

    els.planTableBody.appendChild(row);
  });
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

  for (const item of state.plan) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;
    const produced = runs * output;
    if (!runs || !produced) continue;

    const cost = calculateProductUnitCost(product, new Set());
    const sale = getSalePrice(product, cost.complete ? cost.unitCost : null);
    const unitCost = cost.complete ? cost.unitCost : null;
    const unitProfit = unitCost !== null && sale.price !== null ? sale.price - unitCost : null;
    const totalProfit = unitProfit !== null ? unitProfit * produced : null;
    const totalCost = unitCost !== null ? unitCost * produced : null;
    const totalRevenue = sale.price !== null ? sale.price * produced : null;
    const assessment = getEconomyAssessment(product, unitCost, sale.price);

    if (!cost.complete) warnings.push(`${product.name}: ${cost.missing.length ? `fehlende Materialpreise (${cost.missing.join(", ")})` : "Kosten unvollständig"}.`);

    rows.push({ product, quantity, produced, runs, unitCost, sale, unitProfit, totalProfit, totalCost, totalRevenue, assessment });
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
      <td>${escapeHtml(item.product.name)}</td>
      <td>${item.produced.toLocaleString("de-DE")} <span class="muted-inline">(${item.runs.toLocaleString("de-DE")} Läufe)</span></td>
      <td>${formatOptionalMoney(item.unitCost)}</td>
      <td>${formatOptionalMoney(item.sale.price)}</td>
      <td><span class="source-badge">${escapeHtml(item.sale.source)}</span></td>
      <td>${formatProfit(item.unitProfit)}</td>
      <td>${formatProfit(item.totalProfit)}</td>
      <td><span class="assessment-badge ${item.assessment.className}">${escapeHtml(item.assessment.text)}</span></td>
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

function renderRequirementTable(tbody, requirements, emptyText) {
  tbody.innerHTML = "";
  const entries = Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }));
  if (!entries.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="2" class="empty-state">${escapeHtml(emptyText)}</td>`;
    tbody.appendChild(row);
    return;
  }

  entries.forEach(([material, amount]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${escapeHtml(material)}</td><td>${amount.toLocaleString("de-DE")}</td>`;
    tbody.appendChild(row);
  });
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
  for (const item of state.plan) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const output = positiveInteger(product.output, 1);
    const quantity = positiveInteger(item.quantity, 0);
    const runs = quantity > 0 ? Math.ceil(quantity / output) : 0;
    for (const recipeItem of product.recipe) {
      const material = cleanText(recipeItem.material);
      const amount = positiveInteger(recipeItem.amount, 0) * runs;
      if (!material || amount <= 0) continue;
      expandRawMaterial(material, amount, totals, warnings, new Set([`product:${product.id}`]));
    }
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

  const craftableProduct = findProductByName(material);
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
  els.newProductImportPrice.value = "";
  els.newProductExportPrice.value = "";
  els.newProductMarketValue.value = "";
  els.newProductRunCost.value = "";
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
  els.newProductImportPrice.value = formatInputNumber(product.importPrice);
  els.newProductExportPrice.value = formatInputNumber(product.exportPrice);
  els.newProductMarketValue.value = formatInputNumber(product.marketValue);
  els.newProductRunCost.value = formatInputNumber(product.runCost);
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
  const importPrice = optionalNumber(els.newProductImportPrice.value);
  const exportPrice = optionalNumber(els.newProductExportPrice.value);
  const marketValue = optionalNumber(els.newProductMarketValue.value);
  const runCost = optionalNumber(els.newProductRunCost.value);
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
  if (existingMaterial && existingRecipe?.autoProductId !== productDialogProductId) {
    const origin = getAutoMaterialOrigin(existingMaterial);
    alert(origin
      ? `"${name}" existiert bereits als Ware aus der ${origin.factoryLabel}. Warennamen müssen eindeutig sein.`
      : `"${name}" existiert bereits als manuelles Material. Lege die Ware bitte unter einem anderen Namen an oder benenne das Material vorher um.`);
    queueFocus("#newProductName");
    return;
  }

  if (productDialogMode === "create") {
    const product = { id: cryptoId(), name, output, importPrice, exportPrice, marketValue, runCost, recipe };
    factoryProducts.unshift(product);
    ensureMaterial(name);
    recipe.forEach((item) => ensureMaterial(item.material));
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
  product.importPrice = importPrice;
  product.exportPrice = exportPrice;
  product.marketValue = marketValue;
  product.runCost = runCost;
  product.recipe = recipe;
  ensureMaterial(name);
  recipe.forEach((item) => ensureMaterial(item.material));
  if (oldName !== name) replaceProductMaterialName(oldName, name, product.id);
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
  state.plan.unshift({
    id: cryptoId(),
    factory,
    productId: state.products[factory][0]?.id ?? null,
    quantity: 1
  });
  renderAll();
  activateTab("calculator");
  queueFocus("#planTable tbody tr:first-child .plan-quantity");
}

async function copyRequirementsTable() {
  const requirements = calculateRequirements();
  const lines = [["Material", "Gesamtbedarf"], ...Object.entries(requirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }))].map((row) => row.join("\t"));
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    temporaryButtonText(els.copyMaterialsBtn, "Kopiert", "Tabelle kopieren");
  } catch {
    alert("Kopieren wurde vom Browser blockiert.");
  }
}

async function copyRawRequirementsTable() {
  const rawRequirements = calculateRawRequirements().totals;
  const lines = [["Rohmaterial", "Gesamtbedarf"], ...Object.entries(rawRequirements).sort((a, b) => a[0].localeCompare(b[0], "de", { sensitivity: "base" }))].map((row) => row.join("\t"));
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
  const shouldShow = adminUnlocked && (activeTarget === "materials" || isFactory);
  els.floatingAddBtn.hidden = !shouldShow;
  if (!shouldShow) {
    els.floatingAddBtn.removeAttribute("data-target");
    return;
  }

  els.floatingAddBtn.dataset.target = activeTarget;
  els.floatingAddBtn.textContent = activeTarget === "materials" ? "Material hinzufügen" : "Ware hinzufügen";
}

function handleFloatingAdd() {
  if (!requireAdminAccess()) return;
  const target = els.floatingAddBtn?.dataset.target || getActiveTarget();
  if (target === "materials") {
    openMaterialDialogCreate();
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
  const normalizedName = cleanText(productName).toLocaleLowerCase("de-DE");
  if (!normalizedName) return null;
  return Object.values(state.products).flat().find((product) => product.name.toLocaleLowerCase("de-DE") === normalizedName) ?? null;
}

function getMaterialRecipe(materialName) {
  const name = cleanText(materialName);
  state.materialRecipes ??= {};
  state.materialPrices ??= {};
  state.pricing ??= {};
  state.pricing.standardMarginPercent = positiveNumber(state.pricing.standardMarginPercent, 30);
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
  replaceRecipeMaterialReferences(oldName, newName);
  if (shouldRender) renderAll();
}

function replaceProductMaterialName(oldName, newName, productId) {
  if (state.materials.includes(oldName)) renameMaterial(oldName, newName, false);
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

function normalizeState() {
  state.materials = unique((state.materials ?? []).map(cleanText).filter(Boolean));
  state.products ??= {};
  state.plan ??= [];
  state.materialRecipes ??= {};
  state.materialPrices ??= {};
  state.pricing ??= {};
  state.pricing.standardMarginPercent = positiveNumber(state.pricing.standardMarginPercent, 30);

  for (const factory of Object.keys(FACTORIES)) {
    state.products[factory] ??= [];
    state.products[factory] = state.products[factory].map((product) => ({
      id: product.id || cryptoId(),
      name: cleanText(product.name) || "Unbenannte Ware",
      output: positiveInteger(product.output, 1),
      importPrice: optionalNumber(product.importPrice),
      exportPrice: optionalNumber(product.exportPrice),
      marketValue: optionalNumber(product.marketValue),
      runCost: optionalNumber(product.runCost),
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
  state.materialRecipes = normalizedMaterialRecipes;
  state.materialPrices = normalizedMaterialPrices;
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
  if (value.pricing !== undefined && (typeof value.pricing !== "object" || Array.isArray(value.pricing))) throw new Error("Feld 'pricing' ist ungültig.");
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
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
  return { materials: [], materialRecipes: {}, materialPrices: {}, pricing: { standardMarginPercent: 30 }, products, plan: [] };
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

function calculateMaterialUnitCost(materialName, stack = new Set()) {
  const name = cleanText(materialName);
  const materialKey = `material:${name.toLocaleLowerCase("de-DE")}`;
  if (stack.has(materialKey)) return { complete: false, unitCost: null, missing: [name] };

  const recipeDef = getExistingMaterialRecipe(name);
  const autoOrigin = recipeDef?.autoProductId ? getProductOrigin(recipeDef.autoProductId) : null;
  if (autoOrigin?.product) return calculateProductUnitCost(autoOrigin.product, stack);

  if (recipeDef?.recipe?.length) {
    const nextStack = new Set(stack);
    nextStack.add(materialKey);
    let total = 0;
    const missing = [];
    for (const item of recipeDef.recipe) {
      const child = calculateMaterialUnitCost(item.material, nextStack);
      if (!child.complete) missing.push(...child.missing);
      else total += child.unitCost * positiveInteger(item.amount, 0);
    }
    if (missing.length) return { complete: false, unitCost: null, missing: unique(missing) };
    return { complete: true, unitCost: total / positiveInteger(recipeDef.output, 1), missing: [] };
  }

  const craftableProduct = findProductByName(name);
  if (craftableProduct?.recipe?.length) return calculateProductUnitCost(craftableProduct, stack);

  const manualPrice = getMaterialManualPrice(name);
  if (manualPrice === null) return { complete: false, unitCost: null, missing: [name] };
  return { complete: true, unitCost: manualPrice, missing: [] };
}

function calculateProductUnitCost(product, stack = new Set()) {
  const productKey = `product:${product.id}`;
  if (stack.has(productKey)) return { complete: false, unitCost: null, missing: [product.name] };
  const nextStack = new Set(stack);
  nextStack.add(productKey);

  let runCost = optionalNumber(product.runCost) ?? 0;
  const missing = [];
  for (const item of product.recipe ?? []) {
    const materialCost = calculateMaterialUnitCost(item.material, nextStack);
    if (!materialCost.complete) missing.push(...materialCost.missing);
    else runCost += materialCost.unitCost * positiveInteger(item.amount, 0);
  }
  if (missing.length) return { complete: false, unitCost: null, missing: unique(missing) };
  return { complete: true, unitCost: runCost / positiveInteger(product.output, 1), missing: [] };
}

function getSalePrice(product, unitCost) {
  const exportPrice = optionalNumber(product.exportPrice);
  if (exportPrice !== null) return { price: exportPrice, source: "Exportpreis" };
  const marketValue = optionalNumber(product.marketValue);
  if (marketValue !== null) return { price: marketValue, source: "Marktwert" };
  if (unitCost !== null) {
    const margin = positiveNumber(state.pricing?.standardMarginPercent, 30);
    return { price: unitCost * (1 + margin / 100), source: "Kosten + Marge" };
  }
  return { price: null, source: "Unvollständig" };
}

function getEconomyAssessment(product, unitCost, salePrice) {
  if (unitCost === null || salePrice === null) return { text: "Unvollständig", className: "assessment-neutral" };
  const profit = salePrice - unitCost;
  const importPrice = optionalNumber(product.importPrice);
  if (profit < 0) return { text: "Nicht profitabel", className: "assessment-bad" };
  if (importPrice !== null && importPrice < unitCost) return { text: "Import günstiger", className: "assessment-warning" };
  if (profit === 0) return { text: "Break-even", className: "assessment-neutral" };
  return { text: "Profitabel", className: "assessment-good" };
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
